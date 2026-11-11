# Handoff — Mochi’s six animations

## Implementation

The homepage now uses a shy arrival wave, a head tilt in What we do, a bow in Ask Mochi, breathing at rest, a nod on direct activation, and continuous flight. The two section gestures use independent 12-second entry cooldowns. The direct button uses native mouse, touch and keyboard activation. Chat opens immediately through the other chat buttons. Opening and closing chat share the flight poses with section travel.

The prototype showed the approved artwork could support the intended motion. The production renderer uses a registered body, continuous head and wing movement, and a planted-foot pivot for the breath. The atlas preserves the original 16 frames and one approved wave frame. No new source artwork was generated. The previous working tree and artwork are recorded under `.agents/runs/artifacts/mochi-animations/polish/baseline/`.

## Files

- `owl.js`, `chat.js` and `owl-chat.css` implement the motions and chat ownership.
- `assets/owl/owl-atlas.json`, `assets/owl/owl-atlas.webp` and `tools/build-owl-atlas.py` supply the compact reproducible atlas.
- `index.html`, `elogbook.html` and `arogya.html` refresh only the relevant resource version tokens.
- `.agents/runs/v7-owl-idle.mjs` covers the six motions and interruptions. The local evidence is under `.agents/runs/artifacts/mochi-animations/polish/`.
- `.agents/CURRENT_TASK.md` carries approval and evidence state. `docs/MASTER_PLAN.md` has a dated append in section 9. `docs/STATUS.md` has not been edited.
- Git baseline and current HEAD are both `e8eedbaabe6c87e4737fc5a040f2d6c419240b9b`. This is an uncommitted review. The pre-existing governance and PRODUCT.md edits and unrelated untracked files are outside this task. No staging, commit, remote command, PR or deployment was performed.

## Fresh verification

Run from the workspace root. Logs and screenshots are in `.agents/runs/artifacts/mochi-animations/polish/`.

### Syntax and build

```powershell
node --check owl.js
node --check chat.js
node --check .agents/runs/v7-owl-idle.mjs
python -u tools/build-owl-atlas.py
python -u tools/build-owl-atlas.py --out ".agents/runs/artifacts/mochi-animations/polish/rebuild"
```

```text
node --check owl.js exit=0
node --check chat.js exit=0
node --check .agents/runs/v7-owl-idle.mjs exit=0
Runtime atlas: 16 preserved poses and one approved wave pose
cell 734x413, anchor (367, 179), atlas 2936x2065, webp q90 538 KB
16 original frames byte-identical in metadata; cell, anchor, centre, union and face registration match; alpha extrema=(0, 255)
runtime frame count=17
```

Both builds produced JSON SHA256 `7FDD764B5E9306A29F2823E872E1AD94F47B2A207FD4717F44C81886C6CD2096` and WebP SHA256 `A13CBA01C59A42EBB466DBD80FF664DBC0E0C8153B1DCEFA033B2114096C61D6`. The runtime image is 550,526 bytes, down from 2,815,858 bytes. The builder reports a Pillow deprecation warning for its existing `getdata` call. See `syntax.raw.txt`, `atlas-rebuild.raw.txt` and the generated atlas files.

### Preview startup

```powershell
node -e "const s=require('node:net').createServer();s.once('error',e=>{console.error(e.code);process.exitCode=1});s.listen(4201,'127.0.0.1',()=>s.close(()=>console.log('PORT 4201 FREE: bind and close succeeded')));"
$env:PORT = '4201'
npm.cmd run dev
```

```text
PORT 4201 FREE: bind and close succeeded
Gothos Labs preview: http://127.0.0.1:4201
```

### Browser coverage

```powershell
$p = '.agents/runs/artifacts/mochi-animations/polish'
$env:SHOTS = (Resolve-Path $p).Path
foreach ($suite in @('v1-core','v2-fit','v3-owl','v6-mode','v7-owl-idle')) {
  $env:OUT = Join-Path $env:SHOTS "$suite.json"
  node .agents/runs/run.mjs ".agents/runs/$suite.mjs" http://127.0.0.1:4201 *> "$p/$suite.raw.txt"
}
```

The command was run in batches, with v7 and v3 repeated after the final adjustments. The raw files retain complete row output.

