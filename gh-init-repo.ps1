param(
    [Parameter(Mandatory = $true)]
    [string]$RepoName,
    [string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"

if ($Visibility -notin @("public", "private", "internal")) {
    throw "Visibility must be public, private, or internal."
}

$repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
Set-Location $repoRoot

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) is not installed or not in PATH."
}

if (-not (Test-Path (Join-Path $repoRoot ".git"))) {
    git init
}

git add .
git commit -m "standalone revision-R final 1.0 initial scaffold"

gh repo create $RepoName --$Visibility --source . --remote origin --push
Write-Host "Repository created and pushed: $RepoName"
