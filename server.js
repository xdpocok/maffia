const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const { createMysqlDatabase } = require("./mysql-database");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8766);
const ROOT_DIR = __dirname;
async function main() {
  const db = await createMysqlDatabase();

const selectSaveStmt = db.prepare(`
  SELECT profile_name, state_json, created_at, updated_at
  FROM player_saves
  WHERE profile_name = ?
`);

const listSavesStmt = db.prepare(`
  SELECT profile_name, state_json, created_at, updated_at
  FROM player_saves
`);

const countSavesStmt = db.prepare(`
  SELECT COUNT(*) AS profile_count
  FROM player_saves
`);

const selectMetaStmt = db.prepare(`
  SELECT meta_value
  FROM app_meta
  WHERE meta_key = ?
`);

const upsertMetaStmt = db.prepare(`
  INSERT INTO app_meta (meta_key, meta_value, updated_at)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE
    meta_value = VALUES(meta_value),
    updated_at = VALUES(updated_at)
`);

const upsertSaveStmt = db.prepare(`
  INSERT INTO player_saves (profile_name, state_json, created_at, updated_at)
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    state_json = VALUES(state_json),
    updated_at = VALUES(updated_at)
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
  ON DUPLICATE KEY UPDATE
    display_name = VALUES(display_name),
    rank_title = VALUES(rank_title),
    level = VALUES(level),
    fame = VALUES(fame),
    money = VALUES(money),
    heat = VALUES(heat),
    influence = VALUES(influence),
    city_level = VALUES(city_level),
    crew_count = VALUES(crew_count),
    health = VALUES(health),
    energy = VALUES(energy),
    world_base_lot_id = VALUES(world_base_lot_id),
    world_base_level = VALUES(world_base_level),
    updated_at = VALUES(updated_at),
    last_seen_at = VALUES(last_seen_at)
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
  ON DUPLICATE KEY UPDATE
    snapshot_json = VALUES(snapshot_json),
    inventory_json = VALUES(inventory_json),
    crew_json = VALUES(crew_json),
    quests_json = VALUES(quests_json),
    updated_at = VALUES(updated_at)
`);

const selectPlayerStateStmt = db.prepare(`
  SELECT profile_name, snapshot_json, inventory_json, crew_json, quests_json, updated_at
  FROM player_state
  WHERE profile_name = ?
`);

const upsertPlayerRuntimeStateStmt = db.prepare(`
  INSERT INTO player_runtime_state (
    profile_name,
    runtime_json,
    updated_at
  )
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE
    runtime_json = VALUES(runtime_json),
    updated_at = VALUES(updated_at)
`);

const selectPlayerRuntimeStateStmt = db.prepare(`
  SELECT profile_name, runtime_json, updated_at
  FROM player_runtime_state
  WHERE profile_name = ?
`);

const deletePlayerProcessTasksStmt = db.prepare(`
  DELETE FROM player_process_tasks
  WHERE profile_name = ?
`);

const insertPlayerProcessTaskStmt = db.prepare(`
  INSERT INTO player_process_tasks (
    task_id,
    profile_name,
    task_scope,
    slot_index,
    task_type,
    task_status,
    ends_at,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    task_scope = VALUES(task_scope),
    slot_index = VALUES(slot_index),
    task_type = VALUES(task_type),
    task_status = VALUES(task_status),
    ends_at = VALUES(ends_at),
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const listPlayerProcessTasksStmt = db.prepare(`
  SELECT task_id, profile_name, task_scope, slot_index, task_type, task_status, ends_at, payload_json, updated_at
  FROM player_process_tasks
  WHERE profile_name = ?
  ORDER BY task_scope ASC, slot_index ASC, updated_at DESC, task_id ASC
`);

const deletePlayerTerritoriesStmt = db.prepare(`
  DELETE FROM player_territories
  WHERE profile_name = ?
`);

const insertPlayerTerritoryStmt = db.prepare(`
  INSERT INTO player_territories (
    profile_name,
    territory_id,
    owner_type,
    territory_level,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    owner_type = VALUES(owner_type),
    territory_level = VALUES(territory_level),
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const listPlayerTerritoriesStmt = db.prepare(`
  SELECT profile_name, territory_id, owner_type, territory_level, payload_json, updated_at
  FROM player_territories
  WHERE profile_name = ?
  ORDER BY updated_at DESC, territory_id ASC
`);

const deletePlayerEquipmentStmt = db.prepare(`
  DELETE FROM player_equipment_slots
  WHERE profile_name = ?
`);

const insertPlayerEquipmentStmt = db.prepare(`
  INSERT INTO player_equipment_slots (
    profile_name,
    owner_type,
    owner_id,
    slot_key,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const listPlayerEquipmentStmt = db.prepare(`
  SELECT profile_name, owner_type, owner_id, slot_key, payload_json, updated_at
  FROM player_equipment_slots
  WHERE profile_name = ?
  ORDER BY owner_type ASC, owner_id ASC, slot_key ASC
`);

const deletePlayerInventoryStmt = db.prepare(`
  DELETE FROM player_inventory_items
  WHERE profile_name = ?
`);

const insertPlayerInventoryItemStmt = db.prepare(`
  INSERT INTO player_inventory_items (
    profile_name,
    slot_key,
    item_id,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const listPlayerInventoryStmt = db.prepare(`
  SELECT profile_name, slot_key, item_id, payload_json, updated_at
  FROM player_inventory_items
  WHERE profile_name = ?
  ORDER BY slot_key ASC, updated_at DESC, item_id ASC
`);

const deletePlayerCrewMembersStmt = db.prepare(`
  DELETE FROM player_crew_members
  WHERE profile_name = ?
`);

const insertPlayerCrewMemberStmt = db.prepare(`
  INSERT INTO player_crew_members (
    profile_name,
    member_id,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const listPlayerCrewMembersStmt = db.prepare(`
  SELECT profile_name, member_id, payload_json, updated_at
  FROM player_crew_members
  WHERE profile_name = ?
  ORDER BY updated_at DESC, member_id ASC
`);

const deletePlayerQuestsStmt = db.prepare(`
  DELETE FROM player_quests
  WHERE profile_name = ?
`);

const insertPlayerQuestStmt = db.prepare(`
  INSERT INTO player_quests (
    quest_id,
    profile_name,
    quest_scope,
    slot_index,
    quest_status,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    quest_scope = VALUES(quest_scope),
    slot_index = VALUES(slot_index),
    quest_status = VALUES(quest_status),
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const listPlayerQuestsStmt = db.prepare(`
  SELECT quest_id, profile_name, quest_scope, slot_index, quest_status, payload_json, updated_at
  FROM player_quests
  WHERE profile_name = ?
  ORDER BY quest_scope ASC, slot_index ASC, updated_at DESC, quest_id ASC
`);

const deletePlayerNotificationsStmt = db.prepare(`
  DELETE FROM player_notifications
  WHERE profile_name = ?
`);

const insertPlayerNotificationStmt = db.prepare(`
  INSERT INTO player_notifications (
    notification_id,
    profile_name,
    message_type,
    title,
    body,
    sender_profile_name,
    read_at,
    created_at,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    message_type = VALUES(message_type),
    title = VALUES(title),
    body = VALUES(body),
    sender_profile_name = VALUES(sender_profile_name),
    read_at = VALUES(read_at),
    created_at = VALUES(created_at),
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const listPlayerNotificationsStmt = db.prepare(`
  SELECT notification_id, profile_name, message_type, title, body, sender_profile_name, read_at, created_at, payload_json, updated_at
  FROM player_notifications
  WHERE profile_name = ?
  ORDER BY created_at DESC, notification_id ASC
`);

const countUnreadPlayerNotificationsStmt = db.prepare(`
  SELECT COUNT(*) AS unread_count
  FROM player_notifications
  WHERE profile_name = ? AND read_at IS NULL
`);

const markPlayerNotificationsReadStmt = db.prepare(`
  UPDATE player_notifications
  SET read_at = ?
  WHERE profile_name = ? AND read_at IS NULL
`);

const deletePlayerDistrictsStmt = db.prepare(`
  DELETE FROM player_districts
  WHERE profile_name = ?
`);

const insertPlayerDistrictStmt = db.prepare(`
  INSERT INTO player_districts (
    profile_name,
    district_id,
    slot_index,
    is_selected,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    slot_index = VALUES(slot_index),
    is_selected = VALUES(is_selected),
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const listPlayerDistrictsStmt = db.prepare(`
  SELECT profile_name, district_id, slot_index, is_selected, payload_json, updated_at
  FROM player_districts
  WHERE profile_name = ?
  ORDER BY slot_index ASC, updated_at DESC, district_id ASC
`);

const deletePlayerBuildingDifficultiesStmt = db.prepare(`
  DELETE FROM player_building_difficulties
  WHERE profile_name = ?
`);

const insertPlayerBuildingDifficultyStmt = db.prepare(`
  INSERT INTO player_building_difficulties (
    profile_name,
    spot_id,
    difficulty_value,
    difficulty_cycle,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    difficulty_value = VALUES(difficulty_value),
    difficulty_cycle = VALUES(difficulty_cycle),
    updated_at = VALUES(updated_at)
`);

const listPlayerBuildingDifficultiesStmt = db.prepare(`
  SELECT profile_name, spot_id, difficulty_value, difficulty_cycle, updated_at
  FROM player_building_difficulties
  WHERE profile_name = ?
  ORDER BY updated_at DESC, spot_id ASC
`);

const deletePlayerWorldRivalsStmt = db.prepare(`
  DELETE FROM player_world_rivals
  WHERE profile_name = ?
`);

const insertPlayerWorldRivalStmt = db.prepare(`
  INSERT INTO player_world_rivals (
    city_id,
    profile_name,
    lot_id,
    city_status,
    city_level,
    city_power,
    tribute_ready_at,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    lot_id = VALUES(lot_id),
    city_status = VALUES(city_status),
    city_level = VALUES(city_level),
    city_power = VALUES(city_power),
    tribute_ready_at = VALUES(tribute_ready_at),
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const listPlayerWorldRivalsStmt = db.prepare(`
  SELECT city_id, profile_name, lot_id, city_status, city_level, city_power, tribute_ready_at, payload_json, updated_at
  FROM player_world_rivals
  WHERE profile_name = ?
  ORDER BY updated_at DESC, city_id ASC
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
  ON DUPLICATE KEY UPDATE
    coord = VALUES(coord),
    owner_profile_name = VALUES(owner_profile_name),
    base_level = VALUES(base_level),
    district = VALUES(district),
    status = VALUES(status),
    claimed_at = VALUES(claimed_at),
    updated_at = VALUES(updated_at)
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
  ON DUPLICATE KEY UPDATE
    season_key = VALUES(season_key),
    level = VALUES(level),
    fame = VALUES(fame),
    city_level = VALUES(city_level),
    rank_title = VALUES(rank_title),
    updated_at = VALUES(updated_at)
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
  ON DUPLICATE KEY UPDATE
    market_scope = VALUES(market_scope),
    owner_profile_name = VALUES(owner_profile_name),
    slot_key = VALUES(slot_key),
    item_name = VALUES(item_name),
    rarity = VALUES(rarity),
    stat_kind = VALUES(stat_kind),
    stat_value = VALUES(stat_value),
    price = VALUES(price),
    stock = VALUES(stock),
    expires_at = VALUES(expires_at),
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
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
  ON DUPLICATE KEY UPDATE
    clan_name = VALUES(clan_name),
    boss_profile_name = VALUES(boss_profile_name),
    description = VALUES(description),
    notoriety = VALUES(notoriety),
    treasury = VALUES(treasury),
    updated_at = VALUES(updated_at)
`);

const deleteClanMembersByClanStmt = db.prepare(`
  DELETE FROM clan_members
  WHERE clan_id = ?
`);

const insertClanMemberStmt = db.prepare(`
  INSERT INTO clan_members (
    clan_id,
    profile_name,
    member_role,
    contribution,
    joined_at
  )
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    member_role = VALUES(member_role),
    contribution = VALUES(contribution),
    joined_at = VALUES(joined_at)
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
  const crewMembers = Array.isArray(state.crewMembers) ? state.crewMembers : [];
  const hasCrewMembers = crewMembers.length > 0;
  const hiredCrewCount = crewMembers.filter((member) => member?.hired).length;
  const storedCrewCount = toSafeInt(state.crew, hiredCrewCount, 0);
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
    crewCount: Math.max(0, hasCrewMembers ? hiredCrewCount : storedCrewCount),
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

function buildProcessTasksFromRows(rows = []) {
  return rows
    .map((row) => parseJsonSafely(row.payload_json, null))
    .filter((task) => task && typeof task === "object");
}

function buildTerritoriesFromRows(rows = []) {
  return rows.reduce((territories, row) => {
    const payload = parseJsonSafely(row.payload_json, {});
    territories[row.territory_id] = {
      ...(payload && typeof payload === "object" ? payload : {}),
      level: Math.max(1, toSafeInt(row.territory_level, 1, 1)),
      ownerType: String(row.owner_type || payload?.ownerType || ""),
    };
    return territories;
  }, {});
}

function buildEquipmentFromRows(rows = [], ownerType = "player", ownerId = "self") {
  const selectedRows = rows.filter((row) => row.owner_type === ownerType && row.owner_id === ownerId);
  return selectedRows.reduce((equipment, row) => {
    equipment[row.slot_key] = parseJsonSafely(row.payload_json, null);
    return equipment;
  }, {});
}

function buildInventoryFromRows(rows = []) {
  return rows.reduce((inventory, row) => {
    if (!inventory[row.slot_key]) inventory[row.slot_key] = [];
    inventory[row.slot_key].push(parseJsonSafely(row.payload_json, null));
    return inventory;
  }, {});
}

function buildCrewMembersFromRows(rows = []) {
  return rows
    .map((row) => parseJsonSafely(row.payload_json, null))
    .filter((member) => member && typeof member === "object");
}

function buildQuestStateFromRows(rows = []) {
  const offeredQuests = [];
  const activeQuests = [];
  let activeQuest = null;
  for (const row of rows) {
    const quest = parseJsonSafely(row.payload_json, null);
    if (!quest || typeof quest !== "object") continue;
    if (row.quest_scope === "featured") {
      activeQuest = quest;
      continue;
    }
    if (row.quest_scope === "offered") {
      offeredQuests.push(quest);
      continue;
    }
    activeQuests.push(quest);
  }
  return { activeQuest, activeQuests, offeredQuests };
}

function buildNotificationsFromRows(rows = []) {
  return rows.map((row) => {
    const payload = parseJsonSafely(row.payload_json, {});
    return {
      id: row.notification_id,
      recipientProfileName: row.profile_name,
      title: row.title,
      body: row.body,
      messageType: row.message_type,
      senderProfileName: row.sender_profile_name || "",
      createdAt: row.created_at,
      readAt: row.read_at || 0,
      localOnly: true,
      payload,
    };
  });
}

function buildDistrictStateFromRows(rows = []) {
  const districts = rows.map((row) => parseJsonSafely(row.payload_json, null)).filter((district) => district && typeof district === "object");
  const selected = rows.find((row) => Number(row.is_selected) === 1);
  return {
    districts,
    selectedDistrictIndex: selected ? Math.max(0, toSafeInt(selected.slot_index, 0, 0)) : 0,
  };
}

function buildBuildingDifficultiesFromRows(rows = []) {
  const difficulties = {};
  let cycle = null;
  for (const row of rows) {
    difficulties[row.spot_id] = Math.max(1, toSafeInt(row.difficulty_value, 1, 1));
    if (cycle === null && Number.isFinite(Number(row.difficulty_cycle))) {
      cycle = Number(row.difficulty_cycle);
    }
  }
  return { difficulties, cycle };
}

function buildWorldRivalCitiesFromRows(rows = []) {
  return rows
    .map((row) => {
      const payload = parseJsonSafely(row.payload_json, null);
      if (!payload || typeof payload !== "object") return null;
      return {
        ...payload,
        id: row.city_id,
        lotId: row.lot_id,
        status: row.city_status,
        level: Math.max(1, toSafeInt(row.city_level, 1, 1)),
        power: Math.max(1, toSafeInt(row.city_power, 1, 1)),
        tributeReadyAt: Number.isFinite(Number(row.tribute_ready_at)) ? Number(row.tribute_ready_at) : 0,
      };
    })
    .filter(Boolean);
}

async function buildProfileState(profileName) {
  const [saveRow, playerRow, stateRow, runtimeRow, processTaskRows, territoryRows, equipmentRows, inventoryRows, crewRows, questRows, notificationRows, districtRows, buildingDifficultyRows, worldRivalRows, marketRows, ownedLot] = await Promise.all([
    selectSaveStmt.get(profileName),
    selectPlayerStmt.get(profileName),
    selectPlayerStateStmt.get(profileName),
    selectPlayerRuntimeStateStmt.get(profileName),
    listPlayerProcessTasksStmt.all(profileName),
    listPlayerTerritoriesStmt.all(profileName),
    listPlayerEquipmentStmt.all(profileName),
    listPlayerInventoryStmt.all(profileName),
    listPlayerCrewMembersStmt.all(profileName),
    listPlayerQuestsStmt.all(profileName),
    listPlayerNotificationsStmt.all(profileName),
    listPlayerDistrictsStmt.all(profileName),
    listPlayerBuildingDifficultiesStmt.all(profileName),
    listPlayerWorldRivalsStmt.all(profileName),
    listMarketItemsStmt.all(profileName, profileName, 100),
    selectOwnedWorldLotStmt.get(profileName),
  ]);
  if (!saveRow && !playerRow && !stateRow && !runtimeRow && !processTaskRows.length && !territoryRows.length && !equipmentRows.length && !inventoryRows.length && !crewRows.length && !questRows.length && !notificationRows.length && !districtRows.length && !buildingDifficultyRows.length && !worldRivalRows.length) return null;

  const snapshot = parseJsonSafely(stateRow?.snapshot_json, {});
  const baseState = Object.keys(snapshot).length
    ? snapshot
    : parseJsonSafely(saveRow?.state_json, {});
  const inventory = parseJsonSafely(stateRow?.inventory_json, {});
  const crew = parseJsonSafely(stateRow?.crew_json, []);
  const quests = parseJsonSafely(stateRow?.quests_json, {});
  const merged = {
    ...baseState,
    profileName,
    itemInventory: inventory && typeof inventory === "object" ? inventory : baseState.itemInventory,
    crewMembers: Array.isArray(crew) ? crew : baseState.crewMembers,
    activeQuest: quests?.activeQuest ?? baseState.activeQuest ?? null,
    activeQuests: Array.isArray(quests?.activeQuests) ? quests.activeQuests : (baseState.activeQuests ?? []),
    offeredQuests: Array.isArray(quests?.offeredQuests) ? quests.offeredQuests : (baseState.offeredQuests ?? []),
    marketStock: buildMarketStockFromRows(marketRows),
  };

  if (runtimeRow) {
    const runtime = parseJsonSafely(runtimeRow.runtime_json, {});
    merged.pendingProtectionRewards = Array.isArray(runtime.pendingProtectionRewards)
      ? runtime.pendingProtectionRewards
      : (merged.pendingProtectionRewards ?? []);
    merged.localNotifications = Array.isArray(runtime.localNotifications)
      ? runtime.localNotifications
      : (merged.localNotifications ?? []);
    merged.smuggledGoods = runtime.smuggledGoods && typeof runtime.smuggledGoods === "object"
      ? runtime.smuggledGoods
      : (merged.smuggledGoods ?? {});
    merged.rivalEvent = runtime.rivalEvent ?? merged.rivalEvent ?? null;
    merged.rivalNextSpawnAt = Number.isFinite(Number(runtime.rivalNextSpawnAt))
      ? Number(runtime.rivalNextSpawnAt)
      : (merged.rivalNextSpawnAt ?? 0);
    merged.mentorStep = Number.isFinite(Number(runtime.mentorStep))
      ? Number(runtime.mentorStep)
      : (merged.mentorStep ?? 0);
    merged.mentorCompleted = typeof runtime.mentorCompleted === "boolean"
      ? runtime.mentorCompleted
      : Boolean(merged.mentorCompleted);
    merged.mentorFlags = runtime.mentorFlags && typeof runtime.mentorFlags === "object"
      ? runtime.mentorFlags
      : (merged.mentorFlags ?? {});
    merged.protectionCooldowns = runtime.protectionCooldowns && typeof runtime.protectionCooldowns === "object"
      ? runtime.protectionCooldowns
      : (merged.protectionCooldowns ?? {});
    merged.districts = Array.isArray(runtime.districts) ? runtime.districts : (merged.districts ?? []);
    merged.selectedDistrictIndex = Number.isFinite(Number(runtime.selectedDistrictIndex))
      ? Number(runtime.selectedDistrictIndex)
      : (merged.selectedDistrictIndex ?? 0);
  }

  if (territoryRows.length) {
    merged.territories = buildTerritoriesFromRows(territoryRows);
  }

  if (equipmentRows.length) {
    merged.equipment = buildEquipmentFromRows(equipmentRows, "player", "self");
  }

  if (inventoryRows.length) {
    merged.itemInventory = buildInventoryFromRows(inventoryRows);
  }

  if (crewRows.length) {
    merged.crewMembers = buildCrewMembersFromRows(crewRows);
  }

  if (questRows.length) {
    const questState = buildQuestStateFromRows(questRows);
    merged.activeQuest = questState.activeQuest;
    merged.activeQuests = questState.activeQuests;
    merged.offeredQuests = questState.offeredQuests;
  }

  if (notificationRows.length) {
    merged.localNotifications = buildNotificationsFromRows(notificationRows);
  }

  if (districtRows.length) {
    const districtState = buildDistrictStateFromRows(districtRows);
    merged.districts = districtState.districts;
    merged.selectedDistrictIndex = districtState.selectedDistrictIndex;
  }

  if (buildingDifficultyRows.length) {
    const difficultyState = buildBuildingDifficultiesFromRows(buildingDifficultyRows);
    merged.buildingDifficulties = difficultyState.difficulties;
    if (difficultyState.cycle !== null) merged.buildingDifficultyCycle = difficultyState.cycle;
  }

  if (worldRivalRows.length) {
    merged.worldRivalCities = buildWorldRivalCitiesFromRows(worldRivalRows);
  }

  if (processTaskRows.length) {
    merged.processTasks = buildProcessTasksFromRows(processTaskRows.filter((row) => row.task_scope !== "harbor"));
    merged.harborProcessTasks = buildProcessTasksFromRows(processTaskRows.filter((row) => row.task_scope === "harbor"));
  }

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
      Number(runtimeRow?.updated_at || 0),
      ...equipmentRows.map((row) => Number(row.updated_at || 0)),
      ...inventoryRows.map((row) => Number(row.updated_at || 0)),
      ...crewRows.map((row) => Number(row.updated_at || 0)),
      ...questRows.map((row) => Number(row.updated_at || 0)),
      ...notificationRows.map((row) => Number(row.updated_at || 0)),
      ...districtRows.map((row) => Number(row.updated_at || 0)),
      ...buildingDifficultyRows.map((row) => Number(row.updated_at || 0)),
      ...worldRivalRows.map((row) => Number(row.updated_at || 0)),
    ),
  };
}

async function writePlayerSnapshot(profileName, state, now, existingSaveRow = null) {
  const existingPlayer = await selectPlayerStmt.get(profileName);
  const preservedFame = Math.max(
    0,
    toSafeInt(state?.fame, 0, 0),
    toSafeInt(existingPlayer?.fame, 0, 0),
  );
  const normalizedState = {
    ...state,
    fame: preservedFame,
  };
  const summary = summarizeState(profileName, normalizedState, now);
  const registeredAt = existingPlayer?.registered_at ?? existingSaveRow?.created_at ?? now;
  await upsertPlayerStmt.run(
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

async function writePlayerState(profileName, state, now) {
  const existingPlayer = await selectPlayerStmt.get(profileName);
  const preservedFame = Math.max(
    0,
    toSafeInt(state?.fame, 0, 0),
    toSafeInt(existingPlayer?.fame, 0, 0),
  );
  const snapshot = {
    profileName,
    profileStartedAt: Number.isFinite(Number(state.profileStartedAt)) ? Number(state.profileStartedAt) : now,
    money: state.money ?? 0,
    fame: preservedFame,
    heat: state.heat ?? 0,
    influence: state.influence ?? 0,
    health: state.health ?? 100,
    energy: state.energy ?? 100,
    gearPower: state.gearPower ?? 0,
    equipment: state.equipment ?? {},
    cityLevel: state.cityLevel ?? 1,
    crew: state.crew ?? 1,
    activeCrewMemberId: state.activeCrewMemberId ?? null,
    mainBaseSpotId: state.mainBaseSpotId ?? null,
    worldBaseLotId: state.worldBaseLotId ?? null,
    worldBaseLevel: state.worldBaseLevel ?? 1,
    needsWorldBaseSelection: Boolean(state.needsWorldBaseSelection),
    territories: state.territories ?? {},
    buildingDifficulties: state.buildingDifficulties ?? {},
    buildingDifficultyCycle: state.buildingDifficultyCycle ?? null,
    marketRefreshAt: state.marketRefreshAt ?? 0,
    selectedQuestSlot: state.selectedQuestSlot ?? 0,
    questNextSpawnAt: state.questNextSpawnAt ?? 0,
    pendingProtectionRewards: state.pendingProtectionRewards ?? [],
    processTasks: state.processTasks ?? [],
    harborProcessTasks: state.harborProcessTasks ?? [],
    localNotifications: state.localNotifications ?? [],
    smuggledGoods: state.smuggledGoods ?? {},
    smugglerFame: state.smugglerFame ?? 0,
    rivalEvent: state.rivalEvent ?? null,
    rivalNextSpawnAt: state.rivalNextSpawnAt ?? 0,
    mentorStep: state.mentorStep ?? 0,
    mentorCompleted: Boolean(state.mentorCompleted),
    mentorFlags: state.mentorFlags ?? {},
    protectionCooldowns: state.protectionCooldowns ?? {},
    recoveryEffects: state.recoveryEffects ?? { health: null, energy: null },
    naturalRecoveryAt: state.naturalRecoveryAt ?? { health: now, energy: now },
    nextPolicePressureAt: state.nextPolicePressureAt ?? 0,
    mainBaseClaimDay: state.mainBaseClaimDay ?? 0,
    baseRestDay: state.baseRestDay ?? 0,
    baseRestAvailableAt: state.baseRestAvailableAt ?? 0,
    hideUsesToday: state.hideUsesToday ?? 0,
    hideUsesDay: state.hideUsesDay ?? 1,
    day: state.day ?? 1,
    districts: state.districts ?? [],
    selectedDistrictIndex: state.selectedDistrictIndex ?? 0,
    worldRivalCities: state.worldRivalCities ?? [],
    clanName: state.clanName ?? "",
    clanDescription: state.clanDescription ?? "",
    clanTreasury: state.clanTreasury ?? 0,
    registered: Boolean(state.profileName),
  };
  const inventory = state.itemInventory ?? {};
  const crew = state.crewMembers ?? [];
  const quests = {
    activeQuest: state.activeQuest ?? null,
    activeQuests: state.activeQuests ?? [],
    offeredQuests: state.offeredQuests ?? [],
  };
  await upsertPlayerStateStmt.run(
    profileName,
    JSON.stringify(snapshot),
    JSON.stringify(inventory),
    JSON.stringify(crew),
    JSON.stringify(quests),
    now,
  );
}

async function writePlayerRuntimeState(profileName, state, now) {
  const runtime = {
    pendingProtectionRewards: state.pendingProtectionRewards ?? [],
    localNotifications: state.localNotifications ?? [],
    smuggledGoods: state.smuggledGoods ?? {},
    rivalEvent: state.rivalEvent ?? null,
    rivalNextSpawnAt: state.rivalNextSpawnAt ?? 0,
    mentorStep: state.mentorStep ?? 0,
    mentorCompleted: Boolean(state.mentorCompleted),
    mentorFlags: state.mentorFlags ?? {},
    protectionCooldowns: state.protectionCooldowns ?? {},
    districts: state.districts ?? [],
    selectedDistrictIndex: state.selectedDistrictIndex ?? 0,
  };
  await upsertPlayerRuntimeStateStmt.run(
    profileName,
    JSON.stringify(runtime),
    now,
  );
}

async function writePlayerProcessTasks(profileName, state, now) {
  await deletePlayerProcessTasksStmt.run(profileName);
  const taskGroups = [
    { scope: "main", tasks: Array.isArray(state.processTasks) ? state.processTasks : [] },
    { scope: "harbor", tasks: Array.isArray(state.harborProcessTasks) ? state.harborProcessTasks : [] },
  ];
  for (const group of taskGroups) {
    for (const [index, task] of group.tasks.entries()) {
      if (!task || typeof task !== "object") continue;
      const taskId = String(task.id || `${profileName}-${group.scope}-${index}`);
      await insertPlayerProcessTaskStmt.run(
        taskId.slice(0, 128),
        profileName,
        group.scope,
        index,
        String(task.type || ""),
        String(task.status || ""),
        Number.isFinite(Number(task.endsAt)) ? Number(task.endsAt) : null,
        JSON.stringify(task),
        now,
      );
    }
  }
}

async function writePlayerTerritories(profileName, state, now) {
  await deletePlayerTerritoriesStmt.run(profileName);
  const territories = state.territories && typeof state.territories === "object"
    ? Object.entries(state.territories)
    : [];
  for (const [territoryId, territory] of territories) {
    if (!territoryId || !territory || typeof territory !== "object") continue;
    await insertPlayerTerritoryStmt.run(
      profileName,
      String(territoryId).slice(0, 64),
      String(territory.ownerType || "").slice(0, 24),
      Math.max(1, toSafeInt(territory.level, 1, 1)),
      JSON.stringify(territory),
      now,
    );
  }
}

async function writePlayerEquipment(profileName, state, now) {
  await deletePlayerEquipmentStmt.run(profileName);
  const equipment = state.equipment && typeof state.equipment === "object" ? state.equipment : {};
  for (const [slotKey, item] of Object.entries(equipment)) {
    if (!item || typeof item !== "object") continue;
    await insertPlayerEquipmentStmt.run(
      profileName,
      "player",
      "self",
      String(slotKey).slice(0, 32),
      JSON.stringify(item),
      now,
    );
  }
}

async function writePlayerInventory(profileName, state, now) {
  await deletePlayerInventoryStmt.run(profileName);
  const inventory = state.itemInventory && typeof state.itemInventory === "object" ? state.itemInventory : {};
  for (const [slotKey, items] of Object.entries(inventory)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const itemId = String(item.id || `${slotKey}-${Math.random().toString(36).slice(2, 8)}`);
      await insertPlayerInventoryItemStmt.run(
        profileName,
        String(slotKey).slice(0, 32),
        itemId.slice(0, 128),
        JSON.stringify(item),
        now,
      );
    }
  }
}

async function writePlayerCrewMembers(profileName, state, now) {
  await deletePlayerCrewMembersStmt.run(profileName);
  const members = Array.isArray(state.crewMembers) ? state.crewMembers : [];
  for (const member of members) {
    if (!member || typeof member !== "object") continue;
    await insertPlayerCrewMemberStmt.run(
      profileName,
      String(member.id || "crew-member").slice(0, 64),
      JSON.stringify(member),
      now,
    );
  }
}

async function writePlayerQuests(profileName, state, now) {
  await deletePlayerQuestsStmt.run(profileName);
  const questGroups = [
    { scope: "featured", items: state.activeQuest ? [state.activeQuest] : [] },
    { scope: "active", items: Array.isArray(state.activeQuests) ? state.activeQuests : [] },
    { scope: "offered", items: Array.isArray(state.offeredQuests) ? state.offeredQuests : [] },
  ];
  for (const group of questGroups) {
    for (const [index, quest] of group.items.entries()) {
      if (!quest || typeof quest !== "object") continue;
      const questId = String(quest.id || `${profileName}-${group.scope}-${index}`);
      await insertPlayerQuestStmt.run(
        questId.slice(0, 128),
        profileName,
        group.scope,
        index,
        String(quest.status || ""),
        JSON.stringify(quest),
        now,
      );
    }
  }
}

async function writePlayerNotifications(profileName, state, now) {
  await deletePlayerNotificationsStmt.run(profileName);
  const notifications = Array.isArray(state.localNotifications) ? state.localNotifications : [];
  for (const [index, entry] of notifications.entries()) {
    if (!entry || typeof entry !== "object") continue;
    const notificationId = String(entry.id || `${profileName}-note-${index}`);
    await insertPlayerNotificationStmt.run(
      notificationId.slice(0, 128),
      profileName,
      String(entry.messageType || "event").slice(0, 32),
      String(entry.title || "Ertesites").slice(0, 120),
      String(entry.body || "").slice(0, 1200),
      entry.senderProfileName ? String(entry.senderProfileName).slice(0, 18) : null,
      Number.isFinite(Number(entry.readAt)) && Number(entry.readAt) > 0 ? Number(entry.readAt) : null,
      Number.isFinite(Number(entry.createdAt)) ? Number(entry.createdAt) : now,
      JSON.stringify(entry),
      now,
    );
  }
}

async function writePlayerDistricts(profileName, state, now) {
  await deletePlayerDistrictsStmt.run(profileName);
  const districts = Array.isArray(state.districts) ? state.districts : [];
  const selectedIndex = Math.max(0, toSafeInt(state.selectedDistrictIndex, 0, 0));
  for (const [index, district] of districts.entries()) {
    if (!district || typeof district !== "object") continue;
    await insertPlayerDistrictStmt.run(
      profileName,
      String(district.id || `district-${index}`).slice(0, 64),
      index,
      index === selectedIndex ? 1 : 0,
      JSON.stringify(district),
      now,
    );
  }
}

async function writePlayerBuildingDifficulties(profileName, state, now) {
  await deletePlayerBuildingDifficultiesStmt.run(profileName);
  const difficulties = state.buildingDifficulties && typeof state.buildingDifficulties === "object"
    ? Object.entries(state.buildingDifficulties)
    : [];
  const cycle = Number.isFinite(Number(state.buildingDifficultyCycle)) ? Number(state.buildingDifficultyCycle) : null;
  for (const [spotId, difficulty] of difficulties) {
    await insertPlayerBuildingDifficultyStmt.run(
      profileName,
      String(spotId).slice(0, 64),
      Math.max(1, toSafeInt(difficulty, 1, 1)),
      cycle,
      now,
    );
  }
}

async function writePlayerWorldRivals(profileName, state, now) {
  await deletePlayerWorldRivalsStmt.run(profileName);
  const cities = Array.isArray(state.worldRivalCities) ? state.worldRivalCities : [];
  for (const city of cities) {
    if (!city || typeof city !== "object" || !city.id || !city.lotId) continue;
    await insertPlayerWorldRivalStmt.run(
      String(city.id).slice(0, 128),
      profileName,
      String(city.lotId).slice(0, 64),
      String(city.status || "hostile").slice(0, 24),
      Math.max(1, toSafeInt(city.level, 1, 1)),
      Math.max(1, toSafeInt(city.power, 1, 1)),
      Number.isFinite(Number(city.tributeReadyAt)) ? Number(city.tributeReadyAt) : null,
      JSON.stringify(city),
      now,
    );
  }
}

async function writeWorldLotOwnership(profileName, state, now) {
  await deleteWorldLotsByOwnerStmt.run(profileName);
  const lotId = typeof state.worldBaseLotId === "string" ? state.worldBaseLotId : "";
  if (!lotId) return;
  const coord = lotId.replace(/^world-lot-/, "").toUpperCase();
  await upsertWorldLotStmt.run(
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

async function writeLeaderboardEntry(summary, now) {
  await upsertLeaderboardEntryStmt.run(
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

async function writeMarketStock(profileName, state, now) {
  await deleteMarketItemsByOwnerStmt.run(profileName);
  const stock = Array.isArray(state.marketStock) ? state.marketStock : [];
  for (const offer of stock) {
    const item = offer?.item || {};
    const stat = deriveMarketStat(item);
    const itemId = String(item.id || `market-${profileName}-${Math.random().toString(36).slice(2, 8)}`);
    await upsertMarketItemStmt.run(
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

async function writeClanData(profileName, state, now) {
  const clanName = typeof state.clanName === "string" ? state.clanName.trim() : "";
  if (!clanName) return;
  const clanId = `clan-${clanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ismeretlen"}`;
  await upsertClanStmt.run(
    clanId,
    clanName.slice(0, 40),
    profileName,
    typeof state.clanDescription === "string" ? state.clanDescription.slice(0, 220) : "",
    Math.max(0, toSafeInt(state.fame, 0, 0)),
    Math.max(0, toSafeInt(state.clanTreasury, 0, 0)),
    now,
    now,
  );
  await deleteClanMembersByClanStmt.run(clanId);
  await insertClanMemberStmt.run(clanId, profileName, "fonok", 0, now);
}

async function syncStructuredTables(profileName, state, now, existingSaveRow = null) {
  const { summary, existed } = await writePlayerSnapshot(profileName, state, now, existingSaveRow);
  await Promise.all([
    writePlayerState(profileName, state, now),
    writePlayerRuntimeState(profileName, state, now),
    writePlayerProcessTasks(profileName, state, now),
    writePlayerTerritories(profileName, state, now),
    writePlayerEquipment(profileName, state, now),
    writePlayerInventory(profileName, state, now),
    writePlayerCrewMembers(profileName, state, now),
    writePlayerQuests(profileName, state, now),
    writePlayerNotifications(profileName, state, now),
    writePlayerDistricts(profileName, state, now),
    writePlayerBuildingDifficulties(profileName, state, now),
    writePlayerWorldRivals(profileName, state, now),
    writeWorldLotOwnership(profileName, state, now),
    writeLeaderboardEntry(summary, now),
    writeMarketStock(profileName, state, now),
    writeClanData(profileName, state, now),
  ]);
  return { summary, existed };
}

async function persistGameState(profileName, state, now = Date.now()) {
  return db.transaction(async () => {
    const existingSave = await selectSaveStmt.get(profileName);
    await upsertSaveStmt.run(
      profileName,
      JSON.stringify({ ...state, profileName }),
      existingSave?.created_at ?? now,
      now,
    );
    const result = await syncStructuredTables(profileName, state, now, existingSave);
    await logEvent(
      profileName,
      result.existed ? "save_update" : "player_created",
      result.existed ? "Játékosmentés frissítve" : "Új játékos rögzítve",
      {
        level: result.summary.level,
        fame: result.summary.fame,
        cityLevel: result.summary.cityLevel,
        worldBaseLotId: result.summary.worldBaseLotId,
      },
      now,
    );
    return result;
  });
}

async function logEvent(profileName, eventType, title, payload = {}, now = Date.now()) {
  await insertEventStmt.run(
    profileName,
    String(eventType || "system").slice(0, 40),
    String(title || "Esemény").slice(0, 120),
    JSON.stringify(payload || {}),
    now,
  );
}

async function createMessage(recipientProfileName, senderProfileName, messageType, title, body, payload = {}, now = Date.now()) {
  await insertMessageStmt.run(
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
  const equipment = state && typeof state === "object" && !Array.isArray(state)
    ? (state.equipment && typeof state.equipment === "object" ? state.equipment : state)
    : {};
  for (const item of Object.values(equipment)) {
    const power = Math.max(0, toSafeInt(item?.power, 0, 0));
    if (item?.stat === "defense") defense += power;
    else attack += power;
  }
  return { attack, defense };
}

function getCrewCombatStats(member = {}) {
  const equipment = getEquipmentCombatStats(member.equipment || {});
  const level = Math.max(1, toSafeInt(member.level, 1, 1));
  const defenseLevel = Math.max(1, toSafeInt(member.defenseLevel, level, 1));
  const maxHealth = Math.max(1, toSafeInt(member.baseHealth, 100, 1));
  const health = Math.max(0, Math.min(maxHealth, toSafeInt(member.health, maxHealth, 0)));
  return {
    attack: Math.max(
      0,
      toSafeInt(member.baseAttack, 0, 0)
        + toSafeInt(member.attackBonus, 0, 0)
        + equipment.attack
        + Math.floor(level * 0.45),
    ),
    defense: Math.max(
      0,
      toSafeInt(member.baseDefense, 0, 0)
        + toSafeInt(member.defenseBonus, 0, 0)
        + equipment.defense
        + Math.floor(defenseLevel * 0.4),
    ),
    level,
    readiness: health / maxHealth,
  };
}

function getPvpCombatStats(state = {}) {
  const gear = getEquipmentCombatStats(state);
  const crew = Array.isArray(state.crewMembers)
    ? state.crewMembers.filter((member) => member?.hired)
    : [];
  const memberStats = crew.map(getCrewCombatStats);
  const requestedActiveIndex = crew.findIndex((member) => member?.id === state.activeCrewMemberId);
  const active = memberStats[requestedActiveIndex >= 0 ? requestedActiveIndex : 0] || {
    attack: 0,
    defense: 0,
    level: 1,
    readiness: 1,
  };
  const crewAttack = memberStats.reduce((sum, member) => sum + member.attack, 0);
  const crewDefense = memberStats.reduce((sum, member) => sum + member.defense, 0);
  const crewLevelTotal = memberStats.reduce((sum, member) => sum + member.level, 0);
  const readiness = memberStats.length
    ? memberStats.reduce((sum, member) => sum + member.readiness, 0) / memberStats.length
    : 1;
  const level = getRankLevel(state.fame || 0);
  const playerAttack = gear.attack + Math.max(0, Math.floor(level * 0.6));
  const playerDefense = gear.defense + Math.max(0, Math.floor(level * 0.55));
  const baseProfilePower = (
    gear.attack
    + gear.defense
    + level * 8
    + Math.max(1, toSafeInt(state.cityLevel, 1, 1)) * 5
    + Math.max(0, Number(state.fame) || 0) * 0.1
    + crew.length * 4
  );
  const assault = Math.max(1, Math.round(
    baseProfilePower
      + active.attack
      + crewAttack * 0.72
      + crewDefense * 0.18
      + crewLevelTotal * 0.8
      + readiness * 14,
  ));
  const pressure = Math.max(1, Math.round(
    baseProfilePower
      + active.attack * 0.55
      + active.defense * 0.6
      + crewAttack * 0.42
      + crewDefense * 0.48
      + crewLevelTotal * 0.65
      + readiness * 18,
  ));
  const resilience = Math.max(1, Math.round(
    baseProfilePower
      + active.defense
      + crewDefense * 0.72
      + crewAttack * 0.16
      + crewLevelTotal * 0.7
      + readiness * 22,
  ));
  return {
    attack: assault,
    defense: resilience,
    assault,
    pressure,
    resilience,
    readiness,
    playerAttack,
    playerDefense,
    crewAttack,
    crewDefense,
    crewLevelTotal,
    level,
  };
}

async function buildPublicProfile(profileName) {
  const [player, profile] = await Promise.all([
    selectPlayerStmt.get(profileName),
    buildProfileState(profileName),
  ]);
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
    pressure: combat.pressure,
    readiness: Math.round(combat.readiness * 100),
    playerAttack: combat.playerAttack,
    playerDefense: combat.playerDefense,
    crewAttack: combat.crewAttack,
    crewDefense: combat.crewDefense,
    crewLevelTotal: combat.crewLevelTotal,
    health: Math.max(0, toSafeInt(profile.state.health, player.health, 0)),
    energy: Math.max(0, toSafeInt(profile.state.energy, player.energy, 0)),
    lastSeenAt: player.last_seen_at,
  };
}

async function persistPvpState(profileName, state, now) {
  const existingSave = await selectSaveStmt.get(profileName);
  await upsertSaveStmt.run(
    profileName,
    JSON.stringify({ ...state, profileName }),
    existingSave?.created_at ?? now,
    now,
  );
  await syncStructuredTables(profileName, state, now, existingSave);
}

async function backfillPlayersFromSaves() {
  const rows = await listSavesStmt.all();
  for (const row of rows) {
    let state = {};
    try {
      state = JSON.parse(row.state_json);
    } catch {
      state = {};
    }
    const profileName = normalizeProfileName(row.profile_name || state.profileName);
    if (!profileName) continue;
    const [existingPlayer, existingState] = await Promise.all([
      selectPlayerStmt.get(profileName),
      selectPlayerStateStmt.get(profileName),
    ]);
    const freshestStructuredAt = Math.max(
      Number(existingPlayer?.updated_at || 0),
      Number(existingState?.updated_at || 0),
    );
    if (freshestStructuredAt > Number(row.updated_at || 0)) {
      continue;
    }
    await syncStructuredTables(profileName, state, row.updated_at, row);
  }
}

async function importBootstrapSavesIfNeeded() {
  const importMeta = await selectMetaStmt.get("legacy_sqlite_import");
  if (importMeta?.meta_value === "complete") return;
  const existingRows = await listSavesStmt.all();
  if (existingRows.length) {
    await upsertMetaStmt.run("legacy_sqlite_import", "complete", Date.now());
    return;
  }

  const bootstrapPath = path.join(ROOT_DIR, "data", "mysql-bootstrap-saves.json");
  let rows;
  try {
    rows = JSON.parse(await fsp.readFile(bootstrapPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  if (!Array.isArray(rows)) return;

  for (const row of rows) {
    const profileName = normalizeProfileName(row?.profile_name);
    if (!profileName || typeof row?.state_json !== "string") continue;
    const existingSave = await selectSaveStmt.get(profileName);
    if (existingSave) continue;
    const createdAt = Number.isFinite(Number(row.created_at)) ? Number(row.created_at) : Date.now();
    const updatedAt = Number.isFinite(Number(row.updated_at)) ? Number(row.updated_at) : createdAt;
    await upsertSaveStmt.run(profileName, row.state_json, createdAt, updatedAt);
  }
  await upsertMetaStmt.run("legacy_sqlite_import", "complete", Date.now());
}

await importBootstrapSavesIfNeeded();
await backfillPlayersFromSaves();

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
    await db.ping();
    const counts = await countSavesStmt.get();
    sendJson(response, 200, {
      ok: true,
      databaseType: "mysql",
      database: db.info,
      profiles: Number(counts?.profile_count || 0),
    });
    return true;
  }

  if (pathname === "/api/players" && request.method === "GET") {
    const players = (await listPlayersStmt.all()).map(mapPlayerRow);
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
    const profile = await buildProfileState(profileName);
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
    const profile = profileName ? await buildPublicProfile(profileName) : null;
    if (!profile) {
      sendJson(response, 404, { found: false, error: "Player not found" });
      return true;
    }
    sendJson(response, 200, { found: true, profile });
    return true;
  }

  if (pathname === "/api/player-state" && request.method === "GET") {
    const players = await listPlayersStmt.all();
    const rows = await Promise.all(players.map(async (player) => {
      const profile = await buildProfileState(player.profile_name);
      const state = profile?.state || {};
      return {
        profileName: player.profile_name,
        snapshot: {
          money: state.money ?? 0,
          fame: state.fame ?? 0,
          heat: state.heat ?? 0,
          influence: state.influence ?? 0,
          cityLevel: state.cityLevel ?? 1,
          worldBaseLotId: state.worldBaseLotId ?? null,
          worldBaseLevel: state.worldBaseLevel ?? 1,
          day: state.day ?? 1,
          selectedDistrictIndex: state.selectedDistrictIndex ?? 0,
          rivalEvent: state.rivalEvent ?? null,
          processTasks: state.processTasks ?? [],
          harborProcessTasks: state.harborProcessTasks ?? [],
        },
        updatedAt: profile?.updatedAt ?? player.updated_at,
      };
    }));
    sendJson(response, 200, { playerState: rows });
    return true;
  }

  if (pathname === "/api/world-lots" && request.method === "GET") {
    const lots = (await listWorldLotsStmt.all()).map(mapWorldLotRow);
    sendJson(response, 200, { lots });
    return true;
  }

  if (pathname === "/api/leaderboard" && request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const seasonKey = String(url.searchParams.get("season") || "global").slice(0, 32);
    const limit = Math.min(200, Math.max(1, toSafeInt(url.searchParams.get("limit"), 50, 1)));
    const entries = (await listLeaderboardEntriesStmt.all(seasonKey, limit)).map(mapLeaderboardRow);
    sendJson(response, 200, { entries });
    return true;
  }

  if (pathname === "/api/market-items" && request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const profileName = normalizeProfileName(url.searchParams.get("profileName") || "");
    const limit = Math.min(500, Math.max(1, toSafeInt(url.searchParams.get("limit"), 100, 1)));
    const ownerFilter = profileName || null;
    const items = (await listMarketItemsStmt.all(ownerFilter, ownerFilter, limit)).map(mapMarketItemRow);
    sendJson(response, 200, { items });
    return true;
  }

  if (pathname === "/api/clans" && request.method === "GET") {
    const clans = (await listClansStmt.all()).map(mapClanRow);
    sendJson(response, 200, { clans });
    return true;
  }

  if (pathname === "/api/events" && request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const profileName = normalizeProfileName(url.searchParams.get("profileName") || "");
    const limit = Math.min(200, Math.max(1, toSafeInt(url.searchParams.get("limit"), 40, 1)));
    const rows = profileName
      ? await listEventsByProfileStmt.all(profileName, limit)
      : await listEventsStmt.all(limit);
    sendJson(response, 200, { events: rows.map(mapEventRow) });
    return true;
  }

  if (pathname === "/api/events" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const profileName = normalizeProfileName(body.profileName);
      if (!profileName || !await selectPlayerStmt.get(profileName)) {
        sendJson(response, 404, { error: "Player not found" });
        return true;
      }
      await logEvent(
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
    const messages = (await listMessagesByRecipientStmt.all(profileName, limit)).map(mapMessageRow);
    const notifications = buildNotificationsFromRows(await listPlayerNotificationsStmt.all(profileName));
    const events = (await listEventsByProfileStmt.all(profileName, limit))
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
    const inbox = [...notifications, ...messages, ...events]
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, limit);
    const unreadCount = Number((await countUnreadMessagesStmt.get(profileName))?.unread_count || 0)
      + Number((await countUnreadPlayerNotificationsStmt.get(profileName))?.unread_count || 0);
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
      const [sender, recipient] = await Promise.all([
        selectPlayerStmt.get(senderProfileName),
        selectPlayerStmt.get(recipientProfileName),
      ]);
      if (!sender || !recipient) {
        sendJson(response, 404, { error: "Player not found" });
        return true;
      }
      await createMessage(
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
      const now = Date.now();
      await Promise.all([
        markMessagesReadStmt.run(now, profileName),
        markPlayerNotificationsReadStmt.run(now, profileName),
      ]);
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
      const [attackerProfile, defenderProfile] = await Promise.all([
        buildProfileState(attackerProfileName),
        buildProfileState(defenderProfileName),
      ]);
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

      await db.transaction(async () => {
        await persistPvpState(attackerProfileName, attackerState, now);
        await persistPvpState(defenderProfileName, defenderState, now);
        const defenderBody = attackerWon
          ? `${attackerProfileName} megtámadta a bázisodat és ${stolenMoney} $ zsákmányt vitt el.`
          : `${attackerProfileName} megtámadta a bázisodat, de az embereid visszaverték.`;
        await createMessage(
          defenderProfileName,
          attackerProfileName,
          "pvp",
          attackerWon ? "Támadás érte a bázisodat" : "Visszavert támadás",
          defenderBody,
          { attackerWon, stolenMoney, attackerAttack: attackerCombat.attack, defenderDefense: defenderCombat.defense },
          now,
        );
        await logEvent(attackerProfileName, "pvp_attack", "PvP támadás végrehajtva", {
          body: attackerWon
            ? `${defenderProfileName} bázisát legyőzted, zsákmány: ${stolenMoney} $.`
            : `${defenderProfileName} bázisa visszaverte a támadásodat.`,
          defenderProfileName,
          attackerWon,
          stolenMoney,
        }, now);
      });

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
    const rows = await listSavesStmt.all();
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
      await persistGameState(profileName, state, now);
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
    const row = await selectSaveStmt.get(profileName);
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
      const state = { ...body.state, profileName };
      await persistGameState(profileName, state, now);
      sendJson(response, 200, { ok: true, profileName, updatedAt: now });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Invalid request body" });
      return true;
    }
  }

  if (request.method === "DELETE") {
    try {
      await db.transaction(async () => {
        await deleteMessagesByProfileStmt.run(profileName, profileName);
        await deleteWorldLotsByOwnerStmt.run(profileName);
        await deleteClansByBossStmt.run(profileName);
        await deleteSaveStmt.run(profileName);
        await deletePlayerStmt.run(profileName);
      });
      sendEmpty(response);
    } catch (error) {
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
      "Cache-Control": ext === ".html" || ext === ".js" || ext === ".css" ? "no-store, max-age=0" : "public, max-age=86400",
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
  console.log(`MySQL adatbazis: ${db.info}`);
});

}

main().catch((error) => {
  console.error("A MySQL-alapu Maffia szerver nem tudott elindulni.");
  console.error(error);
  process.exitCode = 1;
});