```text
v1-core rows=85 fail=0 errors=0
v2-fit rows=71 fail=0 errors=0
v3-owl rows=86 fail=0 errors=0
v6-mode rows=69 fail=0 errors=0
v7-owl-idle rows=46 fail=0 errors=0
PASS | 1366 mouse reaction before one modal opening (220 ms)
PASS | 1366 continuous wing spread and contained flight (145 air frames)
PASS | 1366 return flight clears the clone and restores focus
PASS | 390 touch reaction before one modal opening (205 ms)
PASS | 390 continuous wing spread and contained flight (206 air frames)
PASS | 390 return flight clears the clone and restores focus
PASS | what-we-do skips early re-entry
PASS | owl skips early re-entry
PASS | no late replay or extra gesture while staying on a slide
PASS | cold What we do deep link and both post-cooldown entries
PASS | keyboard activation uses the same bounded reaction (196 ms, 22 frames)
PASS | native Ask Mochi deep link runs its own bow only
PASS | native scroll plays the settled section tilt once
PASS | ordinary bypasses the mascot reaction
PASS | reduced uses a static mascot and opens without flight
PASS | toggle uses a static mascot and opens without flight
PASS | failed image leaves local chat replies operational
PASS | resize interruption clears the page action
PASS | hidden interruption clears the page action
PASS | product page uses the direct reaction without homepage cues
PASS | no uncaught page exceptions
SUMMARY {"frames":8966,"outside":0,"hidden":0,"minGap":24.35,"maxLandDx":2.25,"maxLandDy":0,"maxRate":0,"maxStep":0,"minBeats":1.52,"maxBeats":1.6,"maxDrift":0.6,"maxDur":1268.7,"minDur":1007.5}
```

The v6 logs report 19,075 desktop and 12,000 phone samples on controls during flight. Zero resolved to the owl. Flight occupancy and dimensions are documented separately below.

### Baseline comparison and recordings

```powershell
$env:OUT = Join-Path $env:SHOTS 'flight-comparison-final.json'
node .agents/runs/run.mjs "$p/compare-flights.mjs" http://127.0.0.1:4201 *> "$p/flight-comparison-final.raw.txt"
node .agents/runs/run.mjs "$p/check-prototype.mjs" http://127.0.0.1:4201
node .agents/runs/run.mjs "$p/check-preview.mjs" http://127.0.0.1:4201
```

```text
1366 target=5 ms=1163/1155 outside=0/0 boxes=38/11 spread=52.9/50.4 land=0,0/0,0 size=330.2/330.2
1366 target=0 ms=1203/1204 outside=0/0 boxes=19/10 spread=40.4/14.5 land=0,0/0,0 size=330.2/330.2
390 target=1 ms=1008/1015 outside=0/0 boxes=0/0 spread=31.7/9.8 land=-12.95,0/-2.25,0 size=195/195
390 target=5 ms=1157/1153 outside=0/0 boxes=31/25 spread=31.9/11.3 land=0,0/0,0 size=195/195
390 target=0 ms=1206/1210 outside=0/0 boxes=27/11 spread=32/20.3 land=0,0/0,-0.01 size=195/195
```

Measurements are previous/current. The saved baseline stalled before sampling its first desktop route, so that leg is excluded from the timing comparison. Current desktop and phone clips, both with the return flight, are linked from `preview.html`. `prototype.html` has normal and slow playback of the stepped poses and the continuous prototype. The comparison shows the toes stay registered, the eye details stay on one face, and the wing extends and folds without replacing the body silhouette. The continuous wing shape uses a shared front-facing body, with turn coming from the bank and a small body lean.

The conservative flight rectangles still cross some controls in transit, with fewer intersection samples in all measured comparable legs with overlaps. This is a geometry observation, and the exact pixels in those rectangles were not used to assert visual clearance. The v6 hit test establishes that controls remain clickable. The scoped no-overlap check cannot be marked as a literal zero-intersection pass.

## Draft status wording for developer approval

2026-11-11 — Reduced Mochi to six focused animations using approved artwork. Browser verification covers desktop and phone playback, section cooldowns, activation timing, motion settings, flight, and chat fallback. Open questions for acceptance are cold-link timing with delayed artwork, transfer resize, direct fallback, painted control clearance and the remaining verification gaps. See the four-lens report in the local polish evidence directory. This wording remains a draft outside STATUS.md.

