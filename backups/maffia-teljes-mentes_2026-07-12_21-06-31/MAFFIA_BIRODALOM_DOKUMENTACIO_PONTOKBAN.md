# Maffia Birodalom - Játékdokumentáció

## Megnyitás Visual Studio / Visual Studio Code alatt

- Csomagold ki ezt a mappát.
- Nyisd meg a kicsomagolt mappát Visual Studio Code-ban vagy Visual Studióban.
- A fő dokumentáció itt található: `docs/01-jatek-koncepcio.md`.
- A fejlesztési feladatlista itt található: `docs/04-fejlesztesi-feladatlista.md`.
- A feltöltött játékfájl másolata itt található: `src/game.js`.

## Rövid leírás

- A játék címe: **Maffia Birodalom**.
- Műfaj: böngészős stratégiai maffiajáték.
- Hangulat: 1930-as évek, noir, városi bűnbirodalom, kerületek, rangok, család, befolyás.
- Szerkezeti irány: Goodgame Empire-szerű térképes birodalomépítés, de maffia témában.
- Fő cél: a játékos kis bandából indul, majd kerületeket, telkeket, üzleteket és ranglistát épít.

## Dokumentumok

- `docs/01-jatek-koncepcio.md`
  - Alapötlet, cél, hangulat, játékosfantázia.
- `docs/02-jatekmenet-rendszerek.md`
  - Core loop, gazdaság, akciók, rablás, védelmi pénz, küldetések.
- `docs/03-technikai-terv.md`
  - Jelenlegi kód iránya, fő modulok, mentés, adatok, javasolt fájlszerkezet.
- `docs/04-fejlesztesi-feladatlista.md`
  - Pontokra osztott fejlesztési terv MVP-től többjátékos irányig.
- `docs/05-adatok-es-egyensuly.md`
  - Kerületek, rangok, felszerelések, erőforrások, ajánlott számok.

## Ajánlott következő lépés

- Először a `docs/04-fejlesztesi-feladatlista.md` fájlt nyisd meg.
- Pipáld ki, mi van már kész.
- Utána a `src/game.js` fájlt lehet modulokra bontani.

---

# 01 - Játék koncepció pontokban

## 1. Alapötlet

- A játék neve: **Maffia Birodalom**.
- Böngészőben futó stratégiai játék.
- A játékos egy 1930-as évekbeli városban épít bűnbirodalmat.
- A játékos kezdetben kis bandavezér.
- A cél a város kerületeinek megszerzése.
- A fejlődés pénzből, hírnévből, felszerelésből, bandatagokból és területből áll.
- A játék hosszú távon többjátékos ranglistára és világtérképre épülhet.

## 2. Hangulat

- 1930-as évek.
- Noir városkép.
- Esős utcák.
- Téglaházak.
- Régi autók.
- Füstös bárok.
- Sötét sikátorok.
- Elegáns, de veszélyes maffiavilág.
- Színek:
  - barna,
  - bézs,
  - fekete,
  - sötétszürke,
  - arany,
  - vörös kiemelések.

## 3. Játékosfantázia

- A játékos nem csak egy karaktert irányít.
- A játékos egy teljes maffiacsaládot épít.
- A cél, hogy az utcai gengszterből Don legyen.
- A játékos dönt:
  - kit rabol ki,
  - hol szed védelmi pénzt,
  - mikor fejleszt,
  - mikor lapul,
  - melyik kerületet akarja megszerezni,
  - milyen felszerelést használ,
  - melyik bandatagot küldi akcióba.

## 4. Goodgame Empire-szerű irány

- Nem a téma hasonló, hanem a szerkezet.
- Hasonló elemek:
  - térképes világ,
  - területfoglalás,
  - fejlődő bázis,
  - erőforrás-termelés,
  - ranglista,
  - időalapú fejlődés,
  - játékosok közötti verseny,
  - több terület kezelése.
