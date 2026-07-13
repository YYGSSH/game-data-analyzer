import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ['#818cf8', '#a78bfa', '#f87171', '#fbbf24', '#34d399', '#f472b6', '#8b5cf6', '#2dd4bf'];

function DataCharts({ data }) {
  if (!data || !data.length) return <p className="text-slate-300 text-center py-4">等待数据...</p>;

  const typeGroups = {};
  data.forEach(d => { typeGroups[d.type] = (typeGroups[d.type] || 0) + 1; });
  const typeDist = Object.entries(typeGroups).map(([name, value]) => ({ name, value }));

  const zoneGroups = {};
  data.forEach(d => { if (d.zone) zoneGroups[d.zone] = (zoneGroups[d.zone] || 0) + 1; });
  const zoneData = Object.entries(zoneGroups).map(([name, count]) => ({ name, count }));

  const combatRows = data.filter(d => typeof d.hp === 'number' && typeof d.atk === 'number' && d.hp > 0);
  const combatData = combatRows.slice(0, 12).map(d => ({
    name: d.name?.slice(0, 4) || '?',
    hp: typeof d.hp === 'number' ? d.hp : 0,
    atk: typeof d.atk === 'number' ? d.atk : 0,
  }));

  const playerCount = data.filter(d => d.type === '🎮玩家').length;
  const npcCount = data.filter(d => d.type === '👤NPC').length;
  const monsterCount = data.filter(d => d.type === '👹怪物').length;
  const aliveCount = data.filter(d => d.status === '存活').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '玩家', val: playerCount, clr: 'text-blue-400' },
          { label: 'NPC', val: npcCount, clr: 'text-violet-400' },
          { label: '怪物', val: monsterCount, clr: 'text-rose-400' },
          { label: '存活', val: aliveCount, clr: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-700 rounded-lg p-2 text-center border border-slate-600">
            <div className={`text-lg font-bold ${s.clr}`}>{s.val}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-700 rounded-xl p-3 border border-slate-600">
          <h3 className="text-sm font-semibold text-white mb-2">类型分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={typeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}
                label={({ name, value }) => `${name} ${value}`}>
                {typeDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-700 rounded-xl p-3 border border-slate-600">
          <h3 className="text-sm font-semibold text-white mb-2">战力对比 (HP/ATK)</h3>
          {combatData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={combatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#e2e8f0' }} />
                <Bar dataKey="hp" fill="#f87171" radius={[3, 3, 0, 0]} name="HP" />
                <Bar dataKey="atk" fill="#fbbf24" radius={[3, 3, 0, 0]} name="ATK" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-center py-8">无战力数据</p>}
        </div>
      </div>

      <div className="bg-slate-700 rounded-xl p-3 border border-slate-600">
        <h3 className="text-sm font-semibold text-white mb-2">区域分布</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={zoneData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <YAxis tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#e2e8f0' }} />
            <Bar dataKey="count" fill="#34d399" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DataCharts;
