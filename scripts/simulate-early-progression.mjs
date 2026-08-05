import { readFileSync } from "node:fs";

const RUNS = 1200;
const MAX_DAYS = 14;
const TARGET_LEVEL = 10;
const RANK_THRESHOLDS = [0, 10, 24, 42, 68, 100, 134, 236, 406, 644];

const serverSource = readFileSync(new URL("../server.js", import.meta.url), "utf8");
const gameSource = readFileSync(new URL("../game.js", import.meta.url), "utf8");

function requireSource(pattern, label, source = serverSource) {
  if (!pattern.test(source)) throw new Error(`A szimulacio elavult, frissiteni kell: ${label}.`);
}

requireSource(/SERVER_EARLY_RANK_THRESHOLDS\s*=\s*\[0,\s*10,\s*24,\s*42,\s*68,\s*100\]/, "szintkuszobok");
requireSource(/\{\s*id:\s*"luca"[^\n]+hireCost:\s*155\s*\}/, "Luca felberlesi ara");
requireSource(/\{\s*id:\s*"marco"[^\n]+hireCost:\s*700\s*\}/, "Marco felberlesi ara");
requireSource(/\{\s*id:\s*"enzo"[^\n]+hireCost:\s*1500\s*\}/, "Enzo felberlesi ara");
requireSource(/const energyCost = target\.mode === "shop" \? 18 : 12;/, "kirablasi energiakoltseg");
requireSource(/state\.health <= 0 \|\| state\.energy < 8/, "vedelmi penz energiakoltseg");
requireSource(/const SERVER_LOT_LEVEL_INCOME = \{ 1: 80, 2: 190, 3: 360 \};/, "telekbevetel");
requireSource(/function getHarborRequiredLevel\(\) \{\s*return 5;\s*\}/, "kikotoi szintkovetelmeny", gameSource);
requireSource(/const state = \{[\s\S]*?\bmoney:\s*120,/, "kezdo penz", gameSource);

const strategies = [
  {
    id: "casual",
    name: "Laza jatekos",
    sessionsPerDay: 1,
    actionsPerSession: 5,
    meetingUsesPerSession: 1,
    harborTasksPerSession: 1,
    garageRunsPerSession: 0,
    questSuccessesNeeded: 5,
    actionWeights: { protection: 0.5, streetRobbery: 0.32, shopRobbery: 0.18 },
    investmentReserve: 240,
    maxInvestments: 2,
  },
  {
    id: "balanced",
    name: "Kiegyensulyozott jatekos",
    sessionsPerDay: 2,
    actionsPerSession: 7,
    meetingUsesPerSession: 1,
    harborTasksPerSession: 2,
    garageRunsPerSession: 1,
    questSuccessesNeeded: 4,
    actionWeights: { protection: 0.34, streetRobbery: 0.26, shopRobbery: 0.4 },
    investmentReserve: 330,
    maxInvestments: 5,
  },
  {
    id: "grinder",
    name: "Aktiv jatekos",
    sessionsPerDay: 3,
    actionsPerSession: 10,
    meetingUsesPerSession: 2,
    harborTasksPerSession: 3,
    garageRunsPerSession: 2,
    questSuccessesNeeded: 3,
    actionWeights: { protection: 0.22, streetRobbery: 0.2, shopRobbery: 0.58 },
    investmentReserve: 420,
    maxInvestments: 8,
  },
];

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function randomInt(rng, minimum, maximum) {
  return Math.floor(rng() * (maximum - minimum + 1)) + minimum;
}

function levelForFame(fame) {
  let level = 1;
  for (let index = 0; index < RANK_THRESHOLDS.length; index += 1) {
    if (fame >= RANK_THRESHOLDS[index]) level = index + 1;
  }
  return level;
}

function weightedAction(rng, weights) {
  const roll = rng();
  let cursor = 0;
  for (const [action, weight] of Object.entries(weights)) {
    cursor += weight;
    if (roll <= cursor) return action;
  }
  return "protection";
}

function addReward(state, money, fame, source = "active") {
  state.money += Math.max(0, Math.round(money));
  state.fame += Math.max(0, Math.round(fame));
  if (source === "passive") state.passiveMoney += Math.max(0, Math.round(money));
  else state.activeMoney += Math.max(0, Math.round(money));
}

function applyMentorProgress(state, kind) {
  if (kind === "robbery" && !state.mentor.robbery) {
    state.mentor.robbery = true;
    addReward(state, 110, 2);
  }
  if (kind === "protection" && !state.mentor.protection) {
    state.mentor.protection = true;
    addReward(state, 120, 2);
  }
  if (kind === "quest" && !state.mentor.quest) {
    state.mentor.quest = true;
    addReward(state, 130, 2);
    addReward(state, 90, 1);
    addReward(state, 100, 2);
  }
}

function applyLevelMentorRewards(state) {
  if (levelForFame(state.fame) >= 5 && !state.mentor.level5) {
    state.mentor.level5 = true;
    addReward(state, 180, 8);
  }
  if (levelForFame(state.fame) >= 5 && !state.mentor.harbor) {
    state.mentor.harbor = true;
    state.harborUnlockedAtDay = state.elapsedDays;
    addReward(state, 220, 10);
  }
}

function runProtection(state, rng) {
  const successChance = state.health >= 65 ? 0.93 : 0.84;
  state.energy -= 8;
  state.actions += 1;
  if (rng() <= successChance) {
    addReward(state, randomInt(rng, 24, 38), 3);
    state.influence = Math.min(100, state.influence + 1);
    state.successesSinceQuest += 1;
    applyMentorProgress(state, "protection");
    return true;
  }
  state.health = Math.max(1, state.health - randomInt(rng, 4, 11));
  state.failedActions += 1;
  return false;
}

function runRobbery(state, rng, mode) {
  const shop = mode === "shop";
  const earlyBonus = state.elapsedDays < (30 / 60 / 24) ? 0.1 : 0;
  const levelBonus = Math.min(0.1, (levelForFame(state.fame) - 1) * 0.012);
  const successChance = Math.min(0.9, (shop ? 0.64 : 0.72) + earlyBonus + levelBonus);
  state.energy -= shop ? 18 : 12;
  state.actions += 1;
  if (rng() <= successChance) {
    addReward(state, shop ? randomInt(rng, 68, 108) : randomInt(rng, 42, 76), shop ? 8 : 5);
    state.influence = Math.min(100, state.influence + 1);
    state.successesSinceQuest += 1;
    applyMentorProgress(state, "robbery");
    return true;
  }
  state.health = Math.max(1, state.health - randomInt(rng, 7, 16));
  state.money = Math.max(0, state.money - randomInt(rng, 0, 20));
  state.failedActions += 1;
  return false;
}

function runGarage(state, rng) {
  state.actions += 1;
  if (rng() <= 0.72) {
    addReward(state, randomInt(rng, 100, 140), randomInt(rng, 13, 18));
    state.influence = Math.min(100, state.influence + 1);
    state.successesSinceQuest += 1;
    return true;
  }
  state.money = Math.max(0, state.money - 55);
  state.failedActions += 1;
  return false;
}

function completeHarborTask(state, rng, taskIndex) {
  const fish = taskIndex % 3 === 0;
  const successChance = fish ? 1 : 0.86;
  state.harborTasks += 1;
  if (rng() <= successChance) {
    addReward(state, fish ? 90 : randomInt(rng, 58, 105), fish ? 18 : randomInt(rng, 16, 26));
    state.health = Math.min(100, state.health + (fish ? 20 : 0));
    state.energy = Math.min(100, state.energy + (fish ? 20 : 0));
    state.influence = Math.min(100, state.influence + 1);
    state.successesSinceQuest += 1;
    return;
  }
  state.money = Math.max(0, state.money - randomInt(rng, 12, 24));
  state.failedActions += 1;
}

function claimAvailableQuests(state, strategy, rng) {
  while (state.successesSinceQuest >= strategy.questSuccessesNeeded) {
    state.successesSinceQuest -= strategy.questSuccessesNeeded;
    const early = state.elapsedDays < (30 / 60 / 24);
    addReward(
      state,
      early ? randomInt(rng, 145, 170) : randomInt(rng, 155, 285),
      early ? 5 : randomInt(rng, 22, 48),
    );
    state.quests += 1;
    applyMentorProgress(state, "quest");
  }
}

function buyInvestments(state, strategy) {
  const investmentCosts = [80, 80, 80, 120, 120, 120, 120, 120];
  const investmentIncome = [80, 80, 80, 24, 24, 24, 24, 24];
  while (state.investments < strategy.maxInvestments) {
    const cost = investmentCosts[state.investments];
    if (state.money < strategy.investmentReserve + cost) break;
    state.money -= cost;
    state.spentMoney += cost;
    state.dailyPassiveIncome += investmentIncome[state.investments];
    state.investments += 1;
    addReward(state, 0, state.investments <= 3 ? 6 : 6);
  }
}

function buyProgressionUpgrades(state, strategy) {
  const level = levelForFame(state.fame);
  const desiredCrew = strategy.id === "casual"
    ? (level >= 7 ? 2 : 1)
    : strategy.id === "balanced"
      ? (level >= 9 ? 3 : level >= 6 ? 2 : 1)
      : (level >= 8 ? 3 : level >= 5 ? 2 : 1);
  const hireCosts = { 2: 700, 3: 1500 };
  while (state.crewCount < desiredCrew) {
    const nextCrewCount = state.crewCount + 1;
    const cost = hireCosts[nextCrewCount];
    if (!cost || state.money < strategy.investmentReserve + cost) break;
    state.money -= cost;
    state.spentMoney += cost;
    state.crewCount = nextCrewCount;
  }

  const desiredGearPurchases = Math.min(4, Math.floor(Math.max(0, level - 1) / 2));
  const gearCosts = [90, 180, 290, 430];
  while (state.gearPurchases < desiredGearPurchases) {
    const cost = gearCosts[state.gearPurchases];
    if (state.money < strategy.investmentReserve + cost) break;
    state.money -= cost;
    state.spentMoney += cost;
    state.gearPurchases += 1;
  }

  const desiredUpgrades = strategy.id === "casual"
    ? Math.floor(level / 4)
    : strategy.id === "balanced"
      ? Math.floor(level / 3)
      : Math.floor(level / 2);
  while (state.upgrades < desiredUpgrades) {
    const cost = 80 + state.upgrades * 35;
    if (state.money < strategy.investmentReserve + cost) break;
    state.money -= cost;
    state.spentMoney += cost;
    state.upgrades += 1;
  }
}

function createState() {
  const state = {
    money: 120,
    fame: 0,
    influence: 10,
    health: 100,
    energy: 100,
    actions: 0,
    failedActions: 0,
    quests: 0,
    harborTasks: 0,
    successesSinceQuest: 0,
    elapsedDays: 0,
    level5AtDay: null,
    harborUnlockedAtDay: null,
    level10AtDay: null,
    activeMoney: 0,
    passiveMoney: 0,
    spentMoney: 0,
    investments: 0,
    dailyPassiveIncome: 0,
    upgrades: 0,
    crewCount: 1,
    gearPurchases: 0,
    mentor: { robbery: false, protection: false, quest: false, level5: false, harbor: false },
  };
  addReward(state, 80, 2);
  state.money -= 155;
  state.spentMoney += 155;
  addReward(state, 90, 2);
  addReward(state, 70, 2);
  return state;
}

function runSimulation(strategy, seed) {
  const rng = createRng(seed);
  const state = createState();
  for (let day = 1; day <= MAX_DAYS && levelForFame(state.fame) < TARGET_LEVEL; day += 1) {
    if (state.dailyPassiveIncome > 0) addReward(state, state.dailyPassiveIncome, 0, "passive");
    for (let session = 0; session < strategy.sessionsPerDay && levelForFame(state.fame) < TARGET_LEVEL; session += 1) {
      state.elapsedDays = (day - 1) + session / strategy.sessionsPerDay;
      const hoursBetweenSessions = 24 / strategy.sessionsPerDay;
      const naturalRecovery = Math.floor(hoursBetweenSessions * (100 / 12));
      state.energy = Math.min(100, state.energy + naturalRecovery + strategy.meetingUsesPerSession * 50);
      state.health = Math.min(100, state.health + naturalRecovery);

      for (let index = 0; index < strategy.actionsPerSession; index += 1) {
        const action = weightedAction(rng, strategy.actionWeights);
        const energyCost = action === "protection" ? 8 : action === "streetRobbery" ? 12 : 18;
        if (state.energy < energyCost || state.health <= 1) break;
        if (action === "protection") runProtection(state, rng);
        else runRobbery(state, rng, action === "shopRobbery" ? "shop" : "street");
        claimAvailableQuests(state, strategy, rng);
        applyLevelMentorRewards(state);
        if (state.level5AtDay === null && levelForFame(state.fame) >= 5) state.level5AtDay = state.elapsedDays;
      }

      if (levelForFame(state.fame) >= 5) {
        for (let index = 0; index < strategy.harborTasksPerSession; index += 1) {
          completeHarborTask(state, rng, index);
        }
        const allowedGarageRuns = Math.min(strategy.garageRunsPerSession, strategy.sessionsPerDay > 2 ? 1 : strategy.garageRunsPerSession);
        for (let index = 0; index < allowedGarageRuns; index += 1) runGarage(state, rng);
        claimAvailableQuests(state, strategy, rng);
      }

      applyLevelMentorRewards(state);
      buyInvestments(state, strategy);
      buyProgressionUpgrades(state, strategy);
      if (state.level5AtDay === null && levelForFame(state.fame) >= 5) state.level5AtDay = state.elapsedDays;
      if (levelForFame(state.fame) >= TARGET_LEVEL) {
        state.level10AtDay = state.elapsedDays + 1 / strategy.sessionsPerDay;
        break;
      }
    }
  }
  return state;
}

function percentile(values, ratio) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * ratio)));
  return sorted[index];
}

