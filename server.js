const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const zlib = require("node:zlib");
const { randomUUID } = require("node:crypto");
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
    npc_village_victories,
    registered_at,
    updated_at,
    last_seen_at
  FROM players
  WHERE profile_name = ?
`);

const lockPlayerStmt = db.prepare(`
  SELECT profile_name
  FROM players
  WHERE profile_name = ?
  FOR UPDATE
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
    npc_village_victories,
    registered_at,
    updated_at,
    last_seen_at
  FROM players
  ORDER BY level DESC, fame DESC, city_level DESC, updated_at DESC
`);

const countPlayersStmt = db.prepare(`
  SELECT COUNT(*) AS profile_count
  FROM players
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
    npc_village_victories,
    registered_at,
    updated_at,
    last_seen_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    npc_village_victories = VALUES(npc_village_victories),
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

const upsertPlayerHarborGarageStmt = db.prepare(`
  INSERT INTO player_harbor_garage (
    profile_name,
    garage_level,
    active_vehicle_id,
    unlocked_vehicle_ids,
    successful_runs,
    failed_runs,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    garage_level = VALUES(garage_level),
    active_vehicle_id = VALUES(active_vehicle_id),
    unlocked_vehicle_ids = VALUES(unlocked_vehicle_ids),
    successful_runs = VALUES(successful_runs),
    failed_runs = VALUES(failed_runs),
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at)
`);

const selectPlayerHarborGarageStmt = db.prepare(`
  SELECT profile_name, garage_level, active_vehicle_id, unlocked_vehicle_ids, successful_runs, failed_runs, payload_json, updated_at
  FROM player_harbor_garage
  WHERE profile_name = ?
`);

const selectActiveActionSessionStmt = db.prepare(`
  SELECT action_id, profile_name, action_type, action_status, payload_json, created_at, updated_at, expires_at
  FROM player_action_sessions
  WHERE profile_name = ?
    AND action_type = ?
    AND action_status = 'active'
  ORDER BY updated_at DESC
  LIMIT 1
  FOR UPDATE
`);

const selectActionSessionStmt = db.prepare(`
  SELECT action_id, profile_name, action_type, action_status, payload_json, created_at, updated_at, expires_at
  FROM player_action_sessions
  WHERE action_id = ? AND profile_name = ?
  FOR UPDATE
`);

const upsertActionSessionStmt = db.prepare(`
  INSERT INTO player_action_sessions (
    action_id, profile_name, action_type, action_status, payload_json, created_at, updated_at, expires_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    action_status = VALUES(action_status),
    payload_json = VALUES(payload_json),
    updated_at = VALUES(updated_at),
    expires_at = VALUES(expires_at)
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
    npc_village_victories,
    rank_title,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    season_key = VALUES(season_key),
    level = VALUES(level),
    fame = VALUES(fame),
    city_level = VALUES(city_level),
    npc_village_victories = VALUES(npc_village_victories),
    rank_title = VALUES(rank_title),
    updated_at = VALUES(updated_at)
`);

