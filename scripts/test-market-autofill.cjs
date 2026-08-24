const mysql = require("mysql2/promise");
const { createHmac, randomUUID } = require("node:crypto");

const profileName = String(process.argv[2] || "indian").trim().toLowerCase();
const baseUrl = String(process.env.QA_BASE_URL || "http://127.0.0.1:8766").replace(/\/$/, "");
const isProduction = String(process.env.APP_ENV || process.env.NODE_ENV || "development").toLowerCase() === "production";
const sessionSecret = String(process.env.SESSION_SECRET || (isProduction ? "" : "maffia-local-development-session-secret-change-me"));

function createSessionToken(sessionId, expiresAt) {
  const payload = Buffer.from(JSON.stringify({ p: profileName, s: sessionId, e: expiresAt })).toString("base64url");
  const signature = createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

(async () => {
  if (sessionSecret.length < 16) throw new Error("A SESSION_SECRET nincs beallitva a teszthez.");
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "maffia",
  });
  const sessionId = randomUUID();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000;
  try {
    const [profiles] = await connection.query("SELECT profile_name FROM players WHERE profile_name = ? LIMIT 1", [profileName]);
    if (!profiles.length) throw new Error(`A tesztprofil nem talalhato: ${profileName}`);
    await connection.query(
      "INSERT INTO auth_sessions (session_id, profile_name, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)",
      [sessionId, profileName, expiresAt, now, now],
    );
    const response = await fetch(`${baseUrl}/api/market-items?limit=8`, {
      headers: { Authorization: `Bearer ${createSessionToken(sessionId, expiresAt)}`, Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    const items = Array.isArray(payload.items) ? payload.items : [];
    const uniqueIds = new Set(items.map((item) => String(item.itemId || "")));
    if (items.length !== 8 || uniqueIds.size !== 8) throw new Error(`A piac nem nyolc egyedi targyat adott vissza: ${items.length}/${uniqueIds.size}`);
    if (items.some((item) => Number(item.stock) < 0 || Number(item.expiresAt) <= Date.now())) {
      throw new Error("A piac lejart vagy ervenytelen keszletu ajanlatot adott vissza.");
    }
    const [rows] = await connection.query(
      "SELECT COUNT(*) AS active_count, MIN(expires_at) AS refresh_at FROM market_items WHERE owner_profile_name = ? AND expires_at > ?",
      [profileName, Date.now()],
    );
    if (Number(rows[0]?.active_count) !== 8) throw new Error(`Az adatbazisban nem nyolc aktiv ajanlat van: ${rows[0]?.active_count}`);
    console.log(JSON.stringify({ ok: true, profileName, itemCount: items.length, uniqueItems: uniqueIds.size, refreshAt: Number(rows[0]?.refresh_at) }, null, 2));
  } finally {
    await connection.query("DELETE FROM auth_sessions WHERE session_id = ?", [sessionId]).catch(() => {});
    await connection.end();
  }
})().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
