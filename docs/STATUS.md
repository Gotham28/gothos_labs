# Project Status

Last updated: 2026-11-05

## Baseline
- Source: https://github.com/x3O8/Gothos-labs.git
- Imported upstream revision: a7d21093e1c573bcc725d1e706a300173d9803c6
- Existing buildless marketing website for Gothos Labs and Arogya ELogBook.
- No website implementation changes are included in the bootstrap scope.
- Enquiries prepare a local text brief; they do not send messages.
- Repository: `Gotham28/gothos_labs` (private; Vercel deploys `main`) since 2026-11-03. `x3O8/Gothos-labs` is no longer updated.

## Catch-up log

### Catch-up — 2026-10-28
Imported Gothos-labs unchanged and established project governance.
- Branch: bootstrap/import-governance
- PR: N/A — local-only
- Commits: 5d6303a3a9171215e5407371b81783edcc4ae554
- Verification: all 24 tracked files matched upstream bytes.
  Exact integrity, syntax and asset commands/output: HANDOFF.md.
- Command: npm run dev
  Output:
  > gothos-labs@1.0.0 dev
  > node server.mjs
  Gothos Labs preview: http://127.0.0.1:4177
- Browser: homepage opened successfully; broader interaction and
  accessibility checks were not performed.
- Deferred: owl redesign and assistant research remain in
  MASTER_PLAN.md §3; supplied asset paths remain in CURRENT_TASK.md.
- Note: Git reports line-ending status flags despite identical
  file bytes and an empty content diff.

### Catch-up — 2026-11-03
Rebuilt the landing page as six full-screen sections (seven since 2026-11-10) with a section-transition
engine and an owl that perches in each section and flies between them; added
ELogBook and AROGYA product pages; real Gothos Labs logo; 16-pose sprite owl.
- Landing: Gothos Labs hero, What we do, ELogBook, AROGYA, Ask the owl (Hoot; now Ask Mochi),
  Talk to us (local-brief enquiry form). One gesture moves one section. The
  section deck runs from 360x640 up where every section fits; on shorter or
  narrower screens, or when a section stops fitting, the page scrolls normally.
  Header links, dots and #what-we-do, #elogbook, #arogya, #owl, #contact deep
  links work in both modes.
- elogbook.html (six-screen illustrative preview, role tabs) and arogya.html
  (illustrative chat card, disclaimer, disabled live-demo button), each with a
  small perched owl that opens Hoot (now Mochi).
- Copy: developer-supplied; the "What we do" wording is a developer-approved draft.
- Branch: bird-updated
- PR: #2 https://github.com/x3O8/Gothos-labs/pull/2
- Commits: 350c524, plus the docs commit that records this line
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

