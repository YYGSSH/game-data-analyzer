import React, { useRef, useEffect, useState, useCallback } from "react";
import DataCharts from "./components/DataCharts";
import { motion } from "framer-motion";

const ZONE_LABELS = {
  dark_forest: '黑暗森林', elf_woods: '精灵林地', mine: '矿山深处',
  tavern: '酒馆', tower: '高塔', shop: '商铺', ruins: '古城遗迹', village: '村庄',
};
const ZONE_COLORS = {
  dark_forest: '#1a4a2e', elf_woods: '#2d6a1e', mine: '#666',
  tavern: '#b8860b', tower: '#8b6914', shop: '#daa520', ruins: '#887744', village: '#c4a060',
};
const NPC_COLORS = {
  '艾德里克': '#9966cc', '莱拉': '#66cc66', '布罗加': '#cc8844', '米拉': '#cc6666', '凯尔': '#cc9944',
};

function GameMinimap({ gameState }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(0, 0, w, h);

    // Collect zone data
    const zoneCounts = {};
    const zoneNpcs = {};
    const zoneMonsters = {};

    if (gameState.player) {
      const z = gameState.player.zone;
      zoneCounts[z] = (zoneCounts[z] || 0) + 1;
    }
    (gameState.npcs || []).forEach(n => {
      zoneCounts[n.zone] = (zoneCounts[n.zone] || 0) + 1;
      zoneNpcs[n.zone] = (zoneNpcs[n.zone] || 0) + 1;
    });
    (gameState.monsters || []).forEach(m => {
      zoneCounts[m.zone] = (zoneCounts[m.zone] || 0) + 1;
      zoneMonsters[m.zone] = (zoneMonsters[m.zone] || 0) + 1;
    });

    const zones = Object.keys(zoneCounts);
    if (!zones.length) {
      ctx.fillStyle = '#888';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('等待游戏数据...', w / 2, h / 2);
      return;
    }

    const cols = Math.ceil(Math.sqrt(zones.length));
    const cellW = w / cols, cellH = h / Math.ceil(zones.length / cols);

    zones.forEach((zone, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = col * cellW + 4, y = row * cellH + 4;
      const cw = cellW - 8, ch = cellH - 8;
      ctx.fillStyle = ZONE_COLORS[zone] || '#4a3a2a';
      ctx.fillRect(x, y, cw, ch);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((ZONE_LABELS[zone] || zone).slice(0, 4), x + cw / 2, y + 14);
      ctx.font = '9px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      const n = zoneNpcs[zone] || 0, m = zoneMonsters[zone] || 0;
      ctx.fillText('P:' + zoneCounts[zone] + ' N:' + n + ' M:' + m, x + cw / 2, y + ch - 6);
    });
  }, [gameState]);

  return (
    <div className="bg-gray-800 rounded-2xl shadow p-4 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-100 mb-3">🗺️ 实时区域热力图</h2>
      <canvas ref={canvasRef} width={300} height={220} className="w-full rounded-lg border border-gray-700" />
      <p className="text-xs text-gray-400 mt-2">P=玩家 N=NPC M=怪物</p>
    </div>
  );
}

