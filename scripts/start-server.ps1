[CmdletBinding()]
param(
  [ValidateSet("", "development", "production")]
  [string]$Environment = "",
  [string]$HostName = "",
  [int]$Port = 0,
  [switch]$Force,
  [switch]$SkipHealthCheck
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\server-common.ps1"

Initialize-MaffiaRuntimeDirectories
$settings = Get-MaffiaServerSettings -Environment $Environment -HostName $HostName -Port $Port
$existingPid = Get-MaffiaServerPid

if ($existingPid) {
  $existingProcess = Get-MaffiaProcess -ProcessId $existingPid
  if ($existingProcess) {
    if (-not (Test-MaffiaServerProcess -ProcessId $existingPid)) {
      Write-Warning "A PID fajl nem a Maffia szerverre mutat, ezert torlom: $existingPid"
      Remove-MaffiaRuntimeFiles
      $existingPid = $null
      $existingProcess = $null
    }

    if ($existingProcess -and -not $Force) {
      Write-Host "A Maffia szerver mar fut. PID: $existingPid"
      Write-Host "Statusz: powershell -ExecutionPolicy Bypass -File scripts/server-status.ps1"
      exit 0
    }

    if ($existingProcess) {
      & "$PSScriptRoot\stop-server.ps1" -Quiet
    }
  } else {
    Remove-MaffiaRuntimeFiles
  }
}

$portPids = @(Get-MaffiaPortProcessIds -Port $settings.Port)
if ($portPids.Count -gt 0) {
  $serverPortPids = @($portPids | Where-Object { Test-MaffiaServerProcess -ProcessId $_ })
  if ($Force -and $serverPortPids.Count -gt 0 -and $serverPortPids.Count -eq $portPids.Count) {
    & "$PSScriptRoot\stop-server.ps1" -Port $settings.Port -Quiet
  } else {
    throw "A(z) $($settings.Port) port mar foglalt. PID: $($portPids -join ', '). Ha ez a Maffia szerver, futtasd: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\restart-server.ps1"
  }
}

$nodePath = Resolve-MaffiaNodePath
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path (Get-MaffiaLogDir) "server-$timestamp.log"

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = $nodePath
$processInfo.Arguments = "--env-file-if-exists=.env server.js"
$processInfo.WorkingDirectory = Get-MaffiaProjectRoot
$processInfo.UseShellExecute = $true
$processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$processInfo.CreateNoWindow = $false

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $processInfo

$envOverrides = @{
  APP_ENV = $settings.Environment
  NODE_ENV = $settings.Environment
  HOST = $settings.HostName
  PORT = [string]$settings.Port
  SERVER_LOG_FILE = $logFile
  SERVER_LOG_TO_STDOUT = "false"
}
$previousEnv = @{}

try {
  foreach ($key in $envOverrides.Keys) {
    $previousEnv[$key] = [System.Environment]::GetEnvironmentVariable($key, "Process")
    [System.Environment]::SetEnvironmentVariable($key, [string]$envOverrides[$key], "Process")
  }

  if (-not $process.Start()) {
    throw "A szerverfolyamat nem indult el."
  }
} finally {
  foreach ($key in $envOverrides.Keys) {
    [System.Environment]::SetEnvironmentVariable($key, $previousEnv[$key], "Process")
  }
}

Write-MaffiaServerMeta -ProcessId $process.Id -Settings $settings -NodePath $nodePath -LogFile $logFile

Write-Host "Maffia szerver inditva. PID: $($process.Id)"
Write-Host "URL: $($settings.PublicUrl)"
Write-Host "Log: $logFile"

if ($SkipHealthCheck) {
  exit 0
}

$health = Wait-MaffiaServerHealth -Url $settings.HealthUrl -TimeoutSeconds 20
if ($health.Ok) {
  Write-Host "Health OK: $($settings.HealthUrl)"
  Write-Host $health.Content
  exit 0
}

$running = Get-MaffiaProcess -ProcessId $process.Id
if ($running) {
  Write-Warning "A szerver fut, de a health check nem valaszolt idoben: $($health.Error)"
  Write-Warning "Nezd meg a logot: $logFile"
  exit 1
}

Remove-MaffiaRuntimeFiles
throw "A szerver elindult, de kilepett. Nezd meg a logot: $logFile"