### Catch-up — 2026-11-03 (hosting)
Moved the project to `Gotham28/gothos_labs` and added a root `.vercelignore` so Vercel publishes only the public site.
- Repository: the developer force-pushed the full history to `Gotham28/gothos_labs` `main`, replacing its single "Initial commit" (`bab69aa`); the tree was identical to `x3O8/Gothos-labs` `main` at `e554503` (PR #2 there, merged 2026-11-03).
- Domain, checked 2026-11-03: `gothoslabs.com` DNS and HTTPS live; `www.gothoslabs.com` is the main address and the apex redirects to it (308). On the same day, before this change, every path on `www.gothoslabs.com` and `gothoslabs.vercel.app` returned plain-text `Not found`, matching what `server.mjs` sends.
- Change: new root `.vercelignore` with 12 paths (`.agents/`, `docs/`, `tools/`, `reference-source/`, `HANDOFF.md`, `DESIGN.md`, `PRODUCT.md`, `README.md`, `REFERENCE.md`, `server.mjs`, `.gitignore`, `.gitattributes`); one-line MASTER_PLAN.md §9 entry. No page, style, script, asset or font file changed.
- Branch: vercel-publish
- PR: #1 https://github.com/Gotham28/gothos_labs/pull/1
- Commits: 36e7a10, plus the docs commit that records this entry
- Review: high assurance, four lenses; one send-back (fix round 1) and a re-review; accepted by the developer 2026-11-03. Tier unratcheted (no independent Antigravity tier for a direct-executor task, AGENTS.md §12.9).
- Verification (HANDOFF.md, local only):
  - `git ls-files | git -c core.excludesFile=.vercelignore check-ignore --no-index --stdin` -> 23 tracked files, exactly the files under the 12 paths.
  - Same check over every file the pages load, plus `package.json` -> empty output (none ignored).
  - `git diff --stat origin/main` -> only `docs/MASTER_PLAN.md`, `HANDOFF.md`, `.agents/CURRENT_TASK.md` and the pre-existing, unstaged `.agents/AGENTS.md`; `.vercelignore` is new.
  - Local checks prove the ignore rules only. The Vercel preview and production probe results are recorded in the later go-live entry.
- Deferred: preview and production probes; unreferenced files still published (see Notes); REFERENCE.md lines 42-43 (existing note).

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
- REFERENCE.md lines 42-43 still list the deleted assets/owl/hoot-body.png and
  hoot-wing.png; the close-out session could not edit that file (write guard).
- Not yet confirmed that Vercel honours `.vercelignore` and serves the site as static files; the preview and production probes in CURRENT_TASK.md settle it.
- `package.json` `start` still runs `node server.mjs`. If Vercel runs it, `/` may keep returning `Not found`; the fix would be a scoping question.
- `/.vercelignore` itself may be served; it lists path names only.
- Files no page references (`git grep` over tracked `*.html`, `*.css`, `*.js`) are still published: `fly.mp4`, the manrope and open-sauce-one fonts (6 files), `assets/owl/source/owl-sheet.webp`, `assets/logo/gothos-owl.svg`, `assets/logbook/training-flow.svg`, `assets/logbook/training-reflection.svg`. Ignore or delete is undecided.
- Expected, not tested here: Vercel Git deploys see only committed files, while CLI deploys upload the working directory, so untracked root items (`Gothos-labs/`, `show-*.jpg`, `.playwright-mcp/`, root `AGENTS.md` and `CLAUDE.md`) would not be covered by `.vercelignore` in a CLI deploy.

### Catch-up — 2026-11-05 (SEO basics)
Added canonical URLs and Open Graph metadata to the homepage and both product pages, homepage Organization structured data, robots.txt and a three-page sitemap. Added local preview text/XML MIME mappings and developer Search Console guidance. Local checks returned HTTP 200 with expected content types for all five routes, parsed the metadata, checked unchanged page bodies and confirmed referenced public assets remain included. Publication and Search Console setup are pending.
Notes / Open Questions: live indexing, ranking and external sharing previews have not been checked. No ranking guarantee.
- Branch: `vercel-publish`
- PR: #3 https://github.com/Gotham28/gothos_labs/pull/3 — push and PR authorized by developer 2026-11-05; production deployment and merge not performed.
- Commits: `47e33f9afbb2bacc510cc62717b39e80b8805e5e` (SEO implementation), `a22eb6d7a3797c419ca82bd69b6a732d75f39b42` (local close-out); followed by the documentation commit recording this PR.
- Review: standard/medium, four independent read-only lenses; accepted by developer 2026-11-05. One bookkeeping finding corrected and independently rechecked. Direct-executor tier unratcheted; no Antigravity tier.
- Verification evidence: exact PowerShell commands and full fresh output are in HANDOFF.md. Selected output from that run:
  - `node --check server.mjs` — exit 0 (no output).
  - `Invoke-WebRequest` loop over the five routes — `/ : 200 text/html; charset=utf-8`, `/elogbook.html : 200 text/html; charset=utf-8`, `/arogya.html : 200 text/html; charset=utf-8`, `/robots.txt : 200 text/plain; charset=utf-8`, `/sitemap.xml : 200 application/xml; charset=utf-8`.
  - Inline PowerShell XML/JSON/metadata checks — `PASS sitemap XML: exactly three expected canonical URLs; Organization JSON: five expected properties and values`; all three page checks report unchanged body; `PASS 26 public page/runtime/discovery references exist and none are excluded by .vercelignore`.
  - `git diff --check` — exit 0; only line-ending conversion warnings.
- Deferred: publication and developer Search Console verification, submission and inspection steps in docs/SEO.md. Live indexing/ranking and external sharing previews unverified.

### Catch-up — 2026-11-10 (Software, perfected by AI)
Home page repositioned as "Software, perfected by AI". Added an Our products panel, panel names became the large headings, the website guide is now named Mochi, and the deck is a seven-panel deck that takes further product panels.
- Branch: `vercel-publish`
- PR: none opened; push only, authorized by the developer 2026-11-10. Merge and deployment not performed.
- Commits: pending
- Review: standard/medium, four independent read-only lenses; one send-back (fix round), developer accepted 2026-11-10 without a second review of the fix round. Direct-executor tier unratcheted; no Antigravity tier (AGENTS.md §12.9).
- Verification (fresh output in HANDOFF.md, run on a local server at 127.0.0.1:4178 after the last source edit):
  - `node --check section-scroll.js; node --check chat.js; node --check hoot-api.mjs` — exit 0 for each.
  - `node .agents/runs/run.mjs .agents/runs/v1-core.mjs` — PASS=81 FAIL=0.
  - `... v2-fit.mjs` — 70 section/size runs, 0 failing.
  - `... v3-owl.mjs` — 7 slides, 10508 frames, 0 outside the viewport, 0 hidden, maxLandDx 3.62, maxLandDy 2.02.
  - `... v5-pages.mjs` — PASS=58 FAIL=0 SKIP=1.
  - `... v6-mode.mjs` — PASS=62 FAIL=0.
- Not verified: real-device touch; the production chat endpoint with a live key; v5 item 13 (skipped: enquiries now post to `/api/enquiry`, no download).
- Deferred: `PRODUCT.md` and `docs/MASTER_PLAN.md` hold this task's edits plus staged text from the replaced enquiry task, so both were left out of the commit until that task is resolved; `v4-input.mjs` not converted to id/count lookups; chat chips in `chat.js` still say "Arogya Health Assistant"; the index noscript line still mentions "local enquiry downloads"; owl perch after a late font swap and the `.claude/launch.json` port belong to Task 2; the `?v=deck-3` and `?v=sprite-1` cache-bust tokens were not bumped; the Products nav link has no `aria-current` on the ELogBook and AROGYA slides.
