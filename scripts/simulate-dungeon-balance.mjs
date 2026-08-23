const RUNS = 5000;

function rng(seed) {
  let value = seed >>> 0;
  return () => ((value = (Math.imul(value, 1664525) + 1013904223) >>> 0) / 4294967296);
}

const bands = {
  1: { min: .70, max: .80 },
  2: { min: .90, max: 1.00 },
  3: { min: 1.10, max: 1.20 },
  4: { min: 1.30, max: 1.50 },
};

const missions = {
  easy: { rounds: 8, threats: [1, 1, 2], expected: [.48, .82] },
  medium: { rounds: 10, threats: [2, 2, 3, 2], expected: [.30, .68] },
  hard: { rounds: 12, threats: [3, 3, 4, 4, 3], expected: [.15, .52] },
};

function die(random) { return Math.floor(random() * 6) + 1; }

function makePlayer(level = 10, attackGear = 8, defenseGear = 8) {
  const maxHealth = 100;
  const strength = Math.round(12 + level * 1.35 + attackGear);
  const defense = Math.round(9 + level * 1.05 + defenseGear);
  return { maxHealth, health: maxHealth, strength, defense, total: Math.round(maxHealth * .35 + strength * 2 + defense * 1.55) };
}

function makeEnemy(threat, player, stage, enemyIndex, waveCount, random) {
  const band = bands[threat];
  const stagePressure = Math.min(1, Math.floor((stage - 1) / 4) / 21);
  const ratio = band.min + (band.max - band.min) * Math.min(1, .18 + stagePressure * .62 + random() * .20);
  const waveScale = Math.min(.72, 1.2 / Math.sqrt(Math.max(1, waveCount)));
  const tierScale = 1 + Math.floor((stage - 1) / 4) * .012;
  const targetTotal = player.total * ratio * waveScale * tierScale;
  let maxHealth = Math.max(30, Math.round(player.maxHealth * (.78 + ratio * .18)));
  let strength = Math.max(6, Math.round(player.strength * ratio * (.94 + random() * .12)));
  let defense = Math.max(4, Math.round(player.defense * ratio * (.94 + random() * .12)));
  const rawTotal = maxHealth * .35 + strength * 2 + defense * 1.55;
  const scale = targetTotal / Math.max(1, rawTotal);
  maxHealth = Math.max(25, Math.round(maxHealth * scale));
  strength = Math.max(5, Math.round(strength * scale));
  defense = Math.max(3, Math.round(defense * scale));
  return { maxHealth, health: maxHealth, strength, defense };
}

function run(mission, stage, seed) {
  const random = rng(seed);
  let wins = 0;
  for (let attempt = 0; attempt < RUNS; attempt += 1) {
    const player = makePlayer();
    let success = true;
    for (let enemyIndex = 0; enemyIndex < mission.threats.length; enemyIndex += 1) {
      const enemy = makeEnemy(mission.threats[enemyIndex], player, stage, enemyIndex, mission.threats.length, random);
      let round = 0;
      while (round < mission.rounds && player.health > 0 && enemy.health > 0) {
        const playerRoll = die(random);
        const enemyRoll = die(random);
        const playerWon = playerRoll >= enemyRoll;
        const playerDamage = Math.max(1, Math.round((player.strength * .22 + playerRoll * 2.1 - enemy.defense * .10) * (playerWon ? 1.20 : .34)));
        const enemyDamage = Math.max(1, Math.round((enemy.strength * .22 + enemyRoll * 2.1 - player.defense * .10) * (playerWon ? .26 : 1.20)));
        enemy.health = Math.max(0, enemy.health - playerDamage);
        player.health = Math.max(0, player.health - enemyDamage);
        round += 1;
      }
      const won = enemy.health <= 0 || (player.health > 0 && round >= mission.rounds && player.health / player.maxHealth >= enemy.health / enemy.maxHealth);
      if (!won) { success = false; break; }
      if (enemyIndex + 1 < mission.threats.length) player.health = Math.min(player.maxHealth, player.health + Math.round(player.maxHealth * .15));
    }
    if (success) wins += 1;
  }
  return wins / RUNS;
}

const results = [];
for (const [key, mission] of Object.entries(missions)) {
  for (const stage of [1, 20, 44, 88]) results.push({ difficulty: key, stage, winRate: run(mission, stage, stage * 100 + key.length), expected: mission.expected });
}
console.table(results.map((entry) => ({ difficulty: entry.difficulty, stage: entry.stage, winRate: `${Math.round(entry.winRate * 100)}%` })));
const failures = results.filter((entry) => entry.stage === 1 && (entry.winRate < entry.expected[0] || entry.winRate > entry.expected[1]));
if (failures.length) {
  console.error("A kezdő Dungeon-nyerési arány kívül esik a célértéken.");
  process.exitCode = 1;
}