- Maffia témára átültetve:
  - kastély helyett családi bázis,
  - katonák helyett bandatagok,
  - nyersanyagok helyett pénz, hírnév, befolyás,
  - csaták helyett rablások, leszámolások, védelmi pénz,
  - tartományok helyett városi kerületek.

## 5. Fő célok

- Rövid távú cél:
  - pénz szerzése,
  - hírnév növelése,
  - banda erősítése,
  - kezdő küldetések teljesítése.
- Középtávú cél:
  - telkek fejlesztése,
  - jobb felszerelés megszerzése,
  - nehezebb célpontok legyőzése,
  - kerületkontroll növelése.
- Hosszú távú cél:
  - városi dominancia,
  - világtérképes bázis fejlesztése,
  - ranglistahelyezés,
  - más játékosokkal való verseny,
  - klán/család rendszer.

## 6. Célközönség

- Böngészős stratégiai játékokat kedvelő játékosok.
- Goodgame Empire-szerű fejlődést szerető játékosok.
- Maffia/noir témát kedvelő játékosok.
- Olyan játékosok, akik szeretnek naponta többször rövid időre belépni.
- Olyan játékosok, akik szeretik a ranglistát és a lassú, hosszú távú fejlődést.

## 7. Platform

- Első verzió:
  - PC böngésző,
  - egérrel használható térkép,
  - HTML, CSS, JavaScript.
- Második verzió:
  - mobilbarát nézet,
  - nagyobb gombok,
  - egyszerűbb térképkezelés.
- Későbbi lehetőség:
  - PWA,
  - telepíthető webapp,
  - szerveres profilmentés,
  - online ranglista.

---

# 02 - Játékmenet és rendszerek pontokban

## 1. Core loop

- A játékos belép a játékba.
- Megnézi az aktuális állapotot:
  - pénz,
  - hírnév,
  - banda,
  - körözés,
  - életerő,
  - energia,
  - aktív küldetés.
- Választ egy célpontot a térképen.
- Akciót indít:
  - rablás,
  - védelmi pénz,
  - pihenés,
  - fejlesztés,
  - toborzás.
- Jutalmat kap vagy kockázatot szenved el.
- A megszerzett pénzt és hírnevet fejlesztésekre költi.
- A fejlődés új célpontokat és új rendszereket nyit meg.

## 2. Napi játékritmus

- Rövid belépés: 2-5 perc.
  - bevétel átvétele,
  - küldetés ellenőrzése,
  - 1-2 akció indítása.
- Közepes belépés: 10-15 perc.
  - több rablás,
  - felszerelés ellenőrzése,
  - telkek fejlesztése,
  - banda fejlesztése.
- Hosszabb belépés: 20+ perc.
  - térképes tervezés,
  - kerületfoglalás,
  - többjátékos ranglista figyelése,
  - gazdasági optimalizálás.

## 3. Fő erőforrások

- Pénz:
  - rablásból,
  - védelmi pénzből,
  - passzív bevételből,
  - küldetésekből szerezhető.
- Hírnév:
  - rangokat nyit,
  - kerületátvételhez kell,
  - ranglistán is fontos.
- Banda / crew:
  - akcióerőt ad,
  - kerületek megszerzéséhez kell,
  - harci minijátékban is szerepet kap.
- Körözés / heat:
  - túl sok bűnözés után nő,
  - magas értéknél nő a kockázat,
  - lapulással csökkenthető.
- Életerő:
  - rablásoknál csökkenhet,
  - pihenéssel töltődik vissza.
- Energia:
  - akciók költsége,
  - természetesen regenerálódik,
  - pihenéssel gyorsabban visszatölthető.

## 4. Akciók

- Rablás:
  - aktív kockázatos akció,
  - pénzt és hírnevet ad,
  - növeli a körözést,
  - sérülést okozhat.
- Védelmi pénz:
  - ismételhető, de cooldownhoz kötött,
  - kisebb kockázatú bevétel,
  - kerületekhez és épületekhez kapcsolható.