const listLeaderboardEntriesStmt = db.prepare(`
  SELECT
    leaderboard.profile_name,
    leaderboard.season_key,
    leaderboard.level,
    leaderboard.fame,
    leaderboard.city_level,
    GREATEST(
      leaderboard.npc_village_victories,
      (
        SELECT COUNT(*)
        FROM player_world_rivals AS rival
        WHERE rival.profile_name = leaderboard.profile_name
          AND rival.city_status = 'captured'
      )
    ) AS npc_village_victories,
    leaderboard.rank_title,
    leaderboard.updated_at
  FROM leaderboard_entries AS leaderboard
  WHERE leaderboard.season_key = ?
  ORDER BY leaderboard.level DESC, leaderboard.fame DESC, leaderboard.city_level DESC, leaderboard.updated_at DESC
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

const selectMarketItemStmt = db.prepare(`
  SELECT item_id, market_scope, owner_profile_name, slot_key, item_name, rarity, stat_kind, stat_value, price, stock, expires_at, payload_json, updated_at
  FROM market_items
  WHERE item_id = ? AND owner_profile_name = ?
  FOR UPDATE
`);

const markMarketItemSoldStmt = db.prepare(`
  UPDATE market_items
  SET stock = 0, updated_at = ?
  WHERE item_id = ? AND owner_profile_name = ?
`);

const insertGameConfigEntryStmt = db.prepare(`
  INSERT IGNORE INTO game_config_entries (
    config_key,
    config_group,
    payload_json,
    updated_at
  )
  VALUES (?, ?, ?, ?)
`);

const updateGameConfigEntryStmt = db.prepare(`
  UPDATE game_config_entries
  SET config_group = ?, payload_json = ?, updated_at = ?
  WHERE config_key = ?
`);

const listGameConfigEntriesStmt = db.prepare(`
  SELECT config_key, config_group, payload_json, updated_at
  FROM game_config_entries
  ORDER BY config_group ASC, config_key ASC
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

const insertClanStmt = db.prepare(`
  INSERT INTO clans (
    clan_id, clan_name, boss_profile_name, description, notoriety, treasury, created_at, updated_at
  )
  VALUES (?, ?, ?, ?, 0, 0, ?, ?)
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

const updateClanMemberRoleStmt = db.prepare(`
  UPDATE clan_members
  SET member_role = ?
  WHERE clan_id = ? AND profile_name = ?
`);

const deleteClanMemberStmt = db.prepare(`
  DELETE FROM clan_members
  WHERE clan_id = ? AND profile_name = ?
`);

const countClanMembersStmt = db.prepare(`
  SELECT COUNT(*) AS member_count
  FROM clan_members
  WHERE clan_id = ?
`);

const selectClanSuccessorStmt = db.prepare(`
  SELECT cm.profile_name, cm.member_role, p.fame
  FROM clan_members cm
  JOIN players p ON p.profile_name = cm.profile_name
  LEFT JOIN clan_roles cr ON cr.clan_id = cm.clan_id AND cr.role_key = cm.member_role
  WHERE cm.clan_id = ? AND cm.profile_name <> ?
  ORDER BY COALESCE(cr.role_priority, 0) DESC, p.fame DESC, cm.joined_at ASC
  LIMIT 1
`);

const updateClanBossStmt = db.prepare(`
  UPDATE clans
  SET boss_profile_name = ?, updated_at = ?
  WHERE clan_id = ?
`);

const deleteClanByIdStmt = db.prepare(`
  DELETE FROM clans
  WHERE clan_id = ?
`);

const listClanRolesStmt = db.prepare(`
  SELECT clan_id, role_key, role_name, role_priority, permissions_json, is_system, updated_at
  FROM clan_roles
  WHERE clan_id = ?
  ORDER BY role_priority DESC, role_name ASC
`);

const selectClanRoleStmt = db.prepare(`
  SELECT clan_id, role_key, role_name, role_priority, permissions_json, is_system, updated_at
  FROM clan_roles
  WHERE clan_id = ? AND role_key = ?
`);

const upsertClanRoleStmt = db.prepare(`
  INSERT INTO clan_roles (clan_id, role_key, role_name, role_priority, permissions_json, is_system, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    role_name = VALUES(role_name),
    role_priority = VALUES(role_priority),
    permissions_json = VALUES(permissions_json),
    is_system = VALUES(is_system),
    updated_at = VALUES(updated_at)
`);

const insertClanInvitationStmt = db.prepare(`
  INSERT INTO clan_invitations (
    clan_id, invited_profile_name, invited_by_profile_name, invitation_status, message_id, created_at, responded_at, expires_at
  )
  VALUES (?, ?, ?, 'pending', NULL, ?, NULL, ?)
`);

const updateClanInvitationMessageStmt = db.prepare(`
  UPDATE clan_invitations
  SET message_id = ?
  WHERE invitation_id = ?
`);

const selectPendingClanInvitationStmt = db.prepare(`
  SELECT invitation_id, clan_id, invited_profile_name, invited_by_profile_name, invitation_status, message_id, created_at, responded_at, expires_at
  FROM clan_invitations
  WHERE clan_id = ? AND invited_profile_name = ? AND invitation_status = 'pending' AND expires_at > ?
  LIMIT 1
`);

const selectClanInvitationStmt = db.prepare(`
  SELECT invitation_id, clan_id, invited_profile_name, invited_by_profile_name, invitation_status, message_id, created_at, responded_at, expires_at
  FROM clan_invitations
  WHERE invitation_id = ?
`);

const listClanInvitationsStmt = db.prepare(`
  SELECT i.invitation_id, i.clan_id, i.invited_profile_name, i.invited_by_profile_name,
         i.invitation_status, i.message_id, i.created_at, i.responded_at, i.expires_at,
         p.display_name
  FROM clan_invitations i
  JOIN players p ON p.profile_name = i.invited_profile_name
  WHERE i.clan_id = ?
  ORDER BY (i.invitation_status = 'pending') DESC, i.created_at DESC
  LIMIT 100
`);

const updateClanInvitationStatusStmt = db.prepare(`
  UPDATE clan_invitations
  SET invitation_status = ?, responded_at = ?
  WHERE invitation_id = ? AND invitation_status = 'pending'
`);

const updateClanInvitationMessagePayloadStmt = db.prepare(`
  UPDATE messages
  SET payload_json = JSON_SET(payload_json, '$.invitationStatus', ?)
  WHERE id = ?
`);

const listClansStmt = db.prepare(`
  SELECT clan_id, clan_name, boss_profile_name, description, notoriety, treasury, created_at, updated_at
  FROM clans
  ORDER BY notoriety DESC, updated_at DESC, clan_name ASC
`);

const selectClanByIdStmt = db.prepare(`
  SELECT clan_id, clan_name, boss_profile_name, description, notoriety, treasury, created_at, updated_at
  FROM clans
  WHERE clan_id = ?
`);

const selectClanForMemberStmt = db.prepare(`
  SELECT c.clan_id, c.clan_name, c.boss_profile_name, c.description, c.notoriety, c.treasury,
         c.created_at, c.updated_at, cm.member_role, cm.contribution, cm.joined_at
  FROM clan_members cm
  JOIN clans c ON c.clan_id = cm.clan_id
  WHERE cm.profile_name = ?
  ORDER BY cm.joined_at ASC
  LIMIT 1
`);

const listClanMembersStmt = db.prepare(`
  SELECT cm.profile_name, cm.member_role, cm.contribution, cm.joined_at,
         p.display_name, p.rank_title, p.level, p.fame, p.last_seen_at
  FROM clan_members cm
  JOIN players p ON p.profile_name = cm.profile_name
  WHERE cm.clan_id = ?
  ORDER BY CASE cm.member_role WHEN 'fonok' THEN 0 WHEN 'alvezeto' THEN 1 ELSE 2 END,
           p.fame DESC, p.profile_name ASC
`);

const listClanRecruitCandidatesStmt = db.prepare(`
  SELECT p.profile_name, p.display_name, p.rank_title, p.level, p.fame, p.last_seen_at
  FROM players p
  LEFT JOIN clan_members cm ON cm.profile_name = p.profile_name
  WHERE cm.profile_name IS NULL AND p.profile_name <> ?
  ORDER BY p.fame DESC, p.updated_at DESC
  LIMIT 100
`);

const selectClanMembershipStmt = db.prepare(`
  SELECT clan_id, profile_name, member_role, contribution, joined_at
  FROM clan_members
  WHERE profile_name = ?
  LIMIT 1
`);

const listClanWarsStmt = db.prepare(`
  SELECT w.war_id, w.attacker_clan_id, attacker.clan_name AS attacker_clan_name,
         w.defender_clan_id, defender.clan_name AS defender_clan_name,
         w.attacker_score, w.defender_score, w.war_status, w.started_at, w.ends_at
  FROM clan_wars w
  JOIN clans attacker ON attacker.clan_id = w.attacker_clan_id
  JOIN clans defender ON defender.clan_id = w.defender_clan_id
  WHERE w.attacker_clan_id = ? OR w.defender_clan_id = ?
  ORDER BY (w.war_status = 'active') DESC, w.started_at DESC
  LIMIT 30
`);

const findActiveClanWarStmt = db.prepare(`
  SELECT war_id
  FROM clan_wars
  WHERE war_status = 'active'
    AND ((attacker_clan_id = ? AND defender_clan_id = ?) OR (attacker_clan_id = ? AND defender_clan_id = ?))
  LIMIT 1
`);

const insertClanWarStmt = db.prepare(`
  INSERT INTO clan_wars (attacker_clan_id, defender_clan_id, attacker_score, defender_score, war_status, started_at, ends_at)
  VALUES (?, ?, 0, 0, 'active', ?, ?)
`);

const expireClanWarsStmt = db.prepare(`
  UPDATE clan_wars
  SET war_status = 'finished'
  WHERE war_status = 'active' AND ends_at <= ?
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
  WHERE recipient_profile_name = ? AND message_type = 'player'
  ORDER BY created_at DESC
  LIMIT ?
`);

const countUnreadMessagesStmt = db.prepare(`
  SELECT COUNT(*) AS unread_count
  FROM messages
  WHERE recipient_profile_name = ? AND message_type = 'player' AND read_at IS NULL
`);

const markMessagesReadStmt = db.prepare(`
  UPDATE messages
  SET read_at = ?
  WHERE recipient_profile_name = ? AND message_type = 'player' AND read_at IS NULL
`);

const deleteReceivedMessageStmt = db.prepare(`
  DELETE FROM messages
  WHERE id = ? AND recipient_profile_name = ? AND message_type = 'player'
`);

const deleteMessagesByProfileStmt = db.prepare(`
  DELETE FROM messages
  WHERE recipient_profile_name = ? OR sender_profile_name = ?
`);

const listWorldChatMessagesStmt = db.prepare(`
  SELECT id, sender_profile_name, body, created_at
  FROM world_chat_messages
  ORDER BY created_at DESC, id DESC
  LIMIT ?
`);

const insertWorldChatMessageStmt = db.prepare(`
  INSERT INTO world_chat_messages (sender_profile_name, body, created_at)
  VALUES (?, ?, ?)
`);

const worldChatLastSentAt = new Map();

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
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".glb": "model/gltf-binary",
  ".obj": "text/plain; charset=utf-8",
  ".mtl": "text/plain; charset=utf-8",
  ".fbx": "application/octet-stream",
  ".txt": "text/plain; charset=utf-8",
  ".zip": "application/zip",
  ".woff2": "font/woff2",
};

function normalizeProfileName(rawValue = "") {
  return String(rawValue).trim().slice(0, 18);
}

const ACTIVE_PROFILE_COOKIE = "maffia_active_profile";

function parseCookieHeader(rawHeader = "") {
  return String(rawHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf("=");
      if (separator <= 0) return cookies;
      const key = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function getActiveProfileFromRequest(request) {
  const cookies = parseCookieHeader(request.headers.cookie || "");
  return normalizeProfileName(cookies[ACTIVE_PROFILE_COOKIE] || "");
}

function appendResponseHeader(response, headerName, headerValue) {
  const existing = response.getHeader(headerName);
  if (!existing) {
    response.setHeader(headerName, headerValue);
    return;
  }
  const values = Array.isArray(existing) ? existing : [existing];
  response.setHeader(headerName, [...values, headerValue]);
}

function setActiveProfileCookie(response, profileName) {
  const normalized = normalizeProfileName(profileName);
  if (!normalized) return;
  appendResponseHeader(
    response,
    "Set-Cookie",
    `${ACTIVE_PROFILE_COOKIE}=${encodeURIComponent(normalized)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
  );
}

function clearActiveProfileCookie(response) {
  appendResponseHeader(
    response,
    "Set-Cookie",
    `${ACTIVE_PROFILE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

function toSafeInt(value, fallback = 0, min = null) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const rounded = Math.round(numeric);
  return min === null ? rounded : Math.max(min, rounded);
}

const SERVER_RANK_NAMES = [
  "Kezdo gengszter", "Utcai ember", "Kisfiu", "Sarokfonok", "Behajto",
  "Utcai fonok", "Raktarvezeto", "Keruleti ember", "Keruletvezeto", "Befolyasos figura",
  "Varosi kapcsolat", "Csaladi megbizott", "Maffia hadnagy", "Alvezeto", "Maffia kozepvezeto",
  "Kereskedelmi fonok", "Kikoto ura", "Varosi arnyek", "Csaladi tanacsado", "Birodalmi ember",
  "Sotet patronus", "Varosresz ura", "Maffia kapitany", "Csaladi jobbkez", "Szervezeti fonok",
  "Birodalmi fonok", "Nagyfonok", "Don helyettese", "Don", "Maffia legenda",
];
const SERVER_EARLY_RANK_THRESHOLDS = [0, 10, 24, 42, 68, 100];

function getServerRankThreshold(index) {
  return SERVER_EARLY_RANK_THRESHOLDS[index] ?? Math.round(100 + ((index - 5) * (index - 5) * 34));
}

function getRankLevel(fame) {
  const normalizedFame = Math.max(0, toSafeInt(fame, 0, 0));
  let level = 1;
  for (let index = 0; index < SERVER_RANK_NAMES.length; index += 1) {
    if (normalizedFame >= getServerRankThreshold(index)) level = index + 1;
  }
  return Math.max(1, Math.min(level, SERVER_RANK_NAMES.length));
}

function rankForFame(fame) {
  return SERVER_RANK_NAMES[getRankLevel(fame) - 1] || SERVER_RANK_NAMES[0];
}

function getOwnedCrewMembers(state = {}) {
  const crewMembers = Array.isArray(state.crewMembers) ? state.crewMembers : [];
  const hasExplicitHireState = crewMembers.some((member) => (
    member && Object.prototype.hasOwnProperty.call(member, "hired")
  ));
  if (hasExplicitHireState) {
    return crewMembers.filter((member) => member?.hired === true);
  }

  const storedCrewCount = Math.min(
    crewMembers.length,
    Math.max(0, toSafeInt(state.crew, 0, 0)),
  );
  return crewMembers.filter((member, index) => {
    const equipment = member?.equipment && typeof member.equipment === "object"
      ? Object.values(member.equipment)
      : [];
    return index < storedCrewCount
      || toSafeInt(member?.level, 1, 1) > 1
      || toSafeInt(member?.defenseLevel, 1, 1) > 1
      || toSafeInt(member?.attackBonus, 0, 0) > 0
      || toSafeInt(member?.defenseBonus, 0, 0) > 0
      || equipment.some((item) => item && typeof item === "object");
  });
}

function summarizeState(profileName, state = {}, now = Date.now()) {
  const fame = Math.max(0, toSafeInt(state.fame, 0, 0));
  const crewMembers = Array.isArray(state.crewMembers) ? state.crewMembers : [];
  const hasCrewMembers = crewMembers.length > 0;
  const storedCrewCount = toSafeInt(state.crew, 0, 0);
  const hiredCrewCount = getOwnedCrewMembers(state).length;
  const capturedVillageCount = Array.isArray(state.worldRivalCities)
    ? state.worldRivalCities.filter((city) => city?.status === "captured").length
    : 0;
  return {
    profileName,
    displayName: profileName,
    rankTitle: rankForFame(fame),
    level: getRankLevel(fame),
    fame,
    money: Math.max(0, toSafeInt(state.money, 0, 0)),
    heat: Math.max(0, toSafeInt(state.heat, 0, 0)),
    influence: normalizeServerInfluence(state.influence, SERVER_STARTING_INFLUENCE),
    cityLevel: Math.max(1, toSafeInt(state.cityLevel, 1, 1)),
    crewCount: Math.max(0, hasCrewMembers ? hiredCrewCount : storedCrewCount),
    health: Math.max(0, toSafeInt(state.health, 100, 0)),
    energy: Math.max(0, toSafeInt(state.energy, 100, 0)),
    worldBaseLotId: typeof state.worldBaseLotId === "string" ? state.worldBaseLotId : null,
    worldBaseLevel: Math.max(1, toSafeInt(state.worldBaseLevel, 1, 1)),
    npcVillageVictories: Math.max(0, capturedVillageCount, toSafeInt(state.npcVillageVictories, 0, 0)),
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
    influence: normalizeServerInfluence(row.influence, SERVER_STARTING_INFLUENCE),
    cityLevel: row.city_level,
    crewCount: row.crew_count,
    health: row.health,
    energy: row.energy,
    worldBaseLotId: row.world_base_lot_id,
    worldBaseLevel: row.world_base_level,
    npcVillageVictories: row.npc_village_victories,
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
    npcVillageVictories: row.npc_village_victories,
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

const clanPermissionKeys = ["inviteMembers", "declareWar"];

function normalizeClanPermissions(value = {}) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return Object.fromEntries(clanPermissionKeys.map((key) => [key, Boolean(source[key])]));
}

function mapClanRoleRow(row) {
  return {
    clanId: row.clan_id,
    roleKey: row.role_key,
    roleName: row.role_name,
    priority: row.role_priority,
    permissions: normalizeClanPermissions(parseJsonSafely(row.permissions_json, {})),
    isSystem: Boolean(row.is_system),
    updatedAt: row.updated_at,
  };
}

async function ensureDefaultClanRoles(clanId, now = Date.now()) {
  const defaults = [
    { key: "fonok", name: "Családfő", priority: 100, permissions: { inviteMembers: true, declareWar: true }, system: 1 },
    { key: "alvezeto", name: "Alvezér", priority: 60, permissions: { inviteMembers: true, declareWar: true }, system: 0 },
    { key: "katona", name: "Katona", priority: 10, permissions: { inviteMembers: false, declareWar: false }, system: 0 },
  ];
  const current = await listClanRolesStmt.all(clanId);
  const existingKeys = new Set(current.map((role) => role.role_key));
  for (const role of defaults) {
    if (existingKeys.has(role.key)) continue;
    await upsertClanRoleStmt.run(
      clanId,
      role.key,
      role.name,
      role.priority,
      JSON.stringify(role.permissions),
      role.system,
      now,
    );
  }
}

async function getClanAccess(profileName) {
  const membership = profileName ? await selectClanForMemberStmt.get(profileName) : null;
  if (!membership) return null;
  await ensureDefaultClanRoles(membership.clan_id);
  const role = await selectClanRoleStmt.get(membership.clan_id, membership.member_role);
  const isBoss = membership.boss_profile_name === profileName || membership.member_role === "fonok";
  return {
    membership,
    isBoss,
    role: role ? mapClanRoleRow(role) : null,
    permissions: isBoss
      ? Object.fromEntries(clanPermissionKeys.map((key) => [key, true]))
      : normalizeClanPermissions(parseJsonSafely(role?.permissions_json, {})),
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

function buildDefaultHarborMissionCatalog() {
  return Array.from({ length: 50 }, (_, index) => {
    const batch = Math.floor(index / 4);
    const customsVariants = [
      { title: "Gyors vami boritek", gives: { papers: 4 + (batch % 3), counterfeitMoney: 2 + (batch % 2) }, rewardMoney: 45 + batch * 3, rewardXp: 14 + (batch % 4), durationMs: 35 * 60 * 1000, successChance: 0.94 },
      { title: "Hamis papiros csere", gives: { papers: 8 + (batch % 4) }, rewardMoney: 72 + batch * 4, rewardXp: 20 + (batch % 5), durationMs: 35 * 60 * 1000, successChance: 0.88 },
      { title: "Penzmoso pecset", gives: { counterfeitMoney: 9 + (batch % 5), papers: 2 + (batch % 2) }, rewardMoney: 96 + batch * 5, rewardXp: 24 + (batch % 6), durationMs: 35 * 60 * 1000, successChance: 0.8 },
      { title: "Kockazatos vami atiras", gives: { counterfeitMoney: 13 + (batch % 6), papers: 6 + (batch % 3) }, rewardMoney: 142 + batch * 6, rewardXp: 32 + (batch % 7), durationMs: 35 * 60 * 1000, successChance: 0.68 },
    ];
    const railVariants = [
      { title: "Kis rakomanyu vagon", gives: { drugs: 3 + (batch % 3), weapons: 1 }, rewardMoney: 62 + batch * 3, rewardXp: 17 + (batch % 4), durationMs: 35 * 60 * 1000, successChance: 0.92 },
      { title: "Fegyveres lada", gives: { weapons: 5 + (batch % 4), papers: 1 + (batch % 2) }, rewardMoney: 105 + batch * 4, rewardXp: 25 + (batch % 5), durationMs: 35 * 60 * 1000, successChance: 0.84 },
      { title: "Drogos tehervagon", gives: { drugs: 9 + (batch % 5), weapons: 2 + (batch % 2) }, rewardMoney: 128 + batch * 5, rewardXp: 30 + (batch % 6), durationMs: 35 * 60 * 1000, successChance: 0.77 },
      { title: "Ejfeli vonatrablas", gives: { drugs: 12 + (batch % 6), weapons: 6 + (batch % 3), counterfeitMoney: 2 }, rewardMoney: 190 + batch * 7, rewardXp: 42 + (batch % 8), durationMs: 35 * 60 * 1000, successChance: 0.64 },
    ];
    const profiles = [
      { zone: "docks", title: "Rakparti atadas", requires: { counterfeitMoney: 6 + (index % 4), weapons: 1 + (index % 3) }, rewardMoney: 170 + index * 5, rewardXp: 28 + (index % 8), durationMs: 30 * 60 * 1000 },
      { zone: "customs", ...customsVariants[batch % customsVariants.length] },
      { zone: "rail", ...railVariants[batch % railVariants.length] },
      { zone: "fish", title: "Hajnali halaszat", gives: {}, rewardMoney: 90 + index * 3, rewardXp: 18 + (index % 10), heal: 20, energy: 20, durationMs: [60, 180, 360][index % 3] * 60 * 1000 },
    ];
    const profile = profiles[index % profiles.length];
    return {
      id: `harbor-${index + 1}`,
      ...profile,
      title: `${profile.title} ${Math.floor(index / profiles.length) + 1}`,
    };
  });
}

const defaultGameConfigEntries = {
  harbor_zones: {
    group: "harbor",
    payload: [
      { id: "docks", title: "Dokkok", x: 1.5, y: 4.5, w: 29, h: 28, clip: "polygon(2% 48%, 18% 18%, 55% 4%, 91% 22%, 100% 58%, 75% 86%, 28% 96%, 0 72%)", note: "Csempesz fuvarok es hajos megbizasok." },
      { id: "warehouse", title: "Csempeszraktar", x: 76.5, y: 45, w: 20, h: 20, clip: "polygon(12% 24%, 58% 4%, 96% 25%, 100% 76%, 66% 100%, 13% 84%, 0 48%)", note: "Arukeszlet: hamis penz, drog, fegyver, papirok." },
      { id: "bar", title: "Kocsma", x: 27, y: 69, w: 20, h: 18, clip: "polygon(8% 32%, 42% 5%, 88% 14%, 100% 55%, 74% 95%, 20% 88%, 0 58%)", note: "Italok, eletero es energia toltes." },
      { id: "office", title: "Kikotoi iroda", x: 36.5, y: 5, w: 18, h: 22, clip: "polygon(10% 28%, 43% 2%, 84% 8%, 100% 48%, 79% 87%, 28% 100%, 0 68%)", note: "Kapcsolatok es rendori lefizetes." },
      { id: "market", title: "Feketepiac", x: 82, y: 20, w: 17, h: 19, clip: "polygon(12% 30%, 48% 5%, 91% 12%, 100% 54%, 76% 92%, 24% 100%, 0 64%)", note: "Ritka aruk es csempesz cuccok." },
      { id: "customs", title: "Vam", x: 32, y: 26, w: 16, h: 18, clip: "polygon(7% 43%, 35% 10%, 76% 0, 100% 36%, 88% 78%, 42% 100%, 0 73%)", note: "Hamis penz es hamis papirok beszerzese." },
      { id: "rail", title: "Vasuti rakodo", x: 52, y: 31, w: 30, h: 15, clip: "polygon(3% 44%, 25% 14%, 86% 2%, 100% 38%, 86% 78%, 24% 100%, 0 72%)", note: "Drog es fegyver csempeszet." },
      { id: "garage", title: "Garazs", x: 63.1, y: 53, w: 18, h: 15, clip: "polygon(9% 32%, 38% 6%, 84% 7%, 100% 48%, 78% 91%, 22% 100%, 0 66%)", note: "Jarmuvek kesobb." },
      { id: "fish", title: "Halpiac", x: 3.5, y: 35, w: 22, h: 20, clip: "polygon(2% 45%, 28% 12%, 78% 4%, 100% 43%, 83% 84%, 30% 100%, 0 74%)", note: "Halaskuldetesek: penz, XP, pihenes." },
    ],
  },
  harbor_garage_vehicles: {
    group: "harbor",
    payload: [
      { id: "sedan", title: "Utcai sedan", cost: 0, requiredLevel: 1, speed: 2, stealth: 2, load: 1, accent: "Sedan", image: "./garage-assets/sedan-1930.webp", description: "Kompakt menekuloauto. Kisebb utcai atjatszasokra jo, mindenbol keveset hoz.", rewardProfile: "balanced", lootText: "Kisebb penz, hamis papir es hamis penz." },
      { id: "van", title: "Csempesz furgon", cost: 520, requiredLevel: 2, speed: 1, stealth: 2, load: 3, accent: "Furgon", image: "./garage-assets/smuggler-van-1930.webp", description: "Megerositett rakteru furgon. Csempesz aruhoz kell, drogot, fegyvert es papirokat hoz jobban.", rewardProfile: "cargo", lootText: "Csempesz aru: drog, fegyver, hamis papirok." },
      { id: "armor", title: "Pancelkocsi", cost: 980, requiredLevel: 3, speed: 2, stealth: 1, load: 4, accent: "Pancel", image: "./garage-assets/armored-money-car-1930.webp", description: "Nehez pancelkocsi. Nagy penzes korokhoz kell, foleg hamis penzt es nagyobb kasszat hoz.", rewardProfile: "cash", lootText: "Nagy penz, hamis penz es vedettebb rakomany." },
    ],
  },
  harbor_garage_missions: {
    group: "harbor",
    payload: [
      { id: "alley-run", title: "Sikatori atjatszas", vehicleId: "sedan", description: "Utcai sedan kell hozza. Kis csomag, kevesebb penz, de stabil kezdo fuvar.", requiredLevel: 1, rewardMoney: 140, rewardXp: 18, heatSuccess: 2, heatFail: 7, failurePenalty: 55, cargoReward: { papers: 1, counterfeitMoney: 1 }, rounds: 3, requiredHits: 2, baseSafeWidth: 0.3, baseSpeed: 0.02 },
      { id: "night-convoy", title: "Ejjeli konvoj", vehicleId: "van", description: "Csempesz furgon kell hozza. Rakteres fuvar, ahol a csempesz aru a fo jutalom.", requiredLevel: 2, rewardMoney: 240, rewardXp: 31, heatSuccess: 3, heatFail: 10, failurePenalty: 95, cargoReward: { drugs: 2, papers: 1 }, rounds: 4, requiredHits: 3, baseSafeWidth: 0.26, baseSpeed: 0.023 },
      { id: "vault-route", title: "Pancelkocsis kor", vehicleId: "armor", description: "Pancelkocsi kell hozza. Nagy penzes kor, nehezebb utvonallal es komolyabb kasszaval.", requiredLevel: 3, rewardMoney: 410, rewardXp: 46, heatSuccess: 4, heatFail: 14, failurePenalty: 155, cargoReward: { weapons: 2, counterfeitMoney: 2, papers: 1 }, rounds: 5, requiredHits: 4, baseSafeWidth: 0.23, baseSpeed: 0.026 },
    ],
  },
  harbor_missions: {
    group: "harbor",
    payload: buildDefaultHarborMissionCatalog(),
  },
  harbor_fish_missions: {
    group: "harbor",
    payload: [
      { id: "fish-1h", zone: "fish", title: "Hajnali halaszat - 1 ora", gives: {}, rewardMoney: 90, rewardXp: 18, heal: 20, energy: 20, durationMs: 60 * 60 * 1000 },
      { id: "fish-3h", zone: "fish", title: "Part menti halaszat - 3 ora", gives: {}, rewardMoney: 180, rewardXp: 34, heal: 28, energy: 28, durationMs: 180 * 60 * 1000 },
      { id: "fish-6h", zone: "fish", title: "Ejszakai halaszat - 6 ora", gives: {}, rewardMoney: 330, rewardXp: 58, heal: 40, energy: 40, durationMs: 360 * 60 * 1000 },
    ],
  },
  main_quest_templates: {
    group: "quests",
    payload: {
      early: [
        { type: "robbery", title: "Gyors kassza", description: "Rabolj ki 1 boltot a varosban.", objective: "1 sikeres bolti kirablas.", goal: { action: "robbery", mode: "shop", target: 1, progress: 0 }, xp: 5, money: 150 },
        { type: "robbery", title: "Utcai villanas", description: "Hajts vegre 2 sikeres kirablast.", objective: "2 sikeres kirablas barmelyik epuletnel.", goal: { action: "robbery", mode: "any", target: 2, progress: 0 }, xp: 5, money: 165 },
        { type: "protection", title: "Elso boritek", description: "Szedj be vedelmi penzt 1 helyrol.", objective: "1 sikeres vedelmi penz beszedese.", goal: { action: "protection", mode: "any", target: 1, progress: 0 }, xp: 5, money: 145 },
        { type: "harbor_job", title: "Elso rakparti munka", description: "Teljesits 1 munkat a Kikoto negyedben.", objective: "1 sikeres kikotoi megbizas.", goal: { action: "harbor_job", mode: "any", target: 1, progress: 0 }, xp: 5, money: 155 },
        { type: "cargo_acquire", title: "Kezdo rakomany", description: "Szerezz {target} darab {cargo} arut a Kikoto negyedben.", objective: "Szerezz {target} darab {cargo} arut.", goal: { action: "cargo_acquire", mode: "randomCargo", targetMin: 1, targetMax: 3, progress: 0 }, xp: 5, money: 160 },
      ],
      standard: [
        { type: "robbery", title: "Bolti szuret", description: "Rabolj ki 2 boltot a varosban.", objective: "Sikeres kirablas 2 shop/bolt tipusu hazon.", goal: { action: "robbery", mode: "shop", target: 2, progress: 0 }, xp: 32, money: 140 },
        { type: "robbery", title: "Negy utcai melo", description: "Hajts vegre 4 sikeres kirablast barmelyik hazon.", objective: "4 sikeres kirablas barmelyik epuletnel.", goal: { action: "robbery", mode: "any", target: 4, progress: 0 }, xp: 46, money: 210 },
        { type: "protection", title: "Vedett kirakatok", description: "Szedj be vedelmi penzt 3 helyrol.", objective: "3 sikeres vedelmi penz beszedese.", goal: { action: "protection", mode: "any", target: 3, progress: 0 }, xp: 36, money: 170 },
        { type: "robbery", title: "Gazdag celpont", description: "Rabolj ki egy boltot a(z) {district} kornyeken.", objective: "1 sikeres bolti kirablas.", goal: { action: "robbery", mode: "shop", target: 1, progress: 0 }, xp: 24, money: 110 },
        { type: "harbor_job", title: "Rakparti muszak", description: "Teljesits {target} kikotoi megbizast barmelyik kikotoi helyszinen.", objective: "Fejezz be {target} sikeres kikotoi munkat.", goal: { action: "harbor_job", mode: "any", targetMin: 1, targetMax: 3, progress: 0 }, xp: 38, money: 190 },
        { type: "cargo_acquire", title: "Hianyzo rakomany", description: "Szerezz {target} darab {cargo} arut a Kikoto negyedben.", objective: "Szerezz osszesen {target} darab {cargo} arut.", goal: { action: "cargo_acquire", mode: "randomCargo", targetMin: 2, targetMax: 6, progress: 0 }, xp: 34, money: 175 },
        { type: "cargo_spend", title: "Titkos atadas", description: "Adj le {target} darab {cargo} arut lejart kikotoi megbizasokkal.", objective: "Varj, amig a rakomanyt felhasznalo kikotoi munka befejezodik.", goal: { action: "cargo_spend", mode: "randomCargo", targetMin: 2, targetMax: 7, progress: 0 }, xp: 42, money: 225 },
        { type: "garage_run", title: "Menekuloauto probaja", description: "Teljesits {target} sikeres fuvaros minijatekot a kikotoi garazsban.", objective: "Nyerj meg {target} garazsfuvart.", goal: { action: "garage_run", mode: "garage", targetMin: 1, targetMax: 2, progress: 0 }, xp: 46, money: 245 },
        { type: "market_buy", title: "Piaci beszerzes", description: "Vasarolj {target} felszerelest a feketepiacon.", objective: "Vegyel meg {target} piaci felszerelest.", goal: { action: "market_buy", mode: "any", targetMin: 1, targetMax: 2, progress: 0 }, xp: 30, money: 165 },
      ],
    },
  },
  equipment_catalog: {
    group: "items",
    payload: {
      hat: [
        { id: "hat-fedora-black", name: "Fekete fedora", power: 1, stat: "defense", rarity: "gray", image: "./assets/items/item-hat-gray.png" },
        { id: "hat-silk-band", name: "Selyemszalagos kalap", power: 3, stat: "defense", rarity: "yellow", image: "./assets/items/item-hat-yellow.png" },
        { id: "hat-don-fedora", name: "Don fedora", power: 5, stat: "defense", rarity: "red", image: "./assets/items/item-hat-red.png" },
      ],
      shirt: [
        { id: "shirt-white", name: "Feher ing", power: 2, stat: "defense", rarity: "gray", image: "./assets/items/item-shirt-gray.png" },
        { id: "shirt-silk", name: "Selyeming", power: 4, stat: "defense", rarity: "yellow", image: "./assets/items/item-shirt-yellow.png" },
        { id: "shirt-tailored", name: "Szabott ing", power: 6, stat: "defense", rarity: "red", image: "./assets/items/item-shirt-red.png" },
      ],
      pants: [
        { id: "pants-black", name: "Fekete szovet", power: 2, stat: "defense", rarity: "gray", image: "./assets/items/item-pants-gray.png" },
        { id: "pants-pressed", name: "Eltett nadrag", power: 3, stat: "defense", rarity: "yellow", image: "./assets/items/item-pants-yellow.png" },
        { id: "pants-don", name: "Fonoki nadrag", power: 5, stat: "defense", rarity: "red", image: "./assets/items/item-pants-red.png" },
      ],
      weapon: [
        { id: "weapon-colt", name: "Colt M1911", power: 4, stat: "attack", rarity: "gray", image: "./assets/items/item-weapon-gray.png" },
        { id: "weapon-thompson", name: "Tommy gepisztoly", power: 7, stat: "attack", rarity: "yellow", image: "./assets/items/item-weapon-yellow.png" },
        { id: "weapon-custom", name: "Egyedi automata", power: 10, stat: "attack", rarity: "red", image: "./assets/items/item-weapon-red.png" },
      ],
      shoes: [
        { id: "shoes-leather", name: "Bor felcipo", power: 1, stat: "attack", rarity: "gray", image: "./assets/items/item-shoes-gray.png" },
        { id: "shoes-lacquer", name: "Lakkcipo", power: 3, stat: "attack", rarity: "yellow", image: "./assets/items/item-shoes-yellow.png" },
        { id: "shoes-import", name: "Import borcipo", power: 5, stat: "attack", rarity: "red", image: "./assets/items/item-shoes-red.png" },
      ],
      watch: [
        { id: "watch-pocket", name: "Zsebora", power: 1, stat: "attack", rarity: "gray", image: "./assets/items/item-watch-gray.png" },
        { id: "watch-gold", name: "Arany ora", power: 2, stat: "attack", rarity: "yellow", image: "./assets/items/item-watch-yellow.png" },
        { id: "watch-family", name: "Csaladi kronometer", power: 4, stat: "attack", rarity: "red", image: "./assets/items/item-watch-red.png" },
      ],
    },
  },
  rank_table: {
    group: "progression",
    payload: [
      { fame: 0, name: "Kezdo gengszter" },
      { fame: 10, name: "Utcai ember" },
      { fame: 24, name: "Kisfiu" },
      { fame: 42, name: "Sarokfonok" },
      { fame: 68, name: "Behajto" },
      { fame: 100, name: "Utcai fonok" },
      { fame: 134, name: "Raktarvezeto" },
      { fame: 236, name: "Keruleti ember" },
      { fame: 406, name: "Keruletvezeto" },
      { fame: 644, name: "Befolyasos figura" },
      { fame: 950, name: "Varosi kapcsolat" },
      { fame: 1324, name: "Csaladi megbizott" },
      { fame: 1766, name: "Maffia hadnagy" },
      { fame: 2276, name: "Alvezeto" },
      { fame: 2854, name: "Maffia kozepvezeto" },
      { fame: 3500, name: "Kereskedelmi fonok" },
      { fame: 4214, name: "Kikoto ura" },
      { fame: 4996, name: "Varosi arnyek" },
      { fame: 5846, name: "Csaladi tanacsado" },
      { fame: 6764, name: "Birodalmi ember" },
      { fame: 7750, name: "Sotet patronus" },
      { fame: 8804, name: "Varosresz ura" },
      { fame: 9926, name: "Maffia kapitany" },
      { fame: 11116, name: "Csaladi jobbkez" },
      { fame: 12374, name: "Szervezeti fonok" },
      { fame: 13700, name: "Birodalmi fonok" },
      { fame: 15094, name: "Nagyfonok" },
      { fame: 16556, name: "Don helyettese" },
      { fame: 18086, name: "Don" },
      { fame: 19684, name: "Maffia legenda" },
    ],
  },
  mentor_steps: {
    group: "progression",
    payload: [
      { id: "base", title: "Elso munka", text: "Valaszd ki a lakohazadat.", reward: { money: 80, xp: 2 } },
      { id: "crew", title: "Ember a bandaba", text: "Vegyel fel vagy fejlessz egy bandatagot.", reward: { money: 90, xp: 2 } },
      { id: "equip", title: "Oltozz munkahoz", text: "Szereld fel a fegyvert a karakteredre.", reward: { money: 70, xp: 2 } },
      { id: "robbery", title: "Zold celpont", text: "Rabolj ki egy konnyu hazat.", reward: { money: 110, xp: 2 } },
      { id: "protection", title: "Utcai ado", text: "Szedj vedelmi penzt egy hazbol.", reward: { money: 120, xp: 2 } },
      { id: "quest", title: "Atadas", text: "Vegyel fel es adj le egy kuldetest.", reward: { money: 130, xp: 2 } },
      { id: "rest", title: "Biztos hely", text: "Pihenj a fo bazisodon.", reward: { money: 90, xp: 1 } },
      { id: "world", title: "Nagyvilag", text: "Nezd meg a vilagterkepet.", reward: { money: 100, xp: 2 } },
      { id: "level5", title: "Nevet szerzel", text: "Erd el az 5. szintet.", reward: { money: 180, xp: 8 } },
      { id: "harbor", title: "Kikotoi kapu", text: "Lepj be a kikoto negyedbe.", reward: { money: 220, xp: 10 } },
    ],
  },
};

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

function mergeCrewEquipmentFromRows(crewMembers = [], equipmentRows = []) {
  return crewMembers.map((member) => {
    if (!member || typeof member !== "object") return member;
    const equipment = buildEquipmentFromRows(equipmentRows, "crew", String(member.id || ""));
    if (!Object.keys(equipment).length) return member;
    return {
      ...member,
      equipment: {
        ...(member.equipment && typeof member.equipment === "object" ? member.equipment : {}),
        ...equipment,
      },
    };
  });
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

function buildHarborGarageFromRow(row) {
  if (!row) return null;
  const payload = parseJsonSafely(row.payload_json, {});
  const unlockedVehicleIds = parseJsonSafely(row.unlocked_vehicle_ids, []);
  return {
    ...(payload && typeof payload === "object" ? payload : {}),
    level: Math.max(1, toSafeInt(row.garage_level, 1, 1)),
    activeVehicleId: String(row.active_vehicle_id || payload?.activeVehicleId || "sedan"),
    unlockedVehicleIds: Array.isArray(unlockedVehicleIds) ? unlockedVehicleIds : (payload?.unlockedVehicleIds ?? ["sedan"]),
    wins: Math.max(0, toSafeInt(row.successful_runs, 0, 0)),
    losses: Math.max(0, toSafeInt(row.failed_runs, 0, 0)),
  };
}

async function buildProfileState(profileName) {
  const [playerRow, stateRow, runtimeRow, processTaskRows, territoryRows, equipmentRows, inventoryRows, crewRows, questRows, notificationRows, districtRows, buildingDifficultyRows, worldRivalRows, garageRow, marketRows, ownedLot] = await Promise.all([
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
    selectPlayerHarborGarageStmt.get(profileName),
    listMarketItemsStmt.all(profileName, profileName, 100),
    selectOwnedWorldLotStmt.get(profileName),
  ]);
  if (!playerRow && !stateRow && !runtimeRow && !processTaskRows.length && !territoryRows.length && !equipmentRows.length && !inventoryRows.length && !crewRows.length && !questRows.length && !notificationRows.length && !districtRows.length && !buildingDifficultyRows.length && !worldRivalRows.length && !garageRow) return null;

  const snapshot = parseJsonSafely(stateRow?.snapshot_json, {});
  const baseState = Object.keys(snapshot).length ? snapshot : {};
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

  if (equipmentRows.length && Array.isArray(merged.crewMembers)) {
    merged.crewMembers = mergeCrewEquipmentFromRows(merged.crewMembers, equipmentRows);
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
  merged.npcVillageVictories = Math.max(
    0,
    toSafeInt(merged.npcVillageVictories, 0, 0),
    Array.isArray(merged.worldRivalCities)
      ? merged.worldRivalCities.filter((city) => city?.status === "captured").length
      : 0,
  );

  if (garageRow) {
    merged.harborGarage = buildHarborGarageFromRow(garageRow);
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
  ensureServerInfluenceState(merged);
  if (ownedLot) {
    merged.worldBaseLotId = ownedLot.lot_id;
    merged.worldBaseLevel = ownedLot.base_level;
  }

  return {
    profileName,
    state: merged,
    createdAt: playerRow?.registered_at ?? Date.now(),
    updatedAt: Math.max(
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
      Number(garageRow?.updated_at || 0),
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
  ensureServerInfluenceState(normalizedState);
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
    summary.npcVillageVictories,
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
    avatarId: typeof state.avatarId === "string" ? state.avatarId : "",
    needsAvatarSelection: Boolean(state.needsAvatarSelection),
    money: state.money ?? 0,
    fame: preservedFame,
    heat: state.heat ?? 0,
    influence: normalizeServerInfluence(state.influence, SERVER_STARTING_INFLUENCE),
    influenceSystemVersion: SERVER_INFLUENCE_SYSTEM_VERSION,
    health: state.health ?? 100,
    energy: state.energy ?? 100,
    gearPower: state.gearPower ?? 0,
    equipment: state.equipment ?? {},
    cityLevel: state.cityLevel ?? 1,
    npcVillageVictories: state.npcVillageVictories ?? 0,
    crew: state.crew ?? 0,
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
    questHistory: Array.isArray(state.questHistory) ? state.questHistory.slice(-40) : [],
    pendingProtectionRewards: state.pendingProtectionRewards ?? [],
    processTasks: state.processTasks ?? [],
    harborProcessTasks: state.harborProcessTasks ?? [],
    localNotifications: state.localNotifications ?? [],
    smuggledGoods: state.smuggledGoods ?? {},
    smugglerFame: state.smugglerFame ?? 0,
    harborGarage: state.harborGarage ?? {},
    rivalEvent: state.rivalEvent ?? null,
    rivalNextSpawnAt: state.rivalNextSpawnAt ?? 0,
    mentorStep: state.mentorStep ?? 0,
    mentorCompleted: Boolean(state.mentorCompleted),
    mentorFlags: state.mentorFlags ?? {},
    protectionCooldowns: state.protectionCooldowns ?? {},
    recoveryEffects: state.recoveryEffects ?? { health: null, energy: null },
    recoveryUsage: state.recoveryUsage ?? {},
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
  const crewMembers = Array.isArray(state.crewMembers) ? state.crewMembers : [];
  for (const member of crewMembers) {
    if (!member || typeof member !== "object" || !member.id) continue;
    const memberEquipment = member.equipment && typeof member.equipment === "object" ? member.equipment : {};
    for (const [slotKey, item] of Object.entries(memberEquipment)) {
      if (!item || typeof item !== "object") continue;
      await insertPlayerEquipmentStmt.run(
        profileName,
        "crew",
        String(member.id).slice(0, 64),
        String(slotKey).slice(0, 32),
        JSON.stringify(item),
        now,
      );
    }
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

async function writePlayerHarborGarage(profileName, state, now) {
  const garage = state.harborGarage && typeof state.harborGarage === "object"
    ? state.harborGarage
    : {};
  const unlockedVehicleIds = Array.isArray(garage.unlockedVehicleIds)
    ? Array.from(new Set(garage.unlockedVehicleIds.map((id) => String(id || "").trim()).filter(Boolean)))
    : ["sedan"];
  const activeVehicleId = String(garage.activeVehicleId || unlockedVehicleIds[0] || "sedan").slice(0, 64);
  const normalizedGarage = {
    ...garage,
    level: Math.max(1, toSafeInt(garage.level, 1, 1)),
    activeVehicleId,
    unlockedVehicleIds,
    wins: Math.max(0, toSafeInt(garage.wins, 0, 0)),
    losses: Math.max(0, toSafeInt(garage.losses, 0, 0)),
  };
  await upsertPlayerHarborGarageStmt.run(
    profileName,
    normalizedGarage.level,
    normalizedGarage.activeVehicleId,
    JSON.stringify(normalizedGarage.unlockedVehicleIds),
    normalizedGarage.wins,
    normalizedGarage.losses,
    JSON.stringify(normalizedGarage),
    now,
  );
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
    summary.npcVillageVictories,
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
  const existingMembership = await selectClanForMemberStmt.get(profileName);
  if (existingMembership) return;
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
  await insertClanMemberStmt.run(clanId, profileName, "fonok", 0, now);
}

async function syncStructuredTables(profileName, state, now, existingSaveRow = null) {
  const normalizedState = { ...state };
  ensureServerInfluenceState(normalizedState);
  const { summary, existed } = await writePlayerSnapshot(profileName, normalizedState, now, existingSaveRow);
  await Promise.all([
    writePlayerState(profileName, normalizedState, now),
    writePlayerRuntimeState(profileName, normalizedState, now),
    writePlayerProcessTasks(profileName, normalizedState, now),
    writePlayerTerritories(profileName, normalizedState, now),
    writePlayerEquipment(profileName, normalizedState, now),
    writePlayerInventory(profileName, normalizedState, now),
    writePlayerCrewMembers(profileName, normalizedState, now),
    writePlayerQuests(profileName, normalizedState, now),
    writePlayerNotifications(profileName, normalizedState, now),
    writePlayerDistricts(profileName, normalizedState, now),
    writePlayerBuildingDifficulties(profileName, normalizedState, now),
    writePlayerWorldRivals(profileName, normalizedState, now),
    writePlayerHarborGarage(profileName, normalizedState, now),
    writeWorldLotOwnership(profileName, normalizedState, now),
    writeLeaderboardEntry(summary, now),
    writeMarketStock(profileName, normalizedState, now),
    writeClanData(profileName, normalizedState, now),
  ]);
  return { summary, existed };
}

async function isStaleProfileSave(profileName, incomingState) {
  const incomingStartedAt = Number(incomingState?.profileStartedAt || 0);
  if (!Number.isFinite(incomingStartedAt) || incomingStartedAt <= 0) return false;
  const existingStateRow = await selectPlayerStateStmt.get(profileName);
  const existingSnapshot = parseJsonSafely(existingStateRow?.snapshot_json, {});
  const existingStartedAt = Number(existingSnapshot?.profileStartedAt || 0);
  return Number.isFinite(existingStartedAt) && existingStartedAt > incomingStartedAt;
}

async function persistGameState(profileName, state, now = Date.now()) {
  return db.transaction(async () => {
    if (await isStaleProfileSave(profileName, state)) {
      return {
        ignored: true,
        summary: summarizeState(profileName, await buildProfileState(profileName).then((profile) => profile?.state || {}), now),
        existed: true,
      };
    }
    const result = await syncStructuredTables(profileName, state, now, null);
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
  return insertMessageStmt.run(
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
        + Math.floor((level - 1) * 0.65),
    ),
    defense: Math.max(
      0,
      toSafeInt(member.baseDefense, 0, 0)
        + toSafeInt(member.defenseBonus, 0, 0)
        + equipment.defense
        + Math.floor((defenseLevel - 1) * 0.55),
    ),
    level,
    defenseLevel,
    maxHealth,
    health,
    readiness: health / maxHealth,
  };
}

const SERVER_EARLY_GAME_WINDOW_MS = 30 * 60 * 1000;

function getServerEarlyGameActionBonus(state = {}, now = Date.now()) {
  if (!state.registered) return 0;
  const startedAt = Number(state.profileStartedAt) || 0;
  const elapsed = Math.max(0, now - startedAt);
  if (elapsed >= SERVER_EARLY_GAME_WINDOW_MS) return 0;
  const remainingRatio = 1 - Math.max(0, Math.min(1, elapsed / SERVER_EARLY_GAME_WINDOW_MS));
  return Math.round(12 + remainingRatio * 14);
}

function getPvpCombatStats(state = {}) {
  const gear = getEquipmentCombatStats(state);
  const crew = normalizeServerCrewMembers(state).filter((member) => member.hired);
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
  const playerAttack = gear.attack + 5 + Math.max(0, Math.floor(level * 1.1));
  const playerDefense = gear.defense + 4 + Math.max(0, Math.floor(level * 0.9));
  const baseProfilePower = (
    gear.attack
    + gear.defense
    + level * 6
    + Math.max(1, toSafeInt(state.cityLevel, 1, 1)) * 4
    + crew.length * 3
    + getServerEarlyGameActionBonus(state)
  );
  const assault = Math.max(1, Math.round(
    baseProfilePower
      + active.attack
      + crewAttack * 0.75
      + crewDefense * 0.2
      + crewLevelTotal * 0.4
      + readiness * 10,
  ));
  const pressure = Math.max(1, Math.round(
    baseProfilePower
      + active.attack * 0.5
      + active.defense * 0.65
      + crewAttack * 0.4
      + crewDefense * 0.52
      + crewLevelTotal * 0.35
      + readiness * 12,
  ));
  const resilience = Math.max(1, Math.round(
    baseProfilePower
      + active.defense
      + crewDefense * 0.76
      + crewAttack * 0.16
      + crewLevelTotal * 0.38
      + readiness * 16,
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

const ROBBERY_ACTION_TTL_MS = 20 * 60 * 1000;
const ROBBERY_DISTRICT_SECURITY = [55, 48, 62, 40, 72, 36];
const ROBBERY_TACTICS = {
  stealth: { name: "Lopakodas", strongAgainst: "watcher", damage: 1.04, alert: 1 },
  force: { name: "Fegyveres roham", strongAgainst: "bodyguard", damage: 1.13, alert: 3 },
  intimidation: { name: "Megfelemlites", strongAgainst: "boss", damage: 1.08, alert: 2 },
};

function clampServer(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

const SERVER_INFLUENCE_SYSTEM_VERSION = 1;
const SERVER_STARTING_INFLUENCE = 10;

function normalizeServerInfluence(value, fallback = SERVER_STARTING_INFLUENCE) {
  const numericValue = Number(value);
  return clampServer(Number.isFinite(numericValue) ? Math.round(numericValue) : fallback, 0, 100);
}

function ensureServerInfluenceState(state = {}) {
  const version = Math.max(0, toSafeInt(state.influenceSystemVersion, 0, 0));
  state.influence = version < SERVER_INFLUENCE_SYSTEM_VERSION
    ? Math.max(SERVER_STARTING_INFLUENCE, normalizeServerInfluence(state.influence, SERVER_STARTING_INFLUENCE))
    : normalizeServerInfluence(state.influence, SERVER_STARTING_INFLUENCE);
  state.influenceSystemVersion = SERVER_INFLUENCE_SYSTEM_VERSION;
  return state;
}

function changeServerInfluence(state, requestedDelta) {
  ensureServerInfluenceState(state);
  const before = state.influence;
  state.influence = normalizeServerInfluence(before + Math.round(Number(requestedDelta) || 0), before);
  return state.influence - before;
}

function getServerInfluenceBenefits(state = {}) {
  ensureServerInfluenceState(state);
  const progress = clampServer((state.influence - SERVER_STARTING_INFLUENCE) / (100 - SERVER_STARTING_INFLUENCE), 0, 1);
  return {
    progress,
    marketDiscountRate: 0.08 * progress,
    dailyIncomeRate: 0.1 * progress,
    protectionChanceBonus: 0.04 * progress,
    worldTributeRate: 0.1 * progress,
    harborPenaltyReductionRate: 0.1 * progress,
    marketYellowChanceBonus: 0.06 * progress,
    marketRedChanceBonus: 0.1 * progress,
  };
}

function hashStringUnit(value = "") {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function randomServerInt(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function normalizeRobberyTarget(body = {}, state = {}) {
  const spotId = String(body.spotId || "").trim().slice(0, 64);
  if (!spotId || !/^[a-zA-Z0-9_-]+$/.test(spotId)) return null;
  const mode = body.mode === "shop" ? "shop" : "street";
  const districtIndex = clampServer(Math.round(Number(body.districtIndex) || 0), 0, ROBBERY_DISTRICT_SECURITY.length - 1);
  const cycle = Math.floor(Date.now() / (4 * 60 * 60 * 1000));
  const security = ROBBERY_DISTRICT_SECURITY[districtIndex] || 50;
  const variance = hashStringUnit(`${state.profileName}:${spotId}:${cycle}`);
  const storedDifficulty = Number(state.buildingDifficulties?.[spotId]);
  const combat = getPvpCombatStats(state);
  const generatedPowerRatio = variance < 0.56
    ? 0.75 + variance * (0.15 / 0.56)
    : variance < 0.84
      ? 0.95 + ((variance - 0.56) / 0.28) * 0.15
      : 1.15 + ((variance - 0.84) / 0.16) * 0.2;
  const generatedDifficulty = Math.max(
    1,
    Math.round(
      combat.assault
      * generatedPowerRatio
      * (mode === "shop" ? 1.015 : 1)
      * (1 + (security - 50) * 0.0006),
    ),
  );
  const difficulty = Number.isFinite(storedDifficulty) ? storedDifficulty : generatedDifficulty;
  return {
    spotId,
    name: String(body.name || (mode === "shop" ? "Uzlet" : "Utcai celpont")).trim().slice(0, 80),
    mode,
    districtIndex,
    difficulty: clampServer(difficulty, 1, 5000),
    cycle,
  };
}

function getServerRobberyDifficultyInfo(state, difficulty) {
  const combat = getPvpCombatStats(state);
  const actionPower = Math.max(1, combat.assault);
  const powerRatio = Math.max(0.01, Number(difficulty) / actionPower);
  if (powerRatio <= 0.9) {
    const progress = clampServer((powerRatio - 0.75) / 0.15, 0, 1);
    return {
      label: "Konnyu",
      successChance: clampServer(0.96 - progress * 0.12, 0.84, 0.96),
      actionPower,
      powerRatio,
      recommendedMin: 0.75,
      recommendedMax: 0.9,
    };
  }
  if (powerRatio <= 1.1) {
    const progress = clampServer((powerRatio - 0.95) / 0.15, 0, 1);
    return {
      label: "Kockazatos",
      successChance: clampServer(0.72 - progress * 0.2, 0.5, 0.72),
      actionPower,
      powerRatio,
      recommendedMin: 0.95,
      recommendedMax: 1.1,
    };
  }
  const progress = clampServer((powerRatio - 1.15) / 0.2, 0, 1);
  return {
    label: "Veszelyes",
    successChance: clampServer(0.44 - progress * 0.22, 0.18, 0.44),
    actionPower,
    powerRatio,
    recommendedMin: 1.15,
    recommendedMax: 1.35,
  };
}

function getServerCrewPassive(memberId) {
  if (memberId === "luca") {
    return { id: "boss_hunter", label: "Fonokvadasz: +28% sebzes a fonok ellen" };
  }
  if (memberId === "marco") {
    return { id: "marksman", label: "Mesterlovesz: 22% kritikus esely" };
  }
  if (memberId === "enzo") {
    return { id: "guardian", label: "Testor: 22% sebzescsokkentes es magara vonja a tuzet" };
  }
  return { id: "", label: "" };
}

function createServerRobberyAllies(profileName, state, selectedMemberIds = []) {
  const ownedById = new Map(
    normalizeServerCrewMembers(state)
      .filter((member) => member.hired)
      .map((member) => [String(member.id || ""), member]),
  );
  const members = selectedMemberIds
    .map((id) => ownedById.get(String(id || "")))
    .filter((member) => member && Number(member.health) > 0)
    .slice(0, 2)
    .map((member) => {
      const stats = getCrewCombatStats(member);
      const passive = getServerCrewPassive(String(member.id || ""));
      return {
        id: String(member.id),
        name: String(member.name || "Bandatag").slice(0, 64),
        role: String(member.role || "Ember").slice(0, 64),
        level: stats.level,
        maxHealth: stats.maxHealth,
        health: stats.health,
        attack: stats.attack,
        defense: stats.defense,
        passiveId: passive.id,
        passiveLabel: passive.label,
        isPlayer: false,
      };
    });
  const combat = getPvpCombatStats(state);
  const player = {
    id: "player",
    name: profileName,
    role: "Te",
    level: combat.level,
    maxHealth: 100,
    health: clampServer(state.health, 0, 100),
    attack: Math.max(6, combat.playerAttack),
    defense: Math.max(5, combat.playerDefense),
    passiveId: "",
    passiveLabel: "",
    isPlayer: true,
  };
  return [members[0], player, members[1]].filter(Boolean);
}

function createServerRobberyReferenceAllies(profileName, state) {
  const strongestMemberIds = normalizeServerCrewMembers(state)
    .filter((member) => member.hired && Number(member.health) > 0)
    .map((member) => {
      const stats = getCrewCombatStats(member);
      const score = stats.attack * 1.2 + stats.defense + stats.maxHealth * 0.15 + stats.level * 0.5;
      return { id: member.id, score };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((entry) => entry.id);
  return createServerRobberyAllies(profileName, state, strongestMemberIds);
}

function getServerRobberyTier(label) {
  if (label === "Veszelyes") {
    return { attack: 1.28, defense: 1.2, damage: 1.16, threatScale: 1.08, maximumTeamRatio: 1.35 };
  }
  if (label === "Kockazatos") {
    return { attack: 1.08, defense: 1.04, damage: 1.32, threatScale: 1.06, maximumTeamRatio: 1.1 };
  }
  return { attack: 0.88, defense: 0.86, damage: 0.98, threatScale: 1, maximumTeamRatio: 0.9 };
}

function getRobberyUnitPower(unit, useCurrentHealth = true) {
  const maxHealth = Math.max(1, Number(unit?.maxHealth) || 1);
  const readiness = useCurrentHealth
    ? clampServer((Number(unit?.health) || 0) / maxHealth, 0, 1)
    : 1;
  const attack = Math.max(0, Number(unit?.attack) || 0) * (0.68 + readiness * 0.32);
  const defense = Math.max(0, Number(unit?.defense) || 0) * (0.64 + readiness * 0.36);
  const health = maxHealth * readiness;
  const level = Math.max(1, Number(unit?.level) || 1);
  return attack * 1.2 + defense + health * 0.15 + level * 0.5;
}

function getRobberyTeamPower(units = [], useCurrentHealth = true) {
  return Math.max(
    1,
    Math.round(units.reduce((sum, unit) => sum + getRobberyUnitPower(unit, useCurrentHealth), 0)),
  );
}

function getServerRobberyEnemyCount(label, seed = "") {
  const highCount = hashStringUnit(seed) >= 0.5;
  if (label === "Veszelyes") return 3;
  if (label === "Kockazatos") return highCount ? 3 : 2;
  return highCount ? 2 : 1;
}

function getRobberyCombatProfile(units = []) {
  const validUnits = units.filter(Boolean);
  const count = Math.max(1, validUnits.length);
  return {
    averageAttack: validUnits.reduce((sum, unit) => sum + Math.max(0, Number(unit.attack) || 0), 0) / count,
    averageDefense: validUnits.reduce((sum, unit) => sum + Math.max(0, Number(unit.defense) || 0), 0) / count,
    averageLevel: validUnits.reduce((sum, unit) => sum + Math.max(1, Number(unit.level) || 1), 0) / count,
    totalHealth: validUnits.reduce((sum, unit) => sum + Math.max(1, Number(unit.maxHealth) || 1), 0),
  };
}

function getServerRobberyEnemyProfile(action, allies) {
  const selectedProfile = getRobberyCombatProfile(allies);
  const referenceProfile = action.referenceCombatProfile || selectedProfile;
  const actionPower = Math.max(
    1,
    Number(action.difficultyInfo?.actionPower) || Number(action.target.difficulty) || 1,
  );
  const storedRatio = clampServer(Number(action.target.difficulty) / actionPower, 0.45, 1.65);
  const tier = getServerRobberyTier(action.difficultyInfo?.label);
  const blend = (referenceValue, selectedValue) => (
    referenceValue * storedRatio * 0.7 + selectedValue * 0.3
  );
  const healthScale = action.difficultyInfo?.label === "Veszelyes"
    ? 1.05
    : action.difficultyInfo?.label === "Kockazatos"
      ? 1.02
      : 1;
  return {
    averageAttack: Math.max(5, Math.min(
      blend(referenceProfile.averageAttack, selectedProfile.averageAttack),
      referenceProfile.averageAttack * tier.maximumTeamRatio,
    )),
    averageDefense: Math.max(4, Math.min(
      blend(referenceProfile.averageDefense, selectedProfile.averageDefense),
      referenceProfile.averageDefense * tier.maximumTeamRatio,
    )),
    averageLevel: clampServer(
      blend(referenceProfile.averageLevel, selectedProfile.averageLevel),
      1,
      30,
    ),
    totalHealth: Math.max(40, Math.min(
      blend(referenceProfile.totalHealth, selectedProfile.totalHealth) * healthScale,
      referenceProfile.totalHealth * tier.maximumTeamRatio,
    )),
  };
}

function getServerRobberyUnderdogBonus(battleMode = "full") {
  if (battleMode === "lone") {
    return { allyDamageBoost: 1.08, enemyDamageReduction: 0.94, defenseIgnore: 0.08 };
  }
  if (battleMode === "solo") {
    return { allyDamageBoost: 1.04, enemyDamageReduction: 0.97, defenseIgnore: 0.04 };
  }
  return { allyDamageBoost: 1, enemyDamageReduction: 1, defenseIgnore: 0 };
}

function estimateServerRobberyWinChance(allies, enemyPower, battleMode = "full") {
  const currentTeamPower = getRobberyTeamPower(allies, true);
  const underdogBonus = getServerRobberyUnderdogBonus(battleMode);
  const adjustedTeamPower = currentTeamPower
    * underdogBonus.allyDamageBoost
    / underdogBonus.enemyDamageReduction
    * (1 + underdogBonus.defenseIgnore * 0.35);
  const maximumPower = Math.max(adjustedTeamPower, enemyPower, 1);
  const passiveBonus = Math.min(
    0.1,
    allies.reduce((sum, ally) => sum + (ally.passiveId ? (ally.passiveId === "guardian" ? 0.03 : 0.035) : 0), 0),
  );
  return clampServer(0.5 + ((adjustedTeamPower - enemyPower) / maximumPower) * 0.9 + passiveBonus, 0.08, 0.95);
}

function createServerRobberyDefenders(action, allies) {
  const names = ["Salvatore", "Vincent", "Tommy"];
  const types = ["watcher", "boss", "bodyguard"];
  const count = clampServer(
    action.enemyCount || getServerRobberyEnemyCount(action.difficultyInfo.label, action.actionId),
    1,
    3,
  );
  const tier = getServerRobberyTier(action.difficultyInfo.label);
  const enemyProfile = getServerRobberyEnemyProfile(action, allies);
  const roleProfiles = {
    watcher: { attack: 1.04, defense: 0.92, health: 0.9, level: 0 },
    boss: { attack: 1.08, defense: 1.02, health: 1.05, level: 1 },
    bodyguard: { attack: 0.9, defense: 1.1, health: 1.05, level: 0 },
  };
  const selectedRoleProfiles = types.slice(0, count).map((type) => roleProfiles[type]);
  const healthWeightTotal = selectedRoleProfiles.reduce((sum, profile) => sum + profile.health, 0);
  const defenders = names.slice(0, count).map((name, index) => {
    const type = types[index];
    const roleProfile = roleProfiles[type];
    const variance = 0.96 + hashStringUnit(`${action.actionId}:${index}`) * 0.08;
    const level = clampServer(
      Math.round(enemyProfile.averageLevel + roleProfile.level),
      1,
      30,
    );
    const maxHealth = clampServer(
      Math.round(enemyProfile.totalHealth * (roleProfile.health / healthWeightTotal) * variance),
      50,
      420,
    );
    return {
      id: `${action.target.spotId}-guard-${index}`,
      name,
      type,
      level,
      maxHealth,
      health: maxHealth,
      attack: Math.max(6, Math.round(enemyProfile.averageAttack * roleProfile.attack * variance)),
      defense: Math.max(5, Math.round(enemyProfile.averageDefense * roleProfile.defense * variance)),
      damageScale: tier.damage,
    };
  });
  action.enemyCount = count;
  action.enemyPower = getRobberyTeamPower(defenders, false);
  action.enemyPowerTarget = action.enemyPower;
  action.teamPower = getRobberyTeamPower(allies, true);
  action.estimatedWinChance = estimateServerRobberyWinChance(allies, action.enemyPower, action.battleMode);
  return defenders;
}

function getRobberyBattleMode(allyCount) {
  if (allyCount <= 1) return "lone";
  if (allyCount === 2) return "solo";
  return "full";
}

function getRobberyRewardMultiplier(battleMode) {
  if (battleMode === "lone") return 0.52;
  if (battleMode === "solo") return 0.76;
  return 1;
}

function getRobberyDifficultyRewardProfile(label) {
  if (label === "Veszelyes") return { money: 1.35, fame: 1.5 };
  if (label === "Kockazatos") return { money: 1.15, fame: 1.25 };
  return { money: 1, fame: 1 };
}

function getRobberyPlayerHealthPenalty(action, outcome) {
  if (outcome === "won") return 0;
  if (outcome === "retreated") return 2;
  if (action?.difficultyInfo?.label === "Veszelyes") return 5;
  if (action?.difficultyInfo?.label === "Kockazatos") return 4;
  return 3;
}

function getRobberyInfluencePenalty(action, outcome) {
  if (outcome !== "lost") return 0;
  if (action?.difficultyInfo?.label === "Veszelyes") return 4;
  if (action?.difficultyInfo?.label === "Kockazatos") return 3;
  return 2;
}

function getEffectiveUnitStat(unit, key, baseShare) {
  const readiness = clampServer(unit.health / Math.max(1, unit.maxHealth), 0, 1);
  return Math.max(1, Math.round((Number(unit[key]) || 0) * (baseShare + readiness * (1 - baseShare))));
}

function syncRobberyHealthToState(state, action) {
  const player = action.allies.find((ally) => ally.isPlayer);
  if (player) state.health = clampServer(player.health, 0, 100);
  if (!Array.isArray(state.crewMembers)) return;
  const allyById = new Map(action.allies.filter((ally) => !ally.isPlayer).map((ally) => [String(ally.id), ally]));
  state.crewMembers = state.crewMembers.map((member) => {
    const ally = allyById.get(String(member.id || ""));
    if (!ally) return member;
    const storedMaxHealth = Math.max(1, Number(member.baseHealth) || 100);
    const healthPercent = clampServer(ally.health / Math.max(1, ally.maxHealth), 0, 1);
    return { ...member, health: Math.round(storedMaxHealth * healthPercent) };
  });
  state.naturalRecoveryAt = state.naturalRecoveryAt && typeof state.naturalRecoveryAt === "object"
    ? state.naturalRecoveryAt
    : { health: Date.now(), energy: Date.now() };
  state.naturalRecoveryAt.health = Date.now();
}

function advanceServerRobberyQuests(state, mode) {
  advanceServerQuests(state, "robbery", mode, 1);
}

function buildRobberyClientState(state) {
  return {
    money: Math.max(0, toSafeInt(state.money, 0, 0)),
    fame: Math.max(0, toSafeInt(state.fame, 0, 0)),
    heat: clampServer(state.heat, 0, 100),
    influence: normalizeServerInfluence(state.influence, SERVER_STARTING_INFLUENCE),
    influenceSystemVersion: SERVER_INFLUENCE_SYSTEM_VERSION,
    health: clampServer(state.health, 0, 100),
    energy: clampServer(state.energy, 0, 100),
    crewMembers: Array.isArray(state.crewMembers) ? state.crewMembers : [],
    activeQuests: Array.isArray(state.activeQuests) ? state.activeQuests : [],
    districts: Array.isArray(state.districts) ? state.districts : [],
    naturalRecoveryAt: state.naturalRecoveryAt || null,
  };
}

function mapRobberyActionForClient(action) {
  const difficultyReward = getRobberyDifficultyRewardProfile(action.difficultyInfo?.label);
  return {
    actionId: action.actionId,
    status: action.status,
    target: action.target,
    difficulty: action.target.difficulty,
    difficultyInfo: action.difficultyInfo,
    energyCost: action.energyCost,
    battleStarted: Boolean(action.battleStarted),
    battleMode: action.battleMode || "full",
    playerHealthAtStart: Number.isFinite(Number(action.playerHealthAtStart))
      ? clampServer(action.playerHealthAtStart, 0, 100)
      : null,
    rewardMultiplier: action.rewardMultiplier || 1,
    difficultyRewardMultiplier: action.difficultyRewardMultiplier || difficultyReward.money,
    difficultyFameMultiplier: action.difficultyFameMultiplier || difficultyReward.fame,
    selectedMemberIds: action.selectedMemberIds || [],
    allies: action.allies || [],
    defenders: action.defenders || [],
    enemyCount: Math.max(1, toSafeInt(action.enemyCount, 1, 1)),
    teamPower: Math.max(0, toSafeInt(action.teamPower, 0, 0)),
    enemyPower: Math.max(0, toSafeInt(action.enemyPower, 0, 0)),
    enemyPowerTarget: Math.max(0, toSafeInt(action.enemyPowerTarget, 0, 0)),
    referenceTeamPower: Math.max(0, toSafeInt(action.referenceTeamPower, 0, 0)),
    referenceCombatProfile: action.referenceCombatProfile || null,
    estimatedWinChance: clampServer(action.estimatedWinChance, 0, 1),
    combatVersion: Math.max(1, toSafeInt(action.combatVersion, 1, 1)),
    allyTurnIndex: action.allyTurnIndex || 0,
    round: action.round || 1,
    loot: action.loot || 0,
    alert: action.alert || 0,
    message: action.message || "",
    result: action.result || null,
  };
}

function parseActionSession(row) {
  if (!row) return null;
  const payload = parseJsonSafely(row.payload_json, null);
  if (!payload || typeof payload !== "object") return null;
  return { ...payload, actionId: row.action_id, status: payload.status || row.action_status };
}

async function writeRobberyActionSession(profileName, action, now = Date.now()) {
  await upsertActionSessionStmt.run(
    action.actionId,
    profileName,
    "robbery",
    action.status === "selection" || action.status === "battle" ? "active" : "completed",
    JSON.stringify(action),
    action.createdAt || now,
    now,
    action.expiresAt || (now + ROBBERY_ACTION_TTL_MS),
  );
}

const SERVER_EQUIPMENT_SLOTS = ["hat", "shirt", "pants", "weapon", "shoes", "watch"];
const SERVER_CREW_TEMPLATES = [
  { id: "luca", name: "Luca Moretti", role: "Vegrehajto", baseAttack: 12, baseDefense: 9, baseHealth: 100, hireCost: 155 },
  { id: "marco", name: "Marco Bellini", role: "Fegyveres", baseAttack: 15, baseDefense: 8, baseHealth: 88, hireCost: 700 },
  { id: "enzo", name: "Enzo Romano", role: "Megfigyelo", baseAttack: 10, baseDefense: 12, baseHealth: 112, hireCost: 1500 },
];

function getServerCrewMaxHealth(template, level = 1, defenseLevel = 1) {
  return Math.max(
    1,
    toSafeInt(template?.baseHealth, 100, 1)
      + Math.max(0, toSafeInt(level, 1, 1) - 1) * 2
      + Math.max(0, toSafeInt(defenseLevel, 1, 1) - 1),
  );
}

function getEmptyServerEquipment() {
  return Object.fromEntries(SERVER_EQUIPMENT_SLOTS.map((slot) => [slot, null]));
}

function normalizeServerEquipment(source = {}) {
  const output = getEmptyServerEquipment();
  for (const slot of SERVER_EQUIPMENT_SLOTS) {
    const item = source?.[slot];
    output[slot] = item && typeof item === "object" ? { ...item, slot } : null;
  }
  return output;
}

function normalizeServerCrewMembers(state = {}) {
  const savedById = new Map((Array.isArray(state.crewMembers) ? state.crewMembers : []).map((member) => [String(member?.id || ""), member]));
  return SERVER_CREW_TEMPLATES.map((template) => {
    const saved = savedById.get(template.id) || {};
    const level = clampServer(toSafeInt(saved.level, 1, 1), 1, 20);
    const defenseLevel = clampServer(toSafeInt(saved.defenseLevel, 1, 1), 1, 20);
    const maxHealth = getServerCrewMaxHealth(template, level, defenseLevel);
    const savedMaxHealth = Math.max(1, toSafeInt(saved.baseHealth, template.baseHealth, 1));
    const savedHealth = clampServer(saved.health ?? savedMaxHealth, 0, savedMaxHealth);
    const health = Math.round(maxHealth * (savedHealth / savedMaxHealth));
    return {
      ...template,
      baseHealth: maxHealth,
      hired: saved.hired === true,
      level,
      defenseLevel,
      attackBonus: clampServer(toSafeInt(saved.attackBonus, 0, 0), 0, (level - 1) * 3),
      defenseBonus: clampServer(toSafeInt(saved.defenseBonus, 0, 0), 0, (defenseLevel - 1) * 3),
      health: clampServer(health, 0, maxHealth),
      equipment: normalizeServerEquipment(saved.equipment),
    };
  });
}

function normalizeServerInventory(source = {}) {
  return Object.fromEntries(SERVER_EQUIPMENT_SLOTS.map((slot) => [
    slot,
    Array.isArray(source?.[slot])
      ? source[slot].filter((item) => item && typeof item === "object" && item.id).map((item) => ({ ...item, slot }))
      : [],
  ]));
}

function getServerEquipmentMarketPrice(item = {}) {
  const rarity = ["gray", "yellow", "red"].includes(item?.rarity) ? item.rarity : "gray";
  const power = Math.max(0, toSafeInt(item?.power, 0, 0));
  const base = rarity === "red" ? 260 : rarity === "yellow" ? 145 : 68;
  const powerRate = rarity === "red" ? 26 : rarity === "yellow" ? 18 : 10;
  return Math.max(1, Math.round(base + power * powerRate));
}

function getServerEquipmentSellPrice(item = {}) {
  const purchasePrice = Math.max(0, toSafeInt(item?.purchasePrice, 0, 0));
  const referencePrice = purchasePrice || getServerEquipmentMarketPrice(item);
  return Math.max(1, Math.floor(referencePrice * 0.4));
}

function isServerItemEquipped(state, itemId, except = {}) {
  if (!itemId) return false;
  if (except.owner !== "player" && Object.values(state.equipment || {}).some((item) => item?.id === itemId)) return true;
  return (state.crewMembers || []).some((member) => {
    if (except.owner === "crew" && except.memberId === member.id) return false;
    return Object.values(member.equipment || {}).some((item) => item?.id === itemId);
  });
}

function recalculateServerGearPower(state) {
  state.gearPower = Object.values(state.equipment || {}).reduce((sum, item) => sum + Math.max(0, toSafeInt(item?.power, 0, 0)), 0);
}

function buildEconomyClientState(state) {
  return {
    ...buildRobberyClientState(state),
    crew: Math.max(0, toSafeInt(state.crew, 0, 0)),
    activeCrewMemberId: state.activeCrewMemberId || null,
    equipment: normalizeServerEquipment(state.equipment),
    itemInventory: normalizeServerInventory(state.itemInventory),
    gearPower: Math.max(0, toSafeInt(state.gearPower, 0, 0)),
    marketStock: Array.isArray(state.marketStock) ? state.marketStock : [],
    marketRefreshAt: Number(state.marketRefreshAt) || 0,
    mentorFlags: state.mentorFlags && typeof state.mentorFlags === "object" ? state.mentorFlags : {},
  };
}

async function runCrewEconomyCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const now = Date.now();
    const state = {
      ...profile.state,
      cityLevel: clampServer(toSafeInt(profile.state.cityLevel, 1, 1), 1, 100),
      crewMembers: normalizeServerCrewMembers(profile.state),
      equipment: normalizeServerEquipment(profile.state.equipment),
      itemInventory: normalizeServerInventory(profile.state.itemInventory),
    };
    const operation = String(body.operation || "");
    const memberId = String(body.memberId || "").slice(0, 64);
    const member = state.crewMembers.find((entry) => entry.id === memberId);
    if (!member) return { statusCode: 404, error: "A bandatag nem talalhato." };
    let cost = 0;
    let gainedPoints = 0;
    if (operation === "hire") {
      if (member.hired) return { statusCode: 409, error: "Ez az ember mar a bandad tagja." };
      cost = SERVER_CREW_TEMPLATES.find((entry) => entry.id === memberId)?.hireCost || 0;
      if (Number(state.money) < cost) return { statusCode: 409, error: "Nincs eleg penz a felberleshez." };
      state.money -= cost;
      member.hired = true;
      member.health = member.baseHealth;
      state.activeCrewMemberId = member.id;
    } else if (operation === "upgrade") {
      if (!member.hired) return { statusCode: 409, error: "Elobb fel kell berelned ezt az embert." };
      if (member.level >= 20) return { statusCode: 409, error: "A bandatag elerte a maximalis szintet." };
      cost = 45 + member.level * 35;
      if (Number(state.money) < cost) return { statusCode: 409, error: "Nincs eleg penz a fejleszteshez." };
      state.money -= cost;
      const previousMaxHealth = member.baseHealth;
      gainedPoints = 2;
      member.level += 1;
      member.attackBonus += gainedPoints;
      const template = SERVER_CREW_TEMPLATES.find((entry) => entry.id === member.id);
      member.baseHealth = getServerCrewMaxHealth(template, member.level, member.defenseLevel);
      member.health = clampServer(member.health + (member.baseHealth - previousMaxHealth), 0, member.baseHealth);
    } else if (operation === "defense") {
      if (!member.hired) return { statusCode: 409, error: "Elobb fel kell berelned ezt az embert." };
      if (member.defenseLevel >= 20) return { statusCode: 409, error: "A bandatag vedelme mar maximalis." };
      cost = 35 + member.defenseLevel * 30;
      if (Number(state.money) < cost) return { statusCode: 409, error: "Nincs eleg penz a vedelmi fejleszteshez." };
      state.money -= cost;
      const previousMaxHealth = member.baseHealth;
      gainedPoints = 2;
      member.defenseLevel += 1;
      member.defenseBonus += gainedPoints;
      const template = SERVER_CREW_TEMPLATES.find((entry) => entry.id === member.id);
      member.baseHealth = getServerCrewMaxHealth(template, member.level, member.defenseLevel);
      member.health = clampServer(member.health + (member.baseHealth - previousMaxHealth), 0, member.baseHealth);
    } else if (operation === "heal") {
      if (!member.hired) return { statusCode: 409, error: "Elobb fel kell berelned ezt az embert." };
      const missingHealth = Math.max(0, member.baseHealth - member.health);
      if (!missingHealth) return { statusCode: 409, error: "A bandatag mar teljes eleteron van." };
      cost = 4 + Math.ceil(missingHealth * 0.55);
      if (Number(state.money) < cost) return { statusCode: 409, error: "Nincs eleg penz a gyogyitashoz." };
      state.money -= cost;
      member.health = member.baseHealth;
    } else {
      return { statusCode: 400, error: "Ismeretlen bandamuvelet." };
    }
    state.crew = state.crewMembers.filter((entry) => entry.hired).length;
    await persistPvpState(profileName, state, now);
    await logEvent(profileName, `crew_${operation}`, "Bandamuvelet vegrehajtva", { memberId, cost, gainedPoints }, now);
    return { statusCode: 200, payload: { ok: true, operation, memberId, cost, gainedPoints, state: buildEconomyClientState(state) } };
  });
}

async function runEquipEconomyCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const now = Date.now();
    const state = {
      ...profile.state,
      crewMembers: normalizeServerCrewMembers(profile.state),
      equipment: normalizeServerEquipment(profile.state.equipment),
      itemInventory: normalizeServerInventory(profile.state.itemInventory),
    };
    const owner = body.owner === "crew" ? "crew" : "player";
    const slot = SERVER_EQUIPMENT_SLOTS.includes(body.slot) ? body.slot : null;
    const itemId = String(body.itemId || "").slice(0, 128);
    if (!slot || !itemId) return { statusCode: 400, error: "Ervenytelen felszereles." };
    const item = state.itemInventory[slot].find((entry) => entry.id === itemId);
    if (!item) return { statusCode: 404, error: "A targy nincs a leltaradban." };
    let targetEquipment = state.equipment;
    let targetName = profileName;
    let member = null;
    if (owner === "crew") {
      member = state.crewMembers.find((entry) => entry.id === String(body.memberId || ""));
      if (!member?.hired) return { statusCode: 409, error: "A bandatag nincs felberelve." };
      targetEquipment = member.equipment;
      targetName = member.name;
    }
    const currentlyEquipped = targetEquipment[slot]?.id === itemId;
    if (!currentlyEquipped && isServerItemEquipped(state, itemId, { owner, memberId: member?.id })) {
      return { statusCode: 409, error: "Ezt a targyat mar mas viseli." };
    }
    targetEquipment[slot] = currentlyEquipped ? null : { ...item, slot };
    if (member) state.activeCrewMemberId = member.id;
    if (owner === "player" && slot === "weapon" && !currentlyEquipped) {
      state.mentorFlags = state.mentorFlags && typeof state.mentorFlags === "object" ? state.mentorFlags : {};
      state.mentorFlags.equippedItem = true;
    }
    recalculateServerGearPower(state);
    await persistPvpState(profileName, state, now);
    await logEvent(profileName, "equipment_changed", "Felszereles modositva", { owner, memberId: member?.id || null, slot, itemId, equipped: !currentlyEquipped }, now);
    return {
      statusCode: 200,
      payload: { ok: true, equipped: !currentlyEquipped, owner, targetName, itemName: item.name, slot, state: buildEconomyClientState(state) },
    };
  });
}

async function runMarketBuyCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const itemId = String(body.itemId || "").slice(0, 128);
    const marketRow = await selectMarketItemStmt.get(itemId, profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    if (!marketRow || Number(marketRow.stock) <= 0) return { statusCode: 404, error: "Ez az aru mar lekerult a piacrol." };
    if (marketRow.expires_at && Number(marketRow.expires_at) <= Date.now()) return { statusCode: 409, error: "A piaci ajanlat lejart." };
    const state = {
      ...profile.state,
      crewMembers: normalizeServerCrewMembers(profile.state),
      equipment: normalizeServerEquipment(profile.state.equipment),
      itemInventory: normalizeServerInventory(profile.state.itemInventory),
    };
    const slot = SERVER_EQUIPMENT_SLOTS.includes(marketRow.slot_key) ? marketRow.slot_key : null;
    if (!slot) return { statusCode: 409, error: "A piaci aru tipusa ervenytelen." };
    if (state.itemInventory[slot].some((item) => item.id === itemId)) return { statusCode: 409, error: "Ez a targy mar a leltaradban van." };
    const basePrice = Math.max(0, toSafeInt(marketRow.price, 0, 0));
    const marketDiscountRate = getServerInfluenceBenefits(state).marketDiscountRate;
    const price = Math.max(1, Math.round(basePrice * (1 - marketDiscountRate)));
    if (Number(state.money) < price) return { statusCode: 409, error: "Nincs eleg penzed ehhez az aruhoz." };
    const offer = parseJsonSafely(marketRow.payload_json, {});
    const sourceItem = offer?.item && typeof offer.item === "object" ? offer.item : {};
    const item = {
      ...sourceItem,
      id: itemId,
      slot,
      name: String(marketRow.item_name || sourceItem.name || "Ismeretlen targy").slice(0, 160),
      rarity: ["gray", "yellow", "red"].includes(marketRow.rarity) ? marketRow.rarity : "gray",
      stat: marketRow.stat_kind === "defense" ? "defense" : "attack",
      power: Math.max(0, toSafeInt(marketRow.stat_value, sourceItem.power || 0, 0)),
      purchasePrice: price,
    };
    state.money -= price;
    state.itemInventory[slot].push(item);
    advanceServerQuests(state, "market_buy", "any", 1);
    state.marketStock = (Array.isArray(state.marketStock) ? state.marketStock : []).filter((entry) => entry?.item?.id !== itemId);
    const now = Date.now();
    await markMarketItemSoldStmt.run(now, itemId, profileName);
    await persistPvpState(profileName, state, now);
    await logEvent(profileName, "market_purchase", "Feketepiaci vasarlas", {
      itemId,
      slot,
      basePrice,
      price,
      discountPercent: Math.round(marketDiscountRate * 1000) / 10,
    }, now);
    return {
      statusCode: 200,
      payload: {
        ok: true,
        item,
        basePrice,
        price,
        discountPercent: Math.round(marketDiscountRate * 1000) / 10,
        state: buildEconomyClientState(state),
      },
    };
  });
}

async function runMarketSellCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const state = {
      ...profile.state,
      crewMembers: normalizeServerCrewMembers(profile.state),
      equipment: normalizeServerEquipment(profile.state.equipment),
      itemInventory: normalizeServerInventory(profile.state.itemInventory),
    };
    const slot = SERVER_EQUIPMENT_SLOTS.includes(body.slot) ? body.slot : null;
    const itemId = String(body.itemId || "").slice(0, 128);
    if (!slot || !itemId) return { statusCode: 400, error: "Ervenytelen eladasi tetel." };
    const itemIndex = state.itemInventory[slot].findIndex((item) => String(item?.id || "") === itemId);
    if (itemIndex < 0) return { statusCode: 404, error: "Ez a targy mar nincs a leltaradban." };
    const item = state.itemInventory[slot][itemIndex];
    if (isServerItemEquipped(state, itemId)) {
      return { statusCode: 409, error: "A hasznalatban levo targyat elobb le kell venned." };
    }
    const price = getServerEquipmentSellPrice(item);
    state.itemInventory[slot].splice(itemIndex, 1);
    state.money = Math.max(0, toSafeInt(state.money, 0, 0) + price);
    const now = Date.now();
    await persistPvpState(profileName, state, now);
    await logEvent(profileName, "market_sale", "Feketepiaci eladas", {
      itemId,
      itemName: item.name,
      slot,
      price,
    }, now);
    return {
      statusCode: 200,
      payload: {
        ok: true,
        item: { ...item, slot },
        price,
        state: buildEconomyClientState(state),
      },
    };
  });
}

async function runCraftEconomyCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const state = {
      ...profile.state,
      crewMembers: normalizeServerCrewMembers(profile.state),
      equipment: normalizeServerEquipment(profile.state.equipment),
      itemInventory: normalizeServerInventory(profile.state.itemInventory),
    };
    const refs = Array.isArray(body.ingredients) ? body.ingredients.slice(0, 3) : [];
    if (refs.length !== 3) return { statusCode: 400, error: "Pontosan harom alapanyag kell a crafthoz." };
    const keys = new Set();
    const ingredients = [];
    for (const ref of refs) {
      const slot = SERVER_EQUIPMENT_SLOTS.includes(ref?.slot) ? ref.slot : null;
      const itemId = String(ref?.itemId || "").slice(0, 128);
      const key = `${slot}:${itemId}`;
      if (!slot || !itemId || keys.has(key)) return { statusCode: 400, error: "Ervenytelen craft alapanyag." };
      keys.add(key);
      const item = state.itemInventory[slot].find((entry) => entry.id === itemId);
      if (!item || isServerItemEquipped(state, itemId)) return { statusCode: 409, error: "Az egyik alapanyag hianyzik vagy hasznalatban van." };
      ingredients.push({ slot, item });
    }
    const fromRarity = ingredients[0].item.rarity;
    if (!["gray", "yellow"].includes(fromRarity) || !ingredients.every((entry) => entry.item.rarity === fromRarity)) {
      return { statusCode: 409, error: "Harom azonos ritkasagu szabad targy kell." };
    }
    for (const ingredient of ingredients) {
      state.itemInventory[ingredient.slot] = state.itemInventory[ingredient.slot].filter((item) => item.id !== ingredient.item.id);
    }
    const toRarity = fromRarity === "gray" ? "yellow" : "red";
    const success = toRarity !== "red" || Math.random() <= 0.35;
    let craftedItem = null;
    if (success) {
      const target = ingredients[randomServerInt(0, ingredients.length - 1)];
      const catalog = defaultGameConfigEntries.equipment_catalog.payload[target.slot] || [];
      const template = catalog.find((item) => item.rarity === toRarity) || catalog[0] || {};
      const averagePower = Math.max(1, Math.round(ingredients.reduce((sum, entry) => sum + toSafeInt(entry.item.power, 0, 0), 0) / 3));
      craftedItem = {
        ...template,
        id: `crafted-${target.slot}-${toRarity}-${randomUUID()}`,
        slot: target.slot,
        name: `${template.name || target.slot} (craft)`,
        rarity: toRarity,
        stat: template.stat === "defense" ? "defense" : "attack",
        power: Math.max(toSafeInt(template.power, 1, 1), averagePower + (toRarity === "red" ? 3 : 2)),
      };
      state.itemInventory[target.slot].unshift(craftedItem);
    }
    const now = Date.now();
    await persistPvpState(profileName, state, now);
    await logEvent(profileName, "equipment_crafted", success ? "Craft sikeres" : "Craft sikertelen", {
      fromRarity, toRarity, success, craftedItemId: craftedItem?.id || null,
    }, now);
    return { statusCode: 200, payload: { ok: true, success, fromRarity, toRarity, craftedItem, state: buildEconomyClientState(state) } };
  });
}

const SERVER_RECOVERY_DURATION_MS = 20 * 60 * 1000;
const SERVER_RECOVERY_AMOUNT = 50;
const SERVER_RECOVERY_USAGE_LIMIT = 3;
const SERVER_RECOVERY_USAGE_RESET_MS = 3 * 60 * 60 * 1000;
const SERVER_NATURAL_RECOVERY_POINT_MS = (12 * 60 * 60 * 1000) / 100;
const SERVER_PROTECTION_COOLDOWN_MS = 3 * 60 * 1000;

function normalizeServerRecoveryEffects(source = {}) {
  const normalize = (effect) => {
    if (!effect || typeof effect !== "object") return null;
    const startedAt = Number(effect.startedAt);
    const endsAt = Number(effect.endsAt);
    if (!Number.isFinite(startedAt) || !Number.isFinite(endsAt) || endsAt <= startedAt) return null;
    return {
      startedAt,
      endsAt,
      appliedAmount: clampServer(toSafeInt(effect.appliedAmount, 0, 0), 0, SERVER_RECOVERY_AMOUNT),
    };
  };
  return { health: normalize(source?.health), energy: normalize(source?.energy) };
}

function normalizeServerRecoveryUsage(source = {}, now = Date.now()) {
  const normalize = (entry) => {
    const uses = clampServer(toSafeInt(entry?.uses, 0, 0), 0, SERVER_RECOVERY_USAGE_LIMIT);
    const resetAt = Number(entry?.resetAt);
    if (Number.isFinite(resetAt) && resetAt > now) return { uses, resetAt };
    if (uses > 0 && !Number.isFinite(resetAt)) return { uses, resetAt: now + SERVER_RECOVERY_USAGE_RESET_MS };
    return {
      uses: 0,
      resetAt: 0,
    };
  };
  return {
    health: normalize(source?.health),
    energy: normalize(source?.energy),
  };
}

function applyServerRecoveryProgress(state, now = Date.now()) {
  state.recoveryEffects = normalizeServerRecoveryEffects(state.recoveryEffects);
  state.recoveryUsage = normalizeServerRecoveryUsage(state.recoveryUsage, now);
  state.naturalRecoveryAt = state.naturalRecoveryAt && typeof state.naturalRecoveryAt === "object"
    ? { ...state.naturalRecoveryAt }
    : { health: now, energy: now };
  for (const stat of ["health", "energy"]) {
    state[stat] = clampServer(state[stat] ?? 100, 0, 100);
    const naturalAt = Math.min(now, Number(state.naturalRecoveryAt[stat]) || now);
    if (state[stat] < 100) {
      const recovered = Math.floor((now - naturalAt) / SERVER_NATURAL_RECOVERY_POINT_MS);
      if (recovered > 0) {
        state[stat] = clampServer(state[stat] + recovered, 0, 100);
        state.naturalRecoveryAt[stat] = state[stat] >= 100 ? now : naturalAt + recovered * SERVER_NATURAL_RECOVERY_POINT_MS;
      }
    } else {
      state.naturalRecoveryAt[stat] = now;
    }
    const effect = state.recoveryEffects[stat];
    if (!effect) continue;
    const progress = clampServer((now - effect.startedAt) / (effect.endsAt - effect.startedAt), 0, 1);
    const shouldBeApplied = Math.floor(SERVER_RECOVERY_AMOUNT * progress);
    const delta = Math.max(0, shouldBeApplied - effect.appliedAmount);
    if (delta > 0) {
      state[stat] = clampServer(state[stat] + delta, 0, 100);
      effect.appliedAmount += delta;
    }
    if (progress >= 1 || effect.appliedAmount >= SERVER_RECOVERY_AMOUNT || state[stat] >= 100) state.recoveryEffects[stat] = null;
  }
  return state;
}

function buildProgressionClientState(state) {
  return {
    ...buildEconomyClientState(state),
    recoveryEffects: normalizeServerRecoveryEffects(state.recoveryEffects),
    recoveryUsage: normalizeServerRecoveryUsage(state.recoveryUsage),
    naturalRecoveryAt: state.naturalRecoveryAt || null,
    protectionCooldowns: state.protectionCooldowns && typeof state.protectionCooldowns === "object" ? state.protectionCooldowns : {},
    hideUsesToday: Math.max(0, toSafeInt(state.hideUsesToday, 0, 0)),
    hideUsesDay: Math.max(1, toSafeInt(state.hideUsesDay, state.day || 1, 1)),
    day: Math.max(1, toSafeInt(state.day, 1, 1)),
  };
}

function normalizeServerQuestReward(reward, questId) {
  if (!reward || typeof reward !== "object") return null;
  const slot = reward.slot === "trousers"
    ? "pants"
    : (reward.slot === "suit" || reward.slot === "vest" ? "shirt" : String(reward.slot || ""));
  if (!SERVER_EQUIPMENT_SLOTS.includes(slot)) return null;
  const rarity = ["gray", "yellow", "red"].includes(reward.rarity) ? reward.rarity : "gray";
  const templateId = String(reward.templateId || reward.id || `${slot}-quest-reward`).replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 64);
  return {
    id: `owned-quest-${slot}-${String(questId).replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 48)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    templateId,
    slot,
    name: String(reward.name || "Kuldetes jutalma").trim().slice(0, 80),
    power: clampServer(toSafeInt(reward.power, 0, 0), 0, 10),
    stat: reward.stat === "defense" ? "defense" : "attack",
    rarity,
    image: typeof reward.image === "string" ? reward.image.slice(0, 240) : "",
  };
}

function normalizeServerQuest(quest, allowedStatuses = ["offered", "accepted", "completed"]) {
  if (!quest || typeof quest !== "object") return null;
  const id = String(quest.id || "").trim().slice(0, 128);
  const spotId = String(quest.spotId || "").trim().slice(0, 64);
  if (!id || !spotId || !allowedStatuses.includes(quest.status)) return null;
  const allowedActions = new Set(["robbery", "protection", "harbor_job", "cargo_spend", "cargo_acquire", "market_buy", "garage_run"]);
  const requestedAction = String(quest.goal?.action || quest.type || "robbery");
  const action = allowedActions.has(requestedAction) ? requestedAction : "robbery";
  const allowedModes = new Set(["any", "shop", "street", "docks", "customs", "rail", "warehouse", "fish", "garage", "counterfeitMoney", "drugs", "weapons", "papers"]);
  const mode = allowedModes.has(quest.goal?.mode) ? quest.goal.mode : "any";
  const target = clampServer(toSafeInt(quest.goal?.target, 1, 1), 1, 12);
  const progress = clampServer(toSafeInt(quest.goal?.progress, 0, 0), 0, target);
  const steps = (Array.isArray(quest.steps) ? quest.steps : []).slice(0, 3).map((step, index) => {
    const stepAction = allowedActions.has(step?.action) ? step.action : null;
    if (!stepAction) return null;
    const stepMode = allowedModes.has(step?.mode) ? step.mode : "any";
    const stepTarget = clampServer(toSafeInt(step?.target, 1, 1), 1, 12);
    return {
      id: String(step?.id || `step-${index + 1}`).slice(0, 40),
      action: stepAction,
      mode: stepMode,
      target: stepTarget,
      progress: clampServer(toSafeInt(step?.progress, 0, 0), 0, stepTarget),
      label: String(step?.label || "Teljesitsd a reszfeladatot.").trim().slice(0, 180),
    };
  }).filter(Boolean);
  const aggregateTarget = steps.length ? steps.reduce((sum, step) => sum + step.target, 0) : target;
  const aggregateProgress = steps.length ? steps.reduce((sum, step) => sum + step.progress, 0) : progress;
  const primaryAction = steps.length > 1 ? "mixed" : (steps[0]?.action || action);
  return {
    ...quest,
    id,
    spotId,
    spotName: String(quest.spotName || "Ismeretlen hely").trim().slice(0, 80),
    districtName: String(quest.districtName || "Kerulet").trim().slice(0, 80),
    type: primaryAction,
    status: quest.status,
    title: String(quest.title || "Kuldetes").trim().slice(0, 100),
    signature: String(quest.signature || "").trim().slice(0, 240),
    description: String(quest.description || "").trim().slice(0, 500),
    objective: String(quest.objective || "").trim().slice(0, 240),
    moneyReward: clampServer(toSafeInt(quest.moneyReward, 0, 0), 0, 500),
    xpReward: clampServer(toSafeInt(quest.xpReward, 0, 0), 0, 100),
    reward: quest.reward && typeof quest.reward === "object" ? { ...quest.reward } : null,
    goal: {
      action: primaryAction,
      mode: steps.length > 1 ? "any" : (steps[0]?.mode || mode),
      target: aggregateTarget,
      progress: aggregateProgress,
    },
    steps,
    createdAt: Number.isFinite(Number(quest.createdAt)) ? Number(quest.createdAt) : Date.now(),
  };
}

function advanceServerQuests(state, action, mode = "any", amount = 1) {
  if (!Array.isArray(state.activeQuests)) return false;
  let changed = false;
  state.activeQuests = state.activeQuests.map((quest) => {
    if (quest?.status !== "accepted") return quest;
    const increment = Math.max(0, toSafeInt(amount, 0, 0));
    if (Array.isArray(quest.steps) && quest.steps.length) {
      let questChanged = false;
      const steps = quest.steps.map((step) => {
        if (step.action !== action || (step.mode !== "any" && step.mode !== mode)) return step;
        const stepTarget = Math.max(1, toSafeInt(step.target, 1, 1));
        const stepProgress = clampServer(toSafeInt(step.progress, 0, 0) + increment, 0, stepTarget);
        questChanged = questChanged || stepProgress !== step.progress;
        return { ...step, progress: stepProgress };
      });
      if (!questChanged) return quest;
      changed = true;
      const target = steps.reduce((sum, step) => sum + Math.max(1, toSafeInt(step.target, 1, 1)), 0);
      const progress = steps.reduce((sum, step) => sum + Math.max(0, toSafeInt(step.progress, 0, 0)), 0);
      return {
        ...quest,
        status: steps.every((step) => step.progress >= step.target) ? "completed" : quest.status,
        steps,
        goal: { ...quest.goal, target, progress },
      };
    }
    if (quest?.goal?.action !== action || (quest.goal.mode !== "any" && quest.goal.mode !== mode)) return quest;
    const target = Math.max(1, toSafeInt(quest.goal.target, 1, 1));
    const progress = clampServer(toSafeInt(quest.goal.progress, 0, 0) + increment, 0, target);
    changed = changed || progress !== quest.goal.progress;
    return { ...quest, status: progress >= target ? "completed" : quest.status, goal: { ...quest.goal, progress } };
  });
  return changed;
}

function hasPendingLegacyHarborQuestWork(state, quest) {
  const cargoSpendModes = (Array.isArray(quest?.steps) && quest.steps.length
    ? quest.steps
    : [quest?.goal])
    .filter((step) => step?.action === "cargo_spend")
    .map((step) => String(step.mode || "any"));
  if (!cargoSpendModes.length) return false;
  return normalizeServerHarborTasks(state.harborProcessTasks).some((task) => {
    if (task.payload?.questProgressOnCompletion === true) return false;
    const mission = getServerHarborMissions().find((entry) => entry.id === task.payload?.missionId);
    if (!mission) return false;
    const requires = normalizeServerCargo(mission.requires);
    return cargoSpendModes.some((mode) => mode === "any" || Number(requires[mode]) > 0);
  });
}

function buildQuestClientState(state) {
  return {
    ...buildProgressionClientState(state),
    activeQuest: state.activeQuest && typeof state.activeQuest === "object" ? state.activeQuest : null,
    activeQuests: Array.isArray(state.activeQuests) ? state.activeQuests : [],
    offeredQuests: Array.isArray(state.offeredQuests) ? state.offeredQuests : [],
    selectedQuestSlot: clampServer(toSafeInt(state.selectedQuestSlot, 0, 0), 0, 1),
    questNextSpawnAt: Math.max(0, Number(state.questNextSpawnAt) || 0),
    mentorStep: Math.max(0, toSafeInt(state.mentorStep, 0, 0)),
    mentorCompleted: state.mentorCompleted === true,
  };
}

async function runQuestProgressionCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const now = Date.now();
    const state = {
      ...profile.state,
      equipment: normalizeServerEquipment(profile.state.equipment),
      itemInventory: normalizeServerInventory(profile.state.itemInventory),
      activeQuests: Array.isArray(profile.state.activeQuests)
        ? profile.state.activeQuests.map((quest) => normalizeServerQuest(quest, ["accepted", "completed"])).filter(Boolean).slice(0, 2)
        : [],
      offeredQuests: Array.isArray(profile.state.offeredQuests)
        ? profile.state.offeredQuests.map((quest) => normalizeServerQuest(quest, ["offered"])).filter(Boolean).slice(0, 3)
        : [],
    };
    const operation = String(body.operation || "");
    const questId = String(body.questId || "").trim().slice(0, 128);
    if (!questId) return { statusCode: 400, error: "Hianyzik a kuldetes azonositoja." };
    let quest = null;
    let reward = null;
    let mentorReward = null;

    if (operation === "accept") {
      const offeredIndex = state.offeredQuests.findIndex((entry) => entry.id === questId);
      if (offeredIndex < 0) {
        if (state.activeQuests.some((entry) => entry.id === questId)) return { statusCode: 409, error: "Ez a kuldetes mar el van fogadva." };
        return { statusCode: 404, error: "A felajanlott kuldetes nem talalhato." };
      }
      if (state.activeQuests.length >= 2) return { statusCode: 409, error: "Mar ket felvett kuldetesed van." };
      quest = {
        ...state.offeredQuests[offeredIndex],
        status: "accepted",
        goal: { ...state.offeredQuests[offeredIndex].goal, progress: 0 },
        steps: Array.isArray(state.offeredQuests[offeredIndex].steps)
          ? state.offeredQuests[offeredIndex].steps.map((step) => ({ ...step, progress: 0 }))
          : [],
      };
      state.offeredQuests.splice(offeredIndex, 1);
      state.activeQuests.push(quest);
      state.selectedQuestSlot = state.activeQuests.length - 1;
      if (state.activeQuest?.id === questId) state.activeQuest = null;
    } else if (operation === "abandon") {
      const activeIndex = state.activeQuests.findIndex((entry) => entry.id === questId);
      if (activeIndex < 0) return { statusCode: 404, error: "A felvett kuldetes nem talalhato." };
      [quest] = state.activeQuests.splice(activeIndex, 1);
      state.selectedQuestSlot = clampServer(toSafeInt(state.selectedQuestSlot, 0, 0), 0, Math.max(0, state.activeQuests.length - 1));
      if (state.activeQuest?.id === questId) state.activeQuest = null;
    } else if (operation === "claim") {
      const activeIndex = state.activeQuests.findIndex((entry) => entry.id === questId);
      if (activeIndex < 0) return { statusCode: 404, error: "A felvett kuldetes nem talalhato." };
      quest = state.activeQuests[activeIndex];
      if (hasPendingLegacyHarborQuestWork(state, quest)) {
        return { statusCode: 409, error: "A kuldeteshez tartozo kikotoi munka meg folyamatban van." };
      }
      if (quest.status !== "completed" || quest.goal.progress < quest.goal.target) {
        return { statusCode: 409, error: "Ez a kuldetes meg nincs kesz az atadasra." };
      }
      reward = {
        money: quest.moneyReward,
        xp: quest.xpReward,
        item: normalizeServerQuestReward(quest.reward, quest.id),
      };
      state.money = Math.max(0, toSafeInt(state.money, 0, 0) + reward.money);
      state.fame = Math.max(0, toSafeInt(state.fame, 0, 0) + reward.xp);
      state.heat = clampServer(state.heat + 4, 0, 100);
      if (reward.item) state.itemInventory[reward.item.slot].push(reward.item);
      state.activeQuests.splice(activeIndex, 1);
      state.selectedQuestSlot = clampServer(toSafeInt(state.selectedQuestSlot, 0, 0), 0, Math.max(0, state.activeQuests.length - 1));
      if (!state.mentorCompleted && toSafeInt(state.mentorStep, 0, 0) === 5) {
        mentorReward = { money: 130, xp: 2 };
        state.money += mentorReward.money;
        state.fame += mentorReward.xp;
        state.mentorStep = 6;
      }
    } else {
      return { statusCode: 400, error: "Ismeretlen kuldetesmuvelet." };
    }

    await persistPvpState(profileName, state, now);
    await logEvent(profileName, `quest_${operation}`, operation === "claim" ? "Kuldetes atadva" : operation === "accept" ? "Kuldetes elfogadva" : "Kuldetes torolve", {
      questId, title: quest?.title || "Kuldetes", reward, mentorReward,
    }, now);
    return { statusCode: 200, payload: { ok: true, operation, quest, reward, mentorReward, state: buildQuestClientState(state) } };
  });
}