## Airborne body follow-up

The developer reported that Mochi looked perched throughout flight and said “proceed”. The before trace reproduced a single active layer throughout, with the perched body painted into every airborne frame. Both the page actor and the chat transfer now animate the complete approved front-level airborne pose. The wingbeat, tilt and tucked feet move together. The perched pose handles the brief takeoff and landing contacts. The atlas and source sheets retain their previous bytes.

Changed `owl.js` and `chat.js`. Updated the two JavaScript cache tokens in `index.html`, `elogbook.html` and `arogya.html`. The local visual check and previous source snapshot are in `.agents/runs/artifacts/mochi-animations/flight-pose/`.

```powershell
$p = '.agents/runs/artifacts/mochi-animations/flight-pose'
$env:SHOTS = (Resolve-Path $p).Path
node --check owl.js
node --check chat.js
git diff --check -- owl.js chat.js index.html elogbook.html arogya.html
$env:OUT = Join-Path $env:SHOTS 'result.json'
node .agents/runs/run.mjs "$p/check-flight.mjs" http://127.0.0.1:4201 *> "$p/check-flight.raw.txt"
$env:OUT = Join-Path $env:SHOTS 'v7.json'
node .agents/runs/run.mjs .agents/runs/v7-owl-idle.mjs http://127.0.0.1:4201 *> "$p/v7.raw.txt"
```

The syntax and whitespace checks exited zero. The pose check recorded 115 previous desktop airborne samples using perch and 110 updated samples using front-level. Both versions reported a maximum of one visible layer. The updated phone route reported 93 airborne samples with one visible layer and perch restored at the end. The chat transfer had one layer and captured both tucked and landing talons. The browser reported zero page exceptions. The image `flight-poses.png` shows six actual sampled frames from each version.

```text
v7 rows=46 failures=0 errors=0
PASS | 1366 mouse reaction before one modal opening (241 ms)
PASS | 1366 continuous wing spread and contained flight (101 air frames)
PASS | 1366 return flight clears the clone and restores focus
PASS | 390 touch reaction before one modal opening (206 ms)
PASS | 390 continuous wing spread and contained flight (187 air frames)
PASS | 390 return flight clears the clone and restores focus
```

At both sampled takeoff and landing source switches, a detached Chromium canvas measuring alpha above 180 showed a one-pixel change in painted width and bottom edge. The right edge shifted two pixels and the masks overlapped by about 73 percent. Independent samples for leftward and neutral travel measured at most six pixels of width change and one pixel of bottom-edge change. See result.json and REVIEW.md for the exact observation and its limits.

The baseline review’s open findings remain recorded separately. This follow-up verifies the reported airborne-body issue and the selected normal desktop, phone and chat routes.

## Original turns, gaze and mobile perches

The developer asked to improve the original flight and specified direct Codex implementation. `owl.js` and `chat.js` use the approved original front, three-quarter and side headings and the original up, level and down wingbeats. The body and wings interpolate in one canvas while the visible face stays on one approved frame. The landing folds the wings, eases into the perch, and starts a fresh idle cycle. The existing gestures now use directional faces. Idle breathing includes existing blink and three-quarter poses. The atlas and artwork files are unchanged in this follow-up.

`owl-chat.css` places the What we do and AROGYA perches on the left at phone widths, with clearance for the gestures and nearby buttons. The native mobile placement follows the visible section’s side. Updated resource tokens appear in the three existing pages. The v7 fixture now asserts that each gesture shows a directional face. All implementation and verification were performed directly in Codex.

```powershell
$p = '.agents/runs/artifacts/mochi-animations/directional'
$env:SHOTS = (Resolve-Path $p).Path
node --check owl.js
node --check chat.js
node --check .agents/runs/v7-owl-idle.mjs
$env:OUT = Join-Path $env:SHOTS 'v7.json'
node .agents/runs/run.mjs .agents/runs/v7-owl-idle.mjs http://127.0.0.1:4201 *> "$p/v7.raw.txt"
$env:OUT = Join-Path $env:SHOTS 'result.json'
node .agents/runs/run.mjs "$p/check-directional.mjs" http://127.0.0.1:4201 *> "$p/check-directional.raw.txt"
git diff --check -- owl.js chat.js owl-chat.css index.html elogbook.html arogya.html
```

