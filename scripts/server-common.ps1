$Script:ProjectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$Script:RunDir = Join-Path $Script:ProjectRoot "run"
$Script:LogDir = Join-Path $Script:ProjectRoot "logs"
$Script:PidFile = Join-Path $Script:RunDir "maffia-server.pid"
$Script:MetaFile = Join-Path $Script:RunDir "maffia-server.json"

function Get-MaffiaProjectRoot {
  return $Script:ProjectRoot
}

function Get-MaffiaRunDir {
  return $Script:RunDir
}

function Get-MaffiaLogDir {
  return $Script:LogDir
}

function Get-MaffiaPidFile {
  return $Script:PidFile
}

function Get-MaffiaMetaFile {
  return $Script:MetaFile
}

function Initialize-MaffiaRuntimeDirectories {
  New-Item -ItemType Directory -Force -Path $Script:RunDir | Out-Null
  New-Item -ItemType Directory -Force -Path $Script:LogDir | Out-Null
}

function Read-MaffiaDotEnv {
  param([string]$Path = (Join-Path $Script:ProjectRoot ".env"))

  $values = @{}
  if (-not (Test-Path -LiteralPath $Path)) {
    return $values
  }

  foreach ($rawLine in [System.IO.File]::ReadLines($Path)) {
    $line = $rawLine.Trim()
    if ($line.Length -eq 0) { continue }
    if ($line.StartsWith("#")) { continue }
    if ($line.StartsWith("export ")) {
      $line = $line.Substring(7).Trim()
    }

    $equalsIndex = $line.IndexOf("=")
    if ($equalsIndex -lt 1) { continue }

    $key = $line.Substring(0, $equalsIndex).Trim()
    $value = $line.Substring($equalsIndex + 1).Trim()

    if ($value.Length -ge 2) {
      $first = $value.Substring(0, 1)
      $last = $value.Substring($value.Length - 1, 1)
      if (($first -eq '"' -and $last -eq '"') -or ($first -eq "'" -and $last -eq "'")) {
        $value = $value.Substring(1, $value.Length - 2)
      }
    }

    if ($key -match "^[A-Za-z_][A-Za-z0-9_]*$") {
      $values[$key] = $value
    }
  }

  return $values
}

function Get-MaffiaEnvValue {
  param(
    [hashtable]$DotEnv,
    [string]$Name,
    [string]$DefaultValue = ""
  )

  if ($DotEnv.ContainsKey($Name) -and -not [string]::IsNullOrWhiteSpace([string]$DotEnv[$Name])) {
    return [string]$DotEnv[$Name]
  }

  return $DefaultValue
}

function ConvertTo-MaffiaInt {
  param(
    [string]$Value,
    [int]$DefaultValue,
    [int]$Minimum = 1,
    [int]$Maximum = 65535
  )

  $number = 0
  if (-not [int]::TryParse($Value, [ref]$number)) {
    return $DefaultValue
  }

  if ($number -lt $Minimum) { return $Minimum }
  if ($number -gt $Maximum) { return $Maximum }
  return $number
}

function Get-MaffiaServerSettings {
  param(
    [string]$Environment = "",
    [string]$HostName = "",
    [int]$Port = 0
  )

  $dotEnv = Read-MaffiaDotEnv
  $resolvedEnvironment = $Environment
  if ([string]::IsNullOrWhiteSpace($resolvedEnvironment)) {
    $resolvedEnvironment = Get-MaffiaEnvValue -DotEnv $dotEnv -Name "APP_ENV" -DefaultValue ""
  }
  if ([string]::IsNullOrWhiteSpace($resolvedEnvironment)) {
    $resolvedEnvironment = Get-MaffiaEnvValue -DotEnv $dotEnv -Name "NODE_ENV" -DefaultValue "development"
  }

  $resolvedHostName = $HostName
  if ([string]::IsNullOrWhiteSpace($resolvedHostName)) {
    $resolvedHostName = Get-MaffiaEnvValue -DotEnv $dotEnv -Name "HOST" -DefaultValue ""
  }
  if ([string]::IsNullOrWhiteSpace($resolvedHostName)) {
    $resolvedHostName = Get-MaffiaEnvValue -DotEnv $dotEnv -Name "SERVER_HOST" -DefaultValue "127.0.0.1"
  }

  $resolvedPort = $Port
  if ($resolvedPort -le 0) {
    $resolvedPort = ConvertTo-MaffiaInt -Value (Get-MaffiaEnvValue -DotEnv $dotEnv -Name "PORT" -DefaultValue "8766") -DefaultValue 8766
  }

  $healthHost = $resolvedHostName
  if ($healthHost -eq "0.0.0.0" -or $healthHost -eq "::") {
    $healthHost = "127.0.0.1"
  }

  return [pscustomobject]@{
    Environment = $resolvedEnvironment
    HostName = $resolvedHostName
    Port = $resolvedPort
    HealthHost = $healthHost
    HealthUrl = "http://$($healthHost):$($resolvedPort)/api/health"
    PublicUrl = "http://$($resolvedHostName):$($resolvedPort)"
  }
}

