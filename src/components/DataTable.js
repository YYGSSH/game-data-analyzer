import React from "react";

function DataTable({ data }) {
  if (!data.length) {
    return <p className="text-gray-400 text-center py-4">无匹配数据</p>;
  }

  const keys = ['player','class','level','hp','mp','atk','def','gold','weapon','monsters_killed','survival_time','zone','status'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-700">
            {['玩家','职业','等级','HP','MP','攻击','防御','金币','武器','杀怪数','存活时间','区域','状态'].map(h => (
              <th key={h} className="px-3 py-2 border border-gray-600 text-left text-xs font-semibold text-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className={`hover:bg-gray-700 ${row.status === '阵亡' ? 'bg-gray-800/50' : ''}`}>
              {keys.map((k) => (
                <td key={k} className={`px-3 py-2 border border-gray-700 text-xs ${
                  k === 'status' ? (row[k] === '存活' ? 'text-green-400 font-bold' : 'text-red-400 font-bold')
                  : k === 'player' ? 'text-purple-300 font-medium'
                  : k === 'gold' ? 'text-yellow-300'
                  : 'text-gray-300'
                }`}>
                  {k === 'survival_time' && typeof row[k] === 'string' ? parseInt(row[k]) : row[k]}
                  {k === 'survival_time' && (typeof row[k] === 'number' || typeof row[k] === 'string' && !isNaN(row[k])) ? 's' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
