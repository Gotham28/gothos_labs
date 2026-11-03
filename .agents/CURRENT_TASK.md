# Current Task

## Feature
- Rebuild the landing page as six full-screen sections that change one at a time with a seamless, uninterruptible transition, with the owl flying during each transition and perching once it ends. Move product detail onto two new product pages, and make the landing page more beautiful.

## Plan reference
- MASTER_PLAN.md §3 is the nearest section; append a dated §9 entry, "Full-screen section landing and product pages". Append only.
- STATUS.md "Last updated" 2026-10-28: stale for this area.
- Baseline: branch `bird-updated`, origin at eb3f346c, plus earlier unreviewed and uncommitted work: Part 1 (landing content, real logo), Fix round 1 (flight fixes) and Part 2 (owl sprite animation). Evidence for those is in HANDOFF.md.
- Developer order (2026-11-02): build first, then one combined High-assurance review in an Opus session, then one close-out and push.

## What carries over and what is replaced
- Kept: real logo (`assets/logo/gothos-logo.png`), the owl sprite atlas and renderer from Part 2, the chat avatar changes, the enquiry form, the Approved copy below, `tools/build-owl-atlas.py`.
- Replaced: the current five-section landing layout, the native-scroll reading of tall sections, the Fix round 1 y-band, climb and read-fade rules, and the current `section-scroll.js` behaviour.
- Moved: ELogBook and AROGYA detail, plus the interactive six-screen preview, go to the product pages.

## MASTER_PLAN.md update
- [ ] Append the §9 entry above. Append only; keep the earlier entries.

## Landing page — six sections, in order
1. Hero: "Gothos Labs" and "Intelligent software that sees further". Nothing else.
2. What we do: the approved draft below. This is the only section with more than introductory text.
3. ELogBook: short intro, an illustrative screenshot, and an "Explore ELogBook" button to `elogbook.html`.
4. AROGYA: short intro, an illustrative screenshot, the one-line disclaimer, and an "Explore AROGYA" button to `arogya.html`.
5. Talk to the owl: one or two lines introducing Hoot as the website guide, and a "Talk to Hoot" button that opens the chat.
6. Contact: "Talk to us" with the existing enquiry form, its honest not-sent note, and a slim footer line (©, Pause motion, links).

## Copy
### Approved for this task (developer-supplied or developer-directed 2026-11-02)
- Hero: "Gothos Labs" / "Intelligent software that sees further".
- What we do. The developer's direction was "we bring AI to your software so it becomes better". Draft wording, approved when this plan is approved:
  - Heading: "We bring AI to your software, so it works better."
  - Body: "Gothos Labs builds AI into the software people already rely on, so everyday work gets simpler and better. We start from a real workflow, build with the people who use it, and keep each organisation's information its own. ELogBook and AROGYA are where we started: one for postgraduate medical training, one for hospitals and their patients."
- ELogBook section intro: "A digital logbook for postgraduate medical training." + "Residents log their work, professors review it, and Heads of Department track progress against training targets."
- AROGYA section intro: "An AI assistant that speaks your patients' language." + "Answers in English and Malayalam, helps patients find doctors and book appointments, on the web and on WhatsApp." + disclaimer: "General information only. It does not diagnose or replace a doctor. In an emergency, contact your local emergency services."
- Talk to the owl: "Ask the owl" + "Hoot is our website guide. Ask about Gothos Labs, our products, or how to work with us." Hoot gives no medical advice. *(Removed by developer decision, Fix round 2: that line is not on the page.)*
- Contact: "Talk to us" plus the existing form text, unchanged.
- Section intros for ELogBook, AROGYA and Talk to the owl are condensed from the approved copy below and add no new claims.

### Product pages — approved copy (developer-supplied 2026-11-02; use exactly)
#### `elogbook.html`
- Headline and one-liner: "A digital logbook for postgraduate medical training. Residents log cases, procedures and academic work, professors review them, and Heads of Department track progress against training targets."
- The problem: "Paper logbooks get lost, are reviewed late, and make it hard for a department to see where residents stand against requirements."
- How it works, by role:
  - Residents: log clinical cases, procedures and academic activities, and see progress against targets.
  - Professors: review and sign off on the residents assigned to them.
  - HOD: a department-wide view of training progress.
- Key features:
  - Case, procedure and academic logs
  - Professor review and approval
  - An HOD portal
  - Leave and attendance records
  - Postings and research tracking
  - Per-department configuration, not hardcoded to one specialty
