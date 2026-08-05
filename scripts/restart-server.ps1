[CmdletBinding()]
param(
  [ValidateSet("", "development", "production")]
  [string]$Environment = "",
  [string]$HostName = "",
  [int]$Port = 0,
  [switch]$SkipHealthCheck
)

$ErrorActionPreference = "Stop"

$stopArgs = @{}
if ($Port -gt 0) { $stopArgs["Port"] = $Port }
& "$PSScriptRoot\stop-server.ps1" -Quiet @stopArgs

$startArgs = @{}
if (-not [string]::IsNullOrWhiteSpace($Environment)) { $startArgs["Environment"] = $Environment }
if (-not [string]::IsNullOrWhiteSpace($HostName)) { $startArgs["HostName"] = $HostName }
if ($Port -gt 0) { $startArgs["Port"] = $Port }
if ($SkipHealthCheck) { $startArgs["SkipHealthCheck"] = $true }

& "$PSScriptRoot\start-server.ps1" @startArgs
exit $LASTEXITCODE
