const ROUNDS = 2000;

function createRng(seed = 123456789) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

function unitPower(unit, useCurrentHealth = true) {
  const maxHealth = Math.max(1, Number(unit.maxHealth) || 1);
  const readiness = useCurrentHealth ? clamp((Number(unit.health) || maxHealth) / maxHealth, 0, 1) : 1;
  const attack = Math.max(0, Number(unit.attack) || 0) * (0.68 + readiness * 0.32);
  const defense = Math.max(0, Number(unit.defense) || 0) * (0.64 + readiness * 0.36);
  const health = maxHealth * readiness;
  const level = Math.max(1, Number(unit.level) || 1);
  return attack * 1.2 + defense + health * 0.15 + level * 0.5;
}

function teamPower(units) {
  return Math.max(1, Math.round(units.reduce((sum, unit) => sum + unitPower(unit), 0)));
}

function underdogBonus(mode = "full") {
  if (mode === "solo") return { allyDamageBoost: 1.04, enemyDamageReduction: 0.97, defenseIgnore: 0.04 };
  return { allyDamageBoost: 1, enemyDamageReduction: 1, defenseIgnore: 0 };
}

function estimateWinChance(allies, enemyPower, mode = "full") {
  const currentTeamPower = teamPower(allies);
  const bonus = underdogBonus(mode);
  const adjustedTeamPower = currentTeamPower
    * bonus.allyDamageBoost
    / bonus.enemyDamageReduction
    * (1 + bonus.defenseIgnore * 0.35);
  const maximumPower = Math.max(adjustedTeamPower, enemyPower, 1);
  const passiveBonus = Math.min(0.1, allies.reduce((sum, ally) => sum + (ally.passive ? 0.035 : 0), 0));
  return clamp(0.5 + ((adjustedTeamPower - enemyPower) / maximumPower) * 0.9 + passiveBonus, 0.08, 0.95);
}

function runScenario(scenario) {
  const rng = createRng(scenario.seed);
  const baseChance = estimateWinChance(scenario.allies, scenario.enemyPower, scenario.mode);
  let wins = 0;
  for (let index = 0; index < ROUNDS; index += 1) {
    const swing = (rng() - 0.5) * scenario.swing;
    const fatigue = rng() < scenario.fatigueChance ? -scenario.fatiguePenalty : 0;
    const finalChance = clamp(baseChance + swing + fatigue, 0.04, 0.96);
    if (rng() <= finalChance) wins += 1;
  }
  return {
    ...scenario,
    teamPower: teamPower(scenario.allies),
    baseChance,
    observedChance: wins / ROUNDS,
  };
}

const scenarios = [
  {
    name: "10. szint, 1 bandatag, konnyu celpont",
    mode: "solo",
    allies: [
      { level: 10, attack: 18, defense: 16, maxHealth: 100, health: 100 },
      { level: 4, attack: 16, defense: 13, maxHealth: 106, health: 106, passive: true },
    ],
    enemyPowerRatio: 0.86,
    expected: [0.58, 0.9],
    swing: 0.1,
    fatigueChance: 0.08,
    fatiguePenalty: 0.05,
    seed: 1001,
  },
  {
    name: "10. szint, 1 bandatag, kockazatos celpont",
    mode: "solo",
    allies: [
      { level: 10, attack: 18, defense: 16, maxHealth: 100, health: 100 },
      { level: 4, attack: 16, defense: 13, maxHealth: 106, health: 106, passive: true },
    ],
    enemyPowerRatio: 1.03,
    expected: [0.38, 0.75],
    swing: 0.13,
    fatigueChance: 0.14,
    fatiguePenalty: 0.07,
    seed: 1002,
  },
  {
    name: "10. szint, 2 bandatag, veszelyes celpont",
    mode: "full",
    allies: [
      { level: 10, attack: 18, defense: 16, maxHealth: 100, health: 100 },
      { level: 4, attack: 16, defense: 13, maxHealth: 106, health: 106, passive: true },
      { level: 3, attack: 18, defense: 11, maxHealth: 92, health: 92, passive: true },
    ],
    enemyPowerRatio: 1.22,
    expected: [0.25, 0.65],
    swing: 0.16,
    fatigueChance: 0.18,
    fatiguePenalty: 0.08,
    seed: 1003,
  },
  {
    name: "30. szint, fejlesztett csapat, kockazatos celpont",
    mode: "full",
    allies: [
      { level: 30, attack: 43, defense: 39, maxHealth: 100, health: 100 },
      { level: 14, attack: 37, defense: 25, maxHealth: 127, health: 127, passive: true },
      { level: 13, attack: 34, defense: 29, maxHealth: 125, health: 125, passive: true },
    ],
    enemyPowerRatio: 1.05,
    expected: [0.42, 0.82],
    swing: 0.12,
    fatigueChance: 0.13,
    fatiguePenalty: 0.07,
    seed: 3001,
  },
  {
    name: "30. szint, fejlesztett csapat, veszelyes celpont",
    mode: "full",
    allies: [
      { level: 30, attack: 43, defense: 39, maxHealth: 100, health: 100 },
      { level: 14, attack: 37, defense: 25, maxHealth: 127, health: 127, passive: true },
      { level: 13, attack: 34, defense: 29, maxHealth: 125, health: 125, passive: true },
    ],
    enemyPowerRatio: 1.24,
    expected: [0.25, 0.68],
    swing: 0.15,
    fatigueChance: 0.18,
    fatiguePenalty: 0.08,
    seed: 3002,
  },
].map((scenario) => ({
  ...scenario,
  enemyPower: Math.max(1, Math.round(teamPower(scenario.allies) * scenario.enemyPowerRatio)),
}));

const results = scenarios.map(runScenario);
const failures = results.filter((result) => (
  result.observedChance < result.expected[0]
  || result.observedChance > result.expected[1]
));

console.table(results.map((result) => ({
  scenario: result.name,
  teamPower: result.teamPower,
  enemyPower: result.enemyPower,
  baseChance: `${Math.round(result.baseChance * 100)}%`,
  simulatedWins: `${Math.round(result.observedChance * 100)}%`,
  expectedBand: `${Math.round(result.expected[0] * 100)}-${Math.round(result.expected[1] * 100)}%`,
})));

if (failures.length) {
  console.error("Combat balance warning: one or more scenarios fell outside the target band.");
  process.exitCode = 1;
}