const SERVER_DISTRICTS = [
  { id: "center", value: 3, security: 55 },
  { id: "market", value: 3, security: 48 },
  { id: "harbor", value: 4, security: 62 },
  { id: "industrial", value: 2, security: 40 },
  { id: "luxury", value: 5, security: 72 },
  { id: "suburb", value: 2, security: 36 },
];
const SERVER_LOTS = {
  "east-empty-lot": { maxLevel: 3, restoredHouse: false },
  "central-empty-lot": { maxLevel: 3, restoredHouse: false },
  "southeast-empty-lot": { maxLevel: 3, restoredHouse: false },
  "market-row": { maxLevel: 1, restoredHouse: true, privateCost: 120, cityCost: 80, privateIncome: 24 },
  "west-mid-block": { maxLevel: 1, restoredHouse: true, privateCost: 120, cityCost: 80, privateIncome: 24 },
  "east-office": { maxLevel: 1, restoredHouse: true, privateCost: 120, cityCost: 80, privateIncome: 24 },
  "central-bank": { maxLevel: 1, restoredHouse: true, privateCost: 120, cityCost: 80, privateIncome: 24 },
  "southwest-tenement": { maxLevel: 1, restoredHouse: true, privateCost: 120, cityCost: 80, privateIncome: 24 },
  courthouse: { maxLevel: 1, restoredHouse: true, privateCost: 120, cityCost: 80, privateIncome: 24 },
};
const SERVER_LOT_LEVEL_COSTS = { 0: 80, 1: 180, 2: 320 };
const SERVER_LOT_LEVEL_INCOME = { 1: 80, 2: 190, 3: 360 };

