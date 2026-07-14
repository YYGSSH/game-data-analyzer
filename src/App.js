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
  page: 'bg-slate-100 min-h-screen p-6',
  container: 'max-w-5xl mx-auto',
  row: 'flex gap-6 mb-6',
  col2: 'flex-1 min-w-0',
  full: 'mb-4',
  card: 'bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm',
  cardHead: 'px-5 py-3 border-b border-gray-100 bg-gray-50',
  cardHeadTitle: 'text-xs font-bold text-slate-800 uppercase tracking-wider',
  cardBody: 'p-5',
  statGrid: 'grid grid-cols-4 gap-3 mb-4',
  statCard: 'bg-white rounded-xl p-4 border border-gray-200 text-center shadow-xs',
  statIcon: 'text-xl',
  statLabel: 'text-xs font-semibold text-gray-500 uppercase tracking-wider',
  statVal: 'text-2xl font-bold mt-0.5',
  statSub: 'text-xs text-gray-500 mt-0.5',
  hpBar: 'bg-gray-100 rounded-xl p-4 border border-gray-200 mb-3',
  hpLabel: 'flex justify-between mb-2',
  hpLabelText: 'text-sm font-semibold text-gray-700',
  hpVal: 'text-sm font-bold',
  barBg: 'w-full h-3 bg-gray-200 rounded-full overflow-hidden',
  barFill: 'h-full rounded-full transition-all duration-300',
  tinyGrid: 'grid grid-cols-2 gap-3',
  tinyCard: 'bg-gray-50 rounded-xl p-3 border border-gray-200 text-center',
  tinyIcon: 'text-2xl mb-0.5',
  tinyVal: 'text-xl font-bold',
  tinyLabel: 'text-xs text-gray-500',
  sectionTitle: 'text-xs font-semibold text-gray-500 uppercase mb-2',
  npcGrid: 'grid grid-cols-5 gap-3',
  npcCard: 'bg-gray-50 rounded-xl p-4 border border-gray-200',
  npcRow: 'flex items-center gap-3 mb-3',
  npcAvatar: 'w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold',
  npcName: 'text-sm font-bold text-gray-900',
  npcTitle: 'text-xs text-gray-500',
  npcState: 'inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-white rounded-lg px-2.5 py-1 border border-gray-200',
  npcZone: 'text-xs text-gray-500 mt-2',
  monsterGrid: 'grid grid-cols-4 gap-3',
  monsterCard: 'bg-gray-50 rounded-xl p-4 border border-gray-200',
  monsterHead: 'flex justify-between items-center mb-3',
  monsterEmoji: 'text-3xl',
  monsterName: 'text-sm font-bold text-gray-900',
  monsterZone: 'text-xs text-gray-500 bg-white rounded-full px-2 py-0.5 border border-gray-200',
  monsterHP: 'flex justify-between mb-1.5',
  monsterHPLabel: 'text-xs text-gray-500',
  monsterHPVal: 'text-xs font-bold text-red-600',
  monsterStats: 'flex justify-between mt-3 text-xs text-gray-500',
  eventItem: 'flex gap-3 px-4 py-2.5 rounded-lg mb-1',
  eventTime: 'text-xs text-gray-500 font-mono whitespace-nowrap',
  eventText: 'text-sm',
  header: 'flex justify-between items-center bg-white rounded-2xl px-6 py-4 border border-gray-200 mb-6 shadow-sm',
  headerTitle: 'text-xl font-bold text-gray-900',
  headerSub: 'text-sm text-gray-500 mt-0.5',
  liveBadge: 'flex items-center gap-2 bg-green-50 rounded-lg px-4 py-2 border border-green-200',
  liveDot: 'w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm',
  liveText: 'text-sm font-semibold text-green-800',
  waitPage: 'flex items-center justify-center min-h-screen bg-slate-100',
  waitCard: 'bg-white rounded-2xl p-8 border border-gray-200 max-w-sm text-center shadow-lg',
  waitTitle: 'text-xl font-bold text-gray-900 mb-2',
  waitSub: 'text-sm text-gray-500 mb-5',
  waitDot: 'w-3 h-3 rounded-full bg-amber-500 inline-block mr-2',
  waitText: 'text-base font-bold text-amber-600',
  btn: 'inline-block w-full py-3.5 bg-indigo-600 text-white rounded-xl text-base font-bold no-underline text-center',
};

function HPBar({ hp, maxHp, color }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const c = color || (pct > 50 ? '#16a34a' : pct > 25 ? '#d97706' : '#dc2626');
  return React.createElement('div', { className: S.barBg},
    React.createElement('div', { className: S.barFill, style: { width: pct + '%', background: c } })
  );
}