- Toborzás:
  - pénzbe és energiába kerül,
  - növeli a bandát,
  - növeli a hírnevet.
- Lapulás:
  - csökkenti a körözést,
  - cserébe időt vagy befolyást vesz el.
- Bázispihenés:
  - életerőt és energiát tölt vissza,
  - kezdő játékosoknál fontos túlélési funkció.
- Telekfejlesztés:
  - pénzbe kerül,
  - passzív bevételt ad,
  - később üzlettípusokra bontható.

## 5. Rablásos minijáték

- A rablás ne csak egy gombnyomás legyen.
- A játékos célpontot választ.
- A játék kiszámolja az ellenfél erejét.
- A játékos bandatagot vagy taktikát választ.
- A rablás során több érték változik:
  - játékos életereje,
  - kontroll,
  - alert,
  - ellenfél ereje,
  - zsákmány.
- Sikeres rablás esetén:
  - pénz jár,
  - hírnév jár,
  - küldetés haladhat,
  - tárgy is eshet.
- Sikertelen rablás esetén:
  - életerő csökken,
  - körözés nőhet,
  - pénzvesztés is lehet.

## 6. Küldetések

- A küldetésrendszer adja a játékosnak az irányt.
- Küldetéstípusok:
  - rablásos küldetés,
  - védelmi pénzes küldetés,
  - toborzós küldetés,
  - fejlesztési küldetés,
  - kerületfoglalási küldetés.
- A küldetés tartalmazza:
  - címet,
  - leírást,
  - célpontot,
  - állapotot,
  - célszámot,
  - haladást,
  - jutalmat.
- Jutalmak lehetnek:
  - pénz,
  - hírnév,
  - felszerelés,
  - energia,
  - bandatag bónusz.

## 7. Kerületkontroll

- A város kerületekre van osztva.
- Minden kerületnek saját értéke és biztonsága van.
- Minél nagyobb a biztonság, annál nehezebb átvenni.
- Kerületátvételhez kell:
  - megfelelő hírnév,
  - megfelelő bandaerő,
  - pénz vagy akciósorozat.
- Kontrollált kerület adhat:
  - napi bevételt,
  - hűséget,
  - befolyást,
  - új célpontokat.

## 8. Telkek és épületek

- A várostérképen üres telkek vannak.
- A telek fejleszthető.
- A telek szintje 0-ról indul.
- Lehetséges szintek:
  - 1. szint: kis üzlet,
  - 2. szint: kávézó vagy fedőüzlet,
  - 3. szint: díszes üzlet vagy családi fedővállalkozás.
- Minden szint több passzív bevételt ad.
- Később üzlettípusokra lehet bontani:
  - speakeasy bár,
  - illegális kaszinó,
  - autószerelő fedőműhely,
  - import raktár,
  - ruhaszalon,
  - informátor iroda.

## 9. Felszerelés

- Hat felszerelés slot ajánlott:
  - kalap,
  - ing,
  - nadrág,
  - fegyver,
  - cipő,
  - óra.
- Minden tárgy erőt ad.
- A fegyver nagyobb harci bónuszt ad.
- A ruházat stílust, presztízst vagy védelmet adhat.
- A tárgyak minősége:
  - alap,
  - ritka,
  - elit,
  - Don-szintű.

## 10. Rangok

- A rang a hírnév alapján nő.
- Ajánlott rangok:
  - Kezdő gengszter,
  - Utcai főnök,
  - Kerületvezető,
  - Befolyásos figura,
  - Maffia középvezető,
  - Maffia főnök,
  - Don,
  - Városi legenda.
- Minden rang nyithat:
  - új célpontot,
  - új tárgyakat,
  - magasabb épületszintet,
  - nagyobb bandalimietet,
  - új küldetéssort.

---

# 03 - Technikai terv pontokban

## 1. Jelenlegi technikai irány

