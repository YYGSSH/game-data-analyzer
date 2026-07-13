import React, { useRef, useEffect, useState } from "react";
import data from "./data.json";
import DataTable from "./components/DataTable";
import DataCharts from "./components/DataCharts";
import { motion } from "framer-motion";
import { Input } from "./components/ui/input";
import { Select } from "./components/ui/select";

function GameMinimap({ data }) {
  const canvasRef = useRef(null);
  const ZONE_COLORS = {
    '黑暗森林': '#1a4a2e', '精灵林地': '#2d6a1e', '矿山深处': '#666',
    '森林边缘': '#4a7a3e', '高塔': '#8b6914', '酒馆': '#b8860b',
    '铁匠铺': '#8b4513', '火山洞穴': '#aa4422'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(0, 0, w, h);

    const zoneCounts = {};
    const zoneAlive = {};
    data.forEach(d => {
      zoneCounts[d.zone] = (zoneCounts[d.zone] || 0) + 1;
      if (d.status === '存活') zoneAlive[d.zone] = (zoneAlive[d.zone] || 0) + 1;
    });

    const zones = Object.keys(zoneCounts);
    const cols = Math.ceil(Math.sqrt(zones.length));
    const cellW = w / cols, cellH = h / Math.ceil(zones.length / cols);

    zones.forEach((zone, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = col * cellW + 4, y = row * cellH + 4;
      const cw = cellW - 8, ch = cellH - 8;
      ctx.fillStyle = ZONE_COLORS[zone] || '#4a3a2a';
      ctx.fillRect(x, y, cw, ch);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.slice(0, 4), x + cw / 2, y + 14);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(`👤${zoneCounts[zone]}`, x + cw / 2, y + ch - 6);
    });
  }, [data]);

  return (
    <div className="bg-gray-800 rounded-2xl shadow p-4 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-100 mb-3">🗺️ 区域地图</h2>
      <canvas ref={canvasRef} width={280} height={180} className="w-full rounded-lg border border-gray-700" />
      <p className="text-xs text-gray-400 mt-2">按区域分布 · 数字 = 玩家数</p>
    </div>
  );
}

function App() {
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = data.filter((row) => {
    return (
      (category === "All" || row.class === category) &&
      (status === "All" || row.status === status) &&
      (search === "" ||
        row.player.toLowerCase().includes(search.toLowerCase()) ||
        row.zone.toLowerCase().includes(search.toLowerCase()) ||
        row.weapon.toLowerCase().includes(search.toLowerCase()) ||
        row.class.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="p-4 lg:p-6 min-h-screen" style={{background:'#0c0a1a'}}>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">🎮 游戏数据分析平台</h1>
        <p className="text-gray-400 text-sm mt-1">Arcane Village — 玩家数据可视化分析仪表盘</p>
      </motion.div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-36 bg-gray-800 text-gray-200 border-gray-700">
          <option value="All">所有职业</option>
          <option value="法师">法师</option><option value="精灵">精灵</option>
          <option value="矮人">矮人</option><option value="猎人">猎人</option><option value="治疗师">治疗师</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}
          className="w-32 bg-gray-800 text-gray-200 border-gray-700">
          <option value="All">所有状态</option><option value="存活">存活</option><option value="阵亡">阵亡</option>
        </Select>
        <Input type="text" placeholder="搜索 玩家/区域/武器/职业..."
          className="w-64 bg-gray-800 text-gray-200 border-gray-700"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1">
          <GameMinimap data={filtered} />
        </div>
        <div className="lg:col-span-2">
          <motion.div className="bg-gray-800 rounded-2xl shadow p-4 border border-gray-700"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <DataCharts data={filtered} />
          </motion.div>
        </div>
      </div>

      <motion.div className="bg-gray-800 rounded-2xl shadow p-4 border border-gray-700"
        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <DataTable data={filtered} />
      </motion.div>
    </div>
  );
}

export default App;