function App() {
  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const timerRef = useRef(null);
  const lastTurnRef = useRef(0);

  const pollGameState = useCallback(() => {
    try {
      const raw = localStorage.getItem('arcane_village_state');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data.timestamp) return;
      const age = Date.now() - new Date(data.timestamp).getTime();
      if (age > 6000 || age < 0) return;
      lastTurnRef.current = data.turn;
      setGameState(data);
      setConnected(true);
      setShowDashboard(true);
    } catch (e) {}
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(pollGameState, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pollGameState]);

  if (!connected) {
    return React.createElement('div', { className: S.waitPage},
      React.createElement('div', { className: S.waitCard},
        React.createElement('div', { style: { fontSize: 64, marginBottom: 16 } }, '\ud83c\udfae'),
        React.createElement('h1', { className: S.waitTitle}, 'Game Data Analyzer'),
        React.createElement('p', { className: S.waitSub}, 'Arcane Village \xb7 Real-time Dashboard'),
        React.createElement('div', { style: { marginBottom: 16 } },
          React.createElement('span', { className: S.waitDot}),
          React.createElement('span', { className: S.waitText}, 'Waiting for game data...')
        ),
        React.createElement('p', { style: { fontSize: 13, color: '#6b7280', lineHeight: 1.6 } },
          'Open the game in the new tab and start playing.', React.createElement('br'), 'Return here after a few seconds - the dashboard loads automatically.'
        ),
        React.createElement('a', {
          href: 'game.html',
          target: '_blank', rel: 'noopener noreferrer',
          className: S.btn,
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

  return React.createElement('div', { className: S.page},
    React.createElement('div', { className: S.container},
      // Header
      React.createElement('div', { className: S.header},
        React.createElement('div', null,
          React.createElement('h1', { className: S.headerTitle}, '\ud83c\udfae Game Data Analyzer'),
          React.createElement('p', { className: S.headerSub}, 'Arcane Village \xb7 Turn ' + (gameState?.turn || 0) + ' \xb7 ' + Math.floor((gameState?.gameTime || 0) / 1000) + 's')
        ),
        React.createElement('div', { className: S.liveBadge},
          React.createElement('span', { className: S.liveDot}),
          React.createElement('span', { className: S.liveText}, 'Live')
        )
      ),

      // Row 1: Player + Overview (2 columns)
      React.createElement('div', { className: S.row},
        // Player Status
        React.createElement('div', { className: S.col2},
          React.createElement('div', { className: S.card},
            React.createElement('div', { className: S.cardHead},
              React.createElement('h2', { className: S.cardHeadTitle}, '\ud83c\udfaf Player Status')
            ),
            React.createElement('div', { className: S.cardBody},
              React.createElement('div', { className: S.statGrid},
                ...[
                  { icon: '\u2b50', label: 'Level', val: 'Lv.' + p.level, sub: p.class || '-', color: '#d97706' },
                  { icon: '\ud83d\udcb0', label: 'Gold', val: p.gold || 0, sub: 'Exp ' + (p.exp || 0) + '/' + (p.level * 20), color: '#b45309' },
                  { icon: '\u2694\ufe0f', label: 'ATK', val: p.atk || 0, sub: 'DEF ' + (p.def || 0), color: '#ea580c' },
                  { icon: '\ud83d\udde1\ufe0f', label: 'Weapon', val: p.weapon || 'None', sub: p.hasFireball ? 'Fireball' : 'None', color: '#7c3aed' },
                ].map((s, i) => React.createElement('div', { key: i, className: S.statCard},
                  React.createElement('div', { className: S.statIcon}, s.icon),
                  React.createElement('div', { className: S.statLabel}, s.label),
                  React.createElement('div', { className: S.statVal, style: { color: s.color } }, s.val),
                  React.createElement('div', { className: S.statSub}, s.sub)
                ))
              ),
              // HP bar
              React.createElement('div', { className: S.hpBar},
                React.createElement('div', { className: S.hpLabel},
                  React.createElement('span', { className: S.hpLabelText}, '\u2764\ufe0f HP'),
                  React.createElement('span', { className: S.hpVal, style: { color: '#dc2626' } }, p.hp + ' / ' + p.maxHp)
                ),
                React.createElement(HPBar, { hp: p.hp || 0, maxHp: p.maxHp || 1 })
              ),
              // MP bar
              React.createElement('div', { className: S.hpBar, style: { marginBottom: 0 } },
                React.createElement('div', { className: S.hpLabel},
                  React.createElement('span', { className: S.hpLabelText}, '\ud83d\udc99 MP'),
                  React.createElement('span', { className: S.hpVal, style: { color: '#2563eb' } }, p.mp + ' / ' + p.maxMp)
                ),
                React.createElement('div', { className: S.barBg},
                  React.createElement('div', { className: S.barFill, style: { width: mpPct + '%', background: '#3b82f6' } })
                )
              )
            )
          )
        ),

        // Battle Overview
        React.createElement('div', { className: S.col2},
          React.createElement('div', { className: S.card},
            React.createElement('div', { className: S.cardHead},
              React.createElement('h2', { className: S.cardHeadTitle}, '\ud83d\udcca Battle Overview')
            ),
            React.createElement('div', { className: S.cardBody},
              React.createElement('div', { className: S.tinyGrid},
                ...[
                  { icon: '\ud83d\udc64', label: 'Total', val: totalEntities, color: '#1e293b' },
                  { icon: '\u2705', label: 'Alive', val: aliveCount, color: '#16a34a' },
                  { icon: '\ud83d\udc79', label: 'Monsters', val: monsters.length, color: '#dc2626' },
                  { icon: '\ud83d\udc65', label: 'NPCs', val: npcs.length, color: '#7c3aed' },
                ].map((s, i) => React.createElement('div', { key: i, className: S.tinyCard},
                  React.createElement('div', { className: S.tinyIcon}, s.icon),
                  React.createElement('div', { className: S.tinyVal, style: { color: s.color } }, s.val),
                  React.createElement('div', { className: S.tinyLabel}, s.label)
                ))
              ),
              React.createElement('div', { className: S.sectionTitle, style: { marginTop: 16 } }, 'Entity Distribution'),
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
      React.createElement('div', { className: S.row},
        React.createElement('div', { className: S.col2},
          React.createElement('div', { className: S.card},
            React.createElement('div', { className: S.cardHead},
              React.createElement('h2', { className: S.cardHeadTitle}, '\ud83d\udccd Zone Distribution')
            ),
            React.createElement('div', { className: S.cardBody},
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
        React.createElement('div', { className: S.col2},
          React.createElement('div', { className: S.card},
            React.createElement('div', { className: S.cardHead},
              React.createElement('h2', { className: S.cardHeadTitle}, '\u2694\ufe0f Combat Power')
            ),
            React.createElement('div', { className: S.cardBody},
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
      React.createElement('div', { className: S.full},
        React.createElement('div', { className: S.card},
          React.createElement('div', { className: S.cardHead},
            React.createElement('h2', { className: S.cardHeadTitle}, '\ud83d\udc65 NPC Status (' + npcs.length + ')')
          ),
          React.createElement('div', { className: S.cardBody},
            React.createElement('div', { className: S.npcGrid},
              npcs.map((n, i) => {
                const st = n.state || 'idle';
                const si = { walking: '\ud83d\udeb6 Moving', talking: '\ud83d\udcac Talking', casting: '\u2728 Casting', idle: '\ud83d\udca4 Idle' };
                const nc = NPC_COLORS[n.name] || '#6366f1';
                return React.createElement('div', { key: i, className: S.npcCard},
                  React.createElement('div', { className: S.npcRow},
                    React.createElement('div', { className: S.npcAvatar, style: { background: nc } }, n.name[0]),
                    React.createElement('div', null,
                      React.createElement('div', { className: S.npcName}, n.name),
                      React.createElement('div', { className: S.npcTitle}, n.title)
                    )
                  ),
                  React.createElement('div', { className: S.npcState}, si[st] || st),
                  React.createElement('div', { className: S.npcZone}, '\ud83d\udccd ' + (ZONE_CN[n.zone] || n.zone))
                );
              })
            )
          )
        )
      ),

      // Row 4: Monsters
      React.createElement('div', { className: S.full},
        React.createElement('div', { className: S.card},
          React.createElement('div', { className: S.cardHead},
            React.createElement('h2', { className: S.cardHeadTitle}, '\ud83d\udc79 Active Monsters (' + monsters.length + ')')
          ),
          React.createElement('div', { className: S.cardBody},
            monsters.length === 0
              ? React.createElement('p', { style: { color: '#9ca3af', textAlign: 'center', padding: 16 } }, 'No monsters')
              : React.createElement('div', { className: S.monsterGrid},
                  monsters.map((m, i) => React.createElement('div', { key: i, className: S.monsterCard},
                    React.createElement('div', { className: S.monsterHead},
                      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                        React.createElement('span', { className: S.monsterEmoji}, m.emoji),
                        React.createElement('span', { className: S.monsterName}, m.type)
                      ),
                      React.createElement('span', { className: S.monsterZone}, ZONE_CN[m.zone] || m.zone)
                    ),
                    React.createElement('div', { className: S.monsterHP},
                      React.createElement('span', { className: S.monsterHPLabel}, 'HP'),
                      React.createElement('span', { className: S.monsterHPVal}, m.hp + ' / ' + m.maxHp)
                    ),
                    React.createElement(HPBar, { hp: m.hp || 0, maxHp: m.maxHp || 1 }),
                    React.createElement('div', { className: S.monsterStats},
                      React.createElement('span', null, 'ATK ' + m.atk),
                      React.createElement('span', null, 'DEF ' + m.def)
                    )
                  ))
                )
          )
        )
      ),

      // Row 5: Events
      React.createElement('div', { className: S.full},
        React.createElement('div', { className: S.card},
          React.createElement('div', { className: S.cardHead},
            React.createElement('h2', { className: S.cardHeadTitle}, '\ud83d\udcdc Event Log')
          ),
          React.createElement('div', { className: S.cardBody, style: { maxHeight: 280, overflowY: 'auto' } },
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
                className: S.eventItem, style: { borderLeft: '3px solid ' + cc.border, background: cc.bg }
              },
                React.createElement('span', { className: S.eventTime}, '[' + e.time + ']'),
                React.createElement('span', { className: S.eventText, style: { color: cc.text, fontStyle: e.cat === 'system' ? 'italic' : 'normal' } }, e.msg)
              );
            })
          )
        )
      )
    )
  );
}

export default App;