- A játék JavaScript alapú böngészős prototípus.
- A kódban már szerepel:
  - mentési kulcs,
  - korábbi mentési verziók kezelése,
  - szerveres mentési API alapútvonal,
  - kerületdefiníciók,
  - rangtábla,
  - világtérkép generálás,
  - telekkoordináta-rendszer,
  - felszereléskatalógus,
  - bandatag sablonok,
  - kattintható épületek,
  - parkok,
  - üres telkek,
  - rablás UI elemek,
  - karakterpanel,
  - klánpanel,
  - ranglista panel,
  - fekete piac panel helye.

## 2. Javasolt projektstruktúra

- `index.html`
  - játék kezdő HTML fájl.
- `src/main.js`
  - indítás, fő inicializálás.
- `src/state.js`
  - játékállapot.
- `src/save.js`
  - mentés és betöltés.
- `src/config/districts.js`
  - kerületek.
- `src/config/ranks.js`
  - rangok.
- `src/config/equipment.js`
  - felszerelések.
- `src/config/buildings.js`
  - kattintható városi épületek.
- `src/config/lots.js`
  - telkek és fejlesztések.
- `src/systems/economy.js`
  - pénz, bevétel, költségek.
- `src/systems/quests.js`
  - küldetések.
- `src/systems/robbery.js`
  - rablásos minijáték.
- `src/systems/worldMap.js`
  - világtérkép és telekválasztás.
- `src/ui/hud.js`
  - HUD frissítés.
- `src/ui/panels.js`
  - oldalpanelek.
- `src/ui/modals.js`
  - modális ablakok.
- `assets/`
  - képek, térképek, karakterek, ikonok.
- `docs/`
  - játékdokumentáció.

## 3. Állapotkezelés

- A játékállapot legyen egy központi objektumban.
- Fontos állapotmezők:
  - profilnév,
  - pénz,
  - hírnév,
  - banda,
  - körözés,
  - életerő,
  - energia,
  - felszerelés,
  - inventár,
  - bandatagok,
  - aktív bandatag,
  - kiválasztott telek,
  - városi telkek fejlesztése,
  - kerületek kontrollja,
  - aktív küldetések,
  - cooldownok,
  - napi limitek.

## 4. Mentés

- Lokális mentés:
  - `localStorage` használata.
  - verziózott mentési kulcsok.
  - régi mentések beolvasása.
- Szerveres mentés:
  - `/api/saves` végpont.
  - profilnév alapján játékosazonosítás.
  - ranglista és világtérkép miatt később kötelező.
- Mentési szabály:
  - fontos akció után azonnal mentés,
  - gyors egymásutáni akcióknál késleltetett mentés,
  - hibás szerverválasz esetén lokális mentés maradjon.

## 5. Világtérkép technika

- A világtérkép csempézett háttérből áll.
- A térkép mérete több csempe összege.
- A telkek generálhatók sorok és oszlopok alapján.
- Minden telek kap:
  - azonosítót,
  - kódot,
  - koordinátát,
  - x pozíciót,
  - y pozíciót.
- A játékos kezdéskor szabad telket választ.
- Foglalt telek nem választható.
- Saját telek külön jelölést kap.

## 6. UI-rendszer

- A HUD mindig mutassa:
  - pénz,
  - hírnév,
  - rang,
  - banda,
  - körözés,
  - életerő,
  - energia,
  - aktív küldetés.
- A térképen kattintható elemek legyenek.
- Kattintáskor választókerék vagy panel jelenjen meg.
- Fontos panelek:
  - karakterlap,
  - felszerelésválasztó,
  - rablás minijáték,
  - telekinformáció,
  - ranglista,
  - klán,
  - fekete piac,
  - világtérkép.

## 7. Adatvezérelt fejlesztés

