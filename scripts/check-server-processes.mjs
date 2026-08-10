const baseUrl = String(process.env.QA_BASE_URL || "http://127.0.0.1:8766").replace(/\/$/, "");
const qaLogin = String(process.env.QA_LOGIN || "").trim();
const qaPassword = String(process.env.QA_PASSWORD || "");

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
  return { response, payload, text };
}

const checks = [];
function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  if (!ok) throw new Error(`${name}: ${detail}`);
}

const health = await request("/api/health");
record("Health", health.response.ok && health.payload?.ok === true, `HTTP ${health.response.status}`);
record("MySQL", health.payload?.database === "connected", String(health.payload?.database || "nincs kapcsolat"));
record(
  "Karbantartasi ciklus",
  health.payload?.maintenance?.ok === true
    && Date.now() - Number(health.payload?.maintenance?.lastRunAt || 0) < 20_000,
  `utolso futas: ${health.payload?.maintenance?.lastRunAt || 0}`,
);

if (!qaLogin || !qaPassword) {
  checks.push({
    name: "Hitelesitett QA folyamatok",
    ok: true,
    detail: "KIHAGYVA: QA_LOGIN es QA_PASSWORD nincs beallitva",
  });
  console.table(checks);
  console.log("Szerverfolyamat-ellenorzes: a nyilvanos ellenorzesek rendben; a hitelesitett resz kihagyva.");
} else {
const sessionStart = await request("/api/session", {
  method: "POST",
  body: JSON.stringify({ login: qaLogin, password: qaPassword }),
});
const profileName = String(sessionStart.payload?.profileName || "").trim();
record("QA munkamenet", sessionStart.response.ok && Boolean(profileName), `profil: ${profileName || "ismeretlen"}`);
const cookie = sessionStart.response.headers.get("set-cookie")?.split(";")[0] || "";
assert(cookie, "A szerver nem adott munkamenet-sutit.");
const authHeaders = { Cookie: cookie };

const anonymousEvents = await request("/api/events?limit=5");
record(
  "Esemenynaplo vedelme",
  anonymousEvents.response.status === 401,
  `HTTP ${anonymousEvents.response.status}`,
);

for (const [name, pathname] of [
  ["Aktualis mentes", "/api/saves/current"],
  ["Allapotszinkron", "/api/sync/current?since=0"],
  ["Uzenetek", "/api/messages?limit=20"],
  ["Vilagchat", "/api/world-chat?limit=20"],
  ["Klan iranyitopult", "/api/clans/dashboard"],
  ["Piaci ajanlatok", "/api/market-items?limit=8"],
  ["Vilagterkep telkek", "/api/world-lots"],
  ["Ranglista", "/api/leaderboard?season=global&limit=20"],
  ["Sajat esemenynaplo", "/api/events?limit=20"],
  ["Helyi admin allapot", "/api/admin/status"],
]) {
  const result = await request(pathname, { headers: authHeaders });
  record(name, result.response.ok, `HTTP ${result.response.status}`);
}

const privateState = await request("/api/player-state", { headers: authHeaders });
const visibleStates = Array.isArray(privateState.payload?.playerState) ? privateState.payload.playerState : [];
record(
  "Profiladatok elszigetelese",
  privateState.response.ok && visibleStates.length === 1 && visibleStates[0]?.profileName === profileName,
  `${visibleStates.length} profil lathato`,
);

const before = await request("/api/saves/current", { headers: authHeaders });
record("Teszt elotti allapot", before.response.ok && before.payload?.found === true, `HTTP ${before.response.status}`);

const invalidCases = [
  ["Regeneracio bemenet", "/api/actions/progression/recovery", { operation: "invalid" }],
  ["Vedelmi penz celpont", "/api/actions/progression/protection", { spotId: "missing-qa" }],
  ["Rivalis muvelet", "/api/actions/progression/rival", { operation: "invalid" }],
  ["Kuldetes muvelet", "/api/actions/progression/quest", { operation: "invalid", questId: "qa-missing" }],
  ["Birodalom muvelet", "/api/actions/progression/empire", { operation: "invalid" }],
  ["Kikoto muvelet", "/api/actions/harbor", { operation: "invalid" }],
  ["Kocsmai ital tipusa", "/api/actions/harbor", { operation: "bar", kind: "invalid" }],
  ["Garazs muvelet", "/api/actions/garage", { operation: "invalid" }],
  ["Kirablasi celpont", "/api/actions/robbery/start", { spotId: "missing-qa" }],
  ["Craft alapanyag", "/api/actions/economy/craft", { ingredients: [] }],
];

for (const [name, pathname, body] of invalidCases) {
  const result = await request(pathname, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(body),
  });
  record(name, result.response.status >= 400 && result.response.status < 500, `HTTP ${result.response.status}`);
}

const after = await request("/api/saves/current", { headers: authHeaders });
record("Teszt utani allapot", after.response.ok && after.payload?.found === true, `HTTP ${after.response.status}`);
record(
  "Hibas keresek nem valtoztatnak allapotot",
  Number(after.payload?.updatedAt || 0) === Number(before.payload?.updatedAt || 0),
  `${before.payload?.updatedAt || 0} -> ${after.payload?.updatedAt || 0}`,
);

const indexPage = await fetch(`${baseUrl}/`, { redirect: "manual" });
record("Jatekoldal", indexPage.ok && String(indexPage.headers.get("content-type") || "").includes("text/html"), `HTTP ${indexPage.status}`);
record("Biztonsagi fejlecek", indexPage.headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options");

console.table(checks);
console.log(`Szerverfolyamat-ellenorzes: ${checks.length}/${checks.length} rendben.`);
}
