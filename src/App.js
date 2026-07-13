import React, { useRef, useEffect, useState, useCallback } from "react";
import DataCharts from "./components/DataCharts";
import DataTable from "./components/DataTable";
import { motion } from "framer-motion";
import { Input } from "./components/ui/input";
import { Select } from "./components/ui/select";

const ZONE_LABELS = {
  dark_forest: '黑暗森林', elf_woods: '精灵林地', mine: '矿山深处',
  tavern: '酒馆', tower: '高塔', shop: '商铺', ruins: '古城遗迹', village: '村庄',
};

function GameMinimap({ gameState }) {
  const canvasRef = useRef(null);
  const ZONE_COLORS = {
    dark_forest: '#1a4a2e', elf_woods: '#2d6a1e', mine: '#666',
    tavern: '#b8860b', tower: '#8b6914', shop: '#daa520', ruins: '#cc3333', village: '#c4a060',
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#1a1410'; ctx.fillRect(0, 0, w, h);

    const zoneData = {};
    if (gameState.player?.zone) zoneData[gameState.player.zone] = (zoneData[gameState.player.zone] || 0) + 1;
    (gameState.npcs || []).forEach(n => { zoneData[n.zone] = (zoneData[n.zone] || 0) + 1; });
    (gameState.monsters || []).forEach(m => { zoneData[m.zone] = (zoneData[m.zone] || 0) + 1; });

    const zones = Object.keys(zoneData);
    if (!zones.length) return;
    const cols = Math.ceil(Math.sqrt(zones.length));
    const cellW = w / cols, cellH = h / Math.ceil(zones.length / cols);

    zones.forEach((zone, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = col * cellW + 4, y = row * cellH + 4;
      const cw = cellW - 8, ch = cellH - 8;
      ctx.fillStyle = ZONE_COLORS[zone] || '#4a3a2a';
      ctx.fillRect(x, y, cw, ch);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText((ZONE_LABELS[zone] || zone).slice(0, 4), x + cw / 2, y + 16);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(zoneData[zone] + '人', x + cw / 2, y + ch - 6);
    });
  }, [gameState]);

  return (
    <div className="bg-gray-800 rounded-2xl shadow p-4 border border-gray-700">
      <h2 className="text-base font-semibold text-gray-100 mb-3">🗺️ 区域热力图</h2>
      <canvas ref={canvasRef} width={280} height={200} className="w-full rounded-lg border border-gray-700" />
    </div>
  );
}

