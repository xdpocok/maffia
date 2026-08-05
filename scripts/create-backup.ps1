param(
  [string]$BackupRoot = "backups",
  [switch]$IncludeDatabase
)

$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$BackupDir = Join-Path $ProjectRoot $BackupRoot
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

function Read-DotEnvValue {
  param([string]$Name)
  $envValue = [Environment]::GetEnvironmentVariable($Name)
  if ($envValue) { return $envValue }
  $envPath = Join-Path $ProjectRoot ".env"
  if (-not (Test-Path -LiteralPath $envPath)) { return "" }
  foreach ($line in Get-Content -LiteralPath $envPath) {
    if ($line -match "^\s*#") { continue }
    if ($line -match "^\s*$([regex]::Escape($Name))\s*=\s*(.*)\s*$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return ""
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$CodeArchive = Join-Path $BackupDir "maffia-code-$Timestamp.zip"
$ExcludedNames = @("node_modules", ".git", "backups", ".agents", ".codex", "tmp", ".chrome-check")
$CodeSources = Get-ChildItem -LiteralPath $ProjectRoot -Force |
  Where-Object { $ExcludedNames -notcontains $_.Name } |
  Select-Object -ExpandProperty FullName

Compress-Archive -Path $CodeSources -DestinationPath $CodeArchive -CompressionLevel Optimal -Force
Write-Host "Code backup: $CodeArchive"

if ($IncludeDatabase) {
  $mysqldump = Get-Command "mysqldump" -ErrorAction SilentlyContinue
  if (-not $mysqldump) {
    Write-Warning "mysqldump nem talalhato, az adatbazis mentese kimaradt."
    exit 0
  }
  $DbHost = Read-DotEnvValue "MYSQL_HOST"
  $DbPort = Read-DotEnvValue "MYSQL_PORT"
  $DbUser = Read-DotEnvValue "MYSQL_USER"
  $DbPassword = Read-DotEnvValue "MYSQL_PASSWORD"
  $DbName = Read-DotEnvValue "MYSQL_DATABASE"
  if (-not $DbHost) { $DbHost = "127.0.0.1" }
  if (-not $DbPort) { $DbPort = "3306" }
  if (-not $DbUser -or -not $DbName) {
    Write-Warning "MYSQL_USER vagy MYSQL_DATABASE nincs beallitva, az adatbazis mentese kimaradt."
    exit 0
  }
  $DumpFile = Join-Path $BackupDir "maffia-db-$Timestamp.sql"
  $PreviousMysqlPwd = [Environment]::GetEnvironmentVariable("MYSQL_PWD")
  try {
    if ($DbPassword) { [Environment]::SetEnvironmentVariable("MYSQL_PWD", $DbPassword, "Process") }
    & $mysqldump.Source `
      "--host=$DbHost" `
      "--port=$DbPort" `
      "--user=$DbUser" `
      "--single-transaction" `
      "--quick" `
      "--routines" `
      "--events" `
      "--result-file=$DumpFile" `
      $DbName
    if ($LASTEXITCODE -ne 0) { throw "mysqldump hibakod: $LASTEXITCODE" }
    Compress-Archive -Path $DumpFile -DestinationPath "$DumpFile.zip" -CompressionLevel Optimal -Force
    Remove-Item -LiteralPath $DumpFile -Force
    Write-Host "Database backup: $DumpFile.zip"
  } finally {
    [Environment]::SetEnvironmentVariable("MYSQL_PWD", $PreviousMysqlPwd, "Process")
  }
}
