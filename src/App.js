import React, { useRef, useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444'];

const ZONE_MAP = {
  dark_forest: 'dark forest', elf_woods: 'elf woods', mine: 'mine',
  tavern: 'tavern', tower: 'tower', shop: 'shop', ruins: 'ruins', village: 'village',
};

const ZONE_CN = {
  dark_forest: 'Dark Forest', elf_woods: 'Elf Woods', mine: 'Mine',
  tavern: 'Tavern', tower: 'Tower', shop: 'Shop', ruins: 'Ruins', village: 'Village',
};

const NPC_COLORS = {
  '\u827e\u5fb7\u91cc\u514b': '#7c3aed', '\u83b1\u62c9': '#22c55e', '\u5e03\u7f57\u52a0': '#f97316',
  '\u7c73\u62c9': '#ef4444', '\u51ef\u5c14': '#eab308',
};

// Common styles
const S = {
  page: { background: '#f1f5f9', minHeight: '100vh', padding: '24px' },
  container: { maxWidth: 1200, margin: '0 auto' },
  row: { display: 'flex', gap: 24, marginBottom: 24 },
  col2: { flex: 1, minWidth: 0 },
  full: { marginBottom: 24 },
  card: { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  cardHead: { padding: '12px 20px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' },
  cardHeadTitle: { fontSize: 13, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  cardBody: { padding: 20 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
  statCard: { background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
  statIcon: { fontSize: 20 },
  statLabel: { fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statVal: { fontSize: 22, fontWeight: 700, marginTop: 2 },
  statSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  hpBar: { background: '#f3f4f6', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb', marginBottom: 12 },
  hpLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  hpLabelText: { fontSize: 13, fontWeight: 600, color: '#374151' },
  hpVal: { fontSize: 13, fontWeight: 700 },
  barBg: { width: '100%', height: 12, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99, transition: 'width 0.3s' },
  tinyGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  tinyCard: { background: '#f9fafb', borderRadius: 12, padding: 12, border: '1px solid #e5e7eb', textAlign: 'center' },
  tinyIcon: { fontSize: 24, marginBottom: 2 },
  tinyVal: { fontSize: 20, fontWeight: 700 },
  tinyLabel: { fontSize: 11, color: '#6b7280' },
  sectionTitle: { fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 },
  npcGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 },
  npcCard: { background: '#f9fafb', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb' },
  npcRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  npcAvatar: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 },
  npcName: { fontSize: 13, fontWeight: 700, color: '#111827' },
  npcTitle: { fontSize: 11, color: '#6b7280' },
  npcState: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: '#374151', background: '#fff', borderRadius: 8, padding: '4px 10px', border: '1px solid #e5e7eb' },
  npcZone: { fontSize: 11, color: '#6b7280', marginTop: 8 },
  monsterGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  monsterCard: { background: '#f9fafb', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb' },
  monsterHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monsterEmoji: { fontSize: 28 },
  monsterName: { fontSize: 13, fontWeight: 700, color: '#111827' },
  monsterZone: { fontSize: 11, color: '#6b7280', background: '#fff', borderRadius: 99, padding: '2px 10px', border: '1px solid #e5e7eb' },
  monsterHP: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  monsterHPLabel: { fontSize: 11, color: '#6b7280' },
  monsterHPVal: { fontSize: 11, fontWeight: 700, color: '#dc2626' },
  monsterStats: { display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: '#6b7280' },
  eventItem: { display: 'flex', gap: 12, padding: '10px 16px', borderRadius: 8, marginBottom: 4 },
  eventTime: { fontSize: 11, color: '#6b7280', fontFamily: 'monospace', whiteSpace: 'nowrap' },
  eventText: { fontSize: 13 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 16, padding: '16px 24px', border: '1px solid #e5e7eb', marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  headerTitle: { fontSize: 22, fontWeight: 700, color: '#111827' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  liveBadge: { display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', borderRadius: 8, padding: '8px 16px', border: '1px solid #bbf7d0' },
  liveDot: { width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.4)' },
  liveText: { fontSize: 13, fontWeight: 600, color: '#166534' },
  waitPage: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9' },
  waitCard: { background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e5e7eb', maxWidth: 420, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  waitTitle: { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 },
  waitSub: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  waitDot: { width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginRight: 8, animation: 'pulse 2s infinite' },
  waitText: { fontSize: 16, fontWeight: 700, color: '#d97706' },
  btn: { display: 'inline-block', width: '100%', padding: '14px 0', background: '#4f46e5', color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', textAlign: 'center', marginTop: 16 },
};

function HPBar({ hp, maxHp, color }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const c = color || (pct > 50 ? '#16a34a' : pct > 25 ? '#d97706' : '#dc2626');
  return React.createElement('div', { style: S.barBg },
    React.createElement('div', { style: { ...S.barFill, width: pct + '%', background: c } })
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
    return React.createElement('div', { style: S.waitPage },
      React.createElement('div', { style: S.waitCard },
        React.createElement('div', { style: { fontSize: 64, marginBottom: 16 } }, '\ud83c\udfae'),
        React.createElement('h1', { style: S.waitTitle }, 'Game Data Analyzer'),
        React.createElement('p', { style: S.waitSub }, 'Arcane Village \xb7 Real-time Dashboard'),
        React.createElement('div', { style: { marginBottom: 16 } },
          React.createElement('span', { style: S.waitDot }),
          React.createElement('span', { style: S.waitText }, 'Waiting for game data...')
        ),
        React.createElement('p', { style: { fontSize: 13, color: '#6b7280', lineHeight: 1.6 } },
          'Open Arcane Village in a new tab and start playing.', React.createElement('br'),
          'This dashboard will sync automatically.'
        ),
        React.createElement('a', {
          href: 'https://yygssh.github.io/arcane-village/',
          target: '_blank', rel: 'noopener noreferrer',
          style: S.btn,
        }, '\ud83c\udff0 Open Arcane Village')
      )
    );
  }

  const p = gameState?.player || {};
  const npcs = gameState?.npcs || [];
  const monsters = gameState?.monsters || [];
  const events = gameState?.recentEvents || [];
  const mpPct = p.maxMp ? Math.round(p.mp / p.maxMp * 100) : 0;
  const totalEntities = 1 + npcs.length + monsters.length;
  const aliveCount = (p.alive ? 1 : 0) + monsters.filter(m => m.hp > 0).length;

  const zoneCounts = {};
  [p, ...npcs, ...monsters].forEach(e => { if (e.zone) zoneCounts[e.zone] = (zoneCounts[e.zone] || 0) + 1; });
  const zoneEntries = Object.entries(zoneCounts).map(([k, v]) => ({ name: ZONE_CN[k] || k, count: v })).sort((a, b) => b.count - a.count);
  const typeDist = [
    { name: 'Player', value: 1 },
    { name: 'NPC', value: npcs.length },
    { name: 'Monster', value: monsters.length },
  ];
  const combatRows = [
    { name: 'Player', hp: p.hp || 0, atk: p.atk || 0 },
    ...monsters.map(m => ({ name: m.type || '?', hp: m.hp || 0, atk: m.atk || 0 })),
  ];

  return React.createElement('div', { style: S.page },
    React.createElement('div', { style: S.container },
      // Header
      React.createElement('div', { style: S.header },
        React.createElement('div', null,
          React.createElement('h1', { style: S.headerTitle }, '\ud83c\udfae Game Data Analyzer'),
          React.createElement('p', { style: S.headerSub }, 'Arcane Village \xb7 Turn ' + (gameState?.turn || 0) + ' \xb7 ' + Math.floor((gameState?.gameTime || 0) / 1000) + 's')
        ),
        React.createElement('div', { style: S.liveBadge },
          React.createElement('span', { style: S.liveDot }),
          React.createElement('span', { style: S.liveText }, 'Live')
        )
      ),

      // Row 1: Player + Overview (2 columns)
      React.createElement('div', { style: S.row },
        // Player Status
        React.createElement('div', { style: S.col2 },
          React.createElement('div', { style: S.card },
            React.createElement('div', { style: S.cardHead },
              React.createElement('h2', { style: S.cardHeadTitle }, '\ud83c\udfaf Player Status')
            ),
            React.createElement('div', { style: S.cardBody },
              React.createElement('div', { style: S.statGrid },
                ...[
                  { icon: '\u2b50', label: 'Level', val: 'Lv.' + p.level, sub: p.class || '-', color: '#d97706' },
                  { icon: '\ud83d\udcb0', label: 'Gold', val: p.gold || 0, sub: 'Exp ' + (p.exp || 0) + '/' + (p.level * 20), color: '#b45309' },
                  { icon: '\u2694\ufe0f', label: 'ATK', val: p.atk || 0, sub: 'DEF ' + (p.def || 0), color: '#ea580c' },
                  { icon: '\ud83d\udde1\ufe0f', label: 'Weapon', val: p.weapon || 'None', sub: p.hasFireball ? 'Fireball' : 'None', color: '#7c3aed' },
                ].map((s, i) => React.createElement('div', { key: i, style: S.statCard },
                  React.createElement('div', { style: S.statIcon }, s.icon),
                  React.createElement('div', { style: S.statLabel }, s.label),
                  React.createElement('div', { style: { ...S.statVal, color: s.color } }, s.val),
                  React.createElement('div', { style: S.statSub }, s.sub)
                ))
              ),
              // HP bar
              React.createElement('div', { style: S.hpBar },
                React.createElement('div', { style: S.hpLabel },
                  React.createElement('span', { style: S.hpLabelText }, '\u2764\ufe0f HP'),
                  React.createElement('span', { style: { ...S.hpVal, color: '#dc2626' } }, p.hp + ' / ' + p.maxHp)
                ),
                React.createElement(HPBar, { hp: p.hp || 0, maxHp: p.maxHp || 1 })
              ),
              // MP bar
              React.createElement('div', { style: { ...S.hpBar, marginBottom: 0 } },
                React.createElement('div', { style: S.hpLabel },
                  React.createElement('span', { style: S.hpLabelText }, '\ud83d\udc99 MP'),
                  React.createElement('span', { style: { ...S.hpVal, color: '#2563eb' } }, p.mp + ' / ' + p.maxMp)
                ),
                React.createElement('div', { style: S.barBg },
                  React.createElement('div', { style: { ...S.barFill, width: mpPct + '%', background: '#3b82f6' } })
                )
              )
            )
          )
        ),

        // Battle Overview
        React.createElement('div', { style: S.col2 },
          React.createElement('div', { style: S.card },
            React.createElement('div', { style: S.cardHead },
              React.createElement('h2', { style: S.cardHeadTitle }, '\ud83d\udcca Battle Overview')
            ),
            React.createElement('div', { style: S.cardBody },
              React.createElement('div', { style: S.tinyGrid },
                ...[
                  { icon: '\ud83d\udc64', label: 'Total', val: totalEntities, color: '#1e293b' },
                  { icon: '\u2705', label: 'Alive', val: aliveCount, color: '#16a34a' },
                  { icon: '\ud83d\udc79', label: 'Monsters', val: monsters.length, color: '#dc2626' },
                  { icon: '\ud83d\udc65', label: 'NPCs', val: npcs.length, color: '#7c3aed' },
                ].map((s, i) => React.createElement('div', { key: i, style: S.tinyCard },
                  React.createElement('div', { style: S.tinyIcon }, s.icon),
                  React.createElement('div', { style: { ...S.tinyVal, color: s.color } }, s.val),
                  React.createElement('div', { style: S.tinyLabel }, s.label)
                ))
              ),
              React.createElement('div', { style: { ...S.sectionTitle, marginTop: 16 } }, 'Entity Distribution'),
              React.createElement(ResponsiveContainer, { width: '100%', height: 140 },
                React.createElement(PieChart, null,
                  React.createElement(Pie, { data: typeDist, dataKey: 'value', nameKey: 'name', cx: '50%', cy: '50%', outerRadius: 50, label: ({ name, value }) => name + ' ' + value },
                    typeDist.map((_, i) => React.createElement(Cell, { key: i, fill: PIE_COLORS[i] }))
                  ),
                  React.createElement(Tooltip, { contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1e293b', fontSize: 12 } })
                )
              )
            )
          )
        )
      ),

      // Row 2: Zone + Combat (2 columns)
      React.createElement('div', { style: S.row },
        React.createElement('div', { style: S.col2 },
          React.createElement('div', { style: S.card },
            React.createElement('div', { style: S.cardHead },
              React.createElement('h2', { style: S.cardHeadTitle }, '\ud83d\udccd Zone Distribution')
            ),
            React.createElement('div', { style: S.cardBody },
              React.createElement(ResponsiveContainer, { width: '100%', height: 280 },
                React.createElement(BarChart, { data: zoneEntries, layout: 'vertical', margin: { left: 10, right: 20 } },
                  React.createElement(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e5e7eb' }),
                  React.createElement(XAxis, { type: 'number', tick: { fill: '#64748b', fontSize: 11 } }),
                  React.createElement(YAxis, { type: 'category', dataKey: 'name', width: 75, tick: { fill: '#334155', fontSize: 11 } }),
                  React.createElement(Tooltip, { contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1e293b', fontSize: 12 } }),
                  React.createElement(Bar, { dataKey: 'count', fill: '#6366f1', radius: [0, 4, 4, 0] })
                )
              )
            )
          )
        ),
        React.createElement('div', { style: S.col2 },
          React.createElement('div', { style: S.card },
            React.createElement('div', { style: S.cardHead },
              React.createElement('h2', { style: S.cardHeadTitle }, '\u2694\ufe0f Combat Power')
            ),
            React.createElement('div', { style: S.cardBody },
              combatRows.length > 1
                ? React.createElement(ResponsiveContainer, { width: '100%', height: 280 },
                    React.createElement(BarChart, { data: combatRows, margin: { left: 10, right: 20 } },
                      React.createElement(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e5e7eb' }),
                      React.createElement(XAxis, { dataKey: 'name', tick: { fill: '#64748b', fontSize: 10 } }),
                      React.createElement(YAxis, { tick: { fill: '#64748b', fontSize: 11 } }),
                      React.createElement(Tooltip, { contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1e293b', fontSize: 12 } }),
                      React.createElement(Bar, { dataKey: 'hp', fill: '#f87171', radius: [4, 4, 0, 0], name: 'HP' }),
                      React.createElement(Bar, { dataKey: 'atk', fill: '#fbbf24', radius: [4, 4, 0, 0], name: 'ATK' })
                    )
                  )
                : React.createElement('p', { style: { color: '#9ca3af', textAlign: 'center', padding: '48px 0' } }, 'Waiting for monsters...')
            )
          )
        )
      ),

      // Row 3: NPCs (full width)
      React.createElement('div', { style: S.full },
        React.createElement('div', { style: S.card },
          React.createElement('div', { style: S.cardHead },
            React.createElement('h2', { style: S.cardHeadTitle }, '\ud83d\udc65 NPC Status (' + npcs.length + ')')
          ),
          React.createElement('div', { style: S.cardBody },
            React.createElement('div', { style: S.npcGrid },
              npcs.map((n, i) => {
                const st = n.state || 'idle';
                const si = { walking: '\ud83d\udeb6 Moving', talking: '\ud83d\udcac Talking', casting: '\u2728 Casting', idle: '\ud83d\udca4 Idle' };
                const nc = NPC_COLORS[n.name] || '#6366f1';
                return React.createElement('div', { key: i, style: S.npcCard },
                  React.createElement('div', { style: S.npcRow },
                    React.createElement('div', { style: { ...S.npcAvatar, background: nc } }, n.name[0]),
                    React.createElement('div', null,
                      React.createElement('div', { style: S.npcName }, n.name),
                      React.createElement('div', { style: S.npcTitle }, n.title)
                    )
                  ),
                  React.createElement('div', { style: S.npcState }, si[st] || st),
                  React.createElement('div', { style: S.npcZone }, '\ud83d\udccd ' + (ZONE_CN[n.zone] || n.zone))
                );
              })
            )
          )
        )
      ),

      // Row 4: Monsters
      React.createElement('div', { style: S.full },
        React.createElement('div', { style: S.card },
          React.createElement('div', { style: S.cardHead },
            React.createElement('h2', { style: S.cardHeadTitle }, '\ud83d\udc79 Active Monsters (' + monsters.length + ')')
          ),
          React.createElement('div', { style: S.cardBody },
            monsters.length === 0
              ? React.createElement('p', { style: { color: '#9ca3af', textAlign: 'center', padding: 16 } }, 'No monsters')
              : React.createElement('div', { style: S.monsterGrid },
                  monsters.map((m, i) => React.createElement('div', { key: i, style: S.monsterCard },
                    React.createElement('div', { style: S.monsterHead },
                      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                        React.createElement('span', { style: S.monsterEmoji }, m.emoji),
                        React.createElement('span', { style: S.monsterName }, m.type)
                      ),
                      React.createElement('span', { style: S.monsterZone }, ZONE_CN[m.zone] || m.zone)
                    ),
                    React.createElement('div', { style: S.monsterHP },
                      React.createElement('span', { style: S.monsterHPLabel }, 'HP'),
                      React.createElement('span', { style: S.monsterHPVal }, m.hp + ' / ' + m.maxHp)
                    ),
                    React.createElement(HPBar, { hp: m.hp || 0, maxHp: m.maxHp || 1 }),
                    React.createElement('div', { style: S.monsterStats },
                      React.createElement('span', null, 'ATK ' + m.atk),
                      React.createElement('span', null, 'DEF ' + m.def)
                    )
                  ))
                )
          )
        )
      ),

      // Row 5: Events
      React.createElement('div', { style: S.full },
        React.createElement('div', { style: S.card },
          React.createElement('div', { style: S.cardHead },
            React.createElement('h2', { style: S.cardHeadTitle }, '\ud83d\udcdc Event Log')
          ),
          React.createElement('div', { style: { ...S.cardBody, maxHeight: 280, overflowY: 'auto' } },
            events.length === 0 && React.createElement('p', { style: { color: '#9ca3af', fontSize: 13, padding: 8 } }, 'Waiting for events...'),
            events.map((e, i) => {
              const catColors = {
                combat: { border: '#ef4444', bg: '#fef2f2', text: '#1e293b' },
                cast: { border: '#f59e0b', bg: '#fffbeb', text: '#1e293b' },
                talk: { border: '#10b981', bg: '#ecfdf5', text: '#1e293b' },
                loot: { border: '#f59e0b', bg: '#fefce8', text: '#1e293b' },
                system: { border: '#9ca3af', bg: '#f9fafb', text: '#6b7280' },
              };
              const cc = catColors[e.cat] || { border: '#d1d5db', bg: '#fff', text: '#374151' };
              return React.createElement('div', {
                key: i,
                style: { ...S.eventItem, borderLeft: '3px solid ' + cc.border, background: cc.bg }
              },
                React.createElement('span', { style: S.eventTime }, '[' + e.time + ']'),
                React.createElement('span', { style: { ...S.eventText, color: cc.text, fontStyle: e.cat === 'system' ? 'italic' : 'normal' } }, e.msg)
              );
            })
          )
        )
      )
    )
  );
}

export default App;
