const { AsyncLocalStorage } = require("node:async_hooks");
const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

const transactionStorage = new AsyncLocalStorage();

function readLocalEnv() {
  const envPath = path.join(__dirname, ".env");
  let source = "";
  try {
    source = fs.readFileSync(envPath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return {};
  }
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if (
          (value.startsWith("\"") && value.endsWith("\""))
          || (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        return [key, value];
      }),
  );
}

const localEnv = readLocalEnv();

const config = {
  host: localEnv.MYSQL_HOST || process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(localEnv.MYSQL_PORT || process.env.MYSQL_PORT || 3306),
  user: localEnv.MYSQL_USER || process.env.MYSQL_USER || "root",
  password: localEnv.MYSQL_PASSWORD ?? process.env.MYSQL_PASSWORD ?? "",
  database: localEnv.MYSQL_DATABASE || process.env.MYSQL_DATABASE || "maffia",
};

const schema = `
  CREATE TABLE IF NOT EXISTS player_saves (
    profile_name VARCHAR(18) PRIMARY KEY,
    state_json LONGTEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS players (
    profile_name VARCHAR(18) PRIMARY KEY,
    display_name VARCHAR(64) NOT NULL,
    rank_title VARCHAR(64) NOT NULL DEFAULT 'Utcai figura',
    level INT NOT NULL DEFAULT 1,
    fame INT NOT NULL DEFAULT 0,
    money INT NOT NULL DEFAULT 0,
    heat INT NOT NULL DEFAULT 0,
    influence INT NOT NULL DEFAULT 0,
    city_level INT NOT NULL DEFAULT 1,
    crew_count INT NOT NULL DEFAULT 0,
    health INT NOT NULL DEFAULT 100,
    energy INT NOT NULL DEFAULT 100,
    world_base_lot_id VARCHAR(64),
    world_base_level INT NOT NULL DEFAULT 1,
    npc_village_victories INT NOT NULL DEFAULT 0,
    registered_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    last_seen_at BIGINT NOT NULL,
    INDEX idx_players_fame_updated (fame DESC, updated_at DESC)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_name VARCHAR(18) NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    title VARCHAR(120) NOT NULL,
    payload_json LONGTEXT NOT NULL,
    created_at BIGINT NOT NULL,
    INDEX idx_events_profile_created_at (profile_name, created_at DESC),
    CONSTRAINT fk_events_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_profile_name VARCHAR(18) NOT NULL,
    sender_profile_name VARCHAR(18),
    message_type VARCHAR(32) NOT NULL DEFAULT 'player',
    title VARCHAR(120) NOT NULL,
    body TEXT NOT NULL,
    payload_json LONGTEXT NOT NULL,
    read_at BIGINT,
    created_at BIGINT NOT NULL,
    INDEX idx_messages_recipient_created (recipient_profile_name, created_at DESC),
    INDEX idx_messages_recipient_unread (recipient_profile_name, read_at, created_at DESC),
    CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_profile_name) REFERENCES players(profile_name) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_profile_name) REFERENCES players(profile_name) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_state (
    profile_name VARCHAR(18) PRIMARY KEY,
    snapshot_json LONGTEXT NOT NULL,
    inventory_json LONGTEXT NOT NULL,
    crew_json LONGTEXT NOT NULL,
    quests_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    CONSTRAINT fk_player_state_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_runtime_state (
    profile_name VARCHAR(18) PRIMARY KEY,
    runtime_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    CONSTRAINT fk_player_runtime_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_process_tasks (
    task_id VARCHAR(128) PRIMARY KEY,
    profile_name VARCHAR(18) NOT NULL,
    task_scope VARCHAR(16) NOT NULL DEFAULT 'main',
    slot_index INT NOT NULL DEFAULT 0,
    task_type VARCHAR(32) NOT NULL DEFAULT '',
    task_status VARCHAR(24) NOT NULL DEFAULT '',
    ends_at BIGINT,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    INDEX idx_process_tasks_profile_scope (profile_name, task_scope, slot_index, updated_at DESC),
    CONSTRAINT fk_process_tasks_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_territories (
    profile_name VARCHAR(18) NOT NULL,
    territory_id VARCHAR(64) NOT NULL,
    owner_type VARCHAR(24) NOT NULL DEFAULT '',
    territory_level INT NOT NULL DEFAULT 1,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    PRIMARY KEY (profile_name, territory_id),
    INDEX idx_territories_profile_updated (profile_name, updated_at DESC),
    CONSTRAINT fk_player_territories_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_equipment_slots (
    profile_name VARCHAR(18) NOT NULL,
    owner_type VARCHAR(16) NOT NULL DEFAULT 'player',
    owner_id VARCHAR(64) NOT NULL DEFAULT 'self',
    slot_key VARCHAR(32) NOT NULL,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    PRIMARY KEY (profile_name, owner_type, owner_id, slot_key),
    INDEX idx_equipment_profile_owner (profile_name, owner_type, owner_id, updated_at DESC),
    CONSTRAINT fk_player_equipment_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_inventory_items (
    profile_name VARCHAR(18) NOT NULL,
    slot_key VARCHAR(32) NOT NULL,
    item_id VARCHAR(128) NOT NULL,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    PRIMARY KEY (profile_name, slot_key, item_id),
    INDEX idx_inventory_profile_slot (profile_name, slot_key, updated_at DESC),
    CONSTRAINT fk_player_inventory_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_crew_members (
    profile_name VARCHAR(18) NOT NULL,
    member_id VARCHAR(64) NOT NULL,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    PRIMARY KEY (profile_name, member_id),
    INDEX idx_crew_profile_updated (profile_name, updated_at DESC),
    CONSTRAINT fk_player_crew_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_quests (
    quest_id VARCHAR(128) PRIMARY KEY,
    profile_name VARCHAR(18) NOT NULL,
    quest_scope VARCHAR(16) NOT NULL DEFAULT 'active',
    slot_index INT NOT NULL DEFAULT 0,
    quest_status VARCHAR(24) NOT NULL DEFAULT 'offered',
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    INDEX idx_player_quests_profile_scope (profile_name, quest_scope, slot_index, updated_at DESC),
    CONSTRAINT fk_player_quests_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_notifications (
    notification_id VARCHAR(128) PRIMARY KEY,
    profile_name VARCHAR(18) NOT NULL,
    message_type VARCHAR(32) NOT NULL DEFAULT 'event',
    title VARCHAR(120) NOT NULL,
    body TEXT NOT NULL,
    sender_profile_name VARCHAR(18),
    read_at BIGINT,
    created_at BIGINT NOT NULL,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    INDEX idx_player_notifications_profile (profile_name, created_at DESC),
    INDEX idx_player_notifications_unread (profile_name, read_at, created_at DESC),
    CONSTRAINT fk_player_notifications_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_districts (
    profile_name VARCHAR(18) NOT NULL,
    district_id VARCHAR(64) NOT NULL,
    slot_index INT NOT NULL DEFAULT 0,
    is_selected TINYINT(1) NOT NULL DEFAULT 0,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    PRIMARY KEY (profile_name, district_id),
    INDEX idx_player_districts_profile (profile_name, slot_index, updated_at DESC),
    CONSTRAINT fk_player_districts_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_building_difficulties (
    profile_name VARCHAR(18) NOT NULL,
    spot_id VARCHAR(64) NOT NULL,
    difficulty_value INT NOT NULL DEFAULT 1,
    difficulty_cycle BIGINT,
    updated_at BIGINT NOT NULL,
    PRIMARY KEY (profile_name, spot_id),
    INDEX idx_player_building_difficulties_profile (profile_name, difficulty_cycle, updated_at DESC),
    CONSTRAINT fk_player_building_difficulties_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_world_rivals (
    city_id VARCHAR(128) PRIMARY KEY,
    profile_name VARCHAR(18) NOT NULL,
    lot_id VARCHAR(64) NOT NULL,
    city_status VARCHAR(24) NOT NULL DEFAULT 'hostile',
    city_level INT NOT NULL DEFAULT 1,
    city_power INT NOT NULL DEFAULT 1,
    tribute_ready_at BIGINT,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    INDEX idx_player_world_rivals_profile (profile_name, updated_at DESC, lot_id),
    CONSTRAINT fk_player_world_rivals_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS player_harbor_garage (
    profile_name VARCHAR(18) PRIMARY KEY,
    garage_level INT NOT NULL DEFAULT 1,
    active_vehicle_id VARCHAR(64) NOT NULL DEFAULT 'sedan',
    unlocked_vehicle_ids LONGTEXT NOT NULL,
    successful_runs INT NOT NULL DEFAULT 0,
    failed_runs INT NOT NULL DEFAULT 0,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    CONSTRAINT fk_player_harbor_garage_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS world_lots (
    lot_id VARCHAR(64) PRIMARY KEY,
    coord VARCHAR(32) NOT NULL,
    owner_profile_name VARCHAR(18),
    base_level INT NOT NULL DEFAULT 1,
    district VARCHAR(64) NOT NULL DEFAULT 'vilagterkep',
    status VARCHAR(24) NOT NULL DEFAULT 'free',
    claimed_at BIGINT,
    updated_at BIGINT NOT NULL,
    INDEX idx_world_lots_owner (owner_profile_name),
    CONSTRAINT fk_world_lots_owner FOREIGN KEY (owner_profile_name) REFERENCES players(profile_name) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS leaderboard_entries (
    profile_name VARCHAR(18) PRIMARY KEY,
    season_key VARCHAR(32) NOT NULL DEFAULT 'global',
    level INT NOT NULL DEFAULT 1,
    fame INT NOT NULL DEFAULT 0,
    city_level INT NOT NULL DEFAULT 1,
    npc_village_victories INT NOT NULL DEFAULT 0,
    rank_title VARCHAR(64) NOT NULL DEFAULT 'Utcai figura',
    updated_at BIGINT NOT NULL,
    INDEX idx_leaderboard_global (season_key, level DESC, fame DESC, city_level DESC, updated_at DESC),
    CONSTRAINT fk_leaderboard_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS market_items (
    item_id VARCHAR(128) PRIMARY KEY,
    market_scope VARCHAR(32) NOT NULL DEFAULT 'global',
    owner_profile_name VARCHAR(18),
    slot_key VARCHAR(32) NOT NULL,
    item_name VARCHAR(160) NOT NULL,
    rarity VARCHAR(24) NOT NULL DEFAULT 'common',
    stat_kind VARCHAR(24) NOT NULL DEFAULT 'power',
    stat_value INT NOT NULL DEFAULT 0,
    price INT NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 1,
    expires_at BIGINT,
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    INDEX idx_market_scope_owner (market_scope, owner_profile_name, updated_at DESC),
    CONSTRAINT fk_market_owner FOREIGN KEY (owner_profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS game_config_entries (
    config_key VARCHAR(80) PRIMARY KEY,
    config_group VARCHAR(40) NOT NULL DEFAULT 'general',
    payload_json LONGTEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    INDEX idx_game_config_group (config_group, updated_at DESC)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS clans (
    clan_id VARCHAR(128) PRIMARY KEY,
    clan_name VARCHAR(120) NOT NULL UNIQUE,
    boss_profile_name VARCHAR(18),
    description VARCHAR(220) NOT NULL DEFAULT '',
    notoriety INT NOT NULL DEFAULT 0,
    treasury INT NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    CONSTRAINT fk_clans_boss FOREIGN KEY (boss_profile_name) REFERENCES players(profile_name) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS clan_members (
    clan_id VARCHAR(128) NOT NULL,
    profile_name VARCHAR(18) NOT NULL,
    member_role VARCHAR(32) NOT NULL DEFAULT 'katona',
    contribution INT NOT NULL DEFAULT 0,
    joined_at BIGINT NOT NULL,
    PRIMARY KEY (clan_id, profile_name),
    INDEX idx_clan_members_profile (profile_name),
    CONSTRAINT fk_clan_members_clan FOREIGN KEY (clan_id) REFERENCES clans(clan_id) ON DELETE CASCADE,
    CONSTRAINT fk_clan_members_player FOREIGN KEY (profile_name) REFERENCES players(profile_name) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

  CREATE TABLE IF NOT EXISTS app_meta (
    meta_key VARCHAR(80) PRIMARY KEY,
    meta_value VARCHAR(255) NOT NULL,
    updated_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
`;

