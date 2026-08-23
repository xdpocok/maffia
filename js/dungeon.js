(() => {
  const byId = (id) => document.getElementById(id);
  const modal = byId("dungeonModal");
  const hotspot = byId("dungeonHotspot");
  const backdrop = byId("dungeonBackdrop");
  const closeButton = byId("dungeonClose");
  const missionSelect = byId("dungeonMissionSelect");
  const targetSelect = byId("dungeonTargetSelect");
  const enemyChoices = byId("dungeonEnemyChoices");
  const crewChoices = byId("dungeonCrewChoices");
  const attackStart = byId("dungeonAttackStart");
  const selectionBack = byId("dungeonSelectionBack");
  const encounter = byId("dungeonEncounter");
  const panel = modal?.querySelector(".dungeon__panel");
  const fightStage = modal?.querySelector(".dungeon-fight-stage");
  const status = byId("dungeonStatus");
  const rollButton = byId("dungeonRoll");
  const backButton = byId("dungeonBack");
  const nextLevelButton = byId("dungeonNextLevel");
  const completionActions = byId("dungeonCompletionActions");
  const playerDie = byId("dungeonPlayerDie");
  const enemyDie = byId("dungeonEnemyDie");
  const playerScore = byId("dungeonPlayerScore");
  const enemyScore = byId("dungeonEnemyScore");
  const playerName = byId("dungeonPlayerName");
  const enemyName = byId("dungeonEnemyName");
  const playerPortrait = byId("dungeonPlayerPortrait");
  const enemyPortrait = byId("dungeonEnemyPortrait");
  const playerStats = byId("dungeonPlayerStats");
  const enemyStats = byId("dungeonEnemyStats");
  const roundText = byId("dungeonRoundText");
  const progressFill = byId("dungeonProgressFill");
  const vaultReward = byId("dungeonVaultReward");
  const rewardMoney = byId("dungeonRewardMoney");
  const rewardFame = byId("dungeonRewardFame");
  const rewardLevel = byId("dungeonRewardLevel");
  const underworldMoney = byId("dungeonUnderworldMoney");
  const underworldXp = byId("dungeonUnderworldXp");
  const underworldLevel = byId("dungeonUnderworldLevel");
  const missionButtons = [...document.querySelectorAll("[data-dungeon-difficulty]")];
  const stageLabels = [...document.querySelectorAll("[data-dungeon-stage]")];
  if (!modal || !hotspot || missionButtons.length !== 3 || !targetSelect) return;

  const portraits = {
    luca: "./assets/character/player-avatar-enforcer.webp",
    marco: "./assets/character/player-avatar-boss.webp",
    enzo: "./assets/character/gangster-character.webp",
  };
  const combatModels = {
    player: "./assets/character/dungeon-fighter-player-v1.webp",
    enemy: "./assets/character/dungeon-fighter-enemy-v1.webp",
  };
  const missions = {
    easy: { name: "Az eltűnt küldemény", rounds: 8, waveCount: 3, enemyDice: 1, underworldMoney: 40, underworldXp: 12, reward: "40 fekete pénz és 12 alvilági XP", enemies: [
      { id: "rat", name: "Nico Patkány", role: "Pinceőr", threat: 1, image: portraits.enzo },
      { id: "porter", name: "Tony Rakodó", role: "Csempész", threat: 1, image: portraits.luca },
      { id: "runner", name: "Vito Futár", role: "Futár", threat: 2, image: portraits.marco },
      { id: "watcher", name: "Paolo Figyelő", role: "Kapuőr", threat: 1, image: portraits.enzo },
      { id: "clerk", name: "Gino Könyvelő", role: "Pénzőr", threat: 2, image: portraits.luca },
    ] },
    medium: { name: "A 08-as cella", rounds: 10, waveCount: 4, enemyDice: 2, underworldMoney: 90, underworldXp: 28, reward: "90 fekete pénz és 28 alvilági XP", enemies: [
      { id: "guard", name: "Salvatore Greco", role: "Fegyveres őr", threat: 2, image: portraits.luca },
      { id: "knife", name: "Carlo Késes", role: "Behajtó", threat: 2, image: portraits.enzo },
      { id: "captain", name: "Bruno Falcone", role: "Őrparancsnok", threat: 3, image: portraits.marco },
      { id: "breaker", name: "Aldo Törő", role: "Verőember", threat: 2, image: portraits.luca },
      { id: "sergeant", name: "Michele Serra", role: "Őrmester", threat: 3, image: portraits.enzo },
    ] },
    hard: { name: "A vasrács mögött", rounds: 12, waveCount: 5, enemyDice: 2, underworldMoney: 180, underworldXp: 55, reward: "180 fekete pénz és 55 alvilági XP", enemies: [
      { id: "butcher", name: "Rocco Mészáros", role: "Veterán", threat: 3, image: portraits.luca },
      { id: "wolf", name: "Dante Farkas", role: "Bérgyilkos", threat: 3, image: portraits.enzo },
      { id: "warden", name: "Don Massimo", role: "Búvóhelyfőnök", threat: 4, image: portraits.marco },
      { id: "shadow", name: "Silvio Árnyék", role: "Bérgyilkos", threat: 4, image: portraits.enzo },
      { id: "brute", name: "Franco Bika", role: "Testőr", threat: 3, image: portraits.luca },
    ] },
  };
  let activeMission = null;
  let activeMissionKey = "";
  let activeDungeonStage = 1;
  let selectedEnemy = null;
  let selectedCrew = null;
  let round = 0;
  let playerTotal = 0;
  let enemyTotal = 0;
  let battleQueue = [];
  let enemyIndex = 0;
  let activeScene = "";
  let rolling = false;
  let rewardGranted = false;
  let playerCombat = null;
  let enemyCombat = null;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const die = () => Math.floor(Math.random() * 6) + 1;
  const bestOf = (count) => Math.max(...Array.from({ length: Math.max(1, count) }, die));

  function getPlayerDisplayName() {
    const profileName = typeof state !== "undefined" ? String(state.profileName || "").trim() : "";
    return profileName || selectedCrew?.name || "Te";
  }

  function getUnderworldLevel(xp) {
    return Math.min(88, Math.max(1, Math.floor(Math.sqrt(Math.max(0, Number(xp) || 0) / 50)) + 1));
  }

  function normalizeDungeonProgress() {
    const source = typeof state !== "undefined" && state.dungeonProgress && typeof state.dungeonProgress === "object"
      ? state.dungeonProgress
      : {};
    const progress = {
      easy: Math.min(88, Math.max(1, Math.round(Number(source.easy) || 1))),
      medium: Math.min(88, Math.max(1, Math.round(Number(source.medium) || 1))),
      hard: Math.min(88, Math.max(1, Math.round(Number(source.hard) || 1))),
    };
    if (typeof state !== "undefined") state.dungeonProgress = progress;
    return progress;
  }

  function refreshDungeonStages() {
    const progress = normalizeDungeonProgress();
    stageLabels.forEach((label) => {
      const key = label.dataset.dungeonStage;
      label.textContent = String(progress[key] || 1);
    });
  }

  function normalizeUnderworldState() {
    if (typeof state === "undefined") return { money: 0, xp: 0, level: 1 };
    state.underworldMoney = Math.max(0, Math.round(Number(state.underworldMoney) || 0));
    state.underworldXp = Math.max(0, Math.round(Number(state.underworldXp) || 0));
    state.underworldLevel = getUnderworldLevel(state.underworldXp);
    return { money: state.underworldMoney, xp: state.underworldXp, level: state.underworldLevel };
  }

  function refreshUnderworldHud() {
    const progress = normalizeUnderworldState();
    if (underworldMoney) underworldMoney.textContent = String(progress.money);
    if (underworldXp) underworldXp.textContent = progress.level >= 88 ? `${progress.xp} / MAX` : `${progress.xp} / ${50 * progress.level * progress.level}`;
    if (underworldLevel) underworldLevel.textContent = String(progress.level);
  }

  function resetVaultReward() {
    rewardGranted = false;
    vaultReward?.classList.add("hidden");
    vaultReward?.classList.remove("is-opening", "is-revealed");
    vaultReward?.setAttribute("aria-hidden", "true");
    fightStage?.classList.remove("is-cleared");
    completionActions?.classList.add("hidden");
    nextLevelButton?.classList.remove("hidden");
  }

  async function openVaultAndGrantReward() {
    if (rewardGranted || !activeMission) return;
    rewardGranted = true;
    fightStage?.classList.add("is-cleared");
    if (rewardMoney) rewardMoney.textContent = `+${activeMission.underworldMoney} fekete pénz`;
    if (rewardFame) rewardFame.textContent = `+${activeMission.underworldXp} alvilági XP`;
    vaultReward?.classList.remove("hidden");
    vaultReward?.setAttribute("aria-hidden", "false");
    await wait(280);
    vaultReward?.classList.add("is-opening");
    await wait(1050);
    if (typeof state !== "undefined") {
      state.underworldMoney = Math.max(0, Math.round(Number(state.underworldMoney) || 0)) + activeMission.underworldMoney;
      state.underworldXp = Math.max(0, Math.round(Number(state.underworldXp) || 0)) + activeMission.underworldXp;
      state.underworldLevel = getUnderworldLevel(state.underworldXp);
      const progress = normalizeDungeonProgress();
      progress[activeMissionKey] = Math.min(88, Math.max(progress[activeMissionKey] || 1, activeDungeonStage + 1));
      state.dungeonProgress = progress;
    }
    const progress = normalizeUnderworldState();
    const nextDungeonStage = Math.min(88, activeDungeonStage + 1);
    if (rewardLevel) rewardLevel.textContent = activeDungeonStage >= 88
      ? "Dungeon szint: 88 / 88"
      : `Következő Dungeon szint: ${nextDungeonStage}`;
    refreshUnderworldHud();
    refreshDungeonStages();
    vaultReward?.classList.add("is-revealed");
    status.textContent = activeDungeonStage >= 88
      ? `A széf kinyílt! Jutalmad: ${activeMission.reward}. Elérted a maximális, 88. Dungeon-szintet.`
      : `A széf kinyílt! Jutalmad: ${activeMission.reward}. Következő Dungeon-szint: ${nextDungeonStage}.`;
    if (typeof sceneRef !== "undefined") sceneRef?.refreshHUD?.();
    if (typeof saveGame === "function") void saveGame(true);
    await wait(650);
    completionActions?.classList.remove("hidden");
    if (nextLevelButton) {
      const isMaximum = activeDungeonStage >= 88;
      nextLevelButton.disabled = isMaximum;
      nextLevelButton.textContent = isMaximum ? "Elérted a 88. szintet" : `Következő szint (${activeDungeonStage + 1})`;
    }
  }

  function getCrew() {
    if (typeof state !== "undefined" && Array.isArray(state.crewMembers)) {
      const hired = state.crewMembers.filter((member) => member.hired && Number(member.health) > 0);
      if (hired.length) return hired;
    }
    return [{ id: "boss", name: "Te", role: "Főnök", level: 1, baseAttack: 10, attackBonus: 0, health: 100, image: portraits.marco }];
  }

  function getAutomaticCrew() {
    const crew = getCrew();
    if (typeof state !== "undefined" && state.activeCrewMemberId) {
      return crew.find((member) => member.id === state.activeCrewMemberId) || crew[0];
    }
    return crew[0];
  }

  function getSceneForEnemy(index) {
    const progress = battleQueue.length <= 1 ? 1 : index / (battleQueue.length - 1);
    if (progress < 0.34) return "./assets/map/dungeon-corridor-v1.webp";
    if (progress < 0.75) return "./assets/map/dungeon-guard-room-v1.webp";
    return "./assets/map/dungeon-vault-v1.webp";
  }

  function applyScene(index) {
    const scene = getSceneForEnemy(index);
    if (scene === activeScene) return;
    activeScene = scene;
    panel?.classList.add("is-scene-transition");
    panel?.style.setProperty("--dungeon-combat-scene", `url("${scene}")`);
    window.setTimeout(() => panel?.classList.remove("is-scene-transition"), 620);
  }

  function crewAttack(member) {
    if (typeof getCrewMemberAttack === "function" && member.id !== "boss") return getCrewMemberAttack(member);
    return Math.max(1, Number(member.baseAttack || 10) + Number(member.attackBonus || 0));
  }

  function getDungeonDifficultyTier() {
    return Math.floor((Math.max(1, activeDungeonStage) - 1) / 4);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function equippedItem(slot) {
    return typeof state !== "undefined" && state.equipment && typeof state.equipment === "object" ? state.equipment[slot] : null;
  }

  function equippedPower(stat) {
    if (typeof state === "undefined" || !state.equipment || typeof state.equipment !== "object") return 0;
    return Object.entries(state.equipment).reduce((sum, [slot, item]) => {
      if (!item) return sum;
      const itemStat = String(item.stat || (typeof equipmentSlotDefs !== "undefined" ? equipmentSlotDefs?.[slot]?.stat : "") || "");
      return sum + (itemStat === stat ? Math.max(0, Number(item.power) || 0) : 0);
    }, 0);
  }

  function buildPlayerCombatStats() {
    const level = typeof getRankLevel === "function" && typeof state !== "undefined" ? Math.max(1, getRankLevel(state.fame)) : 1;
    const attackGear = equippedPower("attack");
    const defenseGear = equippedPower("defense");
    const maxHealth = Math.max(40, Math.round(Number(state?.maxHealth) || Number(state?.health) || 100));
    const strength = Math.round(12 + level * 1.35 + attackGear);
    const defense = Math.round(9 + level * 1.05 + defenseGear);
    const total = Math.round(maxHealth * .35 + strength * 2 + defense * 1.55);
    return {
      level, maxHealth, health: maxHealth, strength, defense, total,
      weapon: equippedItem("weapon")?.name || "Ököl",
      clothing: equippedItem("shirt")?.name || equippedItem("pants")?.name || "Utcai ruha",
    };
  }

  function enemyBand(threat) {
    if (threat >= 4) return { label: "Boss", min: 1.30, max: 1.50 };
    if (threat >= 3) return { label: "Erős", min: 1.10, max: 1.20 };
    if (threat >= 2) return { label: "Normál", min: .90, max: 1.00 };
    return { label: "Gyenge", min: .70, max: .80 };
  }

  function enemyEquipment(threat) {
    const gear = threat >= 4
      ? { weapons: ["Aranyozott Thompson", "Nehéz géppisztoly"], clothes: ["Megerősített bossöltöny", "Acélbetétes felöltő"] }
      : threat >= 3
        ? { weapons: ["Thompson géppisztoly", "Fűrészelt csövű puska"], clothes: ["Golyóálló mellény", "Nehéz bőrkabát"] }
        : threat >= 2
          ? { weapons: ["Revolver", "Sörétes puska"], clothes: ["Vastag gyapjúkabát", "Bőrkabát"] }
          : { weapons: ["Rozsdás kés", "Ólmosbot"], clothes: ["Kopott zakó", "Munkáskabát"] };
    const stageTier = getDungeonDifficultyTier();
    return {
      weapon: gear.weapons[stageTier % gear.weapons.length],
      clothing: gear.clothes[(stageTier + enemyIndex) % gear.clothes.length],
    };
  }

  function buildEnemyCombatStats(enemy, player) {
    const band = enemyBand(Number(enemy?.threat) || 1);
    const stagePressure = Math.min(1, getDungeonDifficultyTier() / 21);
    const ratio = band.min + (band.max - band.min) * Math.min(1, .18 + stagePressure * .62 + Math.random() * .20);
    const targetTotal = player.total * ratio;
    let maxHealth = Math.max(30, Math.round(player.maxHealth * (.78 + ratio * .18)));
    let strength = Math.max(6, Math.round(player.strength * ratio * (.94 + Math.random() * .12)));
    let defense = Math.max(4, Math.round(player.defense * ratio * (.94 + Math.random() * .12)));
    const rawTotal = maxHealth * .35 + strength * 2 + defense * 1.55;
    const scale = targetTotal / Math.max(1, rawTotal);
    maxHealth = Math.max(25, Math.round(maxHealth * scale));
    strength = Math.max(5, Math.round(strength * scale));
    defense = Math.max(3, Math.round(defense * scale));
    return { ...enemyEquipment(Number(enemy?.threat) || 1), band: band.label, ratio, maxHealth, health: maxHealth, strength, defense, total: Math.round(maxHealth * .35 + strength * 2 + defense * 1.55) };
  }

  function statsMarkup(combat, enemy = false) {
    if (!combat) return "";
    return `<b>${enemy ? escapeHtml(combat.band) : `Saját erő: ${combat.total}`}</b><i>💪 ${combat.strength}</i><i>🛡️ ${combat.defense}</i><small>🔫 ${escapeHtml(combat.weapon)}</small><small>🧥 ${escapeHtml(combat.clothing)}</small>${enemy ? `<em>${Math.round(combat.ratio * 100)}% összerő</em>` : ""}`;
  }

  function refreshCombatHud() {
    if (playerScore && playerCombat) playerScore.textContent = `❤️ ${Math.max(0, playerCombat.health)} / ${playerCombat.maxHealth}`;
    if (enemyScore && enemyCombat) enemyScore.textContent = `❤️ ${Math.max(0, enemyCombat.health)} / ${enemyCombat.maxHealth}`;
    if (playerStats) playerStats.innerHTML = statsMarkup(playerCombat, false);
    if (enemyStats) enemyStats.innerHTML = statsMarkup(enemyCombat, true);
  }

  function crewImage(member) {
    if (member.image) return member.image;
    if (typeof getCrewPortraitAsset === "function") return getCrewPortraitAsset(member);
    return portraits[member.id] || portraits.enzo;
  }

  function choiceButton(person, type) {
    const power = type === "crew" ? `Erő ${crewAttack(person)}` : `Veszély ${person.threat}`;
    return `<button class="dungeon-person" type="button" data-${type}-id="${person.id}"><img src="${type === "crew" ? crewImage(person) : person.image}" alt="${person.name}"><span><strong>${person.name}</strong><small>${person.role}</small><b>${power}</b></span></button>`;
  }

  function updateAttackButton() {
    attackStart.disabled = !(selectedEnemy && selectedCrew);
    status.textContent = selectedEnemy && selectedCrew
      ? `${selectedCrew.name} megtámadja: ${selectedEnemy.name}. A harc dobókockával dől el.`
      : "Válassz egy célpontot és egy embert a bandádból.";
  }

  function openTargetSelection(key) {
    activeMission = missions[key];
    selectedEnemy = null;
    selectedCrew = null;
    missionSelect.classList.add("hidden");
    encounter.classList.add("hidden");
    targetSelect.classList.remove("hidden");
    targetSelect.setAttribute("aria-hidden", "false");
    enemyChoices.innerHTML = activeMission.enemies.map((enemy) => choiceButton(enemy, "enemy")).join("");
    crewChoices.innerHTML = getCrew().map((member) => choiceButton(member, "crew")).join("");
    updateAttackButton();
  }

  function showMissionList() {
    activeMission = null;
    activeMissionKey = "";
    selectedEnemy = null;
    selectedCrew = null;
    missionSelect.classList.remove("hidden");
    targetSelect.classList.add("hidden");
    targetSelect.setAttribute("aria-hidden", "true");
    encounter.classList.add("hidden");
    encounter.setAttribute("aria-hidden", "true");
    completionActions?.classList.add("hidden");
    resetVaultReward();
    refreshUnderworldHud();
    refreshDungeonStages();
    status.textContent = "Válassz küldetést. Minél mélyebbre mész, annál nagyobb a veszély és a jutalom.";
  }

  function openDungeon() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    showMissionList();
  }

  function closeDungeon() {
    rolling = false;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  function prepareEnemy(index) {
    enemyIndex = index;
    selectedEnemy = battleQueue[enemyIndex];
    round = 0;
    // A Dungeon egyetlen folyamatos menet: két őr között nem gyógyul vissza
    // automatikusan a játékos. Új harci állapot csak az első hullámnál készül.
    if (!playerCombat || index === 0) playerCombat = buildPlayerCombatStats();
    enemyCombat = buildEnemyCombatStats(selectedEnemy, playerCombat);
    refreshCombatHud();
    playerDie.textContent = "?";
    enemyDie.textContent = "?";
    enemyName.textContent = selectedEnemy.name;
    enemyPortrait.src = combatModels.enemy;
    applyScene(enemyIndex);
    progressFill.style.width = `${Math.round((enemyIndex / battleQueue.length) * 100)}%`;
    roundText.textContent = `${enemyIndex + 1}/${battleQueue.length}. ellenfél · 1. kör / ${activeMission.rounds}`;
    status.textContent = `${getPlayerDisplayName()} kontra ${selectedEnemy.name} — ${activeDungeonStage}. szint, ${getDungeonDifficultyTier() + 1}. nehézségi fokozat. A széf még ${battleQueue.length - enemyIndex} őr mögött van.`;
    rollButton.textContent = "Dobás";
    rollButton.classList.remove("hidden");
    rollButton.disabled = false;
  }

  function startEncounter() {
    if (!activeMission || !selectedEnemy || !selectedCrew) return;
    battleQueue = [selectedEnemy, ...activeMission.enemies.filter((enemy) => enemy.id !== selectedEnemy.id)]
      .slice(0, activeMission.waveCount);
    playerName.textContent = getPlayerDisplayName();
    playerPortrait.src = combatModels.player;
    targetSelect.classList.add("hidden");
    targetSelect.setAttribute("aria-hidden", "true");
    encounter.classList.remove("hidden");
    encounter.setAttribute("aria-hidden", "false");
    backButton.classList.add("hidden");
    prepareEnemy(0);
  }

  function startDungeonRun(key) {
    activeMission = missions[key];
    activeMissionKey = key;
    activeDungeonStage = normalizeDungeonProgress()[key] || 1;
    selectedCrew = null;
    selectedEnemy = activeMission.enemies[0];
    battleQueue = activeMission.enemies.slice(0, activeMission.waveCount);
    playerCombat = null;
    enemyCombat = null;
    playerName.textContent = getPlayerDisplayName();
    playerPortrait.src = combatModels.player;
    missionSelect.classList.add("hidden");
    targetSelect.classList.add("hidden");
    targetSelect.setAttribute("aria-hidden", "true");
    encounter.classList.remove("hidden");
    encounter.setAttribute("aria-hidden", "false");
    completionActions?.classList.add("hidden");
    resetVaultReward();
    refreshUnderworldHud();
    activeScene = "";
    prepareEnemy(0);
    status.textContent = `${getPlayerDisplayName()} egyedül kezdi meg a(z) ${activeDungeonStage}. szintet. Csak a saját felszerelésed és tulajdonságaid számítanak.`;
  }

  async function rollRound() {
    if (!activeMission || !selectedEnemy || !playerCombat || !enemyCombat || rolling || round >= activeMission.rounds) return;
    rolling = true;
    rollButton.disabled = true;
    fightStage?.classList.add("is-fighting");
    playerDie.classList.add("is-rolling");
    enemyDie.classList.add("is-rolling");
    for (let index = 0; index < 8; index += 1) {
      playerDie.textContent = String(die());
      enemyDie.textContent = String(die());
      await wait(80);
    }
    const playerRoll = die();
    const enemyRoll = die();
    playerDie.textContent = String(playerRoll);
    enemyDie.textContent = String(enemyRoll);
    playerDie.classList.remove("is-rolling");
    enemyDie.classList.remove("is-rolling");
    fightStage?.classList.remove("is-fighting", "is-player-hit", "is-enemy-hit");
    fightStage?.classList.add(playerRoll >= enemyRoll ? "is-enemy-hit" : "is-player-hit");
    window.setTimeout(() => fightStage?.classList.remove("is-player-hit", "is-enemy-hit"), 460);
    const playerWonRoll = playerRoll >= enemyRoll;
    const playerDamage = Math.max(1, Math.round((playerCombat.strength * .22 + playerRoll * 2.1 - enemyCombat.defense * .10) * (playerWonRoll ? 1.22 : .78)));
    const enemyDamage = Math.max(1, Math.round((enemyCombat.strength * .22 + enemyRoll * 2.1 - playerCombat.defense * .10) * (playerWonRoll ? .78 : 1.22)));
    enemyCombat.health = Math.max(0, enemyCombat.health - playerDamage);
    playerCombat.health = Math.max(0, playerCombat.health - enemyDamage);
    round += 1;
    refreshCombatHud();
    const totalSteps = battleQueue.length * activeMission.rounds;
    progressFill.style.width = `${Math.round(((enemyIndex * activeMission.rounds + round) / totalSteps) * 100)}%`;
    const timeLimitReached = round >= activeMission.rounds;
    const playerDefeated = playerCombat.health <= 0;
    const enemyDefeated = enemyCombat.health <= 0;
    if (!timeLimitReached && !playerDefeated && !enemyDefeated) {
      roundText.textContent = `${enemyIndex + 1}/${battleQueue.length}. ellenfél · ${round + 1}. kör / ${activeMission.rounds}`;
      status.textContent = playerWonRoll
        ? `${getPlayerDisplayName()} ${playerDamage} sebzést okozott, és ${enemyDamage} sebzést kapott.`
        : `${selectedEnemy.name} került fölénybe: ${enemyDamage} sebzés érkezett, de ${playerDamage} sebzést kapott.`;
      rollButton.disabled = false;
    } else {
      const playerHealthRatio = playerCombat.health / playerCombat.maxHealth;
      const enemyHealthRatio = enemyCombat.health / enemyCombat.maxHealth;
      const won = enemyDefeated || (!playerDefeated && timeLimitReached && playerHealthRatio >= enemyHealthRatio);
      if (won && enemyIndex + 1 < battleQueue.length) {
        const defeatedName = selectedEnemy.name;
        status.textContent = `${defeatedName} legyőzve. Haladás a következő helyiségbe...`;
        panel?.classList.add("is-advancing");
        await wait(720);
        prepareEnemy(enemyIndex + 1);
        panel?.classList.remove("is-advancing");
        status.textContent = `${defeatedName} legyőzve. Következő őr: ${selectedEnemy.name}.`;
      } else {
        const reachedSafe = won && enemyIndex + 1 === battleQueue.length;
        progressFill.style.width = reachedSafe ? "100%" : progressFill.style.width;
        roundText.textContent = reachedSafe ? "Elérted a széfet" : "Küldetés elbukva";
        status.textContent = reachedSafe ? "Minden őr legyőzve. A széf zárja enged..." : `${selectedEnemy.name} győzött. Próbáld újra!`;
        rollButton.classList.add("hidden");
        if (reachedSafe) await openVaultAndGrantReward();
        else {
          nextLevelButton?.classList.add("hidden");
          completionActions?.classList.remove("hidden");
        }
      }
    }
    rolling = false;
  }

  hotspot.addEventListener("click", openDungeon);
  backdrop?.addEventListener("click", closeDungeon);
  closeButton?.addEventListener("click", closeDungeon);
  missionButtons.forEach((button) => button.addEventListener("click", () => startDungeonRun(button.dataset.dungeonDifficulty)));
  enemyChoices?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-enemy-id]");
    if (!button || !activeMission) return;
    selectedEnemy = activeMission.enemies.find((enemy) => enemy.id === button.dataset.enemyId) || null;
    enemyChoices.querySelectorAll(".dungeon-person").forEach((entry) => entry.classList.toggle("is-selected", entry === button));
    updateAttackButton();
  });
  crewChoices?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-crew-id]");
    if (!button) return;
    selectedCrew = getCrew().find((member) => member.id === button.dataset.crewId) || null;
    crewChoices.querySelectorAll(".dungeon-person").forEach((entry) => entry.classList.toggle("is-selected", entry === button));
    updateAttackButton();
  });
  attackStart?.addEventListener("click", startEncounter);
  selectionBack?.addEventListener("click", showMissionList);
  rollButton?.addEventListener("click", rollRound);
  backButton?.addEventListener("click", showMissionList);
  nextLevelButton?.addEventListener("click", () => {
    if (!activeMissionKey || activeDungeonStage >= 88) return;
    startDungeonRun(activeMissionKey);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) closeDungeon();
  });
})();