function App() {
  const [gameState, setGameState] = useState(null);
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(false);
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
        setHistory(prev => {
          const next = [...prev, {
            turn: data.turn,
            time: data.gameTime,
            level: data.player?.level || 1,
            hp: data.player?.hp || 0,
            gold: data.player?.gold || 0,
            monsters: (data.monsters || []).length,
          }];
          return next.slice(-60);
        });
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(pollGameState, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pollGameState]);

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0a1a' }}>
        <div className="text-center">
          <div className="text-6xl mb-6">🎮</div>
          <h1 className="text-2xl font-bold text-gray-100 mb-3">游戏数据分析平台</h1>
          <p className="text-gray-400 mb-6">Arcane Village — 实时游戏数据可视化</p>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md mx-auto">
            <p className="text-yellow-400 text-lg mb-4">⏳ 等待游戏数据...</p>
            <p className="text-gray-400 text-sm mb-4">
              请在新标签页打开奥术村庄游戏并开始游玩，<br />
              仪表盘将自动同步显示实时数据。
            </p>
            <a href="https://yygssh.github.io/arcane-village/"
              target="_blank" rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
              🏰 打开奥术村庄
            </a>
            <p className="text-gray-600 text-xs mt-4">
              游戏和仪表盘通过 localStorage 实时同步数据
            </p>
          </div>
        </div>
      </div>
    );
  }

  const p = gameState?.player || {};
  const npcs = gameState?.npcs || [];
  const monsters = gameState?.monsters || [];
  const events = gameState?.recentEvents || [];

  // Build chart data
  const zoneData = {};
  if (p.zone) zoneData[p.zone] = (zoneData[p.zone] || 0) + 1;
  npcs.forEach(n => { zoneData[n.zone] = (zoneData[n.zone] || 0) + 1; });
  monsters.forEach(m => { zoneData[m.zone] = (zoneData[m.zone] || 0) + 1; });
  const zoneChart = Object.entries(zoneData).map(([k, v]) => ({ name: ZONE_LABELS[k] || k, count: v }));

  const monsterTypes = {};
  monsters.forEach(m => { monsterTypes[m.type] = (monsterTypes[m.type] || 0) + 1; });
  const monsterChart = Object.entries(monsterTypes).map(([k, v]) => ({ name: k, count: v }));

  return (
    <div className="p-4 lg:p-6 min-h-screen" style={{ background: '#0c0a1a' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">🎮 游戏数据分析平台</h1>
          <p className="text-gray-400 text-sm mt-1">
            Arcane Village · 回合 {gameState?.turn} · 游戏时间 {Math.floor((gameState?.gameTime || 0) / 1000)}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">实时同步中</span>
        </div>
      </motion.div>

      {/* Player Stats */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {[
          { label: '等级', value: 'Lv.' + p.level, color: 'text-yellow-400' },
          { label: '生命', value: p.hp + '/' + p.maxHp, color: 'text-red-400' },
          { label: '法力', value: p.mp + '/' + p.maxMp, color: 'text-blue-400' },
          { label: '金币', value: p.gold, color: 'text-amber-400' },
          { label: '经验', value: p.exp + '/' + (p.level * 20), color: 'text-green-400' },
          { label: '武器', value: p.weapon || '无', color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-3 text-center border border-gray-700">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Minimap */}
        <div className="lg:col-span-1">
          <GameMinimap gameState={gameState} />
        </div>

        {/* Overview stats */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">{npcs.length}</div>
              <div className="text-xs text-gray-500">活跃 NPC</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-red-400">{monsters.length}</div>
              <div className="text-xs text-gray-500">存活怪物</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{p.alive ? '存活' : '阵亡'}</div>
              <div className="text-xs text-gray-500">玩家状态</div>
            </div>
          </div>

          {/* Zone distribution */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-200 mb-2">📍 区域分布</h3>
            <div className="flex flex-wrap gap-2">
              {zoneChart.map((z, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                  <span className="w-3 h-3 rounded-sm" style={{ background: ZONE_COLORS[Object.keys(zoneData)[i]] || '#666' }} />
                  <span className="text-sm text-gray-200">{z.name}</span>
                  <span className="text-xs text-gray-500">×{z.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monster breakdown */}
          {monsters.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-200 mb-2">👹 怪物分布</h3>
              <div className="flex flex-wrap gap-2">
                {monsters.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-sm text-gray-200">{m.type}</span>
                    <span className="text-xs text-gray-500">HP {m.hp}/{m.maxHp}</span>
                    <span className="text-xs text-gray-600">({m.zone && ZONE_LABELS[m.zone] || m.zone})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NPC List */}
      <motion.div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="text-sm font-semibold text-gray-200 mb-3">👥 NPC 状态</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {npcs.map((n, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-3 border border-gray-700 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: NPC_COLORS[n.name] || '#888' }} />
              <div>
                <div className="text-sm text-gray-200 font-medium">{n.name}</div>
                <div className="text-xs text-gray-500">{n.title} · {ZONE_LABELS[n.zone] || n.zone}</div>
                <div className="text-xs text-gray-600">
                  {n.state === 'walking' ? '🚶 移动中' : n.state === 'talking' ? '💬 对话中' : n.state === 'casting' ? '✨ 施法中' : '💤 待机'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Events */}
      <motion.div className="bg-gray-800 rounded-xl p-4 border border-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="text-sm font-semibold text-gray-200 mb-3">📜 最近事件</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {events.length === 0 && <p className="text-gray-500 text-sm">暂无事件</p>}
          {events.map((e, i) => (
            <div key={i} className="text-sm text-gray-400 py-1 border-b border-gray-700/50 last:border-0">
              <span className="text-gray-600 mr-2">[{e.time}]</span>
              <span className={
                e.cat === 'combat' ? 'text-red-400' :
                e.cat === 'cast' ? 'text-yellow-400' :
                e.cat === 'talk' ? 'text-green-400' :
                e.cat === 'loot' ? 'text-amber-400' :
                e.cat === 'system' ? 'text-gray-500 italic' : 'text-gray-400'
              }>{e.msg}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default App;
