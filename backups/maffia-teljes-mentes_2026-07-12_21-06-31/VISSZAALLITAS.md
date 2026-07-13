# Maffia Birodalom teljes mentés

Mentés készült: 2026-07-12 21:06:31 (Europe/Budapest)

## Játékfájlok visszaállítása

1. Állítsd le a játék Node-szerverét.
2. Másold vissza ennek a mappának a tartalmát a projekt gyökerébe.
3. A `maffia-database.sql` és ez az útmutató nem része a futó alkalmazásnak, ezeket nem szükséges a projekt gyökerébe másolni.
4. Futtasd a projekt gyökerében: `npm install`.
5. Indítsd el a MySQL80 szolgáltatást, majd futtasd: `npm start`.

## Adatbázis visszaállítása

A `maffia-database.sql` a teljes `maffia` MySQL-adatbázist tartalmazza, táblákkal és adatokkal együtt.

Példa rendszergazdai terminálból:

```powershell
Get-Content .\maffia-database.sql -Raw | mysql -u root -p
```

A MySQL a jelszót külön fogja bekérni.

## Szándékosan kihagyott mappák

- `.git`: a verziókezelés belső adatai;
- `node_modules`: újratelepíthető az `npm install` paranccsal;
- `tmp`: ideiglenes fejlesztési fájlok;
- korábbi `backups` tartalom.