- Pilot: "Currently in pilot with the Pediatrics department"
- Privacy and access: residents see their own records, professors see their assigned residents, and HODs see their department.
- Interactive six-screen preview, labelled illustrative.
- Call to action: "Request a demo" and "Talk to us", both to `index.html#contact`.

#### `arogya.html`
- Headline: "An AI assistant that speaks your patients' language."
- One-liner: "AROGYA is a multilingual (English and Malayalam) AI assistant for hospitals. It helps patients find doctors, book appointments and get answers from the hospital's own information, on the web and on WhatsApp."
- What it does:
  - Speaks Malayalam and English. Patients can ask in either language and get a natural reply.
  - Books appointments. It handles doctor search, schedules and confirmations, and sends WhatsApp reminders.
  - Answers from the hospital's own information. Replies come from each hospital's own doctors, services and knowledge base, not from generic web content.
  - Each hospital is kept separate. One deployment serves several hospitals, and a hospital's data never appears in another hospital's answers.
- Proof point: "In live use at a hospital in Kerala." Never name the hospital.
- Disclaimer, unchanged: "General information only. It does not diagnose or replace a doctor. In an emergency, contact your local emergency services."
- The labelled illustrative chat card; the disabled "Live demo coming soon" button.
- Call to action: "Request a demo" and "Talk to us", both to `index.html#contact`.

### Developer decisions on record
- The Kerala hospital agreed to the proof line. WhatsApp, booking confirmations and WhatsApp reminders are live. Product names are AROGYA and ELogBook.
- Contact is the existing enquiry form; no email, phone or address is invented.
- Screenshots are snapshots of the existing illustrative previews, labelled illustrative.

## Section transitions (rewrite of `section-scroll.js`)
- Every landing section fills the viewport exactly (100dvh, with an svh/vh fallback). The page is never left between sections.
- One gesture moves exactly one section: one wheel or trackpad gesture, one swipe, or one key press. Trackpad momentum and fast repeated wheels must never skip a section or start a second move.
- A transition runs 900–1200ms with an ease-in-out curve and cannot be stopped or reversed midway. Input during it is ignored.
- Keys: ArrowDown, PageDown and Space go next; ArrowUp, PageUp and Shift+Space go back; Home and End go first and last. Keys are left alone while focus is in a form field or the chat dialog is open.
- Touch: a swipe over about 40px, or a fast flick, moves one section. Pull-to-refresh and the browser chrome stay usable.
- Header links, the side dot navigation and deep links (`#what-we-do`, `#elogbook`, `#arogya`, `#owl`, `#contact`) move straight to the target in one transition. The URL hash updates, and back/forward work. *(Fix round 2: such input arriving during a move is ignored; when the move ends the screen re-syncs to the URL hash.)*
- Tabbing to an element in another section brings that section in. After each move, focus goes to the new section's heading without a scroll jump.
- Resizing or rotating keeps the current section aligned.
- Reduced motion and Pause motion: instant change with a crossfade of at most 200ms; the owl appears at its perch.
- Every section's content fits without internal scrolling at 360x640, 390x844, 1280x720, 1366x768 and 1440x900. If one cannot, halt and report; do not let it scroll. *(Superseded by developer decision, Fix round 2: short or zoomed screens, or content that does not fit, fall back to normal scrolling; the five listed sizes stay on the deck.)*

## Owl
- Visible on every frame of the landing page; never faded or hidden while browsing sections. The chat dialog may still take it over as today.
- Each section has a designed perch spot in its layout, at desktop and phone sizes, where the owl rests without covering text, buttons, the screenshot or the form.
- During a transition the owl flies from the current perch to the next one, synced to the transition's progress. It takes off and lands through the crouch frame, and turns and beats its wings per Part 2's sprite rules. Jumps across several sections are one direct flight.
- Reversing direction flies it back. Rest behaviour (blink, head turn toward the pointer) as in Part 2.
- In the Talk to the owl section it perches beside the "Talk to Hoot" button, and clicking it opens the chat, as today.
- Product pages: a small perched owl replaces the floating chat button and opens Hoot. No flight there.
- Keep from Part 2: header clearance of at least 12px, a steady body size, and an anchor drift of at most 2px between frames.

## Product pages
- `elogbook.html` and `arogya.html` use the same header, logo, fonts and colours as the landing page, scroll normally, and link back to the landing page.
- Use the copy above exactly. Keep the disclaimers. Keep the six-screen preview with its tabs, keyboard behaviour and expand dialog on the ELogBook page.

