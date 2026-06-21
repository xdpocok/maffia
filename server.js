const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const { DatabaseSync } = require("node:sqlite");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8766);
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const DB_PATH = path.join(DATA_DIR, "maffia-online.sqlite");

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = MEMORY;
  PRAGMA synchronous = NORMAL;
  CREATE TABLE IF NOT EXISTS player_saves (
    profile_name TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS players (
    profile_name TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    rank_title TEXT NOT NULL DEFAULT 'Utcai figura',
    level INTEGER NOT NULL DEFAULT 1,
    fame INTEGER NOT NULL DEFAULT 0,
    money INTEGER NOT NULL DEFAULT 0,
    heat INTEGER NOT NULL DEFAULT 0,
    influence INTEGER NOT NULL DEFAULT 0,
    city_level INTEGER NOT NULL DEFAULT 1,
    crew_count INTEGER NOT NULL DEFAULT 3,
    health INTEGER NOT NULL DEFAULT 100,
    energy INTEGER NOT NULL DEFAULT 100,
    world_base_lot_id TEXT,
    world_base_level INTEGER NOT NULL DEFAULT 1,
    registered_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_events_profile_created_at
  ON events(profile_name, created_at DESC);
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_profile_name TEXT NOT NULL,
    sender_profile_name TEXT,
    message_type TEXT NOT NULL DEFAULT 'player',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    payload_json TEXT NOT NULL DEFAULT '{}',
    read_at INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(recipient_profile_name) REFERENCES players(profile_name) ON DELETE CASCADE,
    FOREIGN KEY(sender_profile_name) REFERENCES players(profile_name) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_messages_recipient_created
  ON messages(recipient_profile_name, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread
  ON messages(recipient_profile_name, read_at, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_players_fame_updated
  ON players(fame DESC, updated_at DESC);
  CREATE TABLE IF NOT EXISTS player_state (
    profile_name TEXT PRIMARY KEY,
    snapshot_json TEXT NOT NULL,
    inventory_json TEXT NOT NULL,
    crew_json TEXT NOT NULL,
    quests_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS world_lots (
    lot_id TEXT PRIMARY KEY,
    coord TEXT NOT NULL,
    owner_profile_name TEXT,
    base_level INTEGER NOT NULL DEFAULT 1,
    district TEXT NOT NULL DEFAULT 'vilagterkep',
    status TEXT NOT NULL DEFAULT 'free',
    claimed_at INTEGER,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(owner_profile_name) REFERENCES players(profile_name) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_world_lots_owner
  ON world_lots(owner_profile_name);
  CREATE TABLE IF NOT EXISTS leaderboard_entries (
    profile_name TEXT PRIMARY KEY,
    season_key TEXT NOT NULL DEFAULT 'global',
    level INTEGER NOT NULL DEFAULT 1,
    fame INTEGER NOT NULL DEFAULT 0,
    city_level INTEGER NOT NULL DEFAULT 1,
    rank_title TEXT NOT NULL DEFAULT 'Utcai figura',
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_leaderboard_global
  ON leaderboard_entries(season_key, level DESC, fame DESC, city_level DESC, updated_at DESC);
  CREATE TABLE IF NOT EXISTS market_items (
    item_id TEXT PRIMARY KEY,
    market_scope TEXT NOT NULL DEFAULT 'global',
    owner_profile_name TEXT,
    slot_key TEXT NOT NULL,
    item_name TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    stat_kind TEXT NOT NULL DEFAULT 'power',
    stat_value INTEGER NOT NULL DEFAULT 0,
    price INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 1,
    expires_at INTEGER,
    payload_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(owner_profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_market_scope_owner
  ON market_items(market_scope, owner_profile_name, updated_at DESC);
  CREATE TABLE IF NOT EXISTS clans (
    clan_id TEXT PRIMARY KEY,
    clan_name TEXT NOT NULL UNIQUE,
    boss_profile_name TEXT,
    description TEXT NOT NULL DEFAULT '',
    notoriety INTEGER NOT NULL DEFAULT 0,
    treasury INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(boss_profile_name) REFERENCES players(profile_name) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS clan_members (
    clan_id TEXT NOT NULL,
    profile_name TEXT NOT NULL,
    member_role TEXT NOT NULL DEFAULT 'katona',
    contribution INTEGER NOT NULL DEFAULT 0,
    joined_at INTEGER NOT NULL,
    PRIMARY KEY (clan_id, profile_name),
    FOREIGN KEY(clan_id) REFERENCES clans(clan_id) ON DELETE CASCADE,
    FOREIGN KEY(profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_clan_members_profile
  ON clan_members(profile_name);
  DELETE FROM world_lots
  WHERE owner_profile_name IS NULL AND status <> 'free';
`);

const selectSaveStmt = db.prepare(`
  SELECT profile_name, state_json, created_at, updated_at
  FROM player_saves
  WHERE profile_name = ?
`);

const listSavesStmt = db.prepare(`
  SELECT profile_name, state_json, created_at, updated_at
  FROM player_saves
`);

const upsertSaveStmt = db.prepare(`
  INSERT INTO player_saves (profile_name, state_json, created_at, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(profile_name) DO UPDATE SET
    state_json = excluded.state_json,
    updated_at = excluded.updated_at
`);

const deleteSaveStmt = db.prepare("DELETE FROM player_saves WHERE profile_name = ?");

const selectPlayerStmt = db.prepare(`
  SELECT
    profile_name,
    display_name,
    rank_title,
    level,
    fame,
    money,
    heat,
    influence,
    city_level,
    crew_count,
    health,
    energy,
    world_base_lot_id,
    world_base_level,
    registered_at,
    updated_at,
    last_seen_at
  FROM players
  WHERE profile_name = ?
`);

const listPlayersStmt = db.prepare(`
  SELECT
    profile_name,
    display_name,
    rank_title,
    level,
    fame,
    money,
    heat,
    influence,
    city_level,
    crew_count,
    health,
    energy,
    world_base_lot_id,
    world_base_level,
    registered_at,
    updated_at,
    last_seen_at
  FROM players
  ORDER BY level DESC, fame DESC, city_level DESC, updated_at DESC
`);

const upsertPlayerStmt = db.prepare(`
  INSERT INTO players (
    profile_name,
    display_name,
    rank_title,
    level,
    fame,
    money,
    heat,
    influence,
    city_level,
    crew_count,
    health,
    energy,
    world_base_lot_id,
    world_base_level,
    registered_at,
    updated_at,
    last_seen_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(profile_name) DO UPDATE SET
    display_name = excluded.display_name,
    rank_title = excluded.rank_title,
    level = excluded.level,
    fame = excluded.fame,
    money = excluded.money,
    heat = excluded.heat,
    influence = excluded.influence,
    city_level = excluded.city_level,
    crew_count = excluded.crew_count,
    health = excluded.health,
    energy = excluded.energy,
    world_base_lot_id = excluded.world_base_lot_id,
    world_base_level = excluded.world_base_level,
    updated_at = excluded.updated_at,
    last_seen_at = excluded.last_seen_at
`);

const deletePlayerStmt = db.prepare("DELETE FROM players WHERE profile_name = ?");

const upsertPlayerStateStmt = db.prepare(`
  INSERT INTO player_state (
    profile_name,
    snapshot_json,
    inventory_json,
    crew_json,
    quests_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(profile_name) DO UPDATE SET
    snapshot_json = excluded.snapshot_json,
    inventory_json = excluded.inventory_json,
    crew_json = excluded.crew_json,
    quests_json = excluded.quests_json,
    updated_at = excluded.updated_at
`);

const selectPlayerStateStmt = db.prepare(`
  SELECT profile_name, snapshot_json, inventory_json, crew_json, quests_json, updated_at
  FROM player_state
  WHERE profile_name = ?
`);

const selectOwnedWorldLotStmt = db.prepare(`
  SELECT lot_id, coord, owner_profile_name, base_level, district, status, claimed_at, updated_at
  FROM world_lots
  WHERE owner_profile_name = ?
  LIMIT 1
`);

const deleteWorldLotsByOwnerStmt = db.prepare(`
  DELETE FROM world_lots
  WHERE owner_profile_name = ?
`);

const upsertWorldLotStmt = db.prepare(`
  INSERT INTO world_lots (
    lot_id,
    coord,
    owner_profile_name,
    base_level,
    district,
    status,
    claimed_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(lot_id) DO UPDATE SET
    coord = excluded.coord,
    owner_profile_name = excluded.owner_profile_name,
    base_level = excluded.base_level,
    district = excluded.district,
    status = excluded.status,
    claimed_at = excluded.claimed_at,
    updated_at = excluded.updated_at
`);

const listWorldLotsStmt = db.prepare(`
  SELECT lot_id, coord, owner_profile_name, base_level, district, status, claimed_at, updated_at
  FROM world_lots
  ORDER BY updated_at DESC, lot_id ASC
`);

const upsertLeaderboardEntryStmt = db.prepare(`
  INSERT INTO leaderboard_entries (
    profile_name,
    season_key,
    level,
    fame,
    city_level,
    rank_title,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(profile_name) DO UPDATE SET
    season_key = excluded.season_key,
    level = excluded.level,
    fame = excluded.fame,
    city_level = excluded.city_level,
    rank_title = excluded.rank_title,
    updated_at = excluded.updated_at
`);

const listLeaderboardEntriesStmt = db.prepare(`
  SELECT profile_name, season_key, level, fame, city_level, rank_title, updated_at
  FROM leaderboard_entries
  WHERE season_key = ?
  ORDER BY level DESC, fame DESC, city_level DESC, updated_at DESC
  LIMIT ?
`);

const deleteMarketItemsByOwnerStmt = db.prepare(`
  DELETE FROM market_items
  WHERE owner_profile_name = ?
`);

const upsertMarketItemStmt = db.prepare(`
  INSERT INTO market_items (
    item_id,
    market_scope,
    owner_profile_name,
    slot_key,
    item_name,
    rarity,
    stat_kind,
    stat_value,
    price,
    stock,
    expires_at,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(item_id) DO UPDATE SET
    market_scope = excluded.market_scope,
    owner_profile_name = excluded.owner_profile_name,
    slot_key = excluded.slot_key,
    item_name = excluded.item_name,
    rarity = excluded.rarity,
    stat_kind = excluded.stat_kind,
    stat_value = excluded.stat_value,
    price = excluded.price,
    stock = excluded.stock,
    expires_at = excluded.expires_at,
    payload_json = excluded.payload_json,
    updated_at = excluded.updated_at
`);

const listMarketItemsStmt = db.prepare(`
  SELECT item_id, market_scope, owner_profile_name, slot_key, item_name, rarity, stat_kind, stat_value, price, stock, expires_at, payload_json, updated_at
  FROM market_items
  WHERE (? IS NULL OR owner_profile_name = ?)
  ORDER BY updated_at DESC, item_id ASC
  LIMIT ?
`);

const upsertClanStmt = db.prepare(`
  INSERT INTO clans (
    clan_id,
    clan_name,
    boss_profile_name,
    description,
    notoriety,
    treasury,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(clan_id) DO UPDATE SET
    clan_name = excluded.clan_name,
    boss_profile_name = excluded.boss_profile_name,
    description = excluded.description,
    notoriety = excluded.notoriety,
    treasury = excluded.treasury,
    updated_at = excluded.updated_at
`);

const deleteClanMembersByClanStmt = db.prepare(`
  DELETE FROM clan_members
  WHERE clan_id = ?
`);

const insertClanMemberStmt = db.prepare(`
  INSERT OR REPLACE INTO clan_members (
    clan_id,
    profile_name,
    member_role,
    contribution,
    joined_at
  )
  VALUES (?, ?, ?, ?, ?)
`);

const listClansStmt = db.prepare(`
  SELECT clan_id, clan_name, boss_profile_name, description, notoriety, treasury, created_at, updated_at
  FROM clans
  ORDER BY notoriety DESC, updated_at DESC, clan_name ASC
`);

const insertEventStmt = db.prepare(`
  INSERT INTO events (
    profile_name,
    event_type,
    title,
    payload_json,
    created_at
  )
  VALUES (?, ?, ?, ?, ?)
`);

const listEventsStmt = db.prepare(`
  SELECT id, profile_name, event_type, title, payload_json, created_at
  FROM events
  ORDER BY created_at DESC
  LIMIT ?
`);

const listEventsByProfileStmt = db.prepare(`
  SELECT id, profile_name, event_type, title, payload_json, created_at
  FROM events
  WHERE profile_name = ?
  ORDER BY created_at DESC
  LIMIT ?
`);

const insertMessageStmt = db.prepare(`
  INSERT INTO messages (
    recipient_profile_name,
    sender_profile_name,
    message_type,
    title,
    body,
    payload_json,
    read_at,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?, NULL, ?)
`);

const listMessagesByRecipientStmt = db.prepare(`
  SELECT id, recipient_profile_name, sender_profile_name, message_type, title, body, payload_json, read_at, created_at
  FROM messages
  WHERE recipient_profile_name = ?
  ORDER BY created_at DESC
  LIMIT ?
`);

const countUnreadMessagesStmt = db.prepare(`
  SELECT COUNT(*) AS unread_count
  FROM messages
  WHERE recipient_profile_name = ? AND read_at IS NULL
`);

const markMessagesReadStmt = db.prepare(`
  UPDATE messages
  SET read_at = ?
  WHERE recipient_profile_name = ? AND read_at IS NULL
`);

const deleteMessagesByProfileStmt = db.prepare(`
  DELETE FROM messages
  WHERE recipient_profile_name = ? OR sender_profile_name = ?
`);

const deleteClansByBossStmt = db.prepare(`
  DELETE FROM clans
  WHERE boss_profile_name = ?
`);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".glb": "model/gltf-binary",
  ".obj": "text/plain; charset=utf-8",
  ".mtl": "text/plain; charset=utf-8",
  ".fbx": "application/octet-stream",
  ".txt": "text/plain; charset=utf-8",
  ".zip": "application/zip",
};

function normalizeProfileName(rawValue = "") {
  return String(rawValue).trim().slice(0, 18);
}

function toSafeInt(value, fallback = 0, min = null) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const rounded = Math.round(numeric);
  return min === null ? rounded : Math.max(min, rounded);
}

function getRankLevel(fame) {
  const normalizedFame = Math.max(0, toSafeInt(fame, 0, 0));
  let level = 1;
  while (level < 30) {
    const threshold = 30 * (level ** 2);
    if (normalizedFame < threshold) break;
    level += 1;
  }
  return level;
}

function rankForFame(fame) {
  const normalizedFame = Math.max(0, toSafeInt(fame, 0, 0));
  if (normalizedFame >= 800) return "Don";
  if (normalizedFame >= 500) return "Capo";
  if (normalizedFame >= 280) return "Vegrehajto";
  if (normalizedFame >= 140) return "Felhajto";
  if (normalizedFame >= 60) return "Megfigyelo";
  return "Utcai figura";
}

function summarizeState(profileName, state = {}, now = Date.now()) {
  const fame = Math.max(0, toSafeInt(state.fame, 0, 0));
  return {
    profileName,
    displayName: profileName,
    rankTitle: rankForFame(fame),
    level: getRankLevel(fame),
    fame,
    money: Math.max(0, toSafeInt(state.money, 0, 0)),
    heat: Math.max(0, toSafeInt(state.heat, 0, 0)),
    influence: Math.max(0, toSafeInt(state.influence, 0, 0)),
    cityLevel: Math.max(1, toSafeInt(state.cityLevel, 1, 1)),
    crewCount: Math.max(1, toSafeInt(state.crew, 3, 1)),
    health: Math.max(0, toSafeInt(state.health, 100, 0)),
    energy: Math.max(0, toSafeInt(state.energy, 100, 0)),
    worldBaseLotId: typeof state.worldBaseLotId === "string" ? state.worldBaseLotId : null,
    worldBaseLevel: Math.max(1, toSafeInt(state.worldBaseLevel, 1, 1)),
    updatedAt: now,
    lastSeenAt: now,
  };
}

function mapPlayerRow(row) {
  return {
    profileName: row.profile_name,
    displayName: row.display_name,
    rankTitle: row.rank_title,
    level: row.level,
    fame: row.fame,
    money: row.money,
    heat: row.heat,
    influence: row.influence,
    cityLevel: row.city_level,
    crewCount: row.crew_count,
    health: row.health,
    energy: row.energy,
    worldBaseLotId: row.world_base_lot_id,
    worldBaseLevel: row.world_base_level,
    registeredAt: row.registered_at,
    updatedAt: row.updated_at,
    lastSeenAt: row.last_seen_at,
  };
}

function mapEventRow(row) {
  let payload = {};
  try {
    payload = JSON.parse(row.payload_json);
  } catch {
    payload = {};
  }
  return {
    id: row.id,
    profileName: row.profile_name,
    eventType: row.event_type,
    title: row.title,
    payload,
    createdAt: row.created_at,
  };
}

function mapMessageRow(row) {
  return {
    id: row.id,
    recipientProfileName: row.recipient_profile_name,
    senderProfileName: row.sender_profile_name,
    messageType: row.message_type,
    title: row.title,
    body: row.body,
    payload: parseJsonSafely(row.payload_json, {}),
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

function mapWorldLotRow(row) {
  return {
    lotId: row.lot_id,
    coord: row.coord,
    ownerProfileName: row.owner_profile_name,
    baseLevel: row.base_level,
    district: row.district,
    status: row.status,
    claimedAt: row.claimed_at,
    updatedAt: row.updated_at,
  };
}

function mapLeaderboardRow(row) {
  return {
    profileName: row.profile_name,
    seasonKey: row.season_key,
    level: row.level,
    fame: row.fame,
    cityLevel: row.city_level,
    rankTitle: row.rank_title,
    updatedAt: row.updated_at,
  };
}

function mapMarketItemRow(row) {
  let payload = {};
  try {
    payload = JSON.parse(row.payload_json);
  } catch {
    payload = {};
  }
  return {
    itemId: row.item_id,
    marketScope: row.market_scope,
    ownerProfileName: row.owner_profile_name,
    slotKey: row.slot_key,
    itemName: row.item_name,
    rarity: row.rarity,
    statKind: row.stat_kind,
    statValue: row.stat_value,
    price: row.price,
    stock: row.stock,
    expiresAt: row.expires_at,
    payload,
    updatedAt: row.updated_at,
  };
}

function mapClanRow(row) {
  return {
    clanId: row.clan_id,
    clanName: row.clan_name,
    bossProfileName: row.boss_profile_name,
    description: row.description,
    notoriety: row.notoriety,
    treasury: row.treasury,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseJsonSafely(rawValue, fallback) {
  if (typeof rawValue !== "string" || !rawValue) return fallback;
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

function buildMarketStockFromRows(rows = []) {
  return rows.map((row) => {
    const payload = parseJsonSafely(row.payload_json, {});
    if (payload && payload.item && payload.slot) {
      return payload;
    }
    return {
      slot: row.slot_key,
      price: row.price,
      item: {
        id: row.item_id,
        name: row.item_name,
        rarity: row.rarity,
        power: row.stat_value,
        stat: row.stat_kind === "defense" ? "defense" : "attack",
      },
    };
  });
}

function buildProfileState(profileName) {
  const saveRow = selectSaveStmt.get(profileName);
  const playerRow = selectPlayerStmt.get(profileName);
  const stateRow = selectPlayerStateStmt.get(profileName);
  if (!saveRow && !playerRow && !stateRow) return null;

  const baseState = parseJsonSafely(saveRow?.state_json, {});
  const snapshot = parseJsonSafely(stateRow?.snapshot_json, {});
  const inventory = parseJsonSafely(stateRow?.inventory_json, {});
  const crew = parseJsonSafely(stateRow?.crew_json, []);
  const quests = parseJsonSafely(stateRow?.quests_json, {});
  const marketRows = listMarketItemsStmt.all(profileName, profileName, 100);
  const ownedLot = selectOwnedWorldLotStmt.get(profileName);

  const merged = {
    ...baseState,
    ...snapshot,
    profileName,
    itemInventory: inventory && typeof inventory === "object" ? inventory : baseState.itemInventory,
    crewMembers: Array.isArray(crew) ? crew : baseState.crewMembers,
    activeQuest: quests?.activeQuest ?? baseState.activeQuest ?? null,
    activeQuests: Array.isArray(quests?.activeQuests) ? quests.activeQuests : (baseState.activeQuests ?? []),
    offeredQuests: Array.isArray(quests?.offeredQuests) ? quests.offeredQuests : (baseState.offeredQuests ?? []),
    marketStock: buildMarketStockFromRows(marketRows),
  };

  if (playerRow) {
    merged.fame = playerRow.fame;
    merged.money = playerRow.money;
    merged.heat = playerRow.heat;
    merged.influence = playerRow.influence;
    merged.cityLevel = playerRow.city_level;
    merged.health = playerRow.health;
    merged.energy = playerRow.energy;
  }
  if (ownedLot) {
    merged.worldBaseLotId = ownedLot.lot_id;
    merged.worldBaseLevel = ownedLot.base_level;
  }

  return {
    profileName,
    state: merged,
    createdAt: saveRow?.created_at ?? playerRow?.registered_at ?? Date.now(),
    updatedAt: Math.max(
      Number(saveRow?.updated_at || 0),
      Number(playerRow?.updated_at || 0),
      Number(stateRow?.updated_at || 0),
    ),
  };
}

function writePlayerSnapshot(profileName, state, now, existingSaveRow = null) {
  const summary = summarizeState(profileName, state, now);
  const existingPlayer = selectPlayerStmt.get(profileName);
  const registeredAt = existingPlayer?.registered_at ?? existingSaveRow?.created_at ?? now;
  upsertPlayerStmt.run(
    summary.profileName,
    summary.displayName,
    summary.rankTitle,
    summary.level,
    summary.fame,
    summary.money,
    summary.heat,
    summary.influence,
    summary.cityLevel,
    summary.crewCount,
    summary.health,
    summary.energy,
    summary.worldBaseLotId,
    summary.worldBaseLevel,
    registeredAt,
    summary.updatedAt,
    summary.lastSeenAt,
  );
  return { summary, existed: Boolean(existingPlayer || existingSaveRow) };
}

function writePlayerState(profileName, state, now) {
  const snapshot = {
    profileName,
    money: state.money ?? 0,
    fame: state.fame ?? 0,
    heat: state.heat ?? 0,
    influence: state.influence ?? 0,
    health: state.health ?? 100,
    energy: state.energy ?? 100,
    cityLevel: state.cityLevel ?? 1,
    worldBaseLotId: state.worldBaseLotId ?? null,
    worldBaseLevel: state.worldBaseLevel ?? 1,
    day: state.day ?? 1,
    registered: Boolean(state.profileName),
  };
  const inventory = state.itemInventory ?? {};
  const crew = state.crewMembers ?? [];
  const quests = {
    activeQuest: state.activeQuest ?? null,
    activeQuests: state.activeQuests ?? [],
    offeredQuests: state.offeredQuests ?? [],
  };
  upsertPlayerStateStmt.run(
    profileName,
    JSON.stringify(snapshot),
    JSON.stringify(inventory),
    JSON.stringify(crew),
    JSON.stringify(quests),
    now,
  );
}

function writeWorldLotOwnership(profileName, state, now) {
  deleteWorldLotsByOwnerStmt.run(profileName);
  const lotId = typeof state.worldBaseLotId === "string" ? state.worldBaseLotId : "";
  if (!lotId) return;
  const coord = lotId.replace(/^world-lot-/, "").toUpperCase();
  upsertWorldLotStmt.run(
    lotId,
    coord,
    profileName,
    Math.max(1, toSafeInt(state.worldBaseLevel, 1, 1)),
    "vilagterkep",
    "occupied",
    existingClaimTimestamp(state, now),
    now,
  );
}

function existingClaimTimestamp(state, fallbackNow) {
  return Number.isFinite(Number(state.registeredAt))
    ? Number(state.registeredAt)
    : Number.isFinite(Number(state.createdAt))
      ? Number(state.createdAt)
      : fallbackNow;
}

function writeLeaderboardEntry(summary, now) {
  upsertLeaderboardEntryStmt.run(
    summary.profileName,
    "global",
    summary.level,
    summary.fame,
    summary.cityLevel,
    summary.rankTitle,
    now,
  );
}

function deriveMarketStat(item = {}) {
  const power = toSafeInt(item.power, 0, 0);
  const defense = toSafeInt(item.defense, 0, 0);
  if (power >= defense) {
    return { kind: "power", value: power };
  }
  return { kind: "defense", value: defense };
}

function writeMarketStock(profileName, state, now) {
  deleteMarketItemsByOwnerStmt.run(profileName);
  const stock = Array.isArray(state.marketStock) ? state.marketStock : [];
  for (const offer of stock) {
    const item = offer?.item || {};
    const stat = deriveMarketStat(item);
    const itemId = String(item.id || `market-${profileName}-${Math.random().toString(36).slice(2, 8)}`);
    upsertMarketItemStmt.run(
      itemId,
      "personal",
      profileName,
      String(offer.slot || item.slot || "unknown"),
      String(item.name || "Ismeretlen targy"),
      String(item.rarity || "common"),
      stat.kind,
      stat.value,
      Math.max(0, toSafeInt(offer.price, 0, 0)),
      Math.max(0, toSafeInt(offer.stock ?? 1, 1, 0)),
      Number.isFinite(Number(state.marketRefreshAt)) ? Number(state.marketRefreshAt) : null,
      JSON.stringify(offer),
      now,
    );
  }
}

function writeClanData(profileName, state, now) {
  const clanName = typeof state.clanName === "string" ? state.clanName.trim() : "";
  if (!clanName) return;
  const clanId = `clan-${clanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ismeretlen"}`;
  upsertClanStmt.run(
    clanId,
    clanName.slice(0, 40),
    profileName,
    typeof state.clanDescription === "string" ? state.clanDescription.slice(0, 220) : "",
    Math.max(0, toSafeInt(state.fame, 0, 0)),
    Math.max(0, toSafeInt(state.clanTreasury, 0, 0)),
    now,
    now,
  );
  deleteClanMembersByClanStmt.run(clanId);
  insertClanMemberStmt.run(clanId, profileName, "fonok", 0, now);
}

function syncStructuredTables(profileName, state, now, existingSaveRow = null) {
  const { summary, existed } = writePlayerSnapshot(profileName, state, now, existingSaveRow);
  writePlayerState(profileName, state, now);
  writeWorldLotOwnership(profileName, state, now);
  writeLeaderboardEntry(summary, now);
  writeMarketStock(profileName, state, now);
  writeClanData(profileName, state, now);
  return { summary, existed };
}

function logEvent(profileName, eventType, title, payload = {}, now = Date.now()) {
  insertEventStmt.run(
    profileName,
    String(eventType || "system").slice(0, 40),
    String(title || "Esemény").slice(0, 120),
    JSON.stringify(payload || {}),
    now,
  );
}

function createMessage(recipientProfileName, senderProfileName, messageType, title, body, payload = {}, now = Date.now()) {
  insertMessageStmt.run(
    recipientProfileName,
    senderProfileName || null,
    String(messageType || "player").slice(0, 32),
    String(title || "Üzenet").slice(0, 120),
    String(body || "").slice(0, 1200),
    JSON.stringify(payload || {}),
    now,
  );
}

function getEquipmentCombatStats(state = {}) {
  let attack = 0;
  let defense = 0;
  const equipment = state.equipment && typeof state.equipment === "object" ? state.equipment : {};
  for (const item of Object.values(equipment)) {
    const power = Math.max(0, toSafeInt(item?.power, 0, 0));
    if (item?.stat === "defense") defense += power;
    else attack += power;
  }
  return { attack, defense };
}

function getPvpCombatStats(state = {}) {
  const gear = getEquipmentCombatStats(state);
  const crew = Array.isArray(state.crewMembers) ? state.crewMembers : [];
  const crewAttack = crew.reduce((sum, member) =>
    sum + Math.max(0, toSafeInt(member?.baseAttack, 0, 0) + toSafeInt(member?.attackBonus, 0, 0)), 0);
  const crewDefense = crew.reduce((sum, member) =>
    sum + Math.max(0, toSafeInt(member?.baseDefense, 0, 0) + toSafeInt(member?.defenseBonus, 0, 0)), 0);
  const level = getRankLevel(state.fame || 0);
  return {
    attack: Math.max(1, 8 + gear.attack + crewAttack + level * 2),
    defense: Math.max(1, 8 + gear.defense + crewDefense + level * 2),
    level,
  };
}

function buildPublicProfile(profileName) {
  const player = selectPlayerStmt.get(profileName);
  const profile = buildProfileState(profileName);
  if (!player || !profile) return null;
  const combat = getPvpCombatStats(profile.state);
  return {
    profileName,
    rankTitle: player.rank_title,
    level: player.level,
    fame: player.fame,
    influence: player.influence,
    cityLevel: player.city_level,
    crewCount: player.crew_count,
    worldBaseLevel: player.world_base_level,
    attack: combat.attack,
    defense: combat.defense,
    lastSeenAt: player.last_seen_at,
  };
}

function persistPvpState(profileName, state, now) {
  const existingSave = selectSaveStmt.get(profileName);
  upsertSaveStmt.run(
    profileName,
    JSON.stringify({ ...state, profileName }),
    existingSave?.created_at ?? now,
    now,
  );
  syncStructuredTables(profileName, state, now, existingSave);
}

function backfillPlayersFromSaves() {
  const rows = listSavesStmt.all();
  for (const row of rows) {
    let state = {};
    try {
      state = JSON.parse(row.state_json);
    } catch {
      state = {};
    }
    const profileName = normalizeProfileName(row.profile_name || state.profileName);
    if (!profileName) continue;
    const existingPlayer = selectPlayerStmt.get(profileName);
    const existingState = selectPlayerStateStmt.get(profileName);
    const freshestStructuredAt = Math.max(
      Number(existingPlayer?.updated_at || 0),
      Number(existingState?.updated_at || 0),
    );
    if (freshestStructuredAt > Number(row.updated_at || 0)) {
      continue;
    }
    syncStructuredTables(profileName, state, row.updated_at, row);
  }
}

backfillPlayersFromSaves();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendEmpty(response, statusCode = 204) {
  response.writeHead(statusCode, { "Cache-Control": "no-store" });
  response.end();
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function handleApiRequest(request, response, pathname) {
  if (pathname === "/api/health") {
    sendJson(response, 200, { ok: true, database: DB_PATH });
    return true;
  }

  if (pathname === "/api/players" && request.method === "GET") {
    const players = listPlayersStmt.all().map(mapPlayerRow);
    sendJson(response, 200, { players });
    return true;
  }

  if (pathname.startsWith("/api/profile/") && request.method === "GET") {
    const encodedName = pathname.slice("/api/profile/".length);
    const profileName = normalizeProfileName(decodeURIComponent(encodedName));
    if (!profileName) {
      sendJson(response, 400, { error: "Missing profile name" });
      return true;
    }
    const profile = buildProfileState(profileName);
    if (!profile) {
      sendJson(response, 200, { found: false });
      return true;
    }
    sendJson(response, 200, { found: true, ...profile });
    return true;
  }

  if (pathname.startsWith("/api/public-profile/") && request.method === "GET") {
    const encodedName = pathname.slice("/api/public-profile/".length);
    const profileName = normalizeProfileName(decodeURIComponent(encodedName));
    const profile = profileName ? buildPublicProfile(profileName) : null;
    if (!profile) {
      sendJson(response, 404, { found: false, error: "Player not found" });
      return true;
    }
    sendJson(response, 200, { found: true, profile });
    return true;
  }

  if (pathname === "/api/player-state" && request.method === "GET") {
    const rows = listSavesStmt.all().map((row) => {
      let state = {};
      try {
        state = JSON.parse(row.state_json);
      } catch {
        state = {};
      }
      return {
        profileName: row.profile_name,
        snapshot: {
          money: state.money ?? 0,
          fame: state.fame ?? 0,
          heat: state.heat ?? 0,
          influence: state.influence ?? 0,
          cityLevel: state.cityLevel ?? 1,
          worldBaseLotId: state.worldBaseLotId ?? null,
          worldBaseLevel: state.worldBaseLevel ?? 1,
        },
        updatedAt: row.updated_at,
      };
    });
    sendJson(response, 200, { playerState: rows });
    return true;
  }

  if (pathname === "/api/world-lots" && request.method === "GET") {
    const lots = listWorldLotsStmt.all().map(mapWorldLotRow);
    sendJson(response, 200, { lots });
    return true;
  }

  if (pathname === "/api/leaderboard" && request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const seasonKey = String(url.searchParams.get("season") || "global").slice(0, 32);
    const limit = Math.min(200, Math.max(1, toSafeInt(url.searchParams.get("limit"), 50, 1)));
    const entries = listLeaderboardEntriesStmt.all(seasonKey, limit).map(mapLeaderboardRow);
    sendJson(response, 200, { entries });
    return true;
  }

  if (pathname === "/api/market-items" && request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const profileName = normalizeProfileName(url.searchParams.get("profileName") || "");
    const limit = Math.min(500, Math.max(1, toSafeInt(url.searchParams.get("limit"), 100, 1)));
    const ownerFilter = profileName || null;
    const items = listMarketItemsStmt.all(ownerFilter, ownerFilter, limit).map(mapMarketItemRow);
    sendJson(response, 200, { items });
    return true;
  }

  if (pathname === "/api/clans" && request.method === "GET") {
    const clans = listClansStmt.all().map(mapClanRow);
    sendJson(response, 200, { clans });
    return true;
  }

  if (pathname === "/api/events" && request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const profileName = normalizeProfileName(url.searchParams.get("profileName") || "");
    const limit = Math.min(200, Math.max(1, toSafeInt(url.searchParams.get("limit"), 40, 1)));
    const rows = profileName
      ? listEventsByProfileStmt.all(profileName, limit)
      : listEventsStmt.all(limit);
    sendJson(response, 200, { events: rows.map(mapEventRow) });
    return true;
  }

  if (pathname === "/api/events" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const profileName = normalizeProfileName(body.profileName);
      if (!profileName || !selectPlayerStmt.get(profileName)) {
        sendJson(response, 404, { error: "Player not found" });
        return true;
      }
      logEvent(
        profileName,
        String(body.eventType || "game_event"),
        String(body.title || "Esemény"),
        { ...(body.payload || {}), body: String(body.body || "").slice(0, 1200) },
      );
      sendJson(response, 201, { ok: true });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Invalid event payload" });
      return true;
    }
  }

  if (pathname === "/api/messages" && request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const profileName = normalizeProfileName(url.searchParams.get("profileName") || "");
    const limit = Math.min(200, Math.max(1, toSafeInt(url.searchParams.get("limit"), 60, 1)));
    if (!profileName) {
      sendJson(response, 400, { error: "Missing profile name" });
      return true;
    }
    const messages = listMessagesByRecipientStmt.all(profileName, limit).map(mapMessageRow);
    const events = listEventsByProfileStmt.all(profileName, limit)
      .map(mapEventRow)
      .filter((event) => !["save_update", "player_created"].includes(event.eventType))
      .map((event) => ({
        id: `event-${event.id}`,
        recipientProfileName: profileName,
        senderProfileName: null,
        messageType: "event",
        title: event.title,
        body: String(event.payload?.body || event.payload?.summary || "Esemény történt a birodalmadban."),
        payload: event.payload,
        readAt: event.createdAt,
        createdAt: event.createdAt,
      }));
    const inbox = [...messages, ...events]
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, limit);
    const unreadCount = Number(countUnreadMessagesStmt.get(profileName)?.unread_count || 0);
    sendJson(response, 200, { messages: inbox, unreadCount });
    return true;
  }

  if (pathname === "/api/messages" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const senderProfileName = normalizeProfileName(body.senderProfileName);
      const recipientProfileName = normalizeProfileName(body.recipientProfileName);
      const messageBody = String(body.body || "").trim().slice(0, 1200);
      if (!senderProfileName || !recipientProfileName || !messageBody) {
        sendJson(response, 400, { error: "Missing sender, recipient or message" });
        return true;
      }
      if (!selectPlayerStmt.get(senderProfileName) || !selectPlayerStmt.get(recipientProfileName)) {
        sendJson(response, 404, { error: "Player not found" });
        return true;
      }
      createMessage(
        recipientProfileName,
        senderProfileName,
        "player",
        `Üzenet érkezett: ${senderProfileName}`,
        messageBody,
      );
      sendJson(response, 201, { ok: true });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Invalid message payload" });
      return true;
    }
  }

  if (pathname === "/api/messages/read" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const profileName = normalizeProfileName(body.profileName);
      if (!profileName) {
        sendJson(response, 400, { error: "Missing profile name" });
        return true;
      }
      markMessagesReadStmt.run(Date.now(), profileName);
      sendJson(response, 200, { ok: true, unreadCount: 0 });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Invalid read payload" });
      return true;
    }
  }

  if (pathname === "/api/pvp/attack" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const attackerProfileName = normalizeProfileName(body.attackerProfileName);
      const defenderProfileName = normalizeProfileName(body.defenderProfileName);
      if (!attackerProfileName || !defenderProfileName || attackerProfileName === defenderProfileName) {
        sendJson(response, 400, { error: "Invalid PvP participants" });
        return true;
      }
      const attackerProfile = buildProfileState(attackerProfileName);
      const defenderProfile = buildProfileState(defenderProfileName);
      if (!attackerProfile || !defenderProfile) {
        sendJson(response, 404, { error: "Player not found" });
        return true;
      }
      const attackerState = { ...attackerProfile.state };
      const defenderState = { ...defenderProfile.state };
      if (Number(attackerState.health) <= 0 || Number(attackerState.energy) < 12) {
        sendJson(response, 409, { error: "A támadáshoz legalább 1 HP és 12 energia kell." });
        return true;
      }

      const attackerCombat = getPvpCombatStats(attackerState);
      const defenderCombat = getPvpCombatStats(defenderState);
      const now = Date.now();
      const roll = 0.88 + Math.abs(Math.sin(now * 0.000013 + attackerCombat.attack)) * 0.28;
      const attackScore = attackerCombat.attack * roll;
      const defenseScore = defenderCombat.defense * (0.92 + Math.abs(Math.cos(now * 0.000017 + defenderCombat.defense)) * 0.22);
      const attackerWon = attackScore >= defenseScore;
      const stolenMoney = attackerWon ? Math.max(1, Math.floor(Math.max(0, Number(defenderState.money) || 0) * 0.03)) : 0;
      const healthLoss = attackerWon
        ? Math.max(4, Math.min(12, Math.round(defenderCombat.defense / Math.max(8, attackerCombat.attack) * 8)))
        : Math.max(10, Math.min(25, Math.round(defenderCombat.defense / Math.max(6, attackerCombat.attack) * 16)));

      attackerState.energy = Math.max(0, toSafeInt(attackerState.energy, 0, 0) - 12);
      attackerState.health = Math.max(1, toSafeInt(attackerState.health, 1, 0) - healthLoss);
      attackerState.fame = Math.max(0, toSafeInt(attackerState.fame, 0, 0) + (attackerWon ? 12 : 2));
      if (attackerWon) {
        attackerState.money = Math.max(0, toSafeInt(attackerState.money, 0, 0) + stolenMoney);
        defenderState.money = Math.max(0, toSafeInt(defenderState.money, 0, 0) - stolenMoney);
      }

      db.exec("BEGIN IMMEDIATE");
      try {
        persistPvpState(attackerProfileName, attackerState, now);
        persistPvpState(defenderProfileName, defenderState, now);
        const defenderBody = attackerWon
          ? `${attackerProfileName} megtámadta a bázisodat és ${stolenMoney} $ zsákmányt vitt el.`
          : `${attackerProfileName} megtámadta a bázisodat, de az embereid visszaverték.`;
        createMessage(
          defenderProfileName,
          attackerProfileName,
          "pvp",
          attackerWon ? "Támadás érte a bázisodat" : "Visszavert támadás",
          defenderBody,
          { attackerWon, stolenMoney, attackerAttack: attackerCombat.attack, defenderDefense: defenderCombat.defense },
          now,
        );
        logEvent(attackerProfileName, "pvp_attack", "PvP támadás végrehajtva", {
          body: attackerWon
            ? `${defenderProfileName} bázisát legyőzted, zsákmány: ${stolenMoney} $.`
            : `${defenderProfileName} bázisa visszaverte a támadásodat.`,
          defenderProfileName,
          attackerWon,
          stolenMoney,
        }, now);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }

      sendJson(response, 200, {
        ok: true,
        attackerWon,
        stolenMoney,
        healthLoss,
        attackerAttack: attackerCombat.attack,
        defenderDefense: defenderCombat.defense,
        attackerState,
      });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "PvP attack failed" });
      return true;
    }
  }

  if (pathname === "/api/saves" && request.method === "GET") {
    const rows = listSavesStmt.all();
    const saves = rows.map((row) => {
      let state = {};
      try {
        state = JSON.parse(row.state_json);
      } catch {
        state = {};
      }
      return {
        profileName: row.profile_name,
        fame: Number.isFinite(Number(state.fame)) ? Math.round(Number(state.fame)) : 0,
        money: Number.isFinite(Number(state.money)) ? Math.round(Number(state.money)) : 0,
        day: Number.isFinite(Number(state.day)) ? Math.round(Number(state.day)) : 1,
        heat: Number.isFinite(Number(state.heat)) ? Math.round(Number(state.heat)) : 0,
        cityLevel: Number.isFinite(Number(state.cityLevel)) ? Math.round(Number(state.cityLevel)) : 1,
        worldBaseLotId: typeof state.worldBaseLotId === "string" ? state.worldBaseLotId : null,
        worldBaseLevel: Number.isFinite(Number(state.worldBaseLevel)) ? Math.max(1, Math.round(Number(state.worldBaseLevel))) : 1,
        updatedAt: row.updated_at,
        createdAt: row.created_at,
      };
    });
    saves.sort((left, right) => {
      if (right.fame !== left.fame) return right.fame - left.fame;
      return right.updatedAt - left.updatedAt;
    });
    sendJson(response, 200, { saves });
    return true;
  }

  if (pathname === "/api/saves" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const profileName = normalizeProfileName(body.profileName);
      if (!profileName || !body || typeof body.state !== "object") {
        sendJson(response, 400, { error: "Missing profileName or state payload" });
        return true;
      }
      const now = Date.now();
      const state = { ...body.state, profileName };
      const existingSave = selectSaveStmt.get(profileName);
      upsertSaveStmt.run(
        profileName,
        JSON.stringify(state),
        existingSave?.created_at ?? now,
        now,
      );
      const { summary, existed } = syncStructuredTables(profileName, state, now, existingSave);
      logEvent(
        profileName,
        existed ? "save_update" : "player_created",
        existed ? "Jatekosmentes frissitve" : "Uj jatekos rogzitve",
        {
          level: summary.level,
          fame: summary.fame,
          cityLevel: summary.cityLevel,
          worldBaseLotId: summary.worldBaseLotId,
        },
        now,
      );
      sendJson(response, 200, { ok: true, profileName, updatedAt: now });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Invalid request body" });
      return true;
    }
  }

  if (!pathname.startsWith("/api/saves/")) return false;

  const encodedName = pathname.slice("/api/saves/".length);
  const profileName = normalizeProfileName(decodeURIComponent(encodedName));
  if (!profileName) {
    sendJson(response, 400, { error: "Missing profile name" });
    return true;
  }

  if (request.method === "GET") {
    const row = selectSaveStmt.get(profileName);
    if (!row) {
      sendJson(response, 200, { found: false });
      return true;
    }
    sendJson(response, 200, {
      found: true,
      profileName: row.profile_name,
      state: JSON.parse(row.state_json),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
    return true;
  }

  if (request.method === "PUT" || request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      if (!body || typeof body.state !== "object") {
        sendJson(response, 400, { error: "Missing state payload" });
        return true;
      }
      const now = Date.now();
      const existingSave = selectSaveStmt.get(profileName);
      const state = { ...body.state, profileName };
      upsertSaveStmt.run(
        profileName,
        JSON.stringify(state),
        existingSave?.created_at ?? now,
        now,
      );
      const { summary, existed } = syncStructuredTables(profileName, state, now, existingSave);
      logEvent(
        profileName,
        existed ? "save_update" : "player_created",
        existed ? "Jatekosmentes frissitve" : "Uj jatekos rogzitve",
        {
          level: summary.level,
          fame: summary.fame,
          cityLevel: summary.cityLevel,
          worldBaseLotId: summary.worldBaseLotId,
        },
        now,
      );
      sendJson(response, 200, { ok: true, profileName, updatedAt: now });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Invalid request body" });
      return true;
    }
  }

  if (request.method === "DELETE") {
    db.exec("BEGIN IMMEDIATE");
    try {
      deleteSaveStmt.run(profileName);
      deleteMessagesByProfileStmt.run(profileName, profileName);
      deleteWorldLotsByOwnerStmt.run(profileName);
      deleteClansByBossStmt.run(profileName);
      deletePlayerStmt.run(profileName);
      db.exec("COMMIT");
      sendEmpty(response);
    } catch (error) {
      db.exec("ROLLBACK");
      sendJson(response, 500, { error: error.message || "Player deletion failed" });
    }
    return true;
  }

  sendJson(response, 405, { error: "Method not allowed" });
  return true;
}

function resolveStaticPath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[\\/])+/, "");
  const filePath = path.join(ROOT_DIR, normalizedPath);
  if (!filePath.startsWith(ROOT_DIR)) return null;
  return filePath;
}

async function handleStaticRequest(response, pathname) {
  const filePath = resolveStaticPath(pathname);
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const stats = await fsp.stat(filePath);
    if (!stats.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" || ext === ".js" || ext === ".css" ? "no-cache" : "public, max-age=86400",
    });
    fs.createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const handledByApi = await handleApiRequest(request, response, url.pathname);
    if (handledByApi) return;
    await handleStaticRequest(response, url.pathname);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Maffia server fut: http://${HOST}:${PORT}`);
  console.log(`SQLite adatbazis: ${DB_PATH}`);
});