- A játék elemei ne legyenek szétszórva a kódban.
- Kerületek külön config fájlban legyenek.
- Rangok külön config fájlban legyenek.
- Felszerelések külön config fájlban legyenek.
- Küldetések sablonokból generálódjanak.
- Így könnyebb lesz:
  - új tárgyat hozzáadni,
  - új kerületet hozzáadni,
  - egyensúlyt módosítani,
  - új küldetést írni,
  - később adatbázisba áttenni.

## 8. Fontos minőségi feladatok

- A teljes szöveg legyen magyar ékezetes.
- A hibás karakterkódolásokat javítani kell.
- A fájlokat érdemes UTF-8 kódolással menteni.
- A túl hosszú `game.js` fájlt modulokra kell bontani.
- A megjelenítést és a logikát külön kell választani.
- A mentés előtt az adatokat normalizálni kell.
- A játékállapot ne sérüljön hibás mentésnél.
- Mobilnézetnél a térkép helyett egyszerűsített panel is kellhet.

---

# 04 - Fejlesztési feladatlista pontokban

## 1. Azonnali rendrakás

- [ ] A teljes projektet mappákba rendezni.
- [ ] A `game.js` fájlt átnevezni vagy modulokra bontani.
- [ ] A karakterkódolási hibákat javítani.
- [ ] A magyar ékezeteket egységesíteni.
- [ ] A config adatokat külön fájlokba rakni.
- [ ] A UI szövegeket külön nyelvi fájlba rakni.
- [ ] A mentési verziószámot dokumentálni.
- [ ] A hibakezelést láthatóbbá tenni.

## 2. MVP - játszható első verzió

- [ ] Regisztráció profilnévvel.
- [ ] Kezdő világtérképes telekválasztás.
- [ ] Várostérkép megjelenítése.
- [ ] Épületre kattintás.
- [ ] Rablás indítása.
- [ ] Védelmi pénz indítása.
- [ ] Energia és életerő fogyasztás.
- [ ] Pénz és hírnév jutalom.
- [ ] Körözés növekedés.
- [ ] Lapulás funkció.
- [ ] Pihenés funkció.
- [ ] Napi bevétel.
- [ ] Legalább 5 küldetés.
- [ ] Legalább 6 rang.
- [ ] Legalább 6 felszerelés slot.
- [ ] Mentés és betöltés.
- [ ] Alap ranglista.

## 3. Gazdaság fejlesztése

- [ ] Telek megvásárlás vagy elfoglalás.
- [ ] Telek fejlesztése 1-3 szintig.
- [ ] Passzív bevétel számítása.
- [ ] Kerületbevétel bevezetése.
- [ ] Hűség vagy kontroll érték bevezetése.
- [ ] Külön üzlettípusok.
- [ ] Külön költségek üzlettípusonként.
- [ ] Bevétel begyűjtés gomb.
- [ ] Napi limit vagy időalapú termelés.

## 4. Harc és rablás

- [ ] Célpont nehézségének pontos skálázása.
- [ ] Bandatagok szerepének erősítése.
- [ ] Taktikaválasztás hatásainak pontosítása.
- [ ] Ellenféltípusok bevezetése.
- [ ] Loot táblázat.
- [ ] Ritka tárgy esés.
- [ ] Rablás utáni összefoglaló panel.
- [ ] Sikertelen rablás következményei.
- [ ] Magas körözés esetén extra rendőri kockázat.

## 5. Küldetésrendszer

- [ ] Küldetéssablonok létrehozása.
- [ ] Küldetés generálása kerület alapján.
- [ ] Napi küldetések.
- [ ] Főküldetés-sorozat.
- [ ] Ranghoz kötött küldetések.
- [ ] Jutalmak kiegyensúlyozása.
- [ ] Küldetésnapló.
- [ ] Teljesített küldetések listája.

## 6. Karakter és banda