function normalizeServerTerritories(source = {}) {
  const territories = {};
  for (const [lotId, lot] of Object.entries(SERVER_LOTS)) {
    const saved = source?.[lotId];
    if (!saved || typeof saved !== "object") continue;
    const level = clampServer(toSafeInt(saved.level, 0, 0), 0, lot.maxLevel);
    if (level <= 0) continue;
    const ownerType = lot.restoredHouse && saved.ownerType === "city" ? "city" : "private";
    territories[lotId] = { level, ownerType };
  }
  return territories;
}

function getServerTerritoryIncome(territories = {}) {
  return Object.entries(territories).reduce((sum, [lotId, territory]) => {
    const lot = SERVER_LOTS[lotId];
    if (!lot || !territory) return sum;
    if (lot.restoredHouse) return sum + (territory.ownerType === "private" ? lot.privateIncome : 0);
    return sum + (SERVER_LOT_LEVEL_INCOME[territory.level] || 0);
  }, 0);
}

function normalizeServerDistricts(source = []) {
  return SERVER_DISTRICTS.map((definition, index) => {
    const saved = Array.isArray(source) ? source[index] : null;
    return {
      ...(saved && typeof saved === "object" ? saved : {}),
      id: definition.id,
      value: definition.value,
      security: definition.security,
      controlled: saved?.controlled === true,
      loyalty: clampServer(saved?.loyalty, 0, 100),
    };
  });
}

