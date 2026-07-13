// Game Data Simulator — generates real-time Arcane Village events
const PLAYERS = ['艾德里克', '莱拉', '布罗加', '凯尔', '米拉', '塞拉', '奥丁', '芙蕾雅'];
const CLASSES = ['法师', '精灵', '矮人', '猎人', '治疗师', '战士', '刺客', '德鲁伊'];
const WEAPONS = ['秘银法杖', '精灵长弓', '精钢战斧', '银箭弓', '治愈法杖', '奥术法杖', '秘银符文斧', '暗影匕首', '龙鳞盾', '烈焰剑'];
const ZONES = ['黑暗森林', '精灵林地', '矿山深处', '森林边缘', '高塔', '酒馆', '铁匠铺', '火山洞穴', '龙巢', '古城遗迹'];
const STATUSES = ['存活', '存活', '存活', '存活', '存活', '阵亡']; // 5:1 ratio

let idCounter = 100;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateGameEvent() {
  const player = PLAYERS[rand(0, PLAYERS.length - 1)];
  const playerClass = CLASSES[rand(0, CLASSES.length - 1)];
  const level = rand(3, 9);
  const baseHp = { '法师': 300, '精灵': 260, '矮人': 450, '猎人': 240, '治疗师': 200, '战士': 480, '刺客': 220, '德鲁伊': 350 }[playerClass] || 280;
  const baseAtk = { '法师': 45, '精灵': 38, '矮人': 58, '猎人': 42, '治疗师': 22, '战士': 65, '刺客': 50, '德鲁伊': 35 }[playerClass] || 40;
  const baseDef = { '法师': 22, '精灵': 18, '矮人': 35, '猎人': 14, '治疗师': 12, '战士': 38, '刺客': 16, '德鲁伊': 20 }[playerClass] || 18;

  const hp = baseHp + level * rand(20, 40);
  const mp = rand(60, 350);
  const atk = baseAtk + level * rand(2, 5);
  const def = baseDef + level * rand(1, 3);
  const gold = rand(500, 4000);
  const exp = level * rand(500, 1200);
  const weapon = WEAPONS[rand(0, WEAPONS.length - 1)];
  const monstersKilled = rand(1, 30);
  const questsCompleted = rand(1, 6);
  const survivalTime = rand(120, 500);
  const zone = ZONES[rand(0, ZONES.length - 1)];
  const status = STATUSES[rand(0, STATUSES.length - 1)];

  idCounter++;
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');

  return {
    id: String(idCounter),
    timestamp,
    player,
    class: playerClass,
    level,
    hp, mp, atk, def, gold, exp,
    weapon,
    monsters_killed: monstersKilled,
    quests_completed: questsCompleted,
    survival_time: survivalTime,
    zone,
    status,
  };
}

// Summary stats
export function getSummaryStats(data) {
  const total = data.length;
  const alive = data.filter(d => d.status === '存活').length;
  const dead = data.filter(d => d.status === '阵亡').length;
  const avgLevel = (data.reduce((s, d) => s + d.level, 0) / total).toFixed(1);
  const totalGold = data.reduce((s, d) => s + d.gold, 0);
  const totalMonsters = data.reduce((s, d) => s + d.monsters_killed, 0);

  const classGroups = {};
  data.forEach(d => { classGroups[d.class] = (classGroups[d.class] || 0) + 1; });
  const topClass = Object.entries(classGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  return { total, alive, dead, avgLevel, totalGold, totalMonsters, topClass };
}
