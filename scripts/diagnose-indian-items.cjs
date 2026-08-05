const mysql = require("mysql2/promise");
const fs = require("node:fs");
const zlib = require("node:zlib");

(async () => {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
  const [equipmentRows] = await db.query(
    "SELECT owner_type, owner_id, slot_key, payload_json, updated_at FROM player_equipment_slots WHERE profile_name = ? ORDER BY owner_type, owner_id, slot_key",
    ["indian"],
  );
  const [inventoryRows] = await db.query(
    "SELECT slot_key, item_id, payload_json, updated_at FROM player_inventory_items WHERE profile_name = ? ORDER BY slot_key, item_id",
    ["indian"],
  );
  const [stateRows] = await db.query(
    "SELECT snapshot_json, inventory_json, crew_json, updated_at FROM player_state WHERE profile_name = ?",
    ["indian"],
  );
  const [eventRows] = await db.query(
    "SELECT id, event_type, title, payload_json, created_at FROM events WHERE profile_name = ? AND event_type IN ('equipment_changed', 'equipment_crafted', 'market_purchase', 'market_sale', 'save_integrity_protected', 'dev_refill') ORDER BY created_at DESC LIMIT 120",
    ["indian"],
  );
  const parse = (value, fallback) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };
  const summarizeItem = (row) => {
    const payload = parse(row.payload_json, {});
    return {
      slot: row.slot_key,
      id: row.item_id || payload.id,
      name: payload.name,
      rarity: payload.rarity,
      owner: row.owner_type,
      ownerId: row.owner_id,
      updatedAt: Number(row.updated_at) || 0,
    };
  };
  const stateRow = stateRows[0] || {};
  const snapshot = parse(stateRow.snapshot_json, {});
  const snapshotInventory = parse(stateRow.inventory_json, {});
  const snapshotCrew = parse(stateRow.crew_json, []);
  const manualBackup = JSON.parse(zlib.gunzipSync(fs.readFileSync("backups/manual-db-20260801-104904.json.gz")));
  const backupPlayer = Array.isArray(manualBackup)
    ? manualBackup.find((entry) => entry?.profileName === "indian" || entry?.profile_name === "indian")
    : manualBackup.indian || manualBackup.players?.indian || manualBackup.profiles?.indian || manualBackup;
  const backupEquipmentRows = (manualBackup.tables?.player_equipment_slots?.rows || [])
    .filter((row) => row.profile_name === "indian");
  const backupInventoryRows = (manualBackup.tables?.player_inventory_items?.rows || [])
    .filter((row) => row.profile_name === "indian");
  console.log(JSON.stringify({
    structuredEquipment: equipmentRows.map(summarizeItem),
    structuredInventory: inventoryRows.map(summarizeItem),
    stateUpdatedAt: Number(stateRow.updated_at) || 0,
    snapshotEquipment: Object.entries(snapshot.equipment || {})
      .filter(([, item]) => item)
      .map(([slot, item]) => ({ slot, id: item.id, name: item.name })),
    snapshotInventoryCounts: Object.fromEntries(
      Object.entries(snapshotInventory).map(([slot, items]) => [slot, Array.isArray(items) ? items.length : 0]),
    ),
    snapshotCrew: snapshotCrew.map((member) => ({
      id: member.id,
      hired: member.hired,
      equipment: Object.entries(member.equipment || {})
        .filter(([, item]) => item)
        .map(([slot, item]) => ({ slot, id: item.id, name: item.name })),
    })),
    recentItemEvents: eventRows.map((event) => ({
      id: Number(event.id),
      type: event.event_type,
      title: event.title,
      payload: parse(event.payload_json, {}),
      createdAt: Number(event.created_at) || 0,
    })),
    manualBackupShape: {
      rootType: Array.isArray(manualBackup) ? "array" : typeof manualBackup,
      rootKeys: !Array.isArray(manualBackup) && manualBackup ? Object.keys(manualBackup).slice(0, 30) : [],
      playerKeys: backupPlayer && typeof backupPlayer === "object" ? Object.keys(backupPlayer).slice(0, 40) : [],
      tableKeys: manualBackup.tables && typeof manualBackup.tables === "object" ? Object.keys(manualBackup.tables) : [],
      tableShapes: manualBackup.tables && typeof manualBackup.tables === "object"
        ? Object.fromEntries(Object.entries(manualBackup.tables).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.length : (value && typeof value === "object" ? Object.keys(value).slice(0, 8) : typeof value),
          ]))
        : {},
    },
    manualBackupEquipment: backupEquipmentRows.map(summarizeItem),
    manualBackupInventory: backupInventoryRows.map(summarizeItem),
  }, null, 2));
  await db.end();
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