function getServerPoliceMoneyLoss(money, heat, severe = false) {
  const availableMoney = Math.max(0, toSafeInt(money, 0, 0));
  const normalizedHeat = clampServer(heat, 0, 100);
  const lossRate = severe
    ? clampServer(0.25 + Math.max(0, normalizedHeat - 75) * 0.004, 0.25, 0.35)
    : clampServer(0.05 + Math.max(0, normalizedHeat - 25) * (0.1 / 75), 0.05, 0.15);
  const moneyLoss = availableMoney > 0
    ? Math.min(availableMoney, Math.max(1, Math.floor(availableMoney * lossRate)))
    : 0;
  return { moneyLoss, lossRate };
}

function applyServerPoliceBust(state) {
  const heatBefore = clampServer(state.heat, 0, 100);
  if (heatBefore < 100) return null;
  const { moneyLoss, lossRate } = getServerPoliceMoneyLoss(state.money, heatBefore, true);
  state.money = Math.max(0, state.money - moneyLoss);
  state.heat = clampServer(heatBefore - 15, 0, 100);
  state.crew = normalizeServerCrewMembers(state).filter((member) => member.hired).length;
  return {
    moneyLoss,
    moneyLossPercent: Math.round(lossRate * 100),
    heatBefore,
    heatLoss: 15,
  };
}

function buildEmpireClientState(state) {
  return {
    ...buildQuestClientState(state),
    cityLevel: clampServer(toSafeInt(state.cityLevel, 1, 1), 1, 100),
    territories: normalizeServerTerritories(state.territories),
    districts: normalizeServerDistricts(state.districts),
    day: Math.max(1, toSafeInt(state.day, 1, 1)),
    lastDayEndedAt: Math.max(0, Number(state.lastDayEndedAt) || 0),
  };
}

async function runEmpireProgressionCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const now = Date.now();
    const state = {
      ...profile.state,
      crewMembers: normalizeServerCrewMembers(profile.state),
      districts: normalizeServerDistricts(profile.state.districts),
      territories: normalizeServerTerritories(profile.state.territories),
    };
    applyServerRecoveryProgress(state, now);
    const operation = String(body.operation || "");
    let result = null;

    if (operation === "city-upgrade") {
      const currentLevel = clampServer(toSafeInt(state.cityLevel, 1, 1), 1, 100);
      if (currentLevel >= 100) return { statusCode: 409, error: "A varos elerte a maximalis szintet." };
      const cost = 140 + currentLevel * 70;
      if (state.money < cost) return { statusCode: 409, error: "Nincs eleg penz a varos fejlesztesere." };
      if (state.energy < 15) return { statusCode: 409, error: "A varos fejlesztesehez 15 energia kell." };
      state.money -= cost;
      state.energy = clampServer(state.energy - 15, 0, 100);
      state.naturalRecoveryAt.energy = now;
      state.cityLevel = currentLevel + 1;
      state.fame = Math.max(0, toSafeInt(state.fame, 0, 0) + 10);
      state.districts = state.districts.map((district) => district.controlled
        ? { ...district, loyalty: clampServer(district.loyalty + 10, 0, 100) }
        : district);
      result = { cost, cityLevel: state.cityLevel, fameGain: 10 };
    } else if (operation === "district-takeover") {
      const districtIndex = clampServer(toSafeInt(body.districtIndex, 0, 0), 0, SERVER_DISTRICTS.length - 1);
      const district = state.districts[districtIndex];
      if (!district || district.controlled) return { statusCode: 409, error: "Ez a kerulet mar a tied, vagy nem letezik." };
      const hiredCrew = state.crewMembers.filter((member) => member.hired).length;
      const requiredCrew = Math.max(2, Math.ceil(district.security / 25));
      const requiredFame = district.security + 10;
      if (hiredCrew < requiredCrew || state.fame < requiredFame) return { statusCode: 409, error: "Meg nem eleg eros a bandad ehhez a kerulethez." };
      if (state.energy < 25) return { statusCode: 409, error: "A kerulet atvetelehez 25 energia kell." };
      state.energy = clampServer(state.energy - 25, 0, 100);
      state.naturalRecoveryAt.energy = now;
      district.controlled = true;
      district.loyalty = 35;
      state.fame = Math.max(0, toSafeInt(state.fame, 0, 0) + 12);
      state.heat = clampServer(state.heat + 8, 0, 100);
      const healthLoss = randomServerInt(5, 18);
      state.health = clampServer(state.health - healthLoss, 0, 100);
      state.naturalRecoveryAt.health = now;
      const influenceGain = Math.max(0, changeServerInfluence(state, 3));
      const bust = applyServerPoliceBust(state);
      result = { districtIndex, districtName: district.name || district.id, healthLoss, fameGain: 12, heatGain: 8, influenceGain, bust };
    } else if (operation === "lot-invest") {
      const lotId = String(body.lotId || "").trim().slice(0, 64);
      const lot = SERVER_LOTS[lotId];
      if (!lot) return { statusCode: 404, error: "A telek nem talalhato." };
      const current = state.territories[lotId] || { level: 0, ownerType: "" };
      if (current.level >= lot.maxLevel) return { statusCode: 409, error: "Ez az epulet mar maximalis szintu." };
      let ownerType = "private";
      let cost = SERVER_LOT_LEVEL_COSTS[current.level] || 0;
      let energyCost = 15;
      if (lot.restoredHouse) {
        if (current.level > 0) return { statusCode: 409, error: "Ezt az epuletet mar helyreallitottad." };
        ownerType = body.ownerType === "city" ? "city" : "private";
        cost = ownerType === "city" ? lot.cityCost : lot.privateCost;
        energyCost = 0;
      }
      if (state.money < cost) return { statusCode: 409, error: `Nincs eleg penz. Szükséges: ${cost} $.` };
      if (state.energy < energyCost) return { statusCode: 409, error: `A fejleszteshez ${energyCost} energia kell.` };
      state.money -= cost;
      state.energy = clampServer(state.energy - energyCost, 0, 100);
      if (energyCost) state.naturalRecoveryAt.energy = now;
      const newLevel = current.level + 1;
      state.territories[lotId] = { level: newLevel, ownerType };
      const fameGain = current.level === 0 ? (lot.restoredHouse && ownerType === "city" ? 4 : 6) : 4;
      state.fame = Math.max(0, toSafeInt(state.fame, 0, 0) + fameGain);
      const income = lot.restoredHouse
        ? (ownerType === "private" ? lot.privateIncome : 0)
        : (SERVER_LOT_LEVEL_INCOME[newLevel] || 0);
      result = { lotId, level: newLevel, ownerType, cost, energyCost, fameGain, income, restoredHouse: lot.restoredHouse };
    } else if (operation === "end-day") {
      const controlled = state.districts.filter((district) => district.controlled);
      const districtIncome = controlled.reduce((sum, district) => sum + district.value * 20 + district.loyalty, 0);
      const territoryIncome = getServerTerritoryIncome(state.territories);
      const baseIncome = districtIncome + territoryIncome;
      const incomeBonusRate = getServerInfluenceBenefits(state).dailyIncomeRate;
      const influenceIncomeBonus = Math.max(0, Math.round(baseIncome * incomeBonusRate));
      const income = baseIncome + influenceIncomeBonus;
      const fameGain = controlled.length * 2 + clampServer(toSafeInt(state.cityLevel, 1, 1), 1, 100);
      state.money = Math.max(0, toSafeInt(state.money, 0, 0) + income);
      state.fame = Math.max(0, toSafeInt(state.fame, 0, 0) + fameGain);
      state.day = Math.max(1, toSafeInt(state.day, 1, 1)) + 1;
      state.hideUsesToday = 0;
      state.hideUsesDay = state.day;
      state.health = clampServer(state.health + 10, 0, 100);
      state.energy = 100;
      state.recoveryEffects = { health: null, energy: null };
      state.naturalRecoveryAt = { health: now, energy: now };
      state.districts = state.districts.map((district) => ({
        ...district,
        loyalty: clampServer(district.loyalty + (district.controlled ? 5 + state.cityLevel : 1), 0, 100),
      }));
      state.heat = clampServer(state.heat - 6, 0, 100);
      state.lastDayEndedAt = now;
      result = {
        income,
        baseIncome,
        influenceIncomeBonus,
        incomeBonusPercent: Math.round(incomeBonusRate * 1000) / 10,
        districtIncome,
        territoryIncome,
        fameGain,
        controlledCount: controlled.length,
        day: state.day,
      };
    } else {
      return { statusCode: 400, error: "Ismeretlen birodalommuvelet." };
    }

    await persistPvpState(profileName, state, now);
    await logEvent(profileName, `empire_${operation}`, "Birodalmi muvelet vegrehajtva", { operation, result }, now);
    return { statusCode: 200, payload: { ok: true, operation, result, state: buildEmpireClientState(state) } };
  });
}

const SERVER_HARBOR_TASK_LIMIT = 3;
const SERVER_GARAGE_RUN_WINDOW_MS = 12 * 60 * 60 * 1000;
const SERVER_GARAGE_RUN_LIMIT = 4;
const SERVER_GARAGE_RUN_TTL_MS = 20 * 60 * 1000;

function getServerHarborMissions() {
  return [
    ...(defaultGameConfigEntries.harbor_missions?.payload || []),
    ...(defaultGameConfigEntries.harbor_fish_missions?.payload || []),
  ];
}

function getServerGarageVehicles() {
  return defaultGameConfigEntries.harbor_garage_vehicles?.payload || [];
}

function getServerGarageMissions() {
  return defaultGameConfigEntries.harbor_garage_missions?.payload || [];
}

function normalizeServerCargo(source = {}) {
  return Object.fromEntries(["counterfeitMoney", "drugs", "weapons", "papers"].map((key) => [
    key, Math.max(0, toSafeInt(source?.[key], 0, 0)),
  ]));
}

function normalizeServerGarage(source = {}, now = Date.now()) {
  const vehicles = getServerGarageVehicles();
  const validIds = new Set(vehicles.map((vehicle) => vehicle.id));
  const unlocked = Array.from(new Set(["sedan", ...(Array.isArray(source?.unlockedVehicleIds) ? source.unlockedVehicleIds : [])]))
    .map(String).filter((id) => validIds.has(id));
  const activeVehicleId = unlocked.includes(source?.activeVehicleId) ? source.activeVehicleId : "sedan";
  const runTimestamps = (Array.isArray(source?.runTimestamps) ? source.runTimestamps : [])
    .map(Number)
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp > now - SERVER_GARAGE_RUN_WINDOW_MS && timestamp <= now + 60000)
    .sort((left, right) => left - right)
    .slice(-SERVER_GARAGE_RUN_LIMIT);
  return {
    level: clampServer(toSafeInt(source?.level, 1, 1), 1, 3),
    wins: Math.max(0, toSafeInt(source?.wins, 0, 0)),
    losses: Math.max(0, toSafeInt(source?.losses, 0, 0)),
    activeVehicleId,
    unlockedVehicleIds: unlocked,
    runTimestamps,
  };
}

function normalizeServerHarborTasks(source = []) {
  return (Array.isArray(source) ? source : []).map((task) => ({
    id: String(task?.id || randomUUID()).slice(0, 128),
    type: "harbor",
    title: String(task?.title || "Kikotoi munka").slice(0, 100),
    icon: String(task?.icon || "C").slice(0, 3),
    durationMs: clampServer(toSafeInt(task?.durationMs, 300000, 5000), 5000, 24 * 60 * 60 * 1000),
    startedAt: Math.max(0, Number(task?.startedAt) || 0),
    payload: task?.payload && typeof task.payload === "object" ? { ...task.payload } : {},
  })).slice(0, SERVER_HARBOR_TASK_LIMIT);
}

function buildHarborClientState(state) {
  return {
    ...buildEmpireClientState(state),
    smuggledGoods: normalizeServerCargo(state.smuggledGoods),
    smugglerFame: Math.max(0, toSafeInt(state.smugglerFame, 0, 0)),
    harborProcessTasks: normalizeServerHarborTasks(state.harborProcessTasks),
    harborGarage: normalizeServerGarage(state.harborGarage),
  };
}

function applyServerHarborReward(state, mission) {
  const influenceBenefits = getServerInfluenceBenefits(state);
  const spentCargo = normalizeServerCargo(mission.requires);
  for (const [key, amount] of Object.entries(spentCargo)) {
    if (amount > 0) advanceServerQuests(state, "cargo_spend", key, amount);
  }
  const successChance = Number.isFinite(Number(mission.successChance)) ? clampServer(mission.successChance, 0.05, 1) : (mission.zone === "fish" ? 1 : 0.86);
  const success = Math.random() <= successChance;
  const result = {
    missionId: mission.id,
    title: mission.title,
    success,
    moneyGain: 0,
    xpGain: 0,
    fine: 0,
    baseFine: 0,
    penaltyReductionPercent: Math.round(influenceBenefits.harborPenaltyReductionRate * 1000) / 10,
    influenceGain: 0,
    cargo: {},
    heal: 0,
    energy: 0,
  };
  if (!success) {
    result.baseFine = Math.max(12, Math.round(Number(mission.rewardMoney || 0) * 0.18));
    result.fine = Math.min(
      state.money,
      Math.max(1, Math.round(result.baseFine * (1 - influenceBenefits.harborPenaltyReductionRate))),
    );
    state.money = Math.max(0, state.money - result.fine);
    state.heat = clampServer(state.heat + 1, 0, 100);
    return result;
  }
  result.moneyGain = Math.max(0, toSafeInt(mission.rewardMoney, 0, 0));
  result.xpGain = Math.max(0, toSafeInt(mission.rewardXp, 0, 0));
  result.cargo = normalizeServerCargo(mission.gives);
  result.heal = Math.max(0, toSafeInt(mission.heal, 0, 0));
  result.energy = Math.max(0, toSafeInt(mission.energy, 0, 0));
  state.money += result.moneyGain;
  state.fame += result.xpGain;
  state.smugglerFame = Math.max(0, toSafeInt(state.smugglerFame, 0, 0) + Math.max(1, Math.round(result.xpGain / 5)));
  for (const [key, amount] of Object.entries(result.cargo)) state.smuggledGoods[key] += amount;
  advanceServerQuests(state, "harbor_job", mission.zone || "any", 1);
  for (const [key, amount] of Object.entries(result.cargo)) {
    if (amount > 0) advanceServerQuests(state, "cargo_acquire", key, amount);
  }
  state.health = clampServer(state.health + result.heal, 0, 100);
  state.energy = clampServer(state.energy + result.energy, 0, 100);
  result.influenceGain = Math.max(0, changeServerInfluence(state, 1));
  return result;
}

