import React from "react";

function DataTable({ data }) {
  if (!data || !data.length) {
    return <p className="text-slate-300 text-center py-4">无匹配数据</p>;
  }

  const cols = [
    { key: 'type', label: '类型' },
    { key: 'name', label: '名称' },
    { key: 'class', label: '定位' },
    { key: 'hp', label: 'HP' },
    { key: 'atk', label: '攻击' },
    { key: 'def', label: '防御' },
    { key: 'gold', label: '金币' },
    { key: 'zone', label: '区域' },
    { key: 'status', label: '状态' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-slate-700">
            {cols.map(h => (
              <th key={h.key} className="px-3 py-2.5 border border-slate-600 text-left text-xs font-bold text-white uppercase tracking-wide">
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isPlayer = row.type === '🎮玩家';
            const isDead = row.status === '阵亡';
            return (
              <tr key={row.id || i}
                className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${isPlayer ? 'bg-indigo-900/30' : ''} ${isDead ? 'opacity-50' : ''}`}>
                {cols.map(col => {
                  const key = col.key;
                  let val = row[key];
                  if (val === undefined || val === null) val = '-';
                  if (key === 'hp' && row.maxHp && typeof row.hp === 'number') val = val + '/' + row.maxHp;

                  let textColor = 'text-slate-200';
                  if (key === 'type') {
                    if (isPlayer) textColor = 'text-blue-400 font-bold';
                    else if (row[key] === '👤NPC') textColor = 'text-violet-400';
                    else if (row[key] === '👹怪物') textColor = 'text-rose-400';
                  }
                  if (key === 'name' && isPlayer) textColor = 'text-blue-300 font-semibold';
                  if (key === 'hp' && typeof row.hp === 'number') {
                    textColor = row.hp < 10 ? 'text-rose-400 font-bold' : 'text-rose-300';
                  }
                  if (key === 'gold' && row[key] !== '-' && row[key] !== undefined) textColor = 'text-amber-300 font-medium';
                  if (key === 'status') {
                    textColor = row[key] === '存活' ? 'text-emerald-400 font-bold' : row[key] === '阵亡' ? 'text-rose-400' : 'text-slate-400';
                  }

                  return (
                    <td key={key} className={`px-3 py-2.5 border border-slate-700 text-xs ${textColor}`}>
                      {String(val)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
