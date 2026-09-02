param(
    [string]$OutputRoot = "$env:USERPROFILE\Desktop\standalone-revision-R-final-2.0"
)

$ErrorActionPreference = 'Stop'
$sourceRoot = Split-Path -Parent $PSCommandPath
$sourceWebUi = Join-Path $sourceRoot 'webui'
$sourceApp = Join-Path $sourceRoot 'app'

if (-not (Test-Path (Join-Path $sourceWebUi 'glitch-canvas.html')) -or -not (Test-Path (Join-Path $sourceApp 'StandaloneRevisionRFinal.exe'))) {
    throw "Missing standalone application source under: $sourceRoot"
}

New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null
$targetWebUi = Join-Path $OutputRoot 'webui'
New-Item -ItemType Directory -Force -Path $targetWebUi | Out-Null
Copy-Item -Path (Join-Path $sourceWebUi '*') -Destination $targetWebUi -Recurse -Force
Copy-Item -Path $sourceApp -Destination $OutputRoot -Recurse -Force
Copy-Item -LiteralPath (Join-Path $sourceRoot 'Launch-Standalone-Revision-R-Final-2.0.cmd') -Destination $OutputRoot -Force
Copy-Item -LiteralPath (Join-Path $sourceRoot 'Start-Standalone-Revision-R-Final-2.0.ps1') -Destination $OutputRoot -Force
Copy-Item -LiteralPath (Join-Path $sourceRoot 'README.md') -Destination $OutputRoot -Force

Write-Host "Standalone Revision R Final 2.0 installed to: $OutputRoot"
Write-Host "Launcher: $(Join-Path $OutputRoot 'Launch-Standalone-Revision-R-Final-2.0.cmd')"