function syncServerHarborTasks(state, now = Date.now()) {
  const completed = [];
  const tasks = normalizeServerHarborTasks(state.harborProcessTasks);
  if (tasks[0] && !tasks[0].startedAt) tasks[0].startedAt = now;
  while (tasks.length && tasks[0].startedAt && now - tasks[0].startedAt >= tasks[0].durationMs) {
    const task = tasks.shift();
    const mission = getServerHarborMissions().find((entry) => entry.id === task.payload?.missionId);
    if (mission) completed.push(applyServerHarborReward(state, mission));
    const nextStart = task.startedAt + task.durationMs;
    if (tasks[0] && !tasks[0].startedAt) tasks[0].startedAt = Math.min(now, nextStart);
  }
  state.harborProcessTasks = tasks;
  return completed;
}

async function runHarborCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const now = Date.now();
    const state = {
      ...profile.state,
      smuggledGoods: normalizeServerCargo(profile.state.smuggledGoods),
      harborProcessTasks: normalizeServerHarborTasks(profile.state.harborProcessTasks),
      harborGarage: normalizeServerGarage(profile.state.harborGarage, now),
    };
    applyServerRecoveryProgress(state, now);
    const completed = syncServerHarborTasks(state, now);
    const operation = String(body.operation || "sync");
    let result = null;
    if (operation === "start") {
      const missionId = String(body.missionId || "").slice(0, 64);
      const mission = getServerHarborMissions().find((entry) => entry.id === missionId);
      if (!mission) return { statusCode: 404, error: "A kikotoi munka nem talalhato." };
      if (state.harborProcessTasks.some((task) => task.payload?.missionId === missionId)) return { statusCode: 409, error: "Ugyanez a kikotoi munka mar folyamatban van." };
      if (state.harborProcessTasks.length >= SERVER_HARBOR_TASK_LIMIT) return { statusCode: 409, error: "Nincs szabad kikotoi feladathely." };
      const requires = normalizeServerCargo(mission.requires);
      if (Object.entries(requires).some(([key, amount]) => state.smuggledGoods[key] < amount)) return { statusCode: 409, error: "Nincs eleg csempesz aru ehhez a munkahoz." };
      for (const [key, amount] of Object.entries(requires)) state.smuggledGoods[key] -= amount;
      const task = {
        id: `harbor-${randomUUID()}`,
        type: "harbor",
        title: mission.zone === "fish" ? "Halaszat" : "Csempeszet",
        icon: mission.zone === "fish" ? "H" : "C",
        durationMs: mission.durationMs,
        startedAt: state.harborProcessTasks.length ? 0 : now,
        payload: {
          missionId: mission.id,
          title: mission.title,
          zone: mission.zone,
          questProgressOnCompletion: true,
        },
      };
      state.harborProcessTasks.push(task);
      result = { task, mission: { id: mission.id, title: mission.title, zone: mission.zone } };
    } else if (operation === "cancel") {
      const taskId = String(body.taskId || "").slice(0, 128);
      const index = state.harborProcessTasks.findIndex((task) => task.id === taskId);
      if (index < 0) return { statusCode: 404, error: "A kikotoi feladat nem talalhato." };
      const [task] = state.harborProcessTasks.splice(index, 1);
      if (index === 0 && state.harborProcessTasks[0] && !state.harborProcessTasks[0].startedAt) state.harborProcessTasks[0].startedAt = now;
      result = { task };
    } else if (operation !== "sync") {
      return { statusCode: 400, error: "Ismeretlen kikotoi muvelet." };
    }
    await persistPvpState(profileName, state, now);
    if (operation !== "sync" || completed.length > 0) {
      await logEvent(profileName, `harbor_${operation}`, "Kikotoi muvelet", { result, completed }, now);
    }
    return { statusCode: 200, payload: { ok: true, operation, result, completed, serverNow: now, state: buildHarborClientState(state) } };
  });
}

function createServerGarageRunConfig(mission, garage, vehicle) {
  const load = Math.max(1, toSafeInt(vehicle.load, 1, 1));
  const quantityBonus = Math.max(0, garage.level - 1);
  const cargo = normalizeServerCargo(mission.cargoReward);
  const cargoBonus = Math.max(0, load - 1) + quantityBonus;
  for (const key of Object.keys(cargo)) if (cargo[key] > 0) cargo[key] += cargoBonus;
  let rewardMoney = mission.rewardMoney + Math.max(0, load - 1) * 20;
  let rewardXp = mission.rewardXp + Math.max(0, load - 1) * 3;
  if (vehicle.rewardProfile === "cash") rewardMoney += 160 + load * 20;
  if (vehicle.rewardProfile === "cargo") { rewardMoney -= 30; rewardXp += 8; }
  if (mission.id === "night-convoy") { rewardMoney = Math.round(rewardMoney * 0.5); rewardXp = Math.round(rewardXp * 0.5); }
  if (vehicle.id === "armor") rewardMoney = Math.min(666, rewardMoney);
  return {
    totalRounds: mission.rounds + Math.max(0, load - 1),
    requiredHits: mission.requiredHits + Math.max(0, Math.min(2, load - 1)),
    rewardMoney: Math.max(40, rewardMoney), rewardXp: Math.max(10, rewardXp), cargo,
    baseSafeWidth: clampServer(mission.baseSafeWidth + vehicle.stealth * 0.018, 0.18, 0.36),
    baseSpeed: clampServer(mission.baseSpeed - vehicle.speed * 0.0022, 0.014, 0.03),
  };
}

async function writeGarageActionSession(profileName, action, now = Date.now()) {
  await upsertActionSessionStmt.run(action.actionId, profileName, "garage", action.status === "active" ? "active" : "completed", JSON.stringify(action), action.createdAt || now, now, action.expiresAt || now + SERVER_GARAGE_RUN_TTL_MS);
}

async function runGarageCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const now = Date.now();
    const state = { ...profile.state, smuggledGoods: normalizeServerCargo(profile.state.smuggledGoods), harborGarage: normalizeServerGarage(profile.state.harborGarage, now) };
    const operation = String(body.operation || "");
    let action = null;
    let result = null;
    if (operation === "upgrade") {
      if (state.harborGarage.level >= 3) return { statusCode: 409, error: "A muhely mar maximalis szintu." };
      const cost = 360 + (state.harborGarage.level - 1) * 290;
      if (state.money < cost) return { statusCode: 409, error: "Nincs eleg penz a muhely fejlesztesere." };
      state.money -= cost; state.harborGarage.level += 1; result = { cost, level: state.harborGarage.level };
    } else if (operation === "vehicle") {
      const vehicle = getServerGarageVehicles().find((entry) => entry.id === body.vehicleId);
      if (!vehicle) return { statusCode: 404, error: "A jarmu nem talalhato." };
      let cost = 0;
      if (!state.harborGarage.unlockedVehicleIds.includes(vehicle.id)) {
        if (state.harborGarage.level < vehicle.requiredLevel) return { statusCode: 409, error: "A garazs szintje meg tul alacsony ehhez a jarmuhoz." };
        cost = vehicle.cost;
        if (state.money < cost) return { statusCode: 409, error: "Nincs eleg penz a jarmuhoz." };
        state.money -= cost; state.harborGarage.unlockedVehicleIds.push(vehicle.id);
      }
      state.harborGarage.activeVehicleId = vehicle.id; result = { vehicleId: vehicle.id, title: vehicle.title, cost };
    } else if (operation === "start") {
      const active = await selectActiveActionSessionStmt.get(profileName, "garage");
      if (active && Number(active.expires_at) > now) return { statusCode: 409, error: "Egy garazsfuvar mar folyamatban van." };
      const mission = getServerGarageMissions().find((entry) => entry.id === body.missionId);
      const vehicle = getServerGarageVehicles().find((entry) => entry.id === state.harborGarage.activeVehicleId);
      if (!mission || !vehicle || mission.vehicleId !== vehicle.id) return { statusCode: 409, error: "Ehhez a fuvarhoz a megfelelo aktiv jarmu kell." };
      if (state.harborGarage.runTimestamps.length >= SERVER_GARAGE_RUN_LIMIT) {
        return { statusCode: 409, error: "Tizenket oran belul csak negy fuvar indithato.", resetAt: state.harborGarage.runTimestamps[0] + SERVER_GARAGE_RUN_WINDOW_MS };
      }
      const config = createServerGarageRunConfig(mission, state.harborGarage, vehicle);
      state.harborGarage.runTimestamps.push(now);
      action = { actionId: randomUUID(), status: "active", missionId: mission.id, missionTitle: mission.title, createdAt: now, expiresAt: now + SERVER_GARAGE_RUN_TTL_MS, round: 1, hits: 0, misses: 0, attempts: 0, safeCenter: 0.22 + Math.random() * 0.56, safeWidth: config.baseSafeWidth, speed: config.baseSpeed, direction: 1, ...config };
      await writeGarageActionSession(profileName, action, now);
      result = { started: true };
    } else if (operation === "checkpoint") {
      const row = await selectActionSessionStmt.get(String(body.actionId || ""), profileName);
      action = parseActionSession(row);
      if (!action || row.action_type !== "garage" || row.action_status !== "active" || action.expiresAt <= now) return { statusCode: 404, error: "Nincs aktiv garazsfuvar." };
      const pointer = clampServer(Number(body.pointer), 0, 1);
      const hit = pointer >= action.safeCenter - action.safeWidth / 2 - 0.018 && pointer <= action.safeCenter + action.safeWidth / 2 + 0.018;
      action.attempts += 1; action.hits += hit ? 1 : 0; action.misses += hit ? 0 : 1; action.round += 1;
      if (action.round > action.totalRounds) {
        const mission = getServerGarageMissions().find((entry) => entry.id === action.missionId);
        const success = action.hits >= action.requiredHits;
        if (success) {
          const factor = clampServer(1 - action.misses * 0.15, 0.45, 1);
          result = {
            success,
            moneyGain: Math.max(20, Math.round(action.rewardMoney * factor)),
            xpGain: Math.max(6, Math.round(action.rewardXp * factor)),
            influenceGain: 0,
            cargo: {},
          };
          for (const [key, amount] of Object.entries(action.cargo)) result.cargo[key] = amount > 0 ? Math.max(1, Math.round(amount * factor)) : 0;
          state.money += result.moneyGain; state.fame += result.xpGain; state.heat = clampServer(state.heat + mission.heatSuccess, 0, 100);
          for (const [key, amount] of Object.entries(result.cargo)) state.smuggledGoods[key] += amount;
          advanceServerQuests(state, "garage_run", "garage", 1);
          for (const [key, amount] of Object.entries(result.cargo)) {
            if (amount > 0) advanceServerQuests(state, "cargo_acquire", key, amount);
          }
          state.smugglerFame = Math.max(0, toSafeInt(state.smugglerFame, 0, 0) + Math.max(2, Math.round(result.xpGain / 4)));
          state.harborGarage.wins += 1;
          result.influenceGain = Math.max(0, changeServerInfluence(state, action.misses === 0 ? 2 : 1));
        } else {
          const penaltyReductionRate = getServerInfluenceBenefits(state).harborPenaltyReductionRate;
          const basePenalty = Math.min(state.money, mission.failurePenalty);
          result = {
            success,
            basePenalty,
            penalty: Math.min(state.money, Math.max(1, Math.round(basePenalty * (1 - penaltyReductionRate)))),
            penaltyReductionPercent: Math.round(penaltyReductionRate * 1000) / 10,
            heatGain: mission.heatFail,
          };
          state.money -= result.penalty; state.heat = clampServer(state.heat + mission.heatFail, 0, 100); state.harborGarage.losses += 1;
        }
        action.status = "completed"; action.result = result;
      } else {
        action.safeWidth = clampServer(action.baseSafeWidth - action.attempts * 0.01, 0.14, 0.36);
        action.speed = clampServer(action.baseSpeed + action.attempts * 0.0012, 0.014, 0.034);
        action.direction = Math.random() > 0.5 ? 1 : -1; action.safeCenter = 0.22 + Math.random() * 0.56;
        result = { hit };
      }
      await writeGarageActionSession(profileName, action, now);
    } else if (operation === "abort") {
      const row = await selectActionSessionStmt.get(String(body.actionId || ""), profileName);
      action = parseActionSession(row);
      if (!action || row.action_type !== "garage" || row.action_status !== "active") return { statusCode: 404, error: "Nincs aktiv garazsfuvar." };
      action.status = "aborted"; await writeGarageActionSession(profileName, action, now); result = { aborted: true };
    } else return { statusCode: 400, error: "Ismeretlen garazsmuvelet." };
    await persistPvpState(profileName, state, now);
    await logEvent(profileName, `garage_${operation}`, "Garazsmuvelet", { result, actionId: action?.actionId }, now);
    return { statusCode: 200, payload: { ok: true, operation, result, action, serverNow: now, state: buildHarborClientState(state) } };
  });
}

function advanceServerActionQuests(state, actionType, mode) {
  advanceServerQuests(state, actionType, mode, 1);
}

async function runRecoveryProgressionCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const now = Date.now();
    const state = {
      ...profile.state,
      crewMembers: normalizeServerCrewMembers(profile.state),
      equipment: normalizeServerEquipment(profile.state.equipment),
      itemInventory: normalizeServerInventory(profile.state.itemInventory),
      districts: Array.isArray(profile.state.districts) ? profile.state.districts.map((district) => ({ ...district })) : [],
    };
    applyServerRecoveryProgress(state, now);
    const operation = body.operation === "start" ? "start" : "sync";
    let heatLoss = 0;
    let influenceLoss = 0;
    if (operation === "start") {
      const stat = body.stat === "energy" ? "energy" : "health";
      const otherStat = stat === "health" ? "energy" : "health";
      const usage = state.recoveryUsage[stat];
      if (usage.uses >= SERVER_RECOVERY_USAGE_LIMIT) {
        return {
          statusCode: 409,
          error: `${stat === "health" ? "A Lapulas" : "A Talalkozo"} haromoras kerete meg nem allt vissza.`,
          resetAt: usage.resetAt,
        };
      }
      if (state.recoveryEffects[otherStat]) return { statusCode: 409, error: "A masik toltes mar folyamatban van." };
      if (state.recoveryEffects[stat]) return { statusCode: 409, error: "Ez a toltes mar folyamatban van." };
      if (state[stat] >= 100) return { statusCode: 409, error: stat === "health" ? "Az eleterod mar maximumon van." : "Az energiad mar maximumon van." };
      if (body.layLow) {
        heatLoss = Math.min(clampServer(state.heat, 0, 100), 10);
        state.heat = clampServer(state.heat - heatLoss, 0, 100);
        state.districts = state.districts.map((district) => ({ ...district, loyalty: clampServer(Number(district.loyalty) - 3, 0, 100) }));
        influenceLoss = Math.max(0, -changeServerInfluence(state, -2));
      }
      if (usage.uses === 0 || usage.resetAt <= now) usage.resetAt = now + SERVER_RECOVERY_USAGE_RESET_MS;
      usage.uses += 1;
      state.recoveryEffects[stat] = { startedAt: now, endsAt: now + SERVER_RECOVERY_DURATION_MS, appliedAmount: 0 };
      await logEvent(profileName, `recovery_${stat}_started`, stat === "health" ? "Lapulas elinditva" : "Talalkozo elinditva", {
        layLow: Boolean(body.layLow),
        heatLoss,
        influenceLoss,
        uses: usage.uses,
        resetAt: usage.resetAt,
      }, now);
    }
    await persistPvpState(profileName, state, now);
    return {
      statusCode: 200,
      payload: {
        ok: true,
        operation,
        heatLoss,
        influenceLoss,
        recoveryUsage: normalizeServerRecoveryUsage(state.recoveryUsage, now),
        state: buildProgressionClientState(state),
      },
    };
  });
}

async function runProtectionProgressionCommand(profileName, body = {}) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const now = Date.now();
    const state = {
      ...profile.state,
      crewMembers: normalizeServerCrewMembers(profile.state),
      equipment: normalizeServerEquipment(profile.state.equipment),
      itemInventory: normalizeServerInventory(profile.state.itemInventory),
      districts: Array.isArray(profile.state.districts) ? profile.state.districts.map((district) => ({ ...district })) : [],
      protectionCooldowns: profile.state.protectionCooldowns && typeof profile.state.protectionCooldowns === "object"
        ? { ...profile.state.protectionCooldowns }
        : {},
    };
    applyServerRecoveryProgress(state, now);
    const target = normalizeRobberyTarget(body, state);
    if (!target) return { statusCode: 400, error: "Ervenytelen vedelmi penzes celpont." };
    const cooldownAt = Number(state.protectionCooldowns[target.spotId]) || 0;
    if (cooldownAt > now) return { statusCode: 409, error: "Innen meg nem szedhetsz vedelmi penzt.", cooldownAt };
    if (state.health <= 0 || state.energy < 8) return { statusCode: 409, error: "A beszedeshez legalabb 1 HP es 8 energia kell." };
    state.energy = clampServer(state.energy - 8, 0, 100);
    state.naturalRecoveryAt.energy = now;
    state.protectionCooldowns[target.spotId] = now + SERVER_PROTECTION_COOLDOWN_MS;
    const difficultyInfo = getServerRobberyDifficultyInfo(state, target.difficulty);
    const combat = getPvpCombatStats(state);
    const protectionBaseChance = difficultyInfo.label === "Konnyu"
      ? clampServer(difficultyInfo.successChance + 0.04, 0.9, 0.96)
      : difficultyInfo.label === "Kockazatos"
        ? clampServer(difficultyInfo.successChance + 0.22, 0.6, 0.76)
        : clampServer(difficultyInfo.successChance + 0.3, 0.38, 0.55);
    const readinessPenalty = Math.max(0, 1 - combat.readiness) * 0.18;
    const influenceBenefits = getServerInfluenceBenefits(state);
    const adjustedChance = clampServer(
      protectionBaseChance - readinessPenalty + influenceBenefits.protectionChanceBonus,
      0.2,
      0.98,
    );
    const gainBase = 14 + Math.round(target.difficulty * 0.16) + Math.max(1, toSafeInt(state.cityLevel, 1, 1)) * 4 + randomServerInt(0, 14);
    const readinessGainPenalty = combat.readiness < 0.6 ? Math.round((0.6 - combat.readiness) * 16) : 0;
    const gain = Math.max(10, Math.round(gainBase * (0.84 + difficultyInfo.successChance * 0.42) - readinessGainPenalty));
    const fameGain = difficultyInfo.label === "Veszelyes" ? 5 : difficultyInfo.label === "Kockazatos" ? 4 : 3;
    const rawHeatGain = difficultyInfo.label === "Veszelyes" ? 8 : difficultyInfo.label === "Kockazatos" ? 6 : 4;
    const success = Math.random() <= adjustedChance;
    let moneyGain = 0;
    let healthLoss = 0;
    let heatGain = 0;
    let influenceGain = 0;
    if (success) {
      moneyGain = gain;
      state.money = Math.max(0, toSafeInt(state.money, 0, 0) + moneyGain);
      state.fame = Math.max(0, toSafeInt(state.fame, 0, 0) + fameGain);
      heatGain = Math.max(1, Math.round(rawHeatGain * 0.46));
      state.heat = clampServer(state.heat + heatGain, 0, 100);
      const district = state.districts[target.districtIndex];
      if (district) {
        district.loyalty = clampServer(Number(district.loyalty) + 6, 0, 100);
        if (!district.controlled && district.loyalty >= 65) district.controlled = true;
      }
      advanceServerActionQuests(state, "protection", target.mode);
      influenceGain = Math.max(0, changeServerInfluence(state, 1));
    } else {
      const minLoss = difficultyInfo.label === "Veszelyes" ? 8 : 4;
      const maxLoss = difficultyInfo.label === "Veszelyes" ? 18 : 11;
      healthLoss = randomServerInt(minLoss, maxLoss);
      state.health = clampServer(state.health - healthLoss, 0, 100);
      state.naturalRecoveryAt.health = now;
      const rawFailureHeat = difficultyInfo.label === "Veszelyes" ? 10 : difficultyInfo.label === "Kockazatos" ? 7 : 5;
      heatGain = Math.max(1, Math.round(rawFailureHeat * 0.46));
      state.heat = clampServer(state.heat + heatGain, 0, 100);
    }
    await persistPvpState(profileName, state, now);
    await logEvent(profileName, success ? "protection_success" : "protection_failed", success ? "Vedelmi penz befolyt" : "Vedelmi penz beszedese sikertelen", {
      spotId: target.spotId, success, moneyGain, fameGain: success ? fameGain : 0, healthLoss, heatGain, influenceGain, successChance: adjustedChance,
    }, now);
    return {
      statusCode: 200,
      payload: {
        ok: true,
        result: {
          success,
          buildingName: target.name,
          difficultyLabel: difficultyInfo.label,
          moneyGain,
          fameGain: success ? fameGain : 0,
          healthLoss,
          heatGain,
          influenceGain,
          successChance: adjustedChance,
        },
        state: buildProgressionClientState(state),
      },
    };
  });
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
    influence: normalizeServerInfluence(player.influence, SERVER_STARTING_INFLUENCE),
    cityLevel: player.city_level,
    npcVillageVictories: Math.max(
      0,
      toSafeInt(player.npc_village_victories, 0, 0),
      toSafeInt(profile.state.npcVillageVictories, 0, 0),
    ),
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
  await syncStructuredTables(profileName, state, now, null);
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

async function ensureDefaultGameConfigEntries() {
  const now = Date.now();
  for (const [configKey, entry] of Object.entries(defaultGameConfigEntries)) {
    await insertGameConfigEntryStmt.run(
      configKey,
      entry.group || "general",
      JSON.stringify(entry.payload),
      now,
    );
  }
  const questConfigVersion = "mixed-main-harbor-quests-v2";
  const questConfigMeta = await selectMetaStmt.get("quest_config_version");
  if (questConfigMeta?.meta_value !== questConfigVersion) {
    const questEntry = defaultGameConfigEntries.main_quest_templates;
    await updateGameConfigEntryStmt.run(
      questEntry.group,
      JSON.stringify(questEntry.payload),
      now,
      "main_quest_templates",
    );
    await upsertMetaStmt.run("quest_config_version", questConfigVersion, now);
  }
}

await importBootstrapSavesIfNeeded();
await backfillPlayersFromSaves();
await ensureDefaultGameConfigEntries();

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

async function startServerRobbery(profileName, body) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const profile = await buildProfileState(profileName);
    if (!profile) return { statusCode: 404, error: "A jatekosprofil nem talalhato." };
    const now = Date.now();
    const activeRow = await selectActiveActionSessionStmt.get(profileName, "robbery");
    const activeAction = parseActionSession(activeRow);
    const activeLoneBattle = Boolean(
      activeAction?.battleStarted
      && (!Array.isArray(activeAction.selectedMemberIds) || activeAction.selectedMemberIds.length === 0),
    );
    if (activeAction && Number(activeRow.expires_at) > now && !activeLoneBattle) {
      return {
        statusCode: 200,
        payload: {
          ok: true,
          resumed: true,
          action: mapRobberyActionForClient(activeAction),
          state: buildRobberyClientState(profile.state),
        },
      };
    }
    if (activeAction) {
      activeAction.status = activeLoneBattle ? "cancelled" : "expired";
      activeAction.result = {
        success: false,
        reason: activeLoneBattle
          ? "Az egyeduli kirablas mar nem engedelyezett."
          : "Az akcio ideje lejart.",
      };
      await writeRobberyActionSession(profileName, activeAction, now);
    }

    const state = {
      ...profile.state,
      crewMembers: normalizeServerCrewMembers(profile.state),
      equipment: normalizeServerEquipment(profile.state.equipment),
    };
    const target = normalizeRobberyTarget(body, state);
    if (!target) return { statusCode: 400, error: "Ervenytelen kirablasi celpont." };
    const energyCost = target.mode === "shop" ? 18 : 12;
    if (Number(state.health) <= 0 || Number(state.energy) < energyCost) {
      return { statusCode: 409, error: `A rajtauteshez legalabb 1 HP es ${energyCost} energia kell.` };
    }
    const readyCrewMembers = state.crewMembers.filter(
      (member) => member.hired && Number(member.health) > 0,
    );
    if (!readyCrewMembers.length) {
      return {
        statusCode: 409,
        error: "Kirablashoz legalabb egy felberelt, harckepes bandatag kell.",
      };
    }

    state.energy = clampServer(Number(state.energy) - energyCost, 0, 100);
    state.naturalRecoveryAt = state.naturalRecoveryAt && typeof state.naturalRecoveryAt === "object"
      ? state.naturalRecoveryAt
      : { health: now, energy: now };
    state.naturalRecoveryAt.energy = now;
    const actionId = `robbery-${randomUUID()}`;
    const difficultyInfo = getServerRobberyDifficultyInfo(state, target.difficulty);
    const difficultyReward = getRobberyDifficultyRewardProfile(difficultyInfo.label);
    const action = {
      actionId,
      status: "selection",
      target,
      difficultyInfo,
      energyCost,
      battleStarted: false,
      battleMode: "full",
      playerHealthAtStart: clampServer(state.health, 0, 100),
      rewardMultiplier: 1,
      difficultyRewardMultiplier: difficultyReward.money,
      difficultyFameMultiplier: difficultyReward.fame,
      selectedMemberIds: [],
      allies: [],
      defenders: [],
      allyTurnIndex: 0,
      round: 1,
      loot: 0,
      alert: 0,
      message: "Valassz egy vagy ket harckepes bandatagot a rajtauteshez.",
      combatVersion: 2,
      createdAt: now,
      expiresAt: now + ROBBERY_ACTION_TTL_MS,
    };
    const referenceAllies = createServerRobberyReferenceAllies(profileName, state);
    action.referenceTeamPower = getRobberyTeamPower(referenceAllies, false);
    action.referenceCombatProfile = getRobberyCombatProfile(referenceAllies);
    action.enemyCount = getServerRobberyEnemyCount(
      action.difficultyInfo.label,
      `${action.actionId}:${action.target.spotId}`,
    );
    await persistPvpState(profileName, state, now);
    await writeRobberyActionSession(profileName, action, now);
    await logEvent(profileName, "robbery_started", "Kirablasi akcio elinditva", {
      actionId,
      spotId: target.spotId,
      mode: target.mode,
      energyCost,
    }, now);
    return {
      statusCode: 200,
      payload: { ok: true, resumed: false, action: mapRobberyActionForClient(action), state: buildRobberyClientState(state) },
    };
  });
}

