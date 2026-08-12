# Facebook Instant Games beállítás

Az integráció a meglévő Node.js folyamatban működik; külön háttérprogram nem szükséges.

## Elkészült végpontok és oldalak

- `GET /api/facebook/config` – nyilvános, titkot nem tartalmazó klienskonfiguráció.
- `POST /api/facebook/session` – Meta által aláírt játékosadat ellenőrzése és saját munkamenet létrehozása.
- `POST /api/facebook/data-deletion` – Meta adattörlési callback.
- `https://maffiabirodalom.hu/adatkezeles.html` – adatkezelési tájékoztató.
- `https://maffiabirodalom.hu/adattorles.html` – adattörlési útmutató és visszaigazolás.

## Szükséges környezeti változók

```env
META_INSTANT_GAMES_ENABLED=true
META_APP_ID=a_meta_alkalmazas_azonositoja
META_APP_SECRET=a_meta_alkalmazas_titka
META_SIGNED_INFO_MAX_AGE_SECONDS=600
META_ALLOWED_ORIGINS=https://www.facebook.com,https://apps.facebook.com
PUBLIC_BASE_URL=https://maffiabirodalom.hu
```

Az `META_APP_SECRET` kizárólag a szerver `.env` fájljában lehet. Gitbe, HTML-be vagy JavaScript-kliensbe nem kerülhet.

## Meta irányítópulton megadandó címek

- Privacy Policy URL: `https://maffiabirodalom.hu/adatkezeles.html`
- User Data Deletion URL: `https://maffiabirodalom.hu/api/facebook/data-deletion`
- Data Deletion Instructions URL: `https://maffiabirodalom.hu/adattorles.html`

## Publikálás előtti kötelező kézi lépések

1. A Meta irányítópultból másold az App ID és App Secret értékeket a szerver `.env` fájljába.
2. Ellenőrizd a Meta által használt aktuális Instant Games SDK-verziót. Az `index.html` jelenleg a 6.3-as SDK-címet használja; ha a Meta újabbat ír elő, frissíteni kell.
3. Ha a Meta tesztkörnyezetének Origin címe eltér az alapértelmezettől, add hozzá pontosan a `META_ALLOWED_ORIGINS` listához.
4. Indítsd újra a Node.js szervert, majd ellenőrizd az `/api/health` és `/api/facebook/config` végpontokat.
5. Teszteld egy Meta tesztjátékossal a belépést, új profil létrehozását, mentést, visszalépést és adattörlést.

## Biztonsági működés

- A kliens `FBInstant.player.getSignedPlayerInfoAsync()` aláírást kér.
- A szerver HMAC-SHA256 algoritmussal és az App Secrettel ellenőrzi azt.
- A Facebook játékosazonosító egy saját belső profilhoz kapcsolódik.
- A Facebook-környezetben a kliens Bearer munkamenetet használ, így nem függ harmadik féltől származó sütiktől.
- Hibás, lejárt vagy más kéréshez készült aláírással nem lehet belépni.
