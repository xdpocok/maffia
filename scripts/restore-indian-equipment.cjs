const mysql = require("mysql2/promise");
const fs = require("node:fs");
const zlib = require("node:zlib");

const PROFILE_NAME = "indian";
const BACKUP_FILE = "backups/manual-db-20260801-104904.json.gz";
const RESTORE_SLOTS = new Set(["shirt", "pants", "weapon", "shoes", "watch"]);

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

(async () => {
  const backup = JSON.parse(zlib.gunzipSync(fs.readFileSync(BACKUP_FILE)));
  const backupRows = (backup.tables?.player_equipment_slots?.rows || []).filter((row) => (
    row.profile_name === PROFILE_NAME
      && row.owner_type === "player"
      && row.owner_id === "self"
      && RESTORE_SLOTS.has(row.slot_key)
  ));
  if (backupRows.length !== RESTORE_SLOTS.size) {
    throw new Error(`A mentésben ${RESTORE_SLOTS.size} helyett ${backupRows.length} visszaállítható felszerelés található.`);
  }

  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
  await db.beginTransaction();
  try {
    const [currentEquipmentRows] = await db.query(
      "SELECT owner_type, owner_id, slot_key, payload_json FROM player_equipment_slots WHERE profile_name = ? FOR UPDATE",
      [PROFILE_NAME],
    );
    const currentPlayerSlots = new Map(
      currentEquipmentRows
        .filter((row) => row.owner_type === "player" && row.owner_id === "self")
        .map((row) => [row.slot_key, parseJson(row.payload_json, null)]),
    );
    const restored = [];
    const now = Date.now();

    for (const row of backupRows) {
      if (currentPlayerSlots.get(row.slot_key)) continue;
      const item = parseJson(row.payload_json, null);
      if (!item?.id) throw new Error(`Hibás mentett item: ${row.slot_key}`);
      await db.query(
        `INSERT INTO player_equipment_slots
          (profile_name, owner_type, owner_id, slot_key, payload_json, updated_at)
         VALUES (?, 'player', 'self', ?, ?, ?)
         ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), updated_at = VALUES(updated_at)`,
        [PROFILE_NAME, row.slot_key, JSON.stringify(item), now],
      );
      await db.query(
        `INSERT INTO player_inventory_items
          (profile_name, slot_key, item_id, payload_json, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), updated_at = VALUES(updated_at)`,
        [PROFILE_NAME, row.slot_key, String(item.id).slice(0, 128), JSON.stringify(item), now],
      );
      currentPlayerSlots.set(row.slot_key, item);
      restored.push({ slot: row.slot_key, id: item.id, name: item.name });
    }

    const [stateRows] = await db.query(
      "SELECT snapshot_json, inventory_json FROM player_state WHERE profile_name = ? FOR UPDATE",
      [PROFILE_NAME],
    );
    if (!stateRows.length) throw new Error("Indian player_state sora nem található.");
    const snapshot = parseJson(stateRows[0].snapshot_json, {});
    const inventory = parseJson(stateRows[0].inventory_json, {});
    snapshot.equipment = { ...(snapshot.equipment || {}) };
    for (const [slot, item] of currentPlayerSlots) snapshot.equipment[slot] = item;
    for (const entry of restored) {
      const item = currentPlayerSlots.get(entry.slot);
      if (!Array.isArray(inventory[entry.slot])) inventory[entry.slot] = [];
      if (!inventory[entry.slot].some((candidate) => candidate?.id === item.id)) inventory[entry.slot].push(item);
    }
    snapshot.itemInventory = inventory;
    await db.query(
      "UPDATE player_state SET snapshot_json = ?, inventory_json = ?, updated_at = ? WHERE profile_name = ?",
      [JSON.stringify(snapshot), JSON.stringify(inventory), now, PROFILE_NAME],
    );

    const [saveRows] = await db.query(
      "SELECT state_json FROM player_saves WHERE profile_name = ? FOR UPDATE",
      [PROFILE_NAME],
    );
    if (saveRows.length) {
      const saveState = parseJson(saveRows[0].state_json, {});
      saveState.equipment = snapshot.equipment;
      saveState.itemInventory = inventory;
      await db.query(
        "UPDATE player_saves SET state_json = ?, updated_at = ? WHERE profile_name = ?",
        [JSON.stringify(saveState), now, PROFILE_NAME],
      );
    }

    await db.commit();
    console.log(JSON.stringify({ ok: true, profileName: PROFILE_NAME, restored }, null, 2));
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
