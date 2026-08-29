param(
    [string]$RepoRoot = (Get-Location).Path,
    [string]$OutputDir = "extras\\glitch-canvas-player\\dist",
    [int]$TargetMaxMb = 75,
    [int]$HardFailMb = 100
)

$canonicalBuildScript = Join-Path $PSScriptRoot "extras\glitch-canvas-player\scripts\build-standalone-r-final.ps1"
if (-not (Test-Path $canonicalBuildScript)) {
    throw "Canonical build script not found: $canonicalBuildScript"
}

& $canonicalBuildScript -RepoRoot $RepoRoot -OutputDir $OutputDir -TargetMaxMb $TargetMaxMb -HardFailMb $HardFailMb