```text
v7 rows=48 failures=0 errors=0
PASS | 1366 each gesture shows a directional face
PASS | 1366 mouse reaction before one modal opening (206 ms)
PASS | 1366 continuous wing spread and contained flight (181 air frames)
PASS | 1366 return flight clears the clone and restores focus
PASS | 390 each gesture shows a directional face
PASS | 390 touch reaction before one modal opening (203 ms)
PASS | 390 continuous wing spread and contained flight (198 air frames)
PASS | 390 return flight clears the clone and restores focus
1366 top x=1185 yaw=front/quarter/side landed=perch landingDx=0.21 landingDy=0.93
1366 what-we-do x=1011 yaw=front/quarter/side landed=perch landingDx=0.22 landingDy=0.48
1366 arogya x=1066 yaw=front/quarter/side landed=perch landingDx=0.25 landingDy=0.9
390 top x=293 yaw=front/quarter/side landed=perch landingDx=0.23 landingDy=1.69
390 what-we-do x=85 yaw=front/quarter/side landed=perch landingDx=0.3 landingDy=0.49
390 arogya x=85 yaw=front landed=perch landingDx=0 landingDy=0.77
Idle keys=perch/blink/perch-quarter
Native mobile x=290/70/290/70/290
page errors=0
```

The position changes measure adjacent samples in the final 11 percent of the tested flights. They cover position continuity rather than feather-by-feather texture continuity. The two local recordings are in `directional/preview.html`. Earlier broad review items remain separately tracked.

## Cute gesture follow-up

Opening a product section first previously consumed the opportunity to wave on the hero. The wave now plays once on the first settled hero visit in the page session. The native-scroll cue timer starts its clearance window after scrolling settles. The wave uses the full approved raised-wing frame, with two wing flutters. The existing tilt and bow have larger readable movements and longer holds. The atlas, original turning flight, and responsive perch layout retain their earlier implementation.

Touched `owl.js`, the owl script version on the three HTML pages, and the existing browser fixture `.agents/runs/v7-owl-idle.mjs`. Local evidence is in `.agents/runs/artifacts/mochi-animations/cute-gestures/`. Implementation and testing were direct in Codex.

```powershell
$p = '.agents/runs/artifacts/mochi-animations/cute-gestures'
$env:SHOTS = (Resolve-Path $p).Path
$env:CUE_BEFORE = '1'
$env:OUT = Join-Path $env:SHOTS 'before.json'
node .agents/runs/run.mjs "$p/check-cues.mjs" http://127.0.0.1:4201 *> "$p/before.raw.txt"
Remove-Item Env:CUE_BEFORE
$env:OUT = Join-Path $env:SHOTS 'after.json'
node .agents/runs/run.mjs "$p/check-cues.mjs" http://127.0.0.1:4201 *> "$p/after.raw.txt"
$env:OUT = Join-Path $env:SHOTS 'slow-scroll.json'
node .agents/runs/run.mjs "$p/check-slow-scroll.mjs" http://127.0.0.1:4201 *> "$p/slow-scroll.raw.txt"
$env:OUT = Join-Path $env:SHOTS 'v7-final.json'
node --check owl.js
node --check .agents/runs/v7-owl-idle.mjs
node .agents/runs/run.mjs .agents/runs/v7-owl-idle.mjs http://127.0.0.1:4201 *> "$p/v7-final.raw.txt"
```

The five tested viewport sizes were 1366×768, 960×555, 390×844, 375×667 and 360×620. The before/after traces show a wave on first hero arrival from ELogBook at all five sizes after the fix. The cold-entry cases captured the wave, tilt and bow at all five sizes. The slow-scroll trace at 960×555 shows no tilt during or after scrolling before the fix, then no tilt during scrolling and one after it settles. The visual capture `gestures.png` samples all three cues in the live phone layout.

```text
v7 rows=52 failures=0 errors=0
PASS | 1366 shows the authored raised-wing wave
PASS | 1366 tilt, bow and activation show a directional face
PASS | 1366 continuous wing spread and contained flight (170 air frames)
PASS | 390 shows the authored raised-wing wave
PASS | 390 tilt, bow and activation show a directional face
PASS | 390 continuous wing spread and contained flight (198 air frames)
PASS | first hero visit after a deep link still waves
PASS | hero wave plays once in the same page session
```