- [ ] Bandatag szintlépés.
- [ ] Bandatag támadás, védelem, életerő fejlesztése.
- [ ] Új bandatagok toborzása.
- [ ] Ritka bandatagok.
- [ ] Bandatag sérülés vagy pihenőidő.
- [ ] Aktív bandatag kiválasztása akció előtt.
- [ ] Karakter statisztika részletesítése.
- [ ] Felszerelés összehasonlító panel.

## 7. Fekete piac

- [ ] Fegyverek vásárlása.
- [ ] Ruházat vásárlása.
- [ ] Informátor vásárlása.
- [ ] Hamis papírok vásárlása.
- [ ] Körözéscsökkentő szolgáltatás.
- [ ] Ritka napi ajánlatok.
- [ ] Korlátozott készlet.
- [ ] Árskálázás rang alapján.

## 8. Világtérkép és többjátékos irány

- [ ] Foglalt telkek szerverről betöltése.
- [ ] Más játékos adatainak megjelenítése.
- [ ] Saját külső bázis fejlesztése.
- [ ] Bázisszint látható ikonja.
- [ ] Világtérképes kereső finomítása.
- [ ] Játékos profilkártya más telkére kattintva.
- [ ] Ranglista város, hírnév és bázisszint alapján.
- [ ] Később támadás más játékos ellen.
- [ ] Később szövetség / család rendszer.

## 9. UI és grafika

- [ ] Egységes 1930-as évekbeli gombstílus.
- [ ] Dosszié jellegű panelek.
- [ ] Animált térkép hover.
- [ ] Jobb karakterportré.
- [ ] Tárgyikonok.
- [ ] Kerületikonok.
- [ ] Rablás eredmény animáció.
- [ ] Hangulatüzenetek.
- [ ] Mobilbarát HUD.
- [ ] Egységes betűtípus.

## 10. Tesztelés

- [ ] Új játék indítása teszt.
- [ ] Mentés-betöltés teszt.
- [ ] Régi mentés kompatibilitás teszt.
- [ ] Rablás siker teszt.
- [ ] Rablás bukás teszt.
- [ ] Energia 0 teszt.
- [ ] Életerő 0 teszt.
- [ ] Körözés maximum teszt.
- [ ] Telekfejlesztés teszt.
- [ ] Világtérképes telekválasztás teszt.
- [ ] Ranglista betöltés teszt.

## 11. Kiadási terv

- [ ] 0.1 verzió: prototípus stabilizálása.
- [ ] 0.2 verzió: játszható core loop.
- [ ] 0.3 verzió: küldetések és felszerelés bővítése.
- [ ] 0.4 verzió: gazdaság és telkek.
- [ ] 0.5 verzió: ranglista és szerveres mentés.
- [ ] 0.6 verzió: világtérkép fejlesztése.
- [ ] 0.7 verzió: klán/család rendszer alapjai.
- [ ] 1.0 verzió: publikus első kiadás.

---

# 05 - Adatok és egyensúly pontokban

## 1. Kerületek

- Belváros
  - típus: központ
  - érték: közepes
  - biztonság: közepes
  - hangulat: régi házak, sűrű utcák, városi szív.
- Piac tér
  - típus: kereskedelem
  - érték: közepes
  - biztonság: közepes-alacsony
  - hangulat: üzletek, kirakatok, forgalmas sarkok.
- Kikötő
  - típus: logisztika
  - érték: magas
  - biztonság: közepes-magas
  - hangulat: raktárak, rakpart, teherautók.
- Gyárnegyed
  - típus: ipari zóna
  - érték: alacsony-közepes
  - biztonság: alacsony
  - hangulat: régi csarnokok, olcsó célpontok.
- Villanegyed
  - típus: prémium
  - érték: nagyon magas
  - biztonság: magas
  - hangulat: elegáns házak, nagy pénz, nagy kockázat.
- Peremkerület
  - típus: lakóövezet
  - érték: alacsony-közepes
  - biztonság: alacsony
  - hangulat: kisebb házak, kertek, könnyebb terjeszkedés.

## 2. Rangtábla

