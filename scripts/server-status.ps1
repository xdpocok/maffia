[CmdletBinding()]
param(
  [int]$HealthTimeoutSeconds = 3
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\server-common.ps1"

$meta = Read-MaffiaServerMeta
$settings = Get-MaffiaServerSettings
if ($meta) {
  $settings = [pscustomobject]@{
    Environment = [string]$meta.environment
    HostName = [string]$meta.host
    Port = [int]$meta.port
    HealthHost = ""
    HealthUrl = [string]$meta.healthUrl
    PublicUrl = [string]$meta.publicUrl
  }
}

$serverPid = Get-MaffiaServerPid
if (-not $serverPid) {
  $portPidsForStatus = @(Get-MaffiaPortProcessIds -Port $settings.Port)
  $serverPortPids = @($portPidsForStatus | Where-Object { Test-MaffiaServerProcess -ProcessId $_ })
  if ($serverPortPids.Count -gt 0) {
    Write-Warning "Maffia szerver: fut, de nincs PID fajl. PID: $($serverPortPids -join ', ')"
    Write-Warning "Javasolt atvetel: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\restart-server.ps1"
  } else {
    Write-Host "Maffia szerver: nem fut PID fajl alapjan."
  }
} else {
  $process = Get-MaffiaProcess -ProcessId $serverPid
  if ($process -and (Test-MaffiaServerProcess -ProcessId $serverPid)) {
    Write-Host "Maffia szerver: fut. PID: $serverPid"
  } elseif ($process) {
    Write-Warning "PID fajl letezik, de nem biztos, hogy a Maffia szerverre mutat. PID: $serverPid"
  } else {
    Write-Warning "PID fajl letezik, de a folyamat mar nem fut. PID: $serverPid"
  }
}

Write-Host "URL: $($settings.PublicUrl)"
Write-Host "Health: $($settings.HealthUrl)"
if ($meta -and $meta.logFile) {
  Write-Host "Log: $($meta.logFile)"
}

$portPids = @(Get-MaffiaPortProcessIds -Port $settings.Port)
if ($portPids.Count -gt 0) {
  Write-Host "Port $($settings.Port): foglalt. PID: $($portPids -join ', ')"
} else {
  Write-Host "Port $($settings.Port): szabad."
}

$health = Wait-MaffiaServerHealth -Url $settings.HealthUrl -TimeoutSeconds $HealthTimeoutSeconds
if ($health.Ok) {
  Write-Host "Health OK"
  Write-Host $health.Content
} else {
  Write-Warning "Health nem elerheto: $($health.Error)"
}
