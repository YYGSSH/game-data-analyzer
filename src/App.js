import React, { useRef, useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444'];

const ZONE_MAP = {
  dark_forest: '黑暗森林', elf_woods: '精灵林地', mine: '矿山深处',
  tavern: '酒馆', tower: '高塔', shop: '商铺', ruins: '古城遗迹', village: '村庄',
};

function HPBar({ hp, maxHp }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const barColor = pct > 50 ? '#16a34a' : pct > 25 ? '#d97706' : '#dc2626';
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: pct + '%', backgroundColor: barColor }} />
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function Section({ title, children, className }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className || ''}`}>
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function App() {
  const [gameState, setGameState] = useState(null);
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
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(pollGameState, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pollGameState]);

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f1f5f9' }}>
        <div className="text-center px-4">
          <div className="text-7xl mb-8">🎮</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">游戏数据分析平台</h1>
          <p className="text-gray-600 text-lg mb-8">Arcane Village · 实时数据可视化</p>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-600 text-lg font-bold">等待游戏连接...</span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              打开奥术村庄游戏并开始游玩，<br />仪表盘将自动实时同步所有数据。
            </p>
            <a href="https://yygssh.github.io/arcane-village/" target="_blank" rel="noopener noreferrer"
              className="inline-block w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-bold transition-colors shadow-md">
              🏰 打开奥术村庄
            </a>
          </div>
        </div>
      </div>
    );
  }

  const p = gameState?.player || {};
  const npcs = gameState?.npcs || [];
  const monsters = gameState?.monsters || [];
  const events = gameState?.recentEvents || [];
  const mpPct = p.maxMp ? Math.round(p.mp / p.maxMp * 100) : 0;

  const totalEntities = 1 + npcs.length + monsters.length;
  const zoneCounts = {};
  [p, ...npcs, ...monsters].forEach(e => { if (e.zone) zoneCounts[e.zone] = (zoneCounts[e.zone] || 0) + 1; });
  const zoneEntries = Object.entries(zoneCounts).map(([k, v]) => ({ name: ZONE_MAP[k] || k, count: v })).sort((a, b) => b.count - a.count);
  const typeDist = [
    { name: '玩家', value: 1 },
    { name: 'NPC', value: npcs.length },
    { name: '怪物', value: monsters.length },
  ];
  const combatRows = [
    { name: '玩家', hp: p.hp || 0, atk: p.atk || 0 },
    ...monsters.map(m => ({ name: m.type || '?', hp: m.hp || 0, atk: m.atk || 0 })),
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: '#f1f5f9' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎮 游戏数据分析平台</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Arcane Village · 回合 {gameState?.turn} · 运行 {Math.floor((gameState?.gameTime || 0) / 1000)}s
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-2 border border-green-200">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow shadow-green-500/30" />
            <span className="text-sm font-semibold text-green-700">实时同步中</span>
          </div>
        </div>

        {/* ===== ROW 1: Player + Overview (2 columns) ===== */}
        <div className="grid grid-cols-2 gap-6">
          {/* Player Status */}
          <Section title="🎯 玩家状态">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard icon="⭐" label="等级" value={'Lv.' + p.level} sub={p.class || '-'} color="#d97706" />
              <StatCard icon="💰" label="金币" value={p.gold || 0} sub={'经验 ' + (p.exp || 0) + '/' + (p.level * 20)} color="#b45309" />
              <StatCard icon="⚔️" label="攻击力" value={p.atk || 0} sub={'防御 ' + (p.def || 0)} color="#ea580c" />
              <StatCard icon="🗡️" label="武器" value={p.weapon || '无'} sub={p.hasFireball ? '🔥 火球术' : '无法术'} color="#7c3aed" />
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">❤️ 生命值</span>
                  <span className="text-sm font-bold text-red-600">{p.hp} / {p.maxHp}</span>
                </div>
                <HPBar hp={p.hp || 0} maxHp={p.maxHp || 1} />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">💙 法力值</span>
                  <span className="text-sm font-bold text-blue-600">{p.mp} / {p.maxMp}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: mpPct + '%' }} />
                </div>
              </div>
            </div>
          </Section>

          {/* Battle Overview + Pie */}
          <Section title="📊 战场概览">
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { icon: '👤', label: '总实体', val: totalEntities, color: '#1e293b' },
                { icon: '✅', label: '存活', val: (p.alive ? 1 : 0) + monsters.filter(m => m.hp > 0).length, color: '#16a34a' },
                { icon: '👹', label: '怪物', val: monsters.length, color: '#dc2626' },
                { icon: '👥', label: 'NPC', val: npcs.length, color: '#7c3aed' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">实体分布</h4>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={typeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55}
                  label={({ name, value }) => name + ' ' + value}>
                  {typeDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b' }} />
              </PieChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* ===== ROW 2: Charts (2 columns) ===== */}
        <div className="grid grid-cols-2 gap-6">
          <Section title="📍 区域分布">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={zoneEntries} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fill: '#334155', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="⚔️ 战力对比">
            {combatRows.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={combatRows} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b' }} />
                  <Bar dataKey="hp" fill="#f87171" radius={[4, 4, 0, 0]} name="HP" />
                  <Bar dataKey="atk" fill="#fbbf24" radius={[4, 4, 0, 0]} name="攻击" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-center py-12">等待怪物出现...</p>}
          </Section>
        </div>

        {/* ===== ROW 3: NPC (full width grid) ===== */}
        <Section title="👥 NPC 实时状态">
          <div className="grid grid-cols-5 gap-4">
            {npcs.map((n, i) => {
              const stateIcons = { walking: '🚶', talking: '💬', casting: '✨', idle: '💤' };
              const stateLabels = { walking: '移动中', talking: '对话中', casting: '施法中', idle: '待机' };
              const st = n.state || 'idle';
              const npcColor = { '艾德里克': '#7c3aed', '莱拉': '#22c55e', '布罗加': '#f97316', '米拉': '#ef4444', '凯尔': '#eab308' }[n.name] || '#6366f1';
              return (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-inner"
                      style={{ backgroundColor: npcColor }}>
                      {n.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{n.name}</div>
                      <div className="text-xs text-gray-500">{n.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200">
                    <span>{stateIcons[st]}</span>
                    <span>{stateLabels[st]}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">📍 {ZONE_MAP[n.zone] || n.zone}</div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ===== ROW 4: Monsters ===== */}
        <Section title={'👹 活跃怪物 (' + monsters.length + ')'}>
          {monsters.length === 0 ? (
            <p className="text-gray-400 text-center py-4">暂无怪物</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {monsters.map((m, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="text-sm font-bold text-gray-900">{m.type}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-white rounded-full px-2 py-0.5 border border-gray-200">
                      {ZONE_MAP[m.zone] || m.zone}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-500">HP</span>
                    <span className="text-xs font-bold text-red-600">{m.hp} / {m.maxHp}</span>
                  </div>
                  <HPBar hp={m.hp || 0} maxHp={m.maxHp || 1} />
                  <div className="flex justify-between mt-3 text-xs text-gray-500">
                    <span>攻击 {m.atk}</span>
                    <span>防御 {m.def}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ===== ROW 5: Events ===== */}
        <Section title="📜 事件日志">
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {events.length === 0 && <p className="text-gray-400 text-sm py-2">等待游戏事件...</p>}
            {events.map((e, i) => {
              const tags = {
                combat: { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-gray-900' },
                cast: { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-gray-900' },
                talk: { border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-gray-900' },
                loot: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-gray-900' },
                system: { border: 'border-l-gray-400', bg: 'bg-gray-50', text: 'text-gray-700 italic' },
              };
              const s = tags[e.cat] || { border: 'border-l-gray-300', bg: 'bg-white', text: 'text-gray-800' };
              return (
                <div key={i} className={`flex items-start gap-3 py-2.5 px-4 rounded-lg border-l-4 ${s.border} ${s.bg}`}>
                  <span className="text-xs text-gray-500 font-mono whitespace-nowrap mt-0.5">[{e.time}]</span>
                  <span className={`text-sm ${s.text}`}>{e.msg}</span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

export default App;
