import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

function DataCharts({ data }) {
  if (!data || !data.length) return <p className="text-gray-400 text-center py-4">等待数据...</p>;

  // Type distribution (player/NPC/monster)
  const typeGroups = {};
  data.forEach(d => { typeGroups[d.type] = (typeGroups[d.type] || 0) + 1; });
  const typeDist = Object.entries(typeGroups).map(([name, value]) => ({ name, value }));

  // Zone distribution
  const zoneGroups = {};
  data.forEach(d => { if (d.zone) zoneGroups[d.zone] = (zoneGroups[d.zone] || 0) + 1; });
  const zoneData = Object.entries(zoneGroups).map(([name, count]) => ({ name, count }));

  // Combat stats (only rows with numeric hp/atk)
  const combatRows = data.filter(d => typeof d.hp === 'number' && typeof d.atk === 'number' && d.hp > 0);
  const combatData = combatRows.slice(0, 12).map(d => ({
    name: d.name?.slice(0, 4) || '?',
    hp: typeof d.hp === 'number' ? d.hp : 0,
    atk: typeof d.atk === 'number' ? d.atk : 0,
  }));

  // Counters
  const playerCount = data.filter(d => d.type === '🎮玩家').length;
  const npcCount = data.filter(d => d.type === '👤NPC').length;
  const monsterCount = data.filter(d => d.type === '👹怪物').length;
  const aliveCount = data.filter(d => d.status === '存活').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '玩家', val: playerCount, clr: 'text-blue-400' },
          { label: 'NPC', val: npcCount, clr: 'text-purple-400' },
          { label: '怪物', val: monsterCount, clr: 'text-red-400' },
          { label: '存活', val: aliveCount, clr: 'text-green-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 rounded-lg p-2 text-center border border-gray-700">
            <div className={`text-lg font-bold ${s.clr}`}>{s.val}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-200 mb-2">类型分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={typeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {typeDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-200 mb-2">战力对比 (HP/ATK)</h3>
          {combatData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={combatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                <Bar dataKey="hp" fill="#ef4444" radius={[3, 3, 0, 0]} name="HP" />
                <Bar dataKey="atk" fill="#f59e0b" radius={[3, 3, 0, 0]} name="ATK" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-8">无战力数据</p>}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">区域分布</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={zoneData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
            <Bar dataKey="count" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DataCharts;