function summarize(strategy, results) {
  const completed = results.filter((result) => result.level10AtDay !== null);
  const completionRate = completed.length / results.length;
  const dayValues = completed.map((result) => result.level10AtDay);
  const passiveShares = completed.map((result) => result.passiveMoney / Math.max(1, result.activeMoney + result.passiveMoney));
  return {
    strategy: strategy.name,
    completionRate,
    level5Median: percentile(results.map((result) => result.level5AtDay ?? MAX_DAYS), 0.5),
    level10Median: percentile(dayValues, 0.5),
    level10P90: percentile(dayValues, 0.9),
    actionsMedian: percentile(completed.map((result) => result.actions), 0.5),
    questsMedian: percentile(completed.map((result) => result.quests), 0.5),
    cashMedian: percentile(completed.map((result) => result.money), 0.5),
    investmentsMedian: percentile(completed.map((result) => result.investments), 0.5),
    crewMedian: percentile(completed.map((result) => result.crewCount), 0.5),
    gearMedian: percentile(completed.map((result) => result.gearPurchases), 0.5),
    passiveShareMedian: percentile(passiveShares, 0.5),
    failureRateMedian: percentile(completed.map((result) => result.failedActions / Math.max(1, result.actions + result.harborTasks)), 0.5),
  };
}

