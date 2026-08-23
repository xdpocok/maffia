const mysql = require("mysql2/promise");

(async () => {
  const profileName = String(process.argv[2] || "").trim().toLowerCase();
  if (!profileName) throw new Error("Adj meg egy profilnevet.");
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
  const now = Date.now();
  const expiresAt = now + 6 * 60 * 60 * 1000;
  const [result] = await db.execute(
    `UPDATE market_items
     SET expires_at = ?, updated_at = ?
     WHERE owner_profile_name = ? AND stock > 0
       AND expires_at IS NOT NULL AND expires_at <= ?`,
    [expiresAt, now, profileName, now],
  );
  const [rows] = await db.execute(
    `SELECT item_id, slot_key, item_name, stock, expires_at
     FROM market_items
     WHERE owner_profile_name = ? AND stock > 0 AND expires_at > ?
     ORDER BY item_id`,
    [profileName, now],
  );
  console.log(JSON.stringify({ profileName, repaired: result.affectedRows, activeOffers: rows.length, expiresAt }, null, 2));
  await db.end();
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