function Resolve-MaffiaNodePath {
  $candidates = New-Object System.Collections.Generic.List[string]

  $explicitNodePath = [System.Environment]::GetEnvironmentVariable("MAFFIA_NODE", "Process")
  if (-not [string]::IsNullOrWhiteSpace($explicitNodePath)) {
    $candidates.Add($explicitNodePath)
  }

  $nodeCommands = @(Get-Command node -All -ErrorAction SilentlyContinue)
  foreach ($nodeCommand in $nodeCommands) {
    if ([string]::IsNullOrWhiteSpace($nodeCommand.Source)) { continue }

    if ($nodeCommand.Source -match "\.cmd$" -and (Test-Path -LiteralPath $nodeCommand.Source)) {
      try {
        $cmdContent = [System.IO.File]::ReadAllText($nodeCommand.Source)
        $match = [regex]::Match($cmdContent, '"([^"]*node\.exe)"')
        if ($match.Success) {
          $candidates.Add($match.Groups[1].Value)
        }
      } catch {
        # Ha a wrapper nem olvashato, kesobb probalkozunk mas jelolttel.
      }
      continue
    }

    $candidates.Add($nodeCommand.Source)
  }

  $knownPaths = @(
    (Join-Path $env:ProgramFiles "nodejs\node.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "nodejs\node.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\nodejs\node.exe"),
    (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
  )

  foreach ($knownPath in $knownPaths) {
    if (-not [string]::IsNullOrWhiteSpace($knownPath)) {
      $candidates.Add($knownPath)
    }
  }

  foreach ($candidate in ($candidates | Select-Object -Unique)) {
    if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
    if (-not (Test-Path -LiteralPath $candidate)) { continue }

    $item = Get-Item -LiteralPath $candidate -Force -ErrorAction SilentlyContinue
    if ($item -and -not $item.PSIsContainer -and $item.Name -match "^node(\.exe)?$") {
      return $item.FullName
    }
  }

  throw "Node.js nem talalhato. Telepits rendes Node.js-t, vagy allitsd be a MAFFIA_NODE valtozot a node.exe teljes utvonalara."
}

function Get-MaffiaServerPid {
  if (-not (Test-Path -LiteralPath $Script:PidFile)) {
    return $null
  }

  $text = [System.IO.File]::ReadAllText($Script:PidFile).Trim()
  $serverPid = 0
  if ([int]::TryParse($text, [ref]$serverPid)) {
    return $serverPid
  }

  return $null
}

function Get-MaffiaProcess {
  param([int]$ProcessId)

  if ($ProcessId -le 0) { return $null }
  try {
    return Get-Process -Id $ProcessId -ErrorAction Stop
  } catch {
    return $null
  }
}

function Get-MaffiaProcessCommandLine {
  param([int]$ProcessId)

  if ($ProcessId -le 0) { return "" }
  try {
    $cim = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction Stop
    return [string]$cim.CommandLine
  } catch {
    return ""
  }
}

function Test-MaffiaServerProcess {
  param([int]$ProcessId)

  $process = Get-MaffiaProcess -ProcessId $ProcessId
  if (-not $process) { return $false }

  $commandLine = Get-MaffiaProcessCommandLine -ProcessId $ProcessId
  if ([string]::IsNullOrWhiteSpace($commandLine)) {
    return $process.ProcessName -match "^(node|nodejs)$"
  }

  return $commandLine -match "(^|[\\/\s])server\.js($|[\s`"])"
}

function Get-MaffiaPortProcessIds {
  param([int]$Port)

  $ids = @()
  try {
    $connections = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop)
    foreach ($connection in $connections) {
      if ($connection.OwningProcess -gt 0) {
        $ids += [int]$connection.OwningProcess
      }
    }
  } catch {
    $ids = @()
  }

  if ($ids.Count -eq 0) {
    try {
      $lines = netstat -ano -p tcp 2>$null
      foreach ($line in $lines) {
        if ($line -match "LISTENING" -and $line -match "[:\.]$Port\s") {
          $parts = $line -split "\s+"
          $candidate = $parts[$parts.Length - 1]
          $id = 0
          if ([int]::TryParse($candidate, [ref]$id) -and $id -gt 0) {
            $ids += $id
          }
        }
      }
    } catch {
      return @()
    }
  }

  return @($ids | Sort-Object -Unique)
}

function Wait-MaffiaServerHealth {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 20
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $lastError = ""
  do {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
        return [pscustomobject]@{
          Ok = $true
          StatusCode = $response.StatusCode
          Content = [string]$response.Content
          Error = ""
        }
      }
      $lastError = "HTTP $($response.StatusCode)"
    } catch {
      $lastError = $_.Exception.Message
    }

    Start-Sleep -Milliseconds 500
  } while ((Get-Date) -lt $deadline)

  return [pscustomobject]@{
    Ok = $false
    StatusCode = 0
    Content = ""
    Error = $lastError
  }
}

function Write-MaffiaServerMeta {
  param(
    [int]$ProcessId,
    [object]$Settings,
    [string]$NodePath,
    [string]$LogFile
  )

  Initialize-MaffiaRuntimeDirectories
  [System.IO.File]::WriteAllText($Script:PidFile, [string]$ProcessId, [System.Text.Encoding]::UTF8)

  $meta = [ordered]@{
    pid = $ProcessId
    environment = $Settings.Environment
    host = $Settings.HostName
    port = $Settings.Port
    healthUrl = $Settings.HealthUrl
    publicUrl = $Settings.PublicUrl
    node = $NodePath
    logFile = $LogFile
    projectRoot = $Script:ProjectRoot
    startedAt = (Get-Date).ToString("s")
  }
  $json = $meta | ConvertTo-Json -Depth 4
  [System.IO.File]::WriteAllText($Script:MetaFile, $json, [System.Text.Encoding]::UTF8)
}

function Read-MaffiaServerMeta {
  if (-not (Test-Path -LiteralPath $Script:MetaFile)) {
    return $null
  }

  try {
    $json = [System.IO.File]::ReadAllText($Script:MetaFile, [System.Text.Encoding]::UTF8)
    return $json | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Remove-MaffiaRuntimeFiles {
  Remove-Item -LiteralPath $Script:PidFile -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $Script:MetaFile -Force -ErrorAction SilentlyContinue
}
