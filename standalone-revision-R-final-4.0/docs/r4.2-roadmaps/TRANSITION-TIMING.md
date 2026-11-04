# Roadmap - Transition timing

4.1 gave every voice a glide or cut transition character, per-session and in-session re-rolls, per-voice timing
jitter and a minimum gap between hard cuts. This roadmap turns transition timing into a defined, testable system.

## Where we are
- Per-voice characters (glide/cut, some swap per session), jitter, hard-cut spacing - implemented in
  `glitch-player.js`, asserted by the automation guards tests.
- Light retargets have their own calmer system (sharpness, ease speed, rest chance within fixed bounds).

## Phases
| Phase | Outcome | Exit criteria |
| --- | --- | --- |
| 1. Timing manifest | `transitions.manifest.json`: per voice - character set, glide curve family, jitter bounds, min/max hold, hard-cut spacing; per automation (AI WARP, DROP THE MILK?, continual randomizer) - step ranges and deck behaviour | Generator with `--check`; bounds asserted by tests; current behaviour reproduced exactly |
| 2. Curve library | Named easing curves (linear, soft, snap, settle, breath) implemented once and referenced by the manifest | Every transition resolves to a named curve; no inline easing math per voice |
| 3. Clocked mode | An optional global transition clock (free, or set by tap-tempo) that automations may quantize to - glides land on the grid, hard cuts only on stronger beats | Off by default; lights are explicitly excluded from quantization (their own bounded system is untouched) |
| 4. Audio-aware timing | Local-media-only envelope follower (volume/brightness bands, no FFT of YouTube streams, no network) that can scale non-light transition density | Opt-in per session; photosensitive voices and Flash/Strobe never follow audio |
| 5. Timing inspector | A HUD overlay showing each voice's character, next transition window and the hard-cut gap, read from live state | Overlay is display-only and matches the manifest values |

## Invariants
- The lights never hard-cut, under any mode, clock or follower.
- Hard-cut global spacing is a floor, never lowered by quantization; a missed grid slot waits for the next.
- All timing randomness flows from the session seed streams (see PRESET-RANDOMIZATION-AND-LEARNING.md) so a session
  can be reproduced.

## Risks
- Quantization can synchronize many voices into a simultaneous step - cap simultaneous hard cuts per beat.
- Audio following drifts toward strobing on percussive tracks - enforce a density ceiling per photosensitivity class.
