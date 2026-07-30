# MySQL beallitas

A jatek szervere mar csak MySQL-t hasznal. Inditas elott legyen elerheto egy
MySQL 8 vagy MariaDB szerver.

PowerShell pelda:

```powershell
$env:MYSQL_HOST="127.0.0.1"
$env:MYSQL_PORT="3306"
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="a-jelszavad"
$env:MYSQL_DATABASE="maffia"
npm start
```

A szerver az elso inditaskor letrehozza a `maffia` adatbazist es a szukseges
tablakat. Az elerhetoseg ellenorzese:

```text
http://127.0.0.1:8766/api/health
```