- Kezdő gengszter
  - szükséges hírnév: 0
  - nyitás: alap akciók.
- Utcai főnök
  - szükséges hírnév: 20
  - nyitás: jobb rablások.
- Kerületvezető
  - szükséges hírnév: 50
  - nyitás: kerületkontroll.
- Befolyásos figura
  - szükséges hírnév: 90
  - nyitás: fekete piac jobb ajánlatai.
- Maffia középvezető
  - szükséges hírnév: 150
  - nyitás: magasabb szintű üzletek.
- Maffia főnök
  - szükséges hírnév: 240
  - nyitás: erősebb banda és prémium célpontok.

## 3. Ajánlott erőforrás-skála

- Kezdő pénz: 100-150.
- Kezdő energia: 100.
- Kezdő életerő: 100.
- Kezdő banda: 3 ember.
- Kezdő körözés: 0.
- Könnyű rablás jutalom: 20-60 pénz.
- Közepes rablás jutalom: 70-160 pénz.
- Nehéz rablás jutalom: 180-400 pénz.
- Védelmi pénz: 25-120 pénz célponttól függően.
- Toborzás ára: 80-250 pénz.
- Telek első fejlesztése: 80 pénz körül.
- Telek második fejlesztése: 180 pénz körül.
- Telek harmadik fejlesztése: 320 pénz körül.

## 4. Felszerelés slotok

- Kalap
  - bónusz: stílus vagy presztízs.
  - példák: fekete fedora, selyemszalagos kalap, Don fedora.
- Ing
  - bónusz: fellépés vagy védelem.
  - példák: fehér ing, csíkos ing, selyeming.
- Nadrág
  - bónusz: rutin vagy védelem.
  - példák: fekete szövet, gyapjú nadrág, főnöki nadrág.
- Fegyver
  - bónusz: támadás.
  - példák: Colt M1911, rövid csövű puska, Tommy géppisztoly.
- Cipő
  - bónusz: lépés vagy lopakodás.
  - példák: bőr félcipő, csendes cipő, lakkcipő.
- Óra
  - bónusz: presztízs.
  - példák: zsebóra, ezüst óra, arany óra.

## 5. Bandatag szerepek

- Végrehajtó
  - kiegyensúlyozott támadás és életerő.
  - jó általános akciókra.
- Fegyveres
  - magas támadás.
  - jó rabláshoz és harci helyzetekhez.
- Megfigyelő
  - magasabb védelem vagy taktikai bónusz.
  - jó lopakodáshoz és előkészítéshez.

## 6. Körözés egyensúly

- Alacsony körözés: 0-25.
  - kevés extra kockázat.
- Közepes körözés: 26-60.
  - nagyobb rendőri figyelem.
- Magas körözés: 61-85.
  - rablásnál extra büntetés.
- Kritikus körözés: 86-100.
  - nagy bukási esély,
  - lapulás erősen ajánlott,
  - bizonyos akciók blokkolhatók.

## 7. Energia és regeneráció

- Energia akciónként fogyjon.
- Könnyű akció: 8-15 energia.
- Közepes akció: 16-30 energia.
- Nehéz akció: 31-50 energia.
- Természetes regeneráció:
  - lassú, időalapú.
  - teljes töltés 8-12 óra alatt ideális böngészős játékhoz.
- Pihenés:
  - gyorsabb visszatöltés.
  - cooldownhoz köthető.

## 8. Passzív bevétel

- Kerületbevétel:
  - érték x kontroll x hűség alapján számolható.
- Telekbevétel:
  - épületszint alapján számolható.
- Ajánlott napi telekbevétel:
  - 1. szint: 80.
  - 2. szint: 190.
  - 3. szint: 360.
- Fontos, hogy a passzív bevétel ne tegye feleslegessé az aktív játékot.
- A legjobb ritmus:
  - passzív bevétel segít,
  - aktív rablás gyorsít,
  - fejlesztés hosszú távon erősít.