async function engageServerRobbery(profileName, actionId, body) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const row = await selectActionSessionStmt.get(actionId, profileName);
    const profile = await buildProfileState(profileName);
    const action = parseActionSession(row);
    const now = Date.now();
    if (!profile || !action || row.action_status !== "active") return { statusCode: 404, error: "Nincs aktiv kirablasi akcio." };
    if (Number(row.expires_at) <= now) return { statusCode: 409, error: "A kirablasi akcio ideje lejart." };
    if (action.status !== "selection") {
      return { statusCode: 200, payload: { ok: true, action: mapRobberyActionForClient(action), state: buildRobberyClientState(profile.state) } };
    }
    const normalizedCrew = normalizeServerCrewMembers(profile.state);
    const readyMemberIds = new Set(normalizedCrew
      .filter((member) => member.hired)
      .filter((member) => Number(member.health) > 0)
      .map((member) => String(member.id || "")));
    const selectedMemberIds = Array.from(new Set(
      (Array.isArray(body.selectedMemberIds) ? body.selectedMemberIds : [])
        .map((id) => String(id || "").slice(0, 64))
        .filter((id) => id && readyMemberIds.has(id)),
    )).slice(0, 2);
    if (!selectedMemberIds.length) {
      return {
        statusCode: 409,
        error: "Valassz legalabb egy harckepes bandatagot a kirablashoz.",
        action: mapRobberyActionForClient(action),
      };
    }
    action.difficultyInfo = getServerRobberyDifficultyInfo(profile.state, action.target.difficulty);
    if (!Number.isFinite(Number(action.playerHealthAtStart))) {
      action.playerHealthAtStart = clampServer(profile.state.health, 0, 100);
    }
    action.selectedMemberIds = selectedMemberIds;
    action.allies = createServerRobberyAllies(profileName, profile.state, selectedMemberIds);
    action.battleMode = getRobberyBattleMode(action.allies.length);
    action.rewardMultiplier = getRobberyRewardMultiplier(action.battleMode);
    const difficultyReward = getRobberyDifficultyRewardProfile(action.difficultyInfo.label);
    action.difficultyRewardMultiplier = difficultyReward.money;
    action.difficultyFameMultiplier = difficultyReward.fame;
    action.defenders = createServerRobberyDefenders(action, action.allies);
    action.combatVersion = 2;
    action.battleStarted = true;
    action.status = "battle";
    action.message = action.battleMode === "solo"
      ? "Kis csapattal indultal. A jutalom kisebb."
      : "A csapat keszen all. Valassz celpontot es taktikat.";
    await writeRobberyActionSession(profileName, action, now);
    return { statusCode: 200, payload: { ok: true, action: mapRobberyActionForClient(action), state: buildRobberyClientState(profile.state) } };
  });
}

function finishServerRobberyState(profileName, state, action, outcome, reason, now) {
  syncRobberyHealthToState(state, action);
  const won = outcome === "won";
  const playerHealthAtStart = clampServer(
    Number.isFinite(Number(action.playerHealthAtStart)) ? Number(action.playerHealthAtStart) : 100,
    1,
    100,
  );
  const requestedHealthLoss = getRobberyPlayerHealthPenalty(action, outcome);
  const healthAfter = won
    ? playerHealthAtStart
    : Math.max(1, playerHealthAtStart - requestedHealthLoss);
  const healthLoss = Math.max(0, playerHealthAtStart - healthAfter);
  const healthRestored = Math.max(0, healthAfter - clampServer(state.health, 0, 100));
  state.health = healthAfter;
  if (healthLoss > 0) {
    state.naturalRecoveryAt = state.naturalRecoveryAt && typeof state.naturalRecoveryAt === "object"
      ? state.naturalRecoveryAt
      : { health: now, energy: now };
    state.naturalRecoveryAt.health = now;
  }
  const rawHeat = won ? Math.round(7 + action.alert * 0.15) : (action.alert >= 100 ? 18 : 8);
  const heatGain = Math.max(1, Math.round(rawHeat * 0.46));
  state.heat = clampServer(Number(state.heat) + heatGain, 0, 100);
  const requestedInfluenceLoss = getRobberyInfluencePenalty(action, outcome);
  const influenceLoss = Math.max(0, -changeServerInfluence(state, -requestedInfluenceLoss));
  let moneyGain = 0;
  let fameGain = 0;
  let influenceGain = 0;
  if (won) {
    const baseGain = action.target.mode === "shop" ? 30 : 18;
    const difficultyReward = getRobberyDifficultyRewardProfile(action.difficultyInfo?.label);
    const difficultyRewardMultiplier = Number(action.difficultyRewardMultiplier) || difficultyReward.money;
    const difficultyFameMultiplier = Number(action.difficultyFameMultiplier) || difficultyReward.fame;
    moneyGain = Math.max(5, Math.round(
      (baseGain + action.loot + Math.max(1, Number(state.cityLevel) || 1) * 4 + action.target.difficulty * 0.16)
      * action.rewardMultiplier
      * difficultyRewardMultiplier,
    ));
    fameGain = Math.max(1, Math.round((action.target.mode === "shop" ? 8 : 5) * difficultyFameMultiplier));
    state.money = Math.max(0, toSafeInt(state.money, 0, 0) + moneyGain);
    state.fame = Math.max(0, toSafeInt(state.fame, 0, 0) + fameGain);
    const district = Array.isArray(state.districts) ? state.districts[action.target.districtIndex] : null;
    if (district) {
      district.loyalty = clampServer(Number(district.loyalty) + (action.target.mode === "shop" ? 9 : 5), 0, 100);
      if (!district.controlled && district.loyalty >= 65) district.controlled = true;
    }
    advanceServerRobberyQuests(state, action.target.mode);
    const difficultyInfluence = action.difficultyInfo?.label === "Veszelyes"
      ? 3
      : action.difficultyInfo?.label === "Kockazatos"
        ? 2
        : 1;
    influenceGain = Math.max(0, changeServerInfluence(state, difficultyInfluence));
  }
  action.status = outcome;
  action.battleStarted = true;
  action.result = {
    success: won,
    reason,
    moneyGain,
    fameGain,
    heatGain,
    influenceGain,
    influenceLoss,
    healthLoss,
    healthRestored,
    healthAtStart: playerHealthAtStart,
    healthAfter,
    teamRewardMultiplier: action.rewardMultiplier || 1,
    difficultyRewardMultiplier: action.difficultyRewardMultiplier || 1,
  };
  action.message = reason;
  action.completedAt = now;
  return action.result;
}

async function playServerRobberyTurn(profileName, actionId, body) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const row = await selectActionSessionStmt.get(actionId, profileName);
    const profile = await buildProfileState(profileName);
    const action = parseActionSession(row);
    const now = Date.now();
    if (!profile || !action || row.action_status !== "active" || action.status !== "battle") {
      return { statusCode: 404, error: "Nincs folytathato kirablasi harc." };
    }
    if (Number(row.expires_at) <= now) return { statusCode: 409, error: "A kirablasi akcio ideje lejart." };
    if (!Array.isArray(action.selectedMemberIds) || action.selectedMemberIds.length === 0) {
      action.status = "cancelled";
      action.result = { success: false, reason: "Az egyeduli kirablas mar nem engedelyezett." };
      await writeRobberyActionSession(profileName, action, now);
      return {
        statusCode: 409,
        error: "Kirablashoz legalabb egy harckepes bandatag kell.",
        action: mapRobberyActionForClient(action),
      };
    }
    const correctedDifficultyInfo = getServerRobberyDifficultyInfo(profile.state, action.target.difficulty);
    if (action.combatVersion !== 2 && correctedDifficultyInfo.label !== action.difficultyInfo.label) {
      const oldTier = getServerRobberyTier(action.difficultyInfo.label);
      const newTier = getServerRobberyTier(correctedDifficultyInfo.label);
      action.defenders = action.defenders.map((enemy) => ({
        ...enemy,
        attack: Math.max(4, Math.round(enemy.attack * (newTier.attack / oldTier.attack))),
        defense: Math.max(3, Math.round(enemy.defense * (newTier.defense / oldTier.defense))),
        damageScale: newTier.damage,
      }));
      action.difficultyInfo = correctedDifficultyInfo;
      action.message = `A celpont valodi veszelyszintje: ${correctedDifficultyInfo.label}.`;
    }
    const expectedRound = Math.max(1, toSafeInt(body.expectedRound, 0, 0));
    if (expectedRound !== action.round) {
      return { statusCode: 409, error: "Ez a harci kor mar feldolgozasra kerult.", action: mapRobberyActionForClient(action) };
    }
    const tactic = ROBBERY_TACTICS[body.tactic] || ROBBERY_TACTICS.stealth;
    const livingAllies = action.allies.filter((ally) => ally.health > 0);
    const livingEnemies = action.defenders.filter((enemy) => enemy.health > 0);
    if (!livingAllies.length || !livingEnemies.length) return { statusCode: 409, error: "A harc mar nem folytathato." };
    const attacker = livingAllies[action.allyTurnIndex % livingAllies.length];
    const target = action.defenders.find((enemy) => enemy.id === String(body.targetId || "") && enemy.health > 0) || livingEnemies[0];
    const attack = getEffectiveUnitStat(attacker, "attack", 0.65);
    const defense = getEffectiveUnitStat(target, "defense", 0.6);
    const underdogBonus = getServerRobberyUnderdogBonus(action.battleMode);
    const effectiveTargetDefense = defense * (1 - underdogBonus.defenseIgnore);
    const strongBonus = tactic.strongAgainst === target.type ? 1.18 : 1;
    const bossHunterBonus = attacker.passiveId === "boss_hunter" && target.type === "boss" ? 1.28 : 1;
    const criticalHit = attacker.passiveId === "marksman" && Math.random() < 0.22;
    const criticalBonus = criticalHit ? 1.65 : 1;
    const rawDamage = Math.round(
      (4 + attack * 0.55 + attacker.level * 0.3 + randomServerInt(-3, 3) - effectiveTargetDefense * 0.28)
      * tactic.damage
      * strongBonus
      * bossHunterBonus
      * criticalBonus
      * underdogBonus.allyDamageBoost,
    );
    const damage = clampServer(
      rawDamage,
      Math.max(2, Math.round(target.maxHealth * 0.025)),
      Math.max(8, Math.round(target.maxHealth * 0.34)),
    );
    target.health = clampServer(target.health - damage, 0, target.maxHealth);
    action.loot += randomServerInt(3, 7) + (target.health <= 0 ? randomServerInt(6, 12) : 0);
    action.alert = clampServer(action.alert + tactic.alert + randomServerInt(0, 2), 0, 100);
    const attackNotes = [
      criticalHit ? "KRITIKUS LOVES!" : "",
      bossHunterBonus > 1 ? "A Fonokvadasz kepesseg aktiv." : "",
    ].filter(Boolean).join(" ");
    action.message = `${attacker.name} ${damage} sebzest okozott ${target.name} ellen.${attackNotes ? ` ${attackNotes}` : ""}`;

    const enemiesAfterAttack = action.defenders.filter((enemy) => enemy.health > 0);
    if (enemiesAfterAttack.length) {
      const enemy = enemiesAfterAttack[(action.round - 1) % enemiesAfterAttack.length];
      const targets = action.allies.filter((ally) => ally.health > 0);
      const difficultyLabel = action.difficultyInfo.label;
      const focusChance = difficultyLabel === "Veszelyes" ? 0.68 : difficultyLabel === "Kockazatos" ? 0.42 : 0.18;
      const weakestTarget = [...targets].sort((left, right) => (
        (left.health / Math.max(1, left.maxHealth)) - (right.health / Math.max(1, right.maxHealth))
      ))[0];
      const guardian = targets.find((ally) => ally.passiveId === "guardian");
      const guardianTaunt = guardian && Math.random() < 0.45;
      const allyTarget = guardianTaunt
        ? guardian
        : Math.random() < focusChance
          ? weakestTarget
          : targets[randomServerInt(0, targets.length - 1)];
      const enemyAttack = getEffectiveUnitStat(enemy, "attack", 0.65);
      const allyDefense = getEffectiveUnitStat(allyTarget, "defense", 0.6);
      const guardianReduction = allyTarget.passiveId === "guardian" ? 0.78 : 1;
      const rawRetaliation = Math.round(
        (4 + enemyAttack * 0.52 + enemy.level * 0.28 + randomServerInt(-3, 3) - allyDefense * 0.3)
        * (enemy.damageScale || 1)
        * guardianReduction
        * underdogBonus.enemyDamageReduction,
      );
      const retaliation = clampServer(
        rawRetaliation,
        Math.max(2, Math.round(allyTarget.maxHealth * 0.02)),
        Math.max(8, Math.round(allyTarget.maxHealth * 0.32)),
      );
      allyTarget.health = clampServer(allyTarget.health - retaliation, 0, allyTarget.maxHealth);
      action.message += ` ${enemy.name} visszavagott ${allyTarget.name} ellen: -${retaliation} HP.${guardianTaunt ? " Enzo magara vonta a tamadast." : ""}`;
    }
    action.allyTurnIndex += 1;
    action.round += 1;
    action.teamPower = getRobberyTeamPower(action.allies, true);
    action.enemyPower = getRobberyTeamPower(action.defenders, true);
    action.estimatedWinChance = estimateServerRobberyWinChance(action.allies, action.enemyPower, action.battleMode);

    const state = { ...profile.state, crewMembers: Array.isArray(profile.state.crewMembers) ? [...profile.state.crewMembers] : [] };
    const remainingAllies = action.allies.filter((ally) => ally.health > 0);
    const remainingEnemies = action.defenders.filter((enemy) => enemy.health > 0);
    let result = null;
    if (!remainingEnemies.length) {
      result = finishServerRobberyState(profileName, state, action, "won", `${action.target.name} kirablasa sikerult.`, now);
    } else if (!remainingAllies.length) {
      result = finishServerRobberyState(profileName, state, action, "lost", "A teljes csapatod elesett.", now);
    } else if (action.alert >= 100 && action.round >= 40) {
      result = finishServerRobberyState(profileName, state, action, "lost", "Megerkezett a rendorseg.", now);
    } else {
      syncRobberyHealthToState(state, action);
    }
    await persistPvpState(profileName, state, now);
    await writeRobberyActionSession(profileName, action, now);
    if (result) {
      await logEvent(profileName, result.success ? "robbery_won" : "robbery_lost", result.reason, {
        actionId,
        spotId: action.target.spotId,
        ...result,
      }, now);
    }
    return {
      statusCode: 200,
      payload: { ok: true, action: mapRobberyActionForClient(action), state: buildRobberyClientState(state) },
    };
  });
}

async function retreatServerRobbery(profileName, actionId) {
  return db.transaction(async () => {
    await lockPlayerStmt.get(profileName);
    const row = await selectActionSessionStmt.get(actionId, profileName);
    const profile = await buildProfileState(profileName);
    const action = parseActionSession(row);
    if (!profile || !action || row.action_status !== "active") return { statusCode: 404, error: "Nincs aktiv kirablasi akcio." };
    const now = Date.now();
    const state = { ...profile.state, crewMembers: Array.isArray(profile.state.crewMembers) ? [...profile.state.crewMembers] : [] };
    if (action.allies?.length) syncRobberyHealthToState(state, action);
    action.alert = clampServer(Number(action.alert) + 10, 0, 100);
    finishServerRobberyState(profileName, state, action, "retreated", "A banda zsakmany nelkul visszavonult.", now);
    await persistPvpState(profileName, state, now);
    await writeRobberyActionSession(profileName, action, now);
    await logEvent(profileName, "robbery_retreated", "Kirablasi akcio megszakitva", { actionId }, now);
    return { statusCode: 200, payload: { ok: true, action: mapRobberyActionForClient(action), state: buildRobberyClientState(state) } };
  });
}

