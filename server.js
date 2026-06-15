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
  PRAGMA journal_mode = MEMORY;
  PRAGMA synchronous = NORMAL;
  CREATE TABLE IF NOT EXISTS player_saves (
    profile_name TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
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
      upsertSaveStmt.run(
        profileName,
        JSON.stringify({ ...body.state, profileName }),
        now,
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
    deleteSaveStmt.run(profileName);
    sendEmpty(response);
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