## Existing-art smoothing pass

The developer approved a smoothing pass on the existing motions. This Direct Codex change keeps the existing gesture durations, holds, directional flight poses, wingbeat sequence and artwork. The gesture pose blends use shared outer widths and planted-foot registration. Flight interpolation follows the flight progress and wingbeat phase. The wings narrow and finish folding as Mochi settles onto the perch. The existing atlas files match their previous SHA256 values.

Runtime files touched are `owl.js` and the owl resource version tokens in `index.html`, `elogbook.html` and `arogya.html`. The previous renderer snapshot and recordings are in `.agents/runs/artifacts/mochi-animations/smooth-pass/`. `preview.html` shows actual before-and-after site recordings on desktop and phone with normal and half-speed controls. The recordings use separate browser runs.

```powershell
$p = '.agents/runs/artifacts/mochi-animations/smooth-pass'
$env:SHOTS = (Resolve-Path $p).Path
node --check owl.js
git diff --check -- owl.js index.html elogbook.html arogya.html
$env:OUT = Join-Path $env:SHOTS 'v7.json'
node .agents/runs/run.mjs .agents/runs/v7-owl-idle.mjs http://127.0.0.1:4201 *> "$p/v7.raw.txt"
$env:OUT = Join-Path $env:SHOTS 'comparison.json'
node .agents/runs/run.mjs "$p/check-smoothing.mjs" http://127.0.0.1:4201 *> "$p/comparison.raw.txt"
$env:OUT = Join-Path $env:SHOTS 'playback.json'
node .agents/runs/run.mjs "$p/check-player.mjs" http://127.0.0.1:4201 *> "$p/playback.raw.txt"
```

```text
v7 rows=52 failures=0 errors=0
PASS | 1366 continuous wing spread and contained flight (172 air frames)
PASS | 390 continuous wing spread and contained flight (199 air frames)
PASS | 1366 return flight clears the clone and restores focus
PASS | 390 return flight clears the clone and restores focus
```

The comparison sampled the hero to What we do landing. The largest adjacent-frame change in the reported sprite bounds over the final 12 percent was 33.73 to 2.97 atlas pixels on desktop and 33.64 to 3.34 on phone. The measured sprite position remained within 0.36 CSS pixels per sampled frame in that interval. Both versions showed the original front, quarter and side turn poses. These measurements are reported bounds and position, not an alpha-pixel comparison for every flight. The parallel-recording attempt interfered with desktop browser timing. The quoted results come from the serial rerun.

Both video players advanced on both viewports at 1× and 0.5×. Playback frames were inspected for the wave and the first flight and tilt. The approved artwork was sufficient for this pass.

## Public website privacy draft — 2026-11-11

The developer approved the written scope and authorised Direct Codex execution in this chat. This is the local wording and operating-process review checkpoint. The website operator name and privacy inbox use the developer-confirmed details.

### Files and behavior

- `privacy.html` and `privacy.css` provide a responsive Privacy Policy draft. The page is marked for review and carries noindex. The sitemap has no draft entry.
- `index.html`, `elogbook.html` and `arogya.html` link to the policy in their footers. The contact form has a notice before its fields. All Mochi inputs reference the notice that explains what goes to OpenAI. Form fallback methods use POST to keep messages out of URL queries.
- `chat.js` describes the demo purpose and Resend before asking for name and email. The existing yes/no confirmation and API payloads are preserved.
- `docs/WEBSITE_PRIVACY_OPERATIONS.md` records the data map, source paths, primary references and proposed request, retention and incident workflows. Existing deployment ignore rules exclude the docs directory.
- `tests/website-privacy.test.mjs` and `tests/website-privacy-browser.mjs` exercise the working code with synthetic data and mocked providers. Logs and screenshots are in `.agents/runs/artifacts/website-privacy/`. The scoped §9 entry is appended to `docs/MASTER_PLAN.md`.

### Fresh verification

