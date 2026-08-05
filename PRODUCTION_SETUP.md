# Maffia szerver elesitesi jegyzet

Ez a lepes a szerver futtathatosagat kesziti elo. A valodi regisztracios/bejelentkezesi felulet meg nincs elkeszitve.

## Minimum eles `.env`

```env
APP_ENV=production
NODE_ENV=production
HOST=0.0.0.0
PORT=8766

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=maffia_user
MYSQL_PASSWORD=eros-egyedi-jelszo
MYSQL_DATABASE=maffia
MYSQL_CONNECTION_LIMIT=10

COOKIE_SECURE=true
COOKIE_SAME_SITE=Lax
SESSION_MAX_AGE_SECONDS=2592000

REQUEST_BODY_LIMIT_BYTES=2000000
REQUEST_TIMEOUT_MS=30000
HEADERS_TIMEOUT_MS=35000
KEEP_ALIVE_TIMEOUT_MS=5000
API_RATE_LIMIT_WINDOW_MS=60000
API_READ_RATE_LIMIT_MAX=900
API_WRITE_RATE_LIMIT_MAX=240
MAX_HEADERS_COUNT=96
MAX_CONNECTIONS=0
SHUTDOWN_TIMEOUT_MS=10000
SERVER_LOG_FILE=
SERVER_LOG_TO_STDOUT=true
ENABLE_HSTS=false
```

## Stabil helyi szerverkezeles

A Codex/PowerShell beragadas elkerulesere a szervert kulon folyamatban inditjuk, PID fajllal es sajat loggal.

Elsodlegesen ezeket hasznald ezen a gepen:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-server.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\server-status.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\restart-server.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\stop-server.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\smoke-production-server.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\create-backup.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\create-backup.ps1 -IncludeDatabase
node .\scripts\simulate-combat-balance.mjs
```

Rendes npm telepitessel ezek a rovid parancsok is mukodnek:

```powershell
npm run server:start
npm run server:status
npm run server:restart
npm run server:stop
npm run server:smoke:prod
npm run backup
npm run backup:db
node scripts/simulate-combat-balance.mjs
```

Eles modhoz ezen a gepen:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-server.ps1 -Environment production -HostName 0.0.0.0
```

Rendes npm telepitessel:

```powershell
npm run server:start:prod
```

A kezelo scriptek ezeket hasznaljak:

- `run/maffia-server.pid` - a futo Node folyamat PID-je
- `run/maffia-server.json` - inditasi metaadatok
- `logs/server-YYYYMMDD-HHmmss.log` - szervernaplo

## Fontos eles feltetelek

- Publikus szerveren `HOST=0.0.0.0` kell, kulonben csak a geprol erheto el.
- Elesben ne MySQL `root` user fusson, hanem kulon `maffia_user` korlatozott jogosultsaggal.
- Internetre csak HTTPS mogott erdemes kiengedni. Reverse proxyhoz hasznalhato Nginx, Caddy vagy Cloudflare Tunnel.
- HTTPS mogott `COOKIE_SECURE=true`.
- `ENABLE_HSTS=true` csak akkor legyen, ha a domain mar biztosan HTTPS-en mukodik.
- Hosszu tavon process manager ajanlott: PM2, systemd vagy Docker, hogy crash utan automatikusan ujrainduljon.

## Gyors ellenorzes inditas utan

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\server-status.ps1
```

Vagy kozvetlenul:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8766/api/health
```

Sikeres valasz eseten:

```json
{
  "ok": true,
  "databaseType": "mysql",
  "database": "connected"
}
```

Reszletesebb, nem erzekeny statusz:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8766/api/admin/status
```

Ez profildarabszamot, aktiv akciokat, aktiv klanhaborukat, market item darabszamot, uptime-ot es verzioinformaciot ad vissza.

## Hogyan kerul be kesobb egy fejlesztes?

A legbiztonsagosabb menet:

1. Fejlesztes helyben.
2. Szintaxis/smoke teszt.
3. Harci balansz gyorsellenorzes: `node scripts/simulate-combat-balance.mjs`.
4. Biztonsagi mentes: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\create-backup.ps1`, adatbazissal `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\create-backup.ps1 -IncludeDatabase`.
5. `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\restart-server.ps1`

Igy a jatekosok mar az uj kodot kapjak, de nem egy felig kesz valtozat kerul elesbe.

## Ami meg hianyzik a valodi nyilvanos elesiteshez

- Regisztracio/jelszo/token rendszer.
- Profilnev-alapu session levaltasa valodi hitelesitesre.
- Automatikus idozitett mentes; kezi backup script mar van.
- Publikus domain + HTTPS proxy.