## Design gate — two directions first
- Before building everything, mock up sections 1 and 2 in two directions at 1440x900 and 390x844, using the design-taste-frontend skill if available:
  - A — Calm and airy: cream and white, large confident type, soft green gradients, faint leaf texture, generous space.
  - B — Deep green immersive: dark green full-bleed sections, soft glow accents, the green owl and logo lit against it.
- Use the real logo and the owl sprite in both. Save the screenshots in the scratchpad, not the repo, show them to the developer and halt. Record the choice under `## Blocked on developer input`, then build the whole site in that direction.

## Files/areas in scope
- `index.html` — rewrite the landing page into the six sections.
- `elogbook.html`, `arogya.html` — new product pages.
- `styles.css` — landing and shared styles.
- `product-page.css` — new, shared product-page styles.
- `section-scroll.js` — rewrite as the section transition engine.
- `owl.js` — perches per section, flight synced to transitions, product-page perch; remove the read-fade and tall-section logic.
- `site.js` — move preview handlers to the ELogBook page, keep the form and motion control; remove handlers for removed markup.
- `logbook-showcase.css`, `logbook-showcase.js`, `product-preview.css` — as the ELogBook page needs.
- `owl-chat.css` — owl, perch and avatar rules.
- `chat.js` — only `fly`, `avatar`, `stopTransfer` and `avatarDestination`, and only if perch or layout changes require it.
- `assets/screens/elogbook-preview.webp`, `assets/screens/arogya-preview.webp` — new illustrative snapshots, captured from the local preview, with no personal data.
- `README.md`, `DESIGN.md`, `PRODUCT.md` — new structure, pages and transitions.
- `docs/MASTER_PLAN.md`, `HANDOFF.md`, `.agents/CURRENT_TASK.md`.

## Explicitly out of scope
- Chat conversation, routing and medical-refusal code, and Hoot's replies.
- Delivering enquiries or adding contact details.
- New runtime dependencies or frameworks; the site stays buildless.
- Regenerating owl art. An upscaled sheet may be swapped in by rerunning the script.
- PR, merge to main, deployment or DNS.

## Do NOT touch
- `server.mjs`, `package.json`, `fonts/`, `licenses/`, `fly.mp4`, `assets/logo/`, `assets/owl/source/`.
- `chat.js` outside the four avatar functions.
- `.agents/AGENTS.md`, root `AGENTS.md`, root `CLAUDE.md`, the nested `Gothos-labs/` folder, `.claude/`, `.playwright-mcp/`, `show-*.jpg`, `.agents/owl-contact-sheet.png`. Never stage them.
- `docs/STATUS.md` until wording is approved at close-out.
- Git trust settings, hooks, permissions and sandbox configuration; the local `feature/owl-redesign` branch; the preview server on port 4177.

## Execution route
- B — Agent loop.
- Why: route C test point 1 fails; design, motion and layout need judgement and browser checks.
- Close-out: route B, never route C.

## Manual (developer does)
- [ ] Pick design direction A or B from the mockups.
- [ ] Remove the old owl art, which nothing references now: `git rm assets/owl/hoot-body.png assets/owl/hoot-torso.png assets/owl/hoot-wing.png`
- [ ] Delete clutter the guard stops agents removing: `rm -r .playwright-mcp show-*.jpg`
- [ ] Keep a permanent copy of the owl sheet; optionally hand over a 3x upscale.
- [ ] Accept or send back the combined review; approve STATUS wording.
- [ ] Tell the repo owner that `transfer.json` exposed a signed download link and completion token in a public repo.

## Agent (does on its own, once scope is confirmed)
- [x] Confirm the branch, that origin is still eb3f346c, and that the earlier parts' changes are present.
- [x] Build the two design mockups and halt for the developer's pick. (Direction A chosen.)
- [x] Build the six sections, the transition engine, the owl perches and flights, and both product pages in the chosen direction.
- [x] Capture the two illustrative snapshots.
- [x] Run every check below; update docs, MASTER_PLAN §9 and HANDOFF.md (Part 3); stop for the combined review. (Evidence and gaps are in HANDOFF.md Part 3; the Part 2 video comparison could not be done.)

