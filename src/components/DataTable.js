import React from "react";

function DataTable({ data }) {
  if (!data || !data.length) {
    return <p className="text-gray-400 text-center py-4">无匹配数据</p>;
  }

  const cols = [
    { key: 'type', label: '类型', w: 'w-16' },
    { key: 'name', label: '名称', w: 'w-20' },
    { key: 'class', label: '职业/定位', w: 'w-20' },
    { key: 'hp', label: 'HP', w: 'w-16' },
    { key: 'atk', label: '攻击', w: 'w-14' },
    { key: 'def', label: '防御', w: 'w-14' },
    { key: 'gold', label: '金币', w: 'w-16' },
    { key: 'zone', label: '区域', w: 'w-20' },
    { key: 'status', label: '状态', w: 'w-14' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-700">
            {cols.map(h => (
              <th key={h.key} className={`px-3 py-2 border border-gray-600 text-left text-xs font-semibold text-gray-200 ${h.w}`}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}
              className={`hover:bg-gray-700/50 ${row.status === '阵亡' ? 'opacity-50' : ''} ${row.type === '🎮玩家' ? 'bg-purple-900/20' : ''}`}>
              {cols.map(col => {
                const key = col.key;
                let val = row[key];
                if (val === undefined || val === null) val = '-';
                if (key === 'hp' && row.maxHp) val = val + '/' + row.maxHp;

                let cls = 'text-gray-300';
                if (key === 'type') cls = row[key] === '🎮玩家' ? 'text-blue-400 font-bold' : row[key] === '👤NPC' ? 'text-purple-400' : row[key] === '👹怪物' ? 'text-red-400' : 'text-gray-400';
                if (key === 'name' && row.type === '🎮玩家') cls = 'text-blue-300 font-medium';
                if (key === 'hp' && typeof row.hp === 'number') cls = row.hp < row.maxHp * 0.3 ? 'text-red-400 font-bold' : 'text-red-300';
                if (key === 'gold' && row[key] !== '-') cls = 'text-yellow-300';
                if (key === 'status') cls = row[key] === '存活' ? 'text-green-400 font-bold' : row[key] === '阵亡' ? 'text-red-400 font-bold' : 'text-gray-400';
                if (key === 'zone') cls = 'text-gray-400';

                return (
                  <td key={key} className={`px-3 py-2 border border-gray-700 text-xs ${cls}`}>
                    {String(val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
