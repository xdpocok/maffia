[CmdletBinding()]
param(
  [int]$Port = 8789,
  [string]$HostName = "127.0.0.1",
  [int]$TimeoutSeconds = 25
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\server-common.ps1"

Initialize-MaffiaRuntimeDirectories

$nodePath = Resolve-MaffiaNodePath
$dotEnv = Read-MaffiaDotEnv
$testLog = Join-Path (Get-MaffiaLogDir) ("production-smoke-{0}.log" -f $Port)
$healthUrl = "http://$($HostName):$($Port)/api/health"
$sessionUrl = "http://$($HostName):$($Port)/api/session"

$portPids = @(Get-MaffiaPortProcessIds -Port $Port)
if ($portPids.Count -gt 0) {
  throw "A production smoke port mar foglalt: $Port. PID: $($portPids -join ', ')"
}

$overrides = @{}
foreach ($key in $dotEnv.Keys) {
  $overrides[$key] = [string]$dotEnv[$key]
}

$overrides["APP_ENV"] = "production"
$overrides["NODE_ENV"] = "production"
$overrides["HOST"] = $HostName
$overrides["PORT"] = [string]$Port
$overrides["COOKIE_SECURE"] = "true"
$overrides["COOKIE_SAME_SITE"] = "Lax"
$overrides["ENABLE_HSTS"] = "false"
$overrides["SERVER_LOG_FILE"] = $testLog
$overrides["SERVER_LOG_TO_STDOUT"] = "false"

$previousEnv = @{}
$process = $null

try {
  foreach ($key in $overrides.Keys) {
    $previousEnv[$key] = [System.Environment]::GetEnvironmentVariable($key, "Process")
    [System.Environment]::SetEnvironmentVariable($key, [string]$overrides[$key], "Process")
  }

  $processInfo = New-Object System.Diagnostics.ProcessStartInfo
  $processInfo.FileName = $nodePath
  $processInfo.Arguments = "server.js"
  $processInfo.WorkingDirectory = Get-MaffiaProjectRoot
  $processInfo.UseShellExecute = $true
  $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden

  $process = [System.Diagnostics.Process]::Start($processInfo)
  Write-Host "TEMP_PROD_PID=$($process.Id)"

  $health = Wait-MaffiaServerHealth -Url $healthUrl -TimeoutSeconds $TimeoutSeconds
  if (-not $health.Ok) {
    if (Test-Path -LiteralPath $testLog) {
      Write-Host "LOG_TAIL:"
      Get-Content -Tail 40 -LiteralPath $testLog
    }
    throw "Production smoke health failed: $($health.Error)"
  }

  Write-Host "HEALTH_OK"
  Write-Host $health.Content

  $sessionPayload = @{ profileName = "ProductionSmoke0801" } | ConvertTo-Json -Compress
  $sessionResponse = Invoke-WebRequest -UseBasicParsing -Uri $sessionUrl -Method POST -ContentType "application/json" -Body $sessionPayload -TimeoutSec 5
  Write-Host "SESSION_STATUS=$($sessionResponse.StatusCode)"
  Write-Host "SET_COOKIE=$($sessionResponse.Headers["Set-Cookie"])"

  $headerResponse = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 5
  Write-Host "X_FRAME=$($headerResponse.Headers["X-Frame-Options"])"
  Write-Host "NOSNIFF=$($headerResponse.Headers["X-Content-Type-Options"])"
  Write-Host "REFERRER=$($headerResponse.Headers["Referrer-Policy"])"
  Write-Host "PERMISSIONS=$($headerResponse.Headers["Permissions-Policy"])"
  try {
    Invoke-WebRequest -UseBasicParsing -Uri "http://$($HostName):$($Port)/api/admin/status" -TimeoutSec 5 | Out-Null
    throw "A production admin vegpont nyilvanosan elerheto."
  } catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -ne 404) {
      throw
    }
    Write-Host "ADMIN_STATUS_HIDDEN=404"
  }
  Write-Host "LOG=$testLog"
} finally {
  foreach ($key in $overrides.Keys) {
    [System.Environment]::SetEnvironmentVariable($key, $previousEnv[$key], "Process")
  }

  if ($process -and -not $process.HasExited) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Write-Host "TEMP_PROD_STOPPED"
  }
}
