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
  const barColor = pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';
  return (
    <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: pct + '%', background: barColor }} />
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-600 shadow-sm hover:border-slate-500 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-700 bg-slate-800/80">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h2>
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

  // ── Waiting screen ──
  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="text-center px-4">
          <div className="text-7xl mb-8">🎮</div>
          <h1 className="text-3xl font-bold text-white mb-4">游戏数据分析平台</h1>
          <p className="text-slate-400 text-lg mb-8">Arcane Village · 实时数据可视化</p>
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-600 max-w-lg mx-auto shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-lg font-bold">等待游戏连接...</span>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              打开奥术村庄游戏并开始游玩，<br />
              仪表盘将自动实时同步所有数据。
            </p>
            <a href="https://yygssh.github.io/arcane-village/" target="_blank" rel="noopener noreferrer"
              className="inline-block w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-bold transition-all shadow-lg shadow-indigo-600/25">
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
  const hpPct = p.maxHp ? Math.round(p.hp / p.maxHp * 100) : 0;
  const mpPct = p.maxMp ? Math.round(p.mp / p.maxMp * 100) : 0;

  // Derived stats
  const totalEntities = 1 + npcs.length + monsters.length;
  const zoneCounts = {};
  [p, ...npcs, ...monsters].forEach(e => {
    if (e.zone) zoneCounts[e.zone] = (zoneCounts[e.zone] || 0) + 1;
  });
  const zoneEntries = Object.entries(zoneCounts).map(([k, v]) => ({ name: ZONE_MAP[k] || k, count: v })).sort((a, b) => b.count - a.count);
  const typeDist = [
    { name: '玩家', value: 1 },
    { name: 'NPC', value: npcs.length },
    { name: '怪物', value: monsters.length },
  ];
  const combatRows = [{ name: '玩家', hp: p.hp || 0, atk: p.atk || 0 },
    ...monsters.map(m => ({ name: m.type || '?', hp: m.hp || 0, atk: m.atk || 0 }))];

  return (
    <div className="min-h-screen p-4 lg:p-6" style={{ background: '#0f172a' }}>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* ============= HEADER ============= */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">🎮 游戏数据分析平台</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Arcane Village · 回合 {gameState?.turn} · 运行 {Math.floor((gameState?.gameTime || 0) / 1000)}s
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 border border-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow shadow-emerald-400/50" />
            <span className="text-sm font-semibold text-emerald-400">实时同步</span>
          </div>
        </div>

        {/* ============= PLAYER STATUS ============= */}
        <Section title="🎯 玩家状态">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <StatCard icon="⭐" label="等级" value={'Lv.' + p.level} sub={p.class || '-'} color="text-amber-400" />
            <StatCard icon="💰" label="金币" value={p.gold || 0} sub={'经验 ' + (p.exp || 0) + '/' + (p.level * 20)} color="text-yellow-400" />
            <StatCard icon="⚔️" label="攻击" value={p.atk || 0} sub={'防御 ' + (p.def || 0)} color="text-orange-400" />
            <StatCard icon="🗡️" label="武器" value={p.weapon || '无'} sub={p.hasFireball ? '🔥 火球术' : '无法术'} color="text-violet-400" />
          </div>

          {/* HP / MP bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-white">❤️ 生命值</span>
                <span className="text-sm font-bold text-red-400">{p.hp} / {p.maxHp}</span>
              </div>
              <HPBar hp={p.hp || 0} maxHp={p.maxHp || 1} />
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-white">💙 法力值</span>
                <span className="text-sm font-bold text-blue-400">{p.mp} / {p.maxMp}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: mpPct + '%' }} />
              </div>
            </div>
          </div>
        </Section>

        {/* ============= OVERVIEW + CHARTS ============= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Stats overview */}
          <Section title="📊 战场概览">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '👤', label: '总实体', val: totalEntities, color: 'text-white' },
                { icon: '✅', label: '存活', val: (p.alive ? 1 : 0) + monsters.filter(m => m.hp > 0).length, color: 'text-emerald-400' },
                { icon: '👹', label: '怪物', val: monsters.length, color: 'text-red-400' },
                { icon: '👥', label: 'NPC', val: npcs.length, color: 'text-violet-400' },
              ].map((s, i) => (
                <div key={i} className="bg-slate-700/50 rounded-xl p-3 text-center border border-slate-600">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">实体分布</h4>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={typeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55}
                    label={({ name, value }) => name + ' ' + value}>
                    {typeDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Zone chart */}
          <Section title="📍 区域分布">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={zoneEntries} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#e2e8f0' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          {/* Combat chart */}
          <Section title="⚔️ 战力对比">
            {combatRows.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={combatRows} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#e2e8f0' }} />
                  <Bar dataKey="hp" fill="#f87171" radius={[3, 3, 0, 0]} name="HP" />
                  <Bar dataKey="atk" fill="#fbbf24" radius={[3, 3, 0, 0]} name="攻击" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-400 text-center py-12">等待怪物出现...</p>}
          </Section>
        </div>

        {/* ============= NPC STATUS ============= */}
        <Section title="👥 NPC 实时状态">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {npcs.map((n, i) => {
              const stateIcons = { walking: '🚶', talking: '💬', casting: '✨', idle: '💤' };
              const stateLabels = { walking: '移动中', talking: '对话中', casting: '施法中', idle: '待机' };
              const st = n.state || 'idle';
              return (
                <div key={i} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 hover:border-slate-500 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: { '艾德里克': '#7c3aed', '莱拉': '#22c55e', '布罗加': '#f97316', '米拉': '#ef4444', '凯尔': '#eab308' }[n.name] || '#6366f1' }}>
                      {n.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{n.name}</div>
                      <div className="text-xs text-slate-400">{n.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>{stateIcons[st]}</span>
                    <span>{stateLabels[st]}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    📍 {ZONE_MAP[n.zone] || n.zone}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ============= MONSTERS ============= */}
        <Section title={'👹 活跃怪物 (' + monsters.length + ')'}>
          {monsters.length === 0 ? (
            <p className="text-slate-400 text-center py-3">暂无怪物</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {monsters.map((m, i) => (
                <div key={i} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-sm font-bold text-white">{m.type}</span>
                    </div>
                    <span className="text-xs text-slate-400">{ZONE_MAP[m.zone] || m.zone}</span>
                  </div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-slate-400">HP</span>
                    <span className="text-xs font-bold text-red-400">{m.hp} / {m.maxHp}</span>
                  </div>
                  <HPBar hp={m.hp || 0} maxHp={m.maxHp || 1} />
                  <div className="flex justify-between mt-3 text-xs">
                    <span className="text-slate-400">攻击 {m.atk}</span>
                    <span className="text-slate-400">防御 {m.def}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ============= EVENT LOG ============= */}
        <Section title="📜 事件日志">
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {events.length === 0 && <p className="text-slate-400 text-sm py-2">等待事件...</p>}
            {events.map((e, i) => {
              const catStyles = {
                combat: 'border-l-red-500 bg-red-950/30',
                cast: 'border-l-amber-500 bg-amber-950/30',
                talk: 'border-l-emerald-500 bg-emerald-950/30',
                loot: 'border-l-yellow-500 bg-yellow-950/30',
                system: 'border-l-slate-500 bg-slate-800/50',
              };
              const style = catStyles[e.cat] || 'border-l-slate-600';
              return (
                <div key={i} className={`flex items-start gap-3 py-2.5 px-3 rounded-lg border-l-4 ${style}`}>
                  <span className="text-xs text-slate-500 font-mono whitespace-nowrap mt-0.5">[{e.time}]</span>
                  <span className="text-sm text-slate-200">{e.msg}</span>
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