async function handleApiRequest(request, response, pathname) {
  if (pathname === "/api/session" && request.method === "GET") {
    const profileName = getActiveProfileFromRequest(request);
    const player = profileName ? await selectPlayerStmt.get(profileName) : null;
    sendJson(response, 200, { profileName, active: Boolean(profileName), exists: Boolean(player) });
    return true;
  }

  if (pathname === "/api/session" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const profileName = normalizeProfileName(body.profileName);
      if (!profileName) {
        sendJson(response, 400, { error: "Missing profile name" });
        return true;
      }
      setActiveProfileCookie(response, profileName);
      const player = await selectPlayerStmt.get(profileName);
      sendJson(response, 200, { ok: true, profileName, exists: Boolean(player) });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Invalid session payload" });
      return true;
    }
  }

  if (pathname === "/api/session" && request.method === "DELETE") {
    clearActiveProfileCookie(response);
    sendEmpty(response);
    return true;
  }

  if (pathname === "/api/health") {
    await db.ping();
    const counts = await countPlayersStmt.get();
    sendJson(response, 200, {
      ok: true,
      databaseType: "mysql",
      database: "connected",
      profiles: Number(counts?.profile_count || 0),
    });
    return true;
  }

  if (pathname === "/api/game-config" && request.method === "GET") {
    const entries = await listGameConfigEntriesStmt.all();
    const configs = {};
    for (const row of entries) {
      const payload = parseJsonSafely(row.payload_json, null);
      if (payload === null) continue;
      configs[row.config_key] = {
        group: row.config_group,
        payload,
        updatedAt: row.updated_at,
      };
    }
    sendJson(response, 200, { configs });
    return true;
  }

  if (pathname === "/api/players" && request.method === "GET") {
    const players = (await listPlayersStmt.all()).map(mapPlayerRow);
    sendJson(response, 200, { players });
    return true;
  }

  if (pathname.startsWith("/api/profile/") && request.method === "GET") {
    const encodedName = pathname.slice("/api/profile/".length);
    const activeProfileName = getActiveProfileFromRequest(request);
    const profileName = encodedName === "current"
      ? activeProfileName
      : normalizeProfileName(decodeURIComponent(encodedName));
    if (!activeProfileName || !profileName) {
      sendJson(response, 401, { error: "Missing active profile" });
      return true;
    }
    if (profileName !== activeProfileName) {
      sendJson(response, 403, { error: "Profile access denied" });
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
    const activeProfileName = getActiveProfileFromRequest(request);
    if (!activeProfileName) {
      sendJson(response, 401, { error: "Missing active profile" });
      return true;
    }
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
          influence: normalizeServerInfluence(state.influence, SERVER_STARTING_INFLUENCE),
          cityLevel: state.cityLevel ?? 1,
          npcVillageVictories: state.npcVillageVictories ?? 0,
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
    const profileName = getActiveProfileFromRequest(request);
    const limit = Math.min(500, Math.max(1, toSafeInt(url.searchParams.get("limit"), 100, 1)));
    const ownerFilter = profileName || null;
    const items = (await listMarketItemsStmt.all(ownerFilter, ownerFilter, limit)).map(mapMarketItemRow);
    sendJson(response, 200, { items });
    return true;
  }

  if (pathname === "/api/clans/dashboard" && request.method === "GET") {
    const profileName = getActiveProfileFromRequest(request);
    if (!profileName) {
      sendJson(response, 401, { error: "Nincs aktív játékos." });
      return true;
    }
    await expireClanWarsStmt.run(Date.now());
    const membership = await selectClanForMemberStmt.get(profileName);
    const clans = (await listClansStmt.all()).map(mapClanRow);
    if (!membership) {
      sendJson(response, 200, { clan: null, members: [], candidates: [], rivals: clans, wars: [] });
      return true;
    }
    const clan = {
      ...mapClanRow(membership),
      memberRole: membership.member_role,
      contribution: membership.contribution,
      joinedAt: membership.joined_at,
    };
    await ensureDefaultClanRoles(clan.clanId);
    const access = await getClanAccess(profileName);
    const [members, candidates, wars, roleRows, invitations] = await Promise.all([
      listClanMembersStmt.all(clan.clanId),
      listClanRecruitCandidatesStmt.all(profileName),
      listClanWarsStmt.all(clan.clanId, clan.clanId),
      listClanRolesStmt.all(clan.clanId),
      listClanInvitationsStmt.all(clan.clanId),
    ]);
    sendJson(response, 200, {
      clan,
      members,
      candidates,
      roles: roleRows.map(mapClanRoleRow),
      permissions: access?.permissions || {},
      isBoss: Boolean(access?.isBoss),
      invitations: invitations.map((entry) => ({
        invitationId: entry.invitation_id,
        profileName: entry.invited_profile_name,
        displayName: entry.display_name,
        status: entry.invitation_status,
        createdAt: entry.created_at,
        expiresAt: entry.expires_at,
      })),
      rivals: clans.filter((entry) => entry.clanId !== clan.clanId),
      wars: wars.map((row) => ({
        warId: row.war_id,
        attackerClanId: row.attacker_clan_id,
        attackerClanName: row.attacker_clan_name,
        defenderClanId: row.defender_clan_id,
        defenderClanName: row.defender_clan_name,
        attackerScore: row.attacker_score,
        defenderScore: row.defender_score,
        status: row.war_status,
        startedAt: row.started_at,
        endsAt: row.ends_at,
      })),
    });
    return true;
  }

  if (pathname === "/api/clans" && request.method === "GET") {
    const clans = (await listClansStmt.all()).map(mapClanRow);
    sendJson(response, 200, { clans });
    return true;
  }

  if (pathname === "/api/clans" && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      const player = profileName ? await selectPlayerStmt.get(profileName) : null;
      if (!profileName || !player) {
        sendJson(response, 401, { error: "Nincs aktív játékos." });
        return true;
      }
      if (await selectClanMembershipStmt.get(profileName)) {
        sendJson(response, 409, { error: "Már tagja vagy egy klánnak." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const clanName = String(body.clanName || "").trim().slice(0, 40);
      const description = String(body.description || "").trim().slice(0, 220);
      if (clanName.length < 3) {
        sendJson(response, 400, { error: "A család neve legalább 3 karakter legyen." });
        return true;
      }
      const slug = clanName.toLowerCase().replace(/[^a-z0-9áéíóöőúüű]+/gi, "-").replace(/^-|-$/g, "") || "csalad";
      const clanId = `clan-${Date.now().toString(36)}-${slug}`.slice(0, 128);
      const now = Date.now();
      await db.transaction(async () => {
        await insertClanStmt.run(clanId, clanName, profileName, description, now, now);
        await insertClanMemberStmt.run(clanId, profileName, "fonok", 0, now);
        await ensureDefaultClanRoles(clanId, now);
      });
      sendJson(response, 201, { ok: true, clanId, clanName });
      return true;
    } catch (error) {
      const duplicateName = error?.code === "ER_DUP_ENTRY";
      sendJson(response, duplicateName ? 409 : 400, { error: duplicateName ? "Ez a klánnév már foglalt." : (error.message || "A klán alapítása sikertelen.") });
      return true;
    }
  }

  if (pathname === "/api/clans/members" && request.method === "POST") {
    try {
      const requester = getActiveProfileFromRequest(request);
      const access = await getClanAccess(requester);
      const clan = access?.membership;
      if (!clan || !access.permissions.inviteMembers) {
        sendJson(response, 403, { error: "A rangod nem küldhet klánmeghívót." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const profileName = normalizeProfileName(body.profileName);
      if (!profileName || !await selectPlayerStmt.get(profileName)) {
        sendJson(response, 404, { error: "A játékos nem található." });
        return true;
      }
      if (await selectClanMembershipStmt.get(profileName)) {
        sendJson(response, 409, { error: "A játékos már egy klán tagja." });
        return true;
      }
      const now = Date.now();
      const pendingInvitation = await selectPendingClanInvitationStmt.get(clan.clan_id, profileName, now);
      if (pendingInvitation) {
        sendJson(response, 409, { error: "Ennek a játékosnak már elküldtétek a meghívót." });
        return true;
      }
      const expiresAt = now + (7 * 24 * 60 * 60 * 1000);
      const invitationResult = await insertClanInvitationStmt.run(clan.clan_id, profileName, requester, now, expiresAt);
      const invitationId = Number(invitationResult.insertId);
      const title = `Egy szék vár rád a ${clan.clan_name} asztalánál`;
      const messageBody = `${requester} üzenete: a ${clan.clan_name} család felfigyelt rád. Ha elfogadod a meghívást, helyet kapsz az asztalnál — de ne feledd: a családba belépni döntés, a hűség pedig eskü.`;
      const messageResult = await createMessage(
        profileName,
        requester,
        "player",
        title,
        messageBody,
        {
          kind: "clan_invitation",
          invitationId,
          invitationStatus: "pending",
          clanId: clan.clan_id,
          clanName: clan.clan_name,
          invitedBy: requester,
          expiresAt,
        },
        now,
      );
      await updateClanInvitationMessageStmt.run(Number(messageResult.insertId), invitationId);
      sendJson(response, 201, { ok: true, profileName, invitationId, message: "A meghívó üzenetet elküldtük." });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A játékos felvétele sikertelen." });
      return true;
    }
  }

  if (pathname.startsWith("/api/clans/invitations/") && pathname.endsWith("/respond") && request.method === "POST") {
    try {
      const recipient = getActiveProfileFromRequest(request);
      const invitationId = toSafeInt(pathname.slice("/api/clans/invitations/".length, -"/respond".length), 0, 1);
      const invitation = invitationId ? await selectClanInvitationStmt.get(invitationId) : null;
      if (!recipient || !invitation || invitation.invited_profile_name !== recipient) {
        sendJson(response, 404, { error: "A meghívó nem található." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const decision = body.decision === "accept" ? "accepted" : body.decision === "decline" ? "declined" : "";
      if (!decision) {
        sendJson(response, 400, { error: "Érvénytelen válasz." });
        return true;
      }
      if (invitation.invitation_status !== "pending") {
        sendJson(response, 409, { error: "Erre a meghívóra már válaszoltál.", status: invitation.invitation_status });
        return true;
      }
      const now = Date.now();
      if (Number(invitation.expires_at) <= now) {
        await updateClanInvitationStatusStmt.run("expired", now, invitationId);
        if (invitation.message_id) await updateClanInvitationMessagePayloadStmt.run("expired", invitation.message_id);
        sendJson(response, 410, { error: "A meghívó már lejárt." });
        return true;
      }
      if (decision === "accepted" && await selectClanMembershipStmt.get(recipient)) {
        sendJson(response, 409, { error: "Már tagja vagy egy másik klánnak." });
        return true;
      }
      await db.transaction(async () => {
        if (decision === "accepted") {
          await insertClanMemberStmt.run(invitation.clan_id, recipient, "katona", 0, now);
        }
        await updateClanInvitationStatusStmt.run(decision, now, invitationId);
        if (invitation.message_id) await updateClanInvitationMessagePayloadStmt.run(decision, invitation.message_id);
      });
      const clan = await selectClanByIdStmt.get(invitation.clan_id);
      sendJson(response, 200, {
        ok: true,
        status: decision,
        clanName: clan?.clan_name || "a család",
        message: decision === "accepted" ? "Mostantól a család tagja vagy." : "A meghívót elutasítottad.",
      });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A meghívóra nem sikerült válaszolni." });
      return true;
    }
  }

  if (pathname === "/api/clans/member-role" && request.method === "PUT") {
    try {
      const requester = getActiveProfileFromRequest(request);
      const access = await getClanAccess(requester);
      if (!access?.isBoss) {
        sendJson(response, 403, { error: "Csak a családfő oszthat rangot." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const profileName = normalizeProfileName(body.profileName);
      const roleKey = String(body.roleKey || "").slice(0, 32);
      const targetMembership = profileName ? await selectClanMembershipStmt.get(profileName) : null;
      const role = roleKey ? await selectClanRoleStmt.get(access.membership.clan_id, roleKey) : null;
      if (!targetMembership || targetMembership.clan_id !== access.membership.clan_id || !role) {
        sendJson(response, 404, { error: "A tag vagy a rang nem található." });
        return true;
      }
      if (profileName === requester || targetMembership.member_role === "fonok" || roleKey === "fonok") {
        sendJson(response, 409, { error: "A családfő rangja nem módosítható." });
        return true;
      }
      await updateClanMemberRoleStmt.run(roleKey, access.membership.clan_id, profileName);
      sendJson(response, 200, { ok: true, profileName, roleKey });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A rang kiosztása sikertelen." });
      return true;
    }
  }

  if (pathname.startsWith("/api/clans/members/") && request.method === "DELETE") {
    try {
      const requester = getActiveProfileFromRequest(request);
      const access = await getClanAccess(requester);
      if (!access?.isBoss) {
        sendJson(response, 403, { error: "Csak a családfő rúghat ki tagot." });
        return true;
      }
      const profileName = normalizeProfileName(decodeURIComponent(pathname.slice("/api/clans/members/".length)));
      if (!profileName || profileName === requester) {
        sendJson(response, 400, { error: "Saját magadnál a kilépést használd." });
        return true;
      }
      const membership = await selectClanMembershipStmt.get(profileName);
      if (!membership || membership.clan_id !== access.membership.clan_id || membership.member_role === "fonok") {
        sendJson(response, 404, { error: "Ez a játékos nem rúgható ki ebből a klánból." });
        return true;
      }
      const now = Date.now();
      await db.transaction(async () => {
        await deleteClanMemberStmt.run(access.membership.clan_id, profileName);
        await createMessage(
          profileName,
          requester,
          "player",
          `Lezárult a tagságod a ${access.membership.clan_name} családban`,
          `${requester} döntése alapján többé nem vagy a ${access.membership.clan_name} család tagja. Az ajtó bezárult, az utca azonban továbbra is nyitva áll előtted.`,
          { kind: "clan_membership_removed", clanId: access.membership.clan_id, clanName: access.membership.clan_name },
          now,
        );
      });
      sendJson(response, 200, { ok: true, profileName });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A tag kirúgása sikertelen." });
      return true;
    }
  }

  if (pathname === "/api/clans/leave" && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      const access = await getClanAccess(profileName);
      if (!access) {
        sendJson(response, 404, { error: "Nem vagy klántag." });
        return true;
      }
      const clanId = access.membership.clan_id;
      const clanName = access.membership.clan_name;
      const now = Date.now();
      let successor = null;
      let dissolved = false;
      await db.transaction(async () => {
        if (access.isBoss) {
          successor = await selectClanSuccessorStmt.get(clanId, profileName);
          if (successor) {
            await deleteClanMemberStmt.run(clanId, profileName);
            await updateClanMemberRoleStmt.run("fonok", clanId, successor.profile_name);
            await updateClanBossStmt.run(successor.profile_name, now, clanId);
            await createMessage(
              successor.profile_name,
              profileName,
              "player",
              `A ${clanName} család vezetése rád szállt`,
              `${profileName} elhagyta a családot. A megmaradt emberek mostantól rád néznek: te lettél a családfő.`,
              { kind: "clan_leadership_transfer", clanId, clanName },
              now,
            );
          } else {
            dissolved = true;
            await deleteClanByIdStmt.run(clanId);
          }
        } else {
          await deleteClanMemberStmt.run(clanId, profileName);
        }
      });
      sendJson(response, 200, {
        ok: true,
        clanName,
        dissolved,
        newBossProfileName: successor?.profile_name || null,
      });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A klánból való kilépés sikertelen." });
      return true;
    }
  }

  if (pathname === "/api/clans/roles" && request.method === "PUT") {
    try {
      const requester = getActiveProfileFromRequest(request);
      const access = await getClanAccess(requester);
      if (!access?.isBoss) {
        sendJson(response, 403, { error: "Csak a családfő állíthatja a rangjogokat." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const roleKey = String(body.roleKey || "").slice(0, 32);
      const existingRole = roleKey ? await selectClanRoleStmt.get(access.membership.clan_id, roleKey) : null;
      if (!existingRole || roleKey === "fonok") {
        sendJson(response, 409, { error: "A családfő jogai nem módosíthatók." });
        return true;
      }
      const roleName = String(body.roleName || existingRole.role_name).trim().slice(0, 64);
      if (roleName.length < 2) {
        sendJson(response, 400, { error: "A rang neve legalább 2 karakter legyen." });
        return true;
      }
      const permissions = normalizeClanPermissions(body.permissions);
      await upsertClanRoleStmt.run(
        access.membership.clan_id,
        roleKey,
        roleName,
        existingRole.role_priority,
        JSON.stringify(permissions),
        existingRole.is_system,
        Date.now(),
      );
      sendJson(response, 200, { ok: true, roleKey, roleName, permissions });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A rangjogok mentése sikertelen." });
      return true;
    }
  }

  if (pathname === "/api/clans/wars" && request.method === "POST") {
    try {
      const requester = getActiveProfileFromRequest(request);
      const access = await getClanAccess(requester);
      const clan = access?.membership;
      if (!clan || !access.permissions.declareWar) {
        sendJson(response, 403, { error: "A rangod nem indíthat bandaháborút." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const targetClanId = String(body.targetClanId || "").slice(0, 128);
      const targetClan = targetClanId ? await selectClanByIdStmt.get(targetClanId) : null;
      if (!targetClan || targetClan.clan_id === clan.clan_id) {
        sendJson(response, 400, { error: "Érvénytelen rivális család." });
        return true;
      }
      const activeWar = await findActiveClanWarStmt.get(clan.clan_id, targetClanId, targetClanId, clan.clan_id);
      if (activeWar) {
        sendJson(response, 409, { error: "Ezzel a családdal már folyamatban van egy háború." });
        return true;
      }
      const now = Date.now();
      const endsAt = now + (24 * 60 * 60 * 1000);
      const result = await insertClanWarStmt.run(clan.clan_id, targetClanId, now, endsAt);
      sendJson(response, 201, { ok: true, warId: result.insertId, endsAt });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A bandaháború indítása sikertelen." });
      return true;
    }
  }

  if (pathname === "/api/events" && request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const profileName = getActiveProfileFromRequest(request);
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
      const profileName = getActiveProfileFromRequest(request);
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
    const profileName = getActiveProfileFromRequest(request);
    const limit = Math.min(200, Math.max(1, toSafeInt(url.searchParams.get("limit"), 60, 1)));
    if (!profileName) {
      sendJson(response, 400, { error: "Missing profile name" });
      return true;
    }
    const messages = (await listMessagesByRecipientStmt.all(profileName, limit))
      .map(mapMessageRow)
      .filter((message) => message.recipientProfileName === profileName);
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
    const inbox = messages
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, limit);
    const unreadCount = Number((await countUnreadMessagesStmt.get(profileName))?.unread_count || 0);
    sendJson(response, 200, {
      messages: inbox.filter((message) => message.messageType === "player" && message.senderProfileName && message.senderProfileName !== profileName),
      unreadCount,
    });
    return true;
  }

  if (pathname === "/api/world-chat" && request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);
    const profileName = getActiveProfileFromRequest(request);
    if (!profileName || !await selectPlayerStmt.get(profileName)) {
      sendJson(response, 401, { error: "A világchat használatához be kell jelentkezni." });
      return true;
    }
    const limit = Math.min(80, Math.max(1, toSafeInt(url.searchParams.get("limit"), 40, 1)));
    const rows = await listWorldChatMessagesStmt.all(limit);
    sendJson(response, 200, {
      messages: rows.reverse().map((row) => ({
        id: Number(row.id) || 0,
        senderProfileName: String(row.sender_profile_name || ""),
        body: String(row.body || ""),
        createdAt: Number(row.created_at) || 0,
      })),
    });
    return true;
  }

  if (pathname === "/api/world-chat" && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName || !await selectPlayerStmt.get(profileName)) {
        sendJson(response, 401, { error: "A világchat használatához be kell jelentkezni." });
        return true;
      }
      const now = Date.now();
      const lastSentAt = Number(worldChatLastSentAt.get(profileName)) || 0;
      if (now - lastSentAt < 1500) {
        sendJson(response, 429, { error: "Várj egy pillanatot a következő üzenet előtt." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const payload = rawBody ? JSON.parse(rawBody) : {};
      const messageBody = String(payload.body || "").replace(/\s+/g, " ").trim().slice(0, 120);
      if (!messageBody) {
        sendJson(response, 400, { error: "Az üzenet nem lehet üres." });
        return true;
      }
      const result = await insertWorldChatMessageStmt.run(profileName, messageBody, now);
      worldChatLastSentAt.set(profileName, now);
      sendJson(response, 201, {
        message: {
          id: Number(result.insertId) || 0,
          senderProfileName: profileName,
          body: messageBody,
          createdAt: now,
        },
      });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A világchat-üzenet nem küldhető el." });
      return true;
    }
  }

  if (pathname === "/api/messages" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const senderProfileName = getActiveProfileFromRequest(request);
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
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName) {
        sendJson(response, 400, { error: "Missing profile name" });
        return true;
      }
      const now = Date.now();
      await markMessagesReadStmt.run(now, profileName);
      sendJson(response, 200, { ok: true, unreadCount: 0 });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Invalid read payload" });
      return true;
    }
  }

  if (pathname.startsWith("/api/messages/") && request.method === "DELETE") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      const messageId = toSafeInt(decodeURIComponent(pathname.slice("/api/messages/".length)), 0, 1);
      if (!profileName || !messageId) {
        sendJson(response, 400, { error: "Missing profile name or message id" });
        return true;
      }
      await deleteReceivedMessageStmt.run(messageId, profileName);
      sendJson(response, 200, { ok: true, messageId });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Invalid delete request" });
      return true;
    }
  }

  const progressionActionMatch = pathname.match(/^\/api\/actions\/progression\/(recovery|protection)$/);
  if (progressionActionMatch && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName) {
        sendJson(response, 401, { error: "Ehhez a muvelethez be kell jelentkezni." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const result = progressionActionMatch[1] === "recovery"
        ? await runRecoveryProgressionCommand(profileName, body)
        : await runProtectionProgressionCommand(profileName, body);
      sendJson(response, result.statusCode, result.payload || {
        error: result.error,
        cooldownAt: result.cooldownAt,
        resetAt: result.resetAt,
      });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A fejlodesi muvelet nem hajthato vegre." });
      return true;
    }
  }

  if (pathname === "/api/actions/progression/quest" && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName) {
        sendJson(response, 401, { error: "Ehhez a muvelethez be kell jelentkezni." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const result = await runQuestProgressionCommand(profileName, body);
      sendJson(response, result.statusCode, result.payload || { error: result.error });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A kuldetesmuvelet nem hajthato vegre." });
      return true;
    }
  }

  if (pathname === "/api/actions/progression/empire" && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName) {
        sendJson(response, 401, { error: "Ehhez a muvelethez be kell jelentkezni." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const result = await runEmpireProgressionCommand(profileName, body);
      sendJson(response, result.statusCode, result.payload || { error: result.error });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A birodalommuvelet nem hajthato vegre." });
      return true;
    }
  }

  if (pathname === "/api/actions/harbor" && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName) {
        sendJson(response, 401, { error: "Ehhez a muvelethez be kell jelentkezni." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const result = await runHarborCommand(profileName, body);
      sendJson(response, result.statusCode, result.payload || { error: result.error });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A kikotoi muvelet nem hajthato vegre." });
      return true;
    }
  }

  if (pathname === "/api/actions/garage" && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName) {
        sendJson(response, 401, { error: "Ehhez a muvelethez be kell jelentkezni." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const result = await runGarageCommand(profileName, body);
      sendJson(response, result.statusCode, result.payload || { error: result.error, resetAt: result.resetAt });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A garazsmuvelet nem hajthato vegre." });
      return true;
    }
  }

  const economyActionMatch = pathname.match(/^\/api\/actions\/economy\/(crew|equip|market-buy|market-sell|craft)$/);
  if (economyActionMatch && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName) {
        sendJson(response, 401, { error: "Ehhez a muvelethez be kell jelentkezni." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const command = economyActionMatch[1];
      const result = command === "crew"
        ? await runCrewEconomyCommand(profileName, body)
        : command === "equip"
          ? await runEquipEconomyCommand(profileName, body)
          : command === "market-buy"
            ? await runMarketBuyCommand(profileName, body)
            : command === "market-sell"
              ? await runMarketSellCommand(profileName, body)
              : await runCraftEconomyCommand(profileName, body);
      sendJson(response, result.statusCode, result.payload || { error: result.error });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A gazdasagi muvelet nem hajthato vegre." });
      return true;
    }
  }

  if (pathname === "/api/actions/robbery/start" && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName) {
        sendJson(response, 401, { error: "A kirablashoz be kell jelentkezni." });
        return true;
      }
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const result = await startServerRobbery(profileName, body);
      sendJson(response, result.statusCode, result.payload || { error: result.error });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A kirablasi akcio nem indithato." });
      return true;
    }
  }

  const robberyActionMatch = pathname.match(/^\/api\/actions\/robbery\/([^/]+)\/(engage|turn|retreat)$/);
  if (robberyActionMatch && request.method === "POST") {
    try {
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName) {
        sendJson(response, 401, { error: "A kirablashoz be kell jelentkezni." });
        return true;
      }
      const actionId = String(decodeURIComponent(robberyActionMatch[1] || "")).slice(0, 64);
      const operation = robberyActionMatch[2];
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const result = operation === "engage"
        ? await engageServerRobbery(profileName, actionId, body)
        : operation === "turn"
          ? await playServerRobberyTurn(profileName, actionId, body)
          : await retreatServerRobbery(profileName, actionId);
      sendJson(response, result.statusCode, result.payload || { error: result.error, action: result.action });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "A kirablasi akcio nem folytathato." });
      return true;
    }
  }

  if (pathname === "/api/pvp/attack" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const attackerProfileName = getActiveProfileFromRequest(request);
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
      ensureServerInfluenceState(attackerState);
      ensureServerInfluenceState(defenderState);
      const now = Date.now();
      const roll = 0.88 + Math.abs(Math.sin(now * 0.000013 + attackerCombat.attack)) * 0.28;
      const attackScore = attackerCombat.attack * roll;
      const defenseScore = defenderCombat.defense * (0.92 + Math.abs(Math.cos(now * 0.000017 + defenderCombat.defense)) * 0.22);
      const attackerWon = attackScore >= defenseScore;
      const influenceLoss = attackerWon ? 0 : Math.max(0, -changeServerInfluence(attackerState, -3));
      const stolenMoney = attackerWon ? Math.max(1, Math.floor(Math.max(0, Number(defenderState.money) || 0) * 0.03)) : 0;
      const healthLoss = attackerWon
        ? Math.max(4, Math.min(12, Math.round(defenderCombat.defense / Math.max(8, attackerCombat.attack) * 8)))
        : Math.max(10, Math.min(25, Math.round(defenderCombat.defense / Math.max(6, attackerCombat.attack) * 16)));

      attackerState.energy = Math.max(0, toSafeInt(attackerState.energy, 0, 0) - 12);
      attackerState.health = Math.max(1, toSafeInt(attackerState.health, 1, 0) - healthLoss);
      attackerState.fame = Math.max(0, toSafeInt(attackerState.fame, 0, 0) + (attackerWon ? 12 : 2));
      const influenceGain = attackerWon ? Math.max(0, changeServerInfluence(attackerState, 2)) : 0;
      const defenderInfluenceGain = attackerWon ? 0 : Math.max(0, changeServerInfluence(defenderState, 2));
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
        const defenderMessageBody = !attackerWon && defenderInfluenceGain > 0
          ? `${defenderBody} +${defenderInfluenceGain}% befolyas.`
          : defenderBody;
        await createMessage(
          defenderProfileName,
          attackerProfileName,
          "pvp",
          attackerWon ? "Támadás érte a bázisodat" : "Visszavert támadás",
          defenderMessageBody,
          { attackerWon, stolenMoney, attackerAttack: attackerCombat.attack, defenderDefense: defenderCombat.defense, influenceGain: defenderInfluenceGain },
          now,
        );
        await logEvent(attackerProfileName, "pvp_attack", "PvP támadás végrehajtva", {
          body: attackerWon
            ? `${defenderProfileName} bázisát legyőzted, zsákmány: ${stolenMoney} $.`
            : `${defenderProfileName} bázisa visszaverte a támadásodat.`,
          defenderProfileName,
          attackerWon,
          stolenMoney,
          influenceGain,
          defenderInfluenceGain,
          influenceLoss,
        }, now);
      });

      sendJson(response, 200, {
        ok: true,
        attackerWon,
        stolenMoney,
        influenceGain,
        defenderInfluenceGain,
        influenceLoss,
        healthLoss,
        attackerAttack: attackerCombat.attack,
        defenderDefense: defenderCombat.defense,
        state: buildEconomyClientState(attackerState),
      });
      return true;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "PvP attack failed" });
      return true;
    }
  }

  if (pathname === "/api/saves" && request.method === "GET") {
    const players = await listPlayersStmt.all();
    const saves = (await Promise.all(players.map(async (player) => {
      const profile = await buildProfileState(player.profile_name);
      const state = profile?.state || {};
      return {
        profileName: player.profile_name,
        fame: Number.isFinite(Number(state.fame)) ? Math.round(Number(state.fame)) : 0,
        money: Number.isFinite(Number(state.money)) ? Math.round(Number(state.money)) : 0,
        day: Number.isFinite(Number(state.day)) ? Math.round(Number(state.day)) : 1,
        heat: Number.isFinite(Number(state.heat)) ? Math.round(Number(state.heat)) : 0,
        cityLevel: Number.isFinite(Number(state.cityLevel)) ? Math.round(Number(state.cityLevel)) : 1,
        worldBaseLotId: typeof state.worldBaseLotId === "string" ? state.worldBaseLotId : null,
        worldBaseLevel: Number.isFinite(Number(state.worldBaseLevel)) ? Math.max(1, Math.round(Number(state.worldBaseLevel))) : 1,
        updatedAt: profile?.updatedAt ?? player.updated_at,
        createdAt: profile?.createdAt ?? player.registered_at,
      };
    }))).filter(Boolean);
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
      const profileName = getActiveProfileFromRequest(request);
      if (!profileName || !body || typeof body.state !== "object") {
        sendJson(response, 400, { error: "Missing active profile or state payload" });
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
  const activeProfileName = getActiveProfileFromRequest(request);
  const profileName = encodedName === "current"
    ? activeProfileName
    : normalizeProfileName(decodeURIComponent(encodedName));
  if (!activeProfileName || !profileName) {
    sendJson(response, 401, { error: "Missing active profile" });
    return true;
  }
  if (profileName !== activeProfileName) {
    sendJson(response, 403, { error: "Profile access denied" });
    return true;
  }

  if (request.method === "GET") {
    const profile = await buildProfileState(profileName);
    if (!profile) {
      sendJson(response, 200, { found: false });
      return true;
    }
    sendJson(response, 200, {
      found: true,
      profileName,
      state: profile.state,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
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
      if (getActiveProfileFromRequest(request) === profileName) {
        clearActiveProfileCookie(response);
      }
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
  const relativePath = path.relative(ROOT_DIR, filePath);
  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) return null;
  return filePath;
}

const PUBLIC_STATIC_EXTENSIONS = new Set([
  ".css", ".gif", ".html", ".ico", ".jpeg", ".jpg", ".js", ".mjs",
  ".mp3", ".mtl", ".obj", ".ogg", ".png", ".svg", ".wav", ".webm",
  ".webp", ".woff", ".woff2",
]);
const PRIVATE_STATIC_DIRECTORIES = new Set([
  ".agents", ".chrome-check", ".codex", ".git", "backups", "data",
  "node_modules", "performance", "scripts", "tmp", "tools",
]);
const PRIVATE_STATIC_FILES = new Set([
  "mysql-database.js", "package-lock.json", "package.json", "pnpm-lock.yaml",
  "server.js", "service-worker.js.map",
]);

function isPublicStaticPath(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) return false;
  const segments = relativePath.split(path.sep);
  if (segments.some((segment) => !segment || segment.startsWith("."))) return false;
  if (PRIVATE_STATIC_DIRECTORIES.has(segments[0].toLowerCase())) return false;
  const fileName = path.basename(relativePath).toLowerCase();
  if (PRIVATE_STATIC_FILES.has(fileName) || fileName.endsWith(".log")) return false;
  return PUBLIC_STATIC_EXTENSIONS.has(path.extname(fileName));
}

async function handleStaticRequest(request, response, pathname, searchParams) {
  const filePath = resolveStaticPath(pathname);
  if (!filePath || !isPublicStaticPath(filePath)) {
    response.writeHead(404);
    response.end("Not found");
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
    const etag = `W/\"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}\"`;
    const isVersioned = searchParams?.has("v");
    const isHtml = ext === ".html";
    const isServiceWorker = path.basename(filePath).toLowerCase() === "service-worker.js";
    const isText = [".css", ".html", ".js", ".json", ".svg", ".txt", ".obj", ".mtl"].includes(ext);
    const cacheControl = isHtml || isServiceWorker
      ? "no-cache, max-age=0, must-revalidate"
      : (isVersioned
        ? "public, max-age=31536000, immutable"
        : "public, max-age=604800, stale-while-revalidate=86400");
    const headers = {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": cacheControl,
      ETag: etag,
      "Last-Modified": stats.mtime.toUTCString(),
      "X-Content-Type-Options": "nosniff",
    };
    if (request.headers["if-none-match"] === etag) {
      response.writeHead(304, headers);
      response.end();
      return;
    }
    if (request.method === "HEAD") {
      response.writeHead(200, { ...headers, "Content-Length": stats.size });
      response.end();
      return;
    }
    const acceptsBrotli = isText && /(?:^|,)\s*br\s*(?:;|,|$)/i.test(request.headers["accept-encoding"] || "");
    if (acceptsBrotli) {
      response.writeHead(200, { ...headers, "Content-Encoding": "br", Vary: "Accept-Encoding" });
      fs.createReadStream(filePath).pipe(zlib.createBrotliCompress()).pipe(response);
      return;
    }
    response.writeHead(200, { ...headers, "Content-Length": stats.size });
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
    await handleStaticRequest(request, response, url.pathname, url.searchParams);
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