async function createMysqlDatabase() {
  let bootstrap;
  try {
    bootstrap = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      charset: "utf8mb4",
    });
  } catch (error) {
    if (error?.code === "ER_ACCESS_DENIED_ERROR") {
      throw new Error(
        "A MySQL elerheto, de a belepesi adatok hibasak. Masold le a .env.example fajlt .env neven, majd add meg benne a MYSQL_USER es MYSQL_PASSWORD erteket.",
        { cause: error },
      );
    }
    throw error;
  }
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.database.replaceAll("`", "")}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci`,
  );
  await bootstrap.end();

  const pool = mysql.createPool({
    ...config,
    charset: "utf8mb4",
    connectionLimit: Number(localEnv.MYSQL_CONNECTION_LIMIT || process.env.MYSQL_CONNECTION_LIMIT || 10),
    waitForConnections: true,
    queueLimit: 0,
    multipleStatements: true,
  });
  await pool.query(schema);
  await pool.query("ALTER TABLE players ALTER COLUMN crew_count SET DEFAULT 0");
  await ensureColumn(pool, "players", "npc_village_victories", "INT NOT NULL DEFAULT 0");
  await ensureColumn(pool, "leaderboard_entries", "npc_village_victories", "INT NOT NULL DEFAULT 0");
  await pool.query("DELETE FROM world_lots WHERE owner_profile_name IS NULL AND status <> 'free'");

  const execute = async (sql, params = []) => {
    const executor = transactionStorage.getStore() || pool;
    return executor.query(sql, params);
  };

  return {
    info: `${config.user}@${config.host}:${config.port}/${config.database}`,
    prepare(sql) {
      return {
        async get(...params) {
          const [rows] = await execute(sql, params);
          return Array.isArray(rows) ? rows[0] : undefined;
        },
        async all(...params) {
          const [rows] = await execute(sql, params);
          return Array.isArray(rows) ? rows : [];
        },
        async run(...params) {
          const [result] = await execute(sql, params);
          return result;
        },
      };
    },
    async transaction(callback) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const result = await transactionStorage.run(connection, callback);
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
    async ping() {
      await pool.query("SELECT 1");
    },
    async close() {
      await pool.end();
    },
  };
}

module.exports = { createMysqlDatabase };

async function ensureColumn(pool, tableName, columnName, definitionSql) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [config.database, tableName, columnName],
  );
  const count = Array.isArray(rows) ? Number(rows[0]?.count || 0) : 0;
  if (count > 0) return;
  await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definitionSql}`);
}