## Blocked on developer input
- Design direction resolved 2026-11-02: Direction A (calm and airy) chosen by the developer in the execution session; mockups were in the scratchpad.
- **Close-out 2026-11-03 — nothing staged or committed until these are answered:**
  1. **PR.** This file authorizes only the push to `origin bird-updated`; it says "No PR or merge" and lists PR as out of scope. Authorize a PR to `main` on x3O8/Gothos-labs? (Merge is never done by close-task.)
  2. **STATUS.md wording.** Approve or correct the draft below. It is HANDOFF.md's Fix round 3 draft, with: date 2026-11-03, `PR`/`Commits` as literal `pending`, a Review line, and verification as commands plus counts (copied from HANDOFF.md; not re-run in close-out). Also change `Last updated: 2026-10-28` to `2026-11-03`.
  3. **Paths outside the literal scope list.** Recommended to include: `assets/logo/gothos-logo.png`; `assets/owl/owl-atlas.webp`, `assets/owl/owl-atlas.json`, `assets/owl/source/owl-sheet.webp`; `tools/build-owl-atlas.py` (not `tools/__pycache__/`); the developer's already-staged deletions (`assets/owl/hoot-body.png`, `hoot-torso.png`, `hoot-wing.png`, and `.owl-reference-tools/*`); and dev tooling `.agents/runs/run.mjs`, `v1-core.mjs` … `v6-mode.mjs` (not `out-v*.json`, `smoke.mjs`, `scroll-shots.mjs`).
  4. **Stale line outside STATUS.md:** `REFERENCE.md` lines 42–43 list `assets/owl/hoot-body.png` and `hoot-wing.png`, which the commit deletes. Fold a one-line fix into this commit, do it separately, or leave it?
- Left unstaged regardless: `.agents/AGENTS.md` (modified, "Do NOT touch"), `.agents/owl-contact-sheet.png`, `.claude/`, `.playwright-mcp/`, `Gothos-labs/`, root `AGENTS.md`, root `CLAUDE.md`, `show-1-hero.jpg` … `show-12-landing-talk.jpg`, `tools/__pycache__/`, `.agents/runs/out-v*.json`, `.agents/runs/smoke.mjs`, `.agents/runs/scroll-shots.mjs`.
- Draft STATUS entry (not applied):
```
### Catch-up — 2026-11-03
Rebuilt the landing page as six full-screen sections with a section-transition
engine and an owl that perches in each section and flies between them; added
ELogBook and AROGYA product pages; real Gothos Labs logo; 16-pose sprite owl.
- Landing: Gothos Labs hero, What we do, ELogBook, AROGYA, Ask the owl (Hoot),
  Talk to us (local-brief enquiry form). One gesture moves one section. The
  section deck runs from 360x640 up where every section fits; on shorter or
  narrower screens, or when a section stops fitting, the page scrolls normally.
  Header links, dots and #what-we-do, #elogbook, #arogya, #owl, #contact deep
  links work in both modes.
- elogbook.html (six-screen illustrative preview, role tabs) and arogya.html
  (illustrative chat card, disclaimer, disabled live-demo button), each with a
  small perched owl that opens Hoot.
- Copy: developer-supplied; the "What we do" wording is a developer-approved draft.
- Branch: bird-updated
- PR: pending            (N/A if no PR is authorized)
- Commits: pending
- Review: one combined High-assurance independent review; Fix round 3 accepted
  by the developer 2026-11-03 after two send-backs. Tier unratcheted (no
  independent Antigravity tier for a direct-executor task, AGENTS.md §12.9).
- Verification (HANDOFF.md, Fix round 3, run after the last source edit):
  - for f in section-scroll.js owl.js site.js chat.js logbook-showcase.js; do node --check "$f"; done -> all five OK
  - node .agents/runs/run.mjs .agents/runs/v1-core.mjs  -> 72 rows, 68 PASS, 0 FAIL
  - ... v2-fit.mjs   -> 60 section/size runs, 0 failing
  - ... v3-owl.mjs   -> 70 flights, 9182 frames, 0 outside viewport, 0 hidden
  - ... v4-input.mjs -> 56 rows, 45 PASS, 0 FAIL
  - ... v5-pages.mjs -> 61 rows, 60 PASS, 0 FAIL
  - ... v6-mode.mjs  -> 69 rows, 62 PASS, 0 FAIL
  - git ls-remote origin bird-updated -> eb3f346c256fa64a457349a4d5efaa06b16941bc
  Full output: HANDOFF.md "Fix round 3". Scripts: .agents/runs/ (dev tooling).
Notes / Open Questions
- Part 2 video comparison: not done; waiver needed.
- Not verified on real devices or browsers: touch, pull-to-refresh, trackpad
  momentum, background tab, text-only zoom, phone toolbar resizes,
  Safari/Firefox, screen readers.
- Open review items: n6 (scroll-mode corner owl can sit over a footer link),
  n7 (chat.js:97 selector matches nothing until a live-assistant URL is set),
  n12 (?v=deck-3 cache-busting; openAssistant opens a new tab), n13 (one avatar
  guard line in chat.js), and m1, m3-m5, m10, m14-m17, m19, m20 from the first review.
- Hoot's scripted replies in chat.js still use "Arogya ELogBook" and
  "Arogya Health Assistant"; the name-handling finding and
  assistantVoiceVerified: true (site.js) are unverified; fly.mp4 is committed
  although MASTER_PLAN §3 says the reference video is not.
- The AROGYA live demo needs a real URL and frame-policy check (assistantUrl is empty).
- transfer.json's signed link and token were exposed in a public repo: tell the repo
  owner. (The staged deletion of .owl-reference-tools/ removes it from the tree, not
  from git history.)
```

