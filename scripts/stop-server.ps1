[CmdletBinding()]
param(
  [switch]$Quiet,
  [int]$Port = 0,
  [int]$TimeoutSeconds = 10
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\server-common.ps1"

$settings = Get-MaffiaServerSettings -Port $Port
$serverPid = Get-MaffiaServerPid
$targetPids = @()

if ($serverPid) {
  $process = Get-MaffiaProcess -ProcessId $serverPid
  if ($process) {
    if (-not (Test-MaffiaServerProcess -ProcessId $serverPid)) {
      if (-not $Quiet) { Write-Warning "A PID fajl nem a Maffia szerverre mutat, ezert torlom: $serverPid" }
      Remove-MaffiaRuntimeFiles
      $serverPid = $null
      $process = $null
    } else {
      $targetPids += $serverPid
    }
  } else {
    Remove-MaffiaRuntimeFiles
    if (-not $Quiet) { Write-Host "Stale PID fajl torolve. A szerver nem futott PID alapjan." }
  }
}

if ($targetPids.Count -eq 0) {
  $portPids = @(Get-MaffiaPortProcessIds -Port $settings.Port)
  foreach ($candidatePid in $portPids) {
    if (Test-MaffiaServerProcess -ProcessId $candidatePid) {
      $targetPids += $candidatePid
    }
  }
}

if ($targetPids.Count -eq 0) {
  if (-not $Quiet) { Write-Host "Nem talaltam futo Maffia szervert. Port: $($settings.Port)" }
  exit 0
}

$targetPids = @($targetPids | Sort-Object -Unique)
if (-not $Quiet) { Write-Host "Maffia szerver leallitasa. PID: $($targetPids -join ', ')" }

foreach ($targetPid in $targetPids) {
  Stop-Process -Id $targetPid -ErrorAction Stop
}

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
do {
  Start-Sleep -Milliseconds 500
  $stillRunning = @($targetPids | Where-Object { Get-MaffiaProcess -ProcessId $_ })
} while ($stillRunning.Count -gt 0 -and (Get-Date) -lt $deadline)

if ($stillRunning.Count -gt 0) {
  if (-not $Quiet) { Write-Warning "A szerver nem allt le idoben, kenyszeritett leallitas kovetkezik." }
  foreach ($targetPid in $stillRunning) {
    Stop-Process -Id $targetPid -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Milliseconds 500
}

Remove-MaffiaRuntimeFiles
if (-not $Quiet) { Write-Host "Maffia szerver leallitva." }