function App() {
  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("All");
  const timerRef = useRef(null);
  const lastTurnRef = useRef(0);

  const pollGameState = useCallback(() => {
    try {
      const raw = localStorage.getItem('arcane_village_state');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.turn !== lastTurnRef.current) {
        lastTurnRef.current = data.turn;
        setGameState(data);
        setConnected(true);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(pollGameState, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pollGameState]);

  // ── Build flat data table from game state ──
  const buildTableData = () => {
    if (!gameState) return [];
    const rows = [];
    // Player row
    const p = gameState.player || {};
    rows.push({
      id: 'player', type: '🎮玩家', name: '冒险者',
      class: p.class || '冒险者', level: p.level, hp: p.hp, maxHp: p.maxHp,
      mp: p.mp, maxMp: p.maxMp, atk: p.atk, def: p.def,
      gold: p.gold, exp: p.exp,
      zone: ZONE_LABELS[p.zone] || p.zone || '-',
      status: p.alive ? '存活' : '阵亡', weapon: p.weapon || '-',
    });
    // NPC rows
    (gameState.npcs || []).forEach((n, i) => {
      rows.push({
        id: 'npc' + i, type: '👤NPC', name: n.name,
        class: n.title, level: '-', hp: '-', maxHp: '-', mp: '-', maxMp: '-',
        atk: '-', def: '-', gold: '-', exp: '-',
        zone: ZONE_LABELS[n.zone] || n.zone || '-',
        status: n.state === 'walking' ? '移动' : n.state === 'talking' ? '对话' : n.state === 'casting' ? '施法' : '待机',
        weapon: '-',
      });
    });
    // Monster rows
    (gameState.monsters || []).forEach((m, i) => {
      rows.push({
        id: 'mon' + i, type: '👹怪物', name: m.type || '?',
        class: m.emoji || '', level: '-', hp: m.hp, maxHp: m.maxHp,
        mp: '-', maxMp: '-', atk: m.atk, def: m.def,
        gold: '-', exp: '-',
        zone: ZONE_LABELS[m.zone] || m.zone || '-',
        status: m.hp > 0 ? '存活' : '阵亡', weapon: '-',
      });
    });
    return rows;
  };

  const tableData = buildTableData();

  const filtered = tableData.filter(row => {
    const matchSearch = !search || row.name?.toLowerCase().includes(search.toLowerCase()) ||
      row.class?.toLowerCase().includes(search.toLowerCase()) ||
      row.zone?.toLowerCase().includes(search.toLowerCase());
    const matchZone = zoneFilter === 'All' || row.zone === zoneFilter;
    return matchSearch && matchZone;
  });

  // Zone list for filter
  const zones = [...new Set(tableData.map(r => r.zone).filter(Boolean))];

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0a1a' }}>
        <div className="text-center">
          <div className="text-6xl mb-6">🎮</div>
          <h1 className="text-2xl font-bold text-gray-100 mb-3">游戏数据分析平台</h1>
          <p className="text-gray-400 mb-6">Arcane Village — 实时游戏数据可视化</p>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md mx-auto">
            <p className="text-yellow-400 text-lg mb-4">⏳ 等待游戏数据...</p>
            <p className="text-gray-400 text-sm">
              请在新标签页打开奥术村庄并开始游玩，<br/>仪表盘将自动同步显示实时数据。
            </p>
            <a href="https://yygssh.github.io/arcane-village/" target="_blank" rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
              🏰 打开奥术村庄
            </a>
          </div>
        </div>
      </div>
    );
  }

  const p = gameState?.player || {};
  const monsters = gameState?.monsters || [];
  const npcs = gameState?.npcs || [];
  const events = gameState?.recentEvents || [];

  return (
    <div className="p-4 lg:p-6 min-h-screen" style={{ background: '#0c0a1a' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">🎮 游戏数据分析平台</h1>
          <p className="text-gray-400 text-sm mt-1">
            Arcane Village · 回合 {gameState?.turn} · {Math.floor((gameState?.gameTime || 0) / 1000)}s
            <span className="ml-3 text-green-400 text-xs">● 实时</span>
          </p>
        </div>
      </motion.div>

      {/* Player Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: '等级', val: 'Lv.' + p.level, clr: 'text-yellow-400', sub: p.class || '-' },
          { label: '生命', val: p.hp + '/' + p.maxHp, clr: 'text-red-400', sub: '攻' + p.atk + ' 防' + p.def },
          { label: '金币', val: String(p.gold || 0), clr: 'text-amber-400', sub: '经验 ' + (p.exp || 0) + '/' + (p.level * 20) },
          { label: '状态', val: (monsters.length) + '怪 ' + npcs.length + 'NPC', clr: 'text-purple-400', sub: p.alive ? '存活' : '阵亡' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
            <div className={`text-2xl font-bold ${s.clr}`}>{s.val}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            <div className="text-xs text-gray-600">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts + Minimap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1">
          <GameMinimap gameState={gameState} />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-2xl shadow p-4 border border-gray-700">
            <DataCharts data={filtered} />
          </div>
        </div>
      </div>

      {/* Filters + Data Table */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}
          className="w-40 bg-gray-800 text-gray-200 border-gray-700">
          <option value="All">所有区域</option>
          {zones.map(z => <option key={z} value={z}>{z}</option>)}
        </Select>
        <Input type="text" placeholder="搜索名称/职业/区域..."
          className="w-56 bg-gray-800 text-gray-200 border-gray-700"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Data Table */}
      <motion.div className="bg-gray-800 rounded-2xl shadow p-4 border border-gray-700 mb-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DataTable data={filtered} />
      </motion.div>

      {/* Events Log */}
      <motion.div className="bg-gray-800 rounded-2xl shadow p-4 border border-gray-700"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="text-sm font-semibold text-gray-200 mb-3">📜 最近事件</h3>
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {events.map((e, i) => (
            <div key={i} className="text-sm py-1 border-b border-gray-700/50 last:border-0"
              style={{ color: e.cat === 'combat' ? '#ef4444' : e.cat === 'cast' ? '#f59e0b' : e.cat === 'talk' ? '#10b981' : e.cat === 'loot' ? '#f59e0b' : e.cat === 'system' ? '#9ca3af' : '#d1d5db' }}>
              [{e.time}] {e.msg}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default App;
