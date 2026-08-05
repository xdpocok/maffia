const baseUrl = String(process.env.QA_BASE_URL || "http://127.0.0.1:8766").replace(/\/$/, "");

function fail(profileName, message) {
  throw new Error(`${profileName}: ${message}`);
}

function assertProfile(condition, profileName, message) {
  if (!condition) fail(profileName, message);
}

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: "manual",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  return { response, payload };
}

function collectItemIds(state) {
  const rows = [];
  for (const [slot, items] of Object.entries(state.itemInventory || {})) {
    for (const item of Array.isArray(items) ? items : []) rows.push([`inventory.${slot}`, item]);
  }
  for (const [slot, item] of Object.entries(state.equipment || {})) {
    if (item) rows.push([`player.${slot}`, item]);
  }
  for (const crew of Array.isArray(state.crewMembers) ? state.crewMembers : []) {
    for (const [slot, item] of Object.entries(crew?.equipment || {})) {
      if (item) rows.push([`crew.${crew.id}.${slot}`, item]);
    }
  }
  return rows.map(([location, item]) => ({
    location,
    id: String(item?.instanceId || item?.inventoryId || "").trim(),
  })).filter((entry) => entry.id);
}

const playersResult = await request("/api/players");
if (!playersResult.response.ok || !Array.isArray(playersResult.payload?.players)) {
  throw new Error(`A jatekoslista nem olvashato: HTTP ${playersResult.response.status}`);
}

const profileNames = playersResult.payload.players
  .map((player) => String(player?.profileName || "").trim())
  .filter(Boolean);
const knownProfiles = new Set(profileNames);
const baseOwners = new Map();
const summaries = [];

for (const profileName of profileNames) {
  const session = await request("/api/session", {
    method: "POST",
    body: JSON.stringify({ profileName }),
  });
  const cookie = session.response.headers.get("set-cookie")?.split(";")[0] || "";
  assertProfile(session.response.ok && session.payload?.exists === true && cookie, profileName, "ervenytelen munkamenet");

  const save = await request("/api/saves/current", { headers: { Cookie: cookie } });
  const state = save.payload?.state;
  assertProfile(save.response.ok && save.payload?.found === true && state, profileName, "hianyzo mentes");
  assertProfile(state.profileName === profileName, profileName, "a mentes masik profilhoz tartozik");

  for (const [field, min, max] of [
    ["money", 0, Number.MAX_SAFE_INTEGER],
    ["fame", 0, Number.MAX_SAFE_INTEGER],
    ["health", 0, 100],
    ["energy", 0, 100],
    ["heat", 0, 100],
    ["influence", 0, 100],
  ]) {
    const value = Number(state[field]);
    assertProfile(Number.isFinite(value) && value >= min && value <= max, profileName, `hibas ${field}: ${state[field]}`);
  }

  const crew = Array.isArray(state.crewMembers) ? state.crewMembers : [];
  const crewIds = crew.map((member) => String(member?.id || "")).filter(Boolean);
  assertProfile(new Set(crewIds).size === crewIds.length, profileName, "duplikalt bandatag-azonosito");
  for (const member of crew) {
    const health = Number(member?.health);
    assertProfile(Number.isFinite(health) && health >= 0 && health <= 1000, profileName, `hibas bandatag-HP: ${member?.id}`);
  }
  if (state.activeCrewMemberId) {
    const activeCrew = crew.find((member) => member?.id === state.activeCrewMemberId);
    assertProfile(activeCrew?.hired === true, profileName, "az aktiv bandatag nincs megvasarolva");
  }

  const itemRows = collectItemIds(state);
  const itemIds = itemRows.map((entry) => entry.id);
  const duplicateItems = itemIds.filter((id, index) => itemIds.indexOf(id) !== index);
  assertProfile(duplicateItems.length === 0, profileName, `ugyanaz az item tobb helyen szerepel: ${[...new Set(duplicateItems)].join(", ")}`);

  for (const field of ["processTasks", "harborProcessTasks"]) {
    const tasks = Array.isArray(state[field]) ? state[field] : [];
    const taskIds = tasks.map((task) => String(task?.id || "")).filter(Boolean);
    assertProfile(new Set(taskIds).size === taskIds.length, profileName, `duplikalt ${field}-azonosito`);
    for (const task of tasks) {
      const startedAt = Number(task?.startedAt) || 0;
      const endsAt = Number(task?.endsAt) || 0;
      assertProfile(startedAt === 0 || endsAt > startedAt, profileName, `hibas idozites: ${task?.id || field}`);
    }
  }

  const questIds = (Array.isArray(state.activeQuests) ? state.activeQuests : [])
    .map((quest) => String(quest?.id || ""))
    .filter(Boolean);
  assertProfile(new Set(questIds).size === questIds.length, profileName, "duplikalt aktiv kuldetes");

  for (const kind of ["health", "energy"]) {
    const usage = state.harborBarUsage?.[kind];
    if (!usage) continue;
    assertProfile(
      Number.isFinite(Number(usage.uses)) && Number(usage.uses) >= 0 && Number(usage.uses) <= 3,
      profileName,
      `hibas kocsmai limit: ${kind}`,
    );
    assertProfile(Number(usage.resetAt) >= 0, profileName, `hibas kocsmai visszaallitas: ${kind}`);
  }

  if (state.worldBaseLotId) {
    const existingOwner = baseOwners.get(state.worldBaseLotId);
    assertProfile(!existingOwner, profileName, `a vilagterkepi bazis mar ${existingOwner} tulajdona`);
    baseOwners.set(state.worldBaseLotId, profileName);
  }

  summaries.push({
    profile: profileName,
    crew: crew.filter((member) => member?.hired).length,
    inventory: Object.values(state.itemInventory || {}).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0),
    equipped: Object.values(state.equipment || {}).filter(Boolean).length
      + crew.reduce((sum, member) => sum + Object.values(member?.equipment || {}).filter(Boolean).length, 0),
    quests: questIds.length,
    processes: (state.processTasks?.length || 0) + (state.harborProcessTasks?.length || 0),
  });
}

const lotsResult = await request("/api/world-lots");
if (!lotsResult.response.ok || !Array.isArray(lotsResult.payload?.lots)) {
  throw new Error(`A vilagterkepi telkek nem olvashatok: HTTP ${lotsResult.response.status}`);
}
for (const lot of lotsResult.payload.lots) {
  const owner = String(lot?.ownerProfileName || "").trim();
  if (owner && !knownProfiles.has(owner)) throw new Error(`Arva vilagterkepi telek: ${lot?.lotId || "ismeretlen"} -> ${owner}`);
}

console.table(summaries);
console.log(`Adatintegritasi ellenorzes: ${summaries.length}/${profileNames.length} profil rendben.`);
