import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function DataCharts({ data }) {
  if (!data.length) return <p className="text-gray-400 text-center py-4">无数据</p>;

  const classGroups = {};
  data.forEach(d => { classGroups[d.class] = (classGroups[d.class] || 0) + 1; });
  const classDist = Object.entries(classGroups).map(([name, value]) => ({ name, value }));

  const levelData = data.map(d => ({ name: d.player, level: d.level, hp: Math.round(d.hp/10), atk: d.atk }));
  const aliveCount = data.filter(d => d.status === '存活').length;
  const deadCount = data.filter(d => d.status === '阵亡').length;

  const zoneGroups = {};
  data.forEach(d => { zoneGroups[d.zone] = (zoneGroups[d.zone] || 0) + 1; });
  const zoneData = Object.entries(zoneGroups).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-200 mb-2">职业分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={classDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {classDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{background:'#1f2937',border:'1px solid #374151',borderRadius:8}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-200 mb-2">等级 vs HP vs 攻击力</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{fill:'#9ca3af',fontSize:10}} />
              <YAxis tick={{fill:'#9ca3af',fontSize:10}} />
              <Tooltip contentStyle={{background:'#1f2937',border:'1px solid #374151',borderRadius:8}} />
              <Bar dataKey="level" fill="#7c3aed" radius={[3,3,0,0]} />
              <Bar dataKey="hp" fill="#06b6d4" radius={[3,3,0,0]} />
              <Bar dataKey="atk" fill="#10b981" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">区域分布</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={zoneData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{fill:'#9ca3af',fontSize:10}} />
            <YAxis tick={{fill:'#9ca3af',fontSize:10}} />
            <Tooltip contentStyle={{background:'#1f2937',border:'1px solid #374151',borderRadius:8}} />
            <Bar dataKey="count" fill="#10b981" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">{data.length}</div>
          <div className="text-xs text-gray-400">总记录</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{aliveCount}</div>
          <div className="text-xs text-gray-400">存活</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
          <div className="text-2xl font-bold text-red-400">{deadCount}</div>
          <div className="text-xs text-gray-400">阵亡</div>
        </div>
      </div>
    </div>
  );
}

export default DataCharts;