```powershell
$p = '.agents/runs/artifacts/website-privacy'
$env:SHOTS = (Resolve-Path $p).Path
node --check chat.js
node --check tests/website-privacy-browser.mjs
node --test tests/enquiry.test.mjs *> "$p/enquiry-baseline.raw.txt"
node --test tests/website-privacy.test.mjs *> "$p/unit.raw.txt"
$env:OUT = Join-Path $env:SHOTS 'browser.json'
node .agents/runs/run.mjs tests/website-privacy-browser.mjs http://127.0.0.1:4201 *> "$p/browser.raw.txt"
$env:OUT = Join-Path $env:SHOTS 'mochi.json'
node .agents/runs/run.mjs "$p/check-mochi-local.mjs" http://127.0.0.1:4201 *> "$p/mochi.raw.txt"
git diff --check -- index.html elogbook.html arogya.html chat.js docs/MASTER_PLAN.md
```

```text
existing enquiry exit=1
SyntaxError: The requested module '../api/enquiry.mjs' does not provide an export named 'createEnquiryHandler'
tests 4
pass 4
(superseded: the fifth test was added later for the recipient change. See "Fix round 1 evidence" below for the 5-test run.)
fail 0
1366 policy opens by keyboard from all three footers and fits viewport
1366 contact notice fits the deck, precedes input and enquiry goes to a mock
1366 Mochi notice is visible before the first mocked AI request
1366 demo notice precedes collection and confirmation gates delivery
1366 chat closes and clears on-page messages with no external network or page errors
390 policy opens by keyboard from all three footers and fits viewport
390 contact notice fits the deck, precedes input and enquiry goes to a mock
390 Mochi notice is visible before the first mocked AI request
390 demo notice precedes collection and confirmation gates delivery
390 chat closes and clears on-page messages with no external network or page errors
Mochi rows=52 failures=0 errors=0 blocked-provider-requests=0
(The earlier line "Draft discovery controls verified" was a claim without output. The exact discovery check is under "Fix round 1 evidence" below.)
```

The legacy enquiry suite failed before the privacy edits and still imports an export from a different handler implementation. The focused tests exercise the current modules without changing the legacy suite or accepting its expected recipient as evidence. The browser test routes every submission to a mock and blocks outside origins. The Mochi regression wrapper rejects API requests and outside origins. Syntax and whitespace checks passed.

### Operator review and remaining verification

Confirm the intended enquiry recipient and the live route. The recipient is now gothoslabs@gmail.com in the working source and in README.md and EMAIL_SETUP.md (see the recipient confirmation below); the deployed destination and inbox delivery are not verified. Confirm the responsible privacy and incident owners, the actual hosting and processor configuration, and retention and deletion practices. Review the basis for each processing flow and the language, grievance and withdrawal implementation before approving the complete wording. The live provider settings were not verified. Public wording approval and independent high-assurance review precede release.

Draft status wording for later acceptance — Drafted the public website privacy policy, contact and Mochi notices and a private operations workflow, checked locally with mocked providers. The enquiry recipient now routes to gothoslabs@gmail.com. Open items: notice and policy wording approval, hosting, provider and retention facts, operator review of the request workflow, language access, and the legacy enquiry suite, which fails to import `createEnquiryHandler` and predates this task.

### Enquiry recipient confirmation — 2026-11-11

The developer confirmed gothoslabs@gmail.com for contact form enquiries and confirmed Mochi demo enquiries. The shared enquiry module and its recipient references in README.md and EMAIL_SETUP.md now use that address. Both the local server and the Vercel route call the shared module. The focused mocked tests confirm the exact destination, including when a request supplies an attempted override. The production deployment and actual inbox delivery remain a release check.

```powershell
node --check enquiry-api.mjs
node --test tests/website-privacy.test.mjs
git diff --check -- enquiry-api.mjs README.md EMAIL_SETUP.md
```

```text
✔ contact enquiry uses the approved recipient and keeps the request address out of Resend
✔ Mochi demo enquiry uses the approved recipient and keeps the request address out of Resend
tests 5
pass 5
fail 0
```

Exact output is in `.agents/runs/artifacts/website-privacy/enquiry-recipient.raw.txt`.

### Fix round 1 evidence — 2026-11-11