## Order
### Steps inside this task
1. Confirm the branch and state.
2. Design gate: mockups, then halt for the developer's pick.
3. Build the landing sections and transition engine.
4. Owl perches and flights.
5. Product pages and snapshots.
6. All checks; docs; HANDOFF Part 3.
7. One combined independent code-review at High assurance in an Opus session, covering Part 1, Fix round 1, Part 2 and this work; stop for the developer's decision.
8. After acceptance, close-task commits only scoped files and pushes to `origin bird-updated` without force. Approval of this file authorizes that push. No PR or merge. If the remote moved from eb3f346c, halt.

### Where this task sits
- Before this: Part 1, Fix round 1 and Part 2, all built and unreviewed.
- After this: the carried-over findings.

## Verification required before this is considered done
- [ ] `node --check` on every changed `.js` file; paste commands and output.
- [ ] Landing page and both product pages load from 127.0.0.1:4177 with no console errors and no failed requests.
- [ ] Copy check: every Approved copy line appears exactly where listed; paste output.
- [ ] Section alignment: after every input type (wheel, trackpad-style burst of 30 wheel events, swipe at 390x844, each key, dot nav, header link, deep link, back/forward), the settled position equals a section boundary within 1px. Paste a table.
- [ ] No skip: a burst of rapid wheel events moves exactly one section; input during a transition is ignored. Paste evidence.
- [ ] Fit: screenshots of all six sections at 360x640, 390x844, 1280x720, 1366x768 and 1440x900, with no internal scroll and nothing clipped.
- [ ] Owl: a frame-by-frame trace through all transitions forward and back shows the owl visible and inside the viewport on every frame, landing at each perch. Screenshots of every perch show nothing covered.
- [ ] Owl sprite checks from Part 2: angle-change rate, turn order and anchor drift on the new paths.
- [ ] Keyboard and focus: every key in the list, Tab across sections, focus lands on the section heading, and the form and chat inputs are not hijacked.
- [ ] Reduced motion, Pause motion and hidden tab behave as specified.
- [ ] Chat opens from the Talk to the owl section and the product-page owl, and closes and restores the owl.
- [ ] Product pages: the ELogBook preview tabs, keyboard and expand dialog work; the AROGYA disclaimer and live-demo button are present; Request a demo and Talk to us reach the form.
- [ ] Enquiry form still downloads a brief with the honest not-sent wording.
- [ ] Part 2 checks never completed: phone trace, Pause/reduced-motion run, reverse run and the video comparison, now on the new layout.
- [ ] `git status` and `git diff --stat` before commit — only scoped files changed.

## Flags (AGENTS.md rule triggers)
- §4 / §5.5: AROGYA and ELogBook claims are developer-supplied; the What we do wording is a draft approved with this plan. Add no claims. Keep the medical disclaimer.
- §5.2: never name the Kerala hospital.
- §5.3: architecture change — the landing page becomes a full-screen section deck with its own scroll engine, and two pages are added. Approval of this plan covers it.
- Accessibility risk: replacing native scroll needs careful keyboard, focus and reduced-motion handling, as listed.
- §5.4 / §9: push to bird-updated only after acceptance; no force, PR, merge or deployment.
- §12.5 likely halts: design gate; a section that cannot fit at 360x640; a perch that cannot avoid content; the remote moved.
- Rule conflict still open: `fly.mp4` is committed although MASTER_PLAN §3 says the reference video is never committed.