const summaries = strategies.map((strategy, strategyIndex) => {
  const results = Array.from({ length: RUNS }, (_, runIndex) => (
    runSimulation(strategy, 100000 + strategyIndex * 10000 + runIndex)
  ));
  return summarize(strategy, results);
});

console.table(summaries.map((summary) => ({
  jatekstilus: summary.strategy,
  eleriSzint10: `${Math.round(summary.completionRate * 100)}%`,
  szint5Nap: summary.level5Median.toFixed(2),
  szint10Nap: summary.level10Median.toFixed(2),
  szint10P90Nap: summary.level10P90.toFixed(2),
  aktivMuvelet: summary.actionsMedian,
  kuldetes: summary.questsMedian,
  penzSzint10: `${summary.cashMedian} $`,
  ingatlan: summary.investmentsMedian,
  bandatag: summary.crewMedian,
  felszereles: summary.gearMedian,
  passzivResz: `${Math.round(summary.passiveShareMedian * 100)}%`,
  bukasiArany: `${Math.round(summary.failureRateMedian * 100)}%`,
})));

const failures = [];
for (const summary of summaries) {
  if (summary.completionRate < 0.98) failures.push(`${summary.strategy}: tul sok jatekos akad el 10. szint elott.`);
  if (summary.level5Median > 2) failures.push(`${summary.strategy}: a kikoto tul keson nyilik meg.`);
  if (summary.level10Median < 1) failures.push(`${summary.strategy}: a 10. szint egy napnal gyorsabban elerheto.`);
  if (summary.level10P90 > MAX_DAYS) failures.push(`${summary.strategy}: a lassabb futasok ket het alatt sem ernek celba.`);
  if (summary.cashMedian < 0) failures.push(`${summary.strategy}: negativ penzegyenleg alakult ki.`);
  if (summary.passiveShareMedian > 0.5) failures.push(`${summary.strategy}: a passziv bevetel elnyomja az aktiv jatekot.`);
}

if (failures.length) {
  console.error("\nKorai fejlodesi egyensulyhibak:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("\nKorai fejlodesi ellenorzes: minden celertek teljesult.");
}