Executor: Sonnet direct (relabelled from "Direct Codex" at the developer's instruction so the guard hook accepts direct writes). Local preview `node server.mjs` on 127.0.0.1:4177, synthetic data, mocked providers.

Files touched this round: `docs/WEBSITE_PRIVACY_OPERATIONS.md` (hosting row; abuse-prevention row corrected to `enquiry-api.mjs:6` and `hoot-api.mjs:8`, with `api/*.mjs:12` only forwarding the address), `index.html` (contact notice marked draft and "No booking is made until the team confirms it." restored; Mochi notice marked draft), `elogbook.html` and `arogya.html` (Mochi notice marked draft), `chat.js` (demo reply marked draft), `privacy.html` (proposed hosting-log wording as an HTML comment only, plus a visible "Under review" line), `HANDOFF.md`, `.agents/CURRENT_TASK.md`.

Proposed, not approved, wording for `privacy.html` hosting logs: "Our hosting provider may keep standard request logs, such as your network address, browser details, the page requested and the time, to deliver and secure the website. We have not yet confirmed which logs are kept or for how long." It is in an HTML comment. The visible text only says the logs are being confirmed.

```text
$ node .agents/runs/run.mjs .agents/runs/v2-fit.mjs   (contact slide s7, all ten viewports; errs=0 fails=0)
ok   360x640 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=24.4px | controls=21 samples=500 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
ok   390x844 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=24.7px | controls=21 samples=500 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
ok   1280x720 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=259.4px | controls=24 samples=575 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
ok   1366x768 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=278.9px | controls=24 samples=575 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
ok   1440x900 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=337.0px | controls=24 samples=575 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
ok   1920x760 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=275.6px | controls=24 samples=575 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
ok   1760x700 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=251.3px | controls=24 samples=575 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
ok   1700x660 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=235.1px | controls=24 samples=575 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
ok   2560x700 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=251.3px | controls=24 samples=575 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
ok   1920x640 s7: top=0.00 innerOverflow=0/0 docScroll=0 clipped=0 owlOverlap=0 owlTopGap=227.0px | controls=24 samples=575 resolvingToOwl=0 owlHitCentreOK=true oldBoxCornerOnOwl=false
SUMMARY: 70 section/size runs, 0 failing; finding 1: 968 control checks, 23950 sample points, 0 resolved to the owl layer

$ for f in chat.js site.js enquiry-api.mjs hoot-api.mjs server.mjs api/chat.mjs api/enquiry.mjs; do node --check $f; done
node --check chat.js: ok
node --check site.js: ok
node --check enquiry-api.mjs: ok
node --check hoot-api.mjs: ok
node --check server.mjs: ok
node --check api/chat.mjs: ok
node --check api/enquiry.mjs: ok

$ git diff --check ; echo exit $?
(only LF/CRLF warnings for .agents/CURRENT_TASK.md, HANDOFF.md, docs/MASTER_PLAN.md, tools/build-owl-atlas.py; no whitespace errors)
git diff --check exit 0

$ grep -c privacy sitemap.xml      -> 0
$ grep -ci privacy robots.txt      -> 0
$ grep -n 'name="robots"' privacy.html
7:  <meta name="robots" content="noindex,follow">

$ node --test tests/website-privacy.test.mjs
tests 5
pass 5
fail 0

$ node .agents/runs/run.mjs tests/website-privacy-browser.mjs http://127.0.0.1:4177
10 checks listed (at 1366 and 390: policy via footers by keyboard; contact notice precedes input; Mochi notice before first mocked AI request; demo notice precedes collection and confirmation gates delivery; chat closes and clears; no external network or page errors), no failure

$ node .agents/runs/run.mjs .agents/runs/artifacts/website-privacy/check-mochi-local.mjs http://127.0.0.1:4177
rows=52 failures=0 errors=0 blocked=0

$ node --test tests/enquiry.test.mjs
SyntaxError: The requested module '../api/enquiry.mjs' does not provide an export named 'createEnquiryHandler'
(known failure that predates this task; to be fixed in its own task)
```

Notes: the hosting row in the data map is a repo observation only (`vercel.json`, `api/` functions, and no analytics script in `index.html`, `elogbook.html`, `arogya.html`, `site.js` or `chat.js`). Deployment on Vercel, log retention and analytics settings are unverified. Screenshots from this round are in the temp folder, not committed. The v2-fit output above is the contact-slide rows only; the 70-run summary line covers every section.

Open items: notice and policy wording approval, hosting/provider/retention facts, operator review of the request workflow, language access, the legacy enquiry suite, and the fact that `.vercelignore` does not exclude `tests/`.