## Suggested review tier (set at scoping time)
- High assurance, high effort — public privacy and data-separation claims, a scroll-engine rewrite with accessibility risk, and three stacked unreviewed parts.

## Executor
- Sonnet direct
- Why: Antigravity test fails (2); design and motion need in-loop browser checks.
- Antigravity model: n/a.
- Execution session: a fresh agent session; Sonnet in Claude Code.

## Fix round 2 (combined review: reject; developer: send back, 2026-11-02)
- Executor: Sonnet direct, same task. Fix-only until the Criticals are closed and re-reviewed; no staging, commit, push or PR; no STATUS.md write.
- Developer decisions, which override the lines above where they differ:
  - Short or zoomed screens fall back to normal scrolling when a section's content does not fit or the viewport is short. This replaces "do not let it scroll" in the transition rules; the deck stays at the five listed sizes.
  - Input during a move is ignored: dot and header clicks, back/forward and focus changes. When the move ends the screen re-syncs to the URL hash.
  - Copy: "Bring ELogBook to your department" and "Bring AROGYA to your hospital" are approved. Removed: the What we do card, the "Hoot, our website guide" kicker and "Hoot gives no medical advice."
- Open for the developer: waiver of the Part 2 video comparison.
- Findings and fixes are recorded in HANDOFF.md, "Fix round 2".

## Fix round 3 (re-review of Fix round 2: reject; developer: send back, 2026-11-03)
- Executor: Sonnet direct, same task and rules as Fix round 2. Fix-only: no staging, commit, push or PR, no STATUS.md write. `chat.js`: avatar block and the four named functions only. The Fix round 2 developer decisions stand.
- Scope of the round: the one Critical (the mode switch moved the page) and its Majors (stale owl size, screenshot height, content growth, URL and focus after a mode switch, scroll-mode link focus, the `.agents/runs/` scripts), plus the listed minors. Findings and fixes go in HANDOFF.md, "Fix round 3".

## Acceptance (Fix round 3 review)
- Accepted by the developer 2026-11-03: "Accepted, close it out". Close-out (close-task) started 2026-11-03 in a Sonnet session on branch `bird-updated`; origin `bird-updated` and HEAD both still at eb3f346c (`git ls-remote`).
- Authorization on record: commit scoped files and push to `origin bird-updated`, no force (Order step 8). Merge, deployment and DNS are not authorized.
- Close-out answers, relayed 2026-11-03 by the planning session as the developer's choices: (1) open a PR to `main` on x3O8/Gothos-labs, do not merge; (2) STATUS.md draft approved as drafted; (3) include the extra paths listed under Blocked on developer input, item 3; (4) fix `REFERENCE.md` lines 42–43 in this commit.

## Owl art and sprite reference (from Part 2)
- Source sheet: `assets/owl/source/owl-sheet.webp` (4x4: front, three-quarter, side and rear three-quarter; wings up, level and down; perched front, blink, perched three-quarter, take-off crouch). Rebuild with `tools/build-owl-atlas.py`.
- Sprite rules: yaw follows travel, turns step through neighbouring angles, at most 4 angle changes per second, 80–120ms crossfades, about 1.4–1.6 wingbeats per second, bank capped at 10°, blink every 3.5–6s on the front perch.

## Carried over from earlier tasks
- The redesign task's independent review (2026-10-28) ended in reject / send back, and that work reached main through PR #1 without a recorded re-review. These items are not part of this task:
- Critical: `chat.js` could accept unrecognized health statements as contact names and include them in local briefs, with a related medical routing bypass. A medical check now runs before name handling; whether that closes the finding is unverified.
- Major: mobile ELogBook inner clipping and incomplete legibility evidence (`product-preview.css`, `HANDOFF.md`).
- Major: `site.js` microphone delegation flag defaulted to true although live verification was not performed; URL empty, so not active. Current state unverified.
- Full findings and fix-only prompt: `C:\Users\aravi\.codex\visualizations\2026\10\26\01a17990-0bda-7f40-89d2-8e001e3f7688\gothos-redesign-review.md`.
- Deferred: a dedicated public demo URL. Do not guess it.

## Approval
- Status: APPROVED 2026-11-02 — planning session, including the What we do wording. Execute in a fresh agent session (Sonnet in Claude Code). First halt: the design gate.
