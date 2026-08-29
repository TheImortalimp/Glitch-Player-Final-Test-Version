# standalone revision-R final 1.0

This repository contains a new blended effects build where revision r2 is the dominant baseline and revisions r1, r3, and r4 are layered in subtly.

## Goals

- Keep r2 smoothness and responsiveness as the primary visual behavior.
- Blend in r1/r3/r4 effect signatures at low amplitude.
- Preserve fast frame pacing and low CPU overhead.
- Enforce a strict installer package cap of 75MB.

## Blend Strategy

The runtime computes a blended control signal:

- `w2 = 0.78` (r2 baseline)
- `w1 = 0.08`
- `w3 = 0.08`
- `w4 = 0.06`

`blend = w2 * r2 + w1 * r1 + w3 * r3 + w4 * r4`

An exponential smoother is then used to avoid jitter:

`state = state + (target - state) * (1 - exp(-dt / tau))`

Where `tau` is tuned for stable, subtle transitions.

## Layout

- `extras/glitch-canvas-player/webui/glitch-canvas-youtube.html`
- `extras/glitch-canvas-player/webui/glitch-canvas-youtube.css`
- `extras/glitch-canvas-player/webui/revision-r-final-engine.js`
- `extras/glitch-canvas-player/scripts/build-standalone-r-final.ps1`
- `extras/glitch-canvas-player/scripts/gh-init-repo.ps1`

## Build

Run from repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File extras\glitch-canvas-player\scripts\build-standalone-r-final.ps1
```

The build script creates a packaged artifact under `extras\glitch-canvas-player\dist` and fails if the output is above 75MB.

## GitHub CLI Mode

If `gh` is installed and authenticated:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File extras\glitch-canvas-player\scripts\gh-init-repo.ps1 -RepoName "standalone-revision-r-final-1.0"
```

This initializes git, creates a GitHub repo with `gh`, and pushes the first commit.

## Build On GitHub (Cloud)

This repo includes two GitHub Actions workflows:

- `.github/workflows/build-standalone-r-final.yml`
	- Triggers on push to main/master or manual run.
	- Builds the package with the 75MB cap and uploads an artifact.

- `.github/workflows/release-standalone-r-final.yml`
	- Manual release workflow.
	- Builds package and publishes it to a GitHub Release for the tag you provide.

### Run Cloud Build

1. Push this repository to GitHub.
2. Open Actions tab.
3. Run `Build Standalone Revision-R Final`.
4. Download artifact `standalone-revision-R-final-1.0-package`.

### Run Cloud Release

1. Open Actions tab.
2. Run `Release Standalone Revision-R Final`.
3. Enter tag (example: `v1.0.0`).
4. The workflow creates a release and attaches `standalone-revision-R-final-1.0-package.zip`.
