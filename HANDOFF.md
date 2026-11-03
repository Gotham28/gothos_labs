# Vercel publish hygiene — execution handoff

Date: 2026-11-03. Executor: Direct (Sonnet direct), route B, fresh execution session. Branch `vercel-publish`, created from `origin/main` (`e554503`). `git remote get-url origin` = `https://github.com/Gotham28/gothos_labs.git`; `git merge-base --is-ancestor e554503 origin/main` succeeded. The execution session committed, staged and pushed nothing. Independent high-assurance review: send-back, fix round 1, re-review; the developer accepted the work on 2026-11-03. Commit, push and PR happen at close-out (commit hashes and PR number are in the STATUS.md entry and on the PR).

## Status
All Agent-bucket items are done. Local verification passes. The preview and production checks (Verification items 4 and 5) are not run: they need the Vercel project and DNS, which are the developer's.

One halt happened and is resolved: the guard hook blocked `Write` to `.vercelignore` (it then allowed only `.agents/`, `docs/`, `HANDOFF.md`). I did not route around it. The developer created the file by hand (first as `.vercelignore.txt`, then renamed). I did not write `.vercelignore`; I only verified it.

## What changed
- `.vercelignore` (new, repo root, written by the developer): the 12 listed paths, one per line: `.agents/`, `docs/`, `tools/`, `reference-source/`, `HANDOFF.md`, `DESIGN.md`, `PRODUCT.md`, `README.md`, `REFERENCE.md`, `server.mjs`, `.gitignore`, `.gitattributes`. ASCII, no BOM, CRLF line endings (git's ignore matching handled them correctly, see evidence 1). 142 bytes.
- `docs/MASTER_PLAN.md`: one line appended at the end of §9 (line 27), the exact wording from the task. No other line touched.
- `HANDOFF.md`: replaced (previous task's content is in git at `5d2b9c2`).
- `.agents/CURRENT_TASK.md`: I recorded the guard halt under "Blocked on developer input" (marked RESOLVED there). The task file is also in the commit list.

## Evidence
### 1. Ignore rules cover every tracked file under the ignored paths, and nothing else
Command (run from `D:/Company Website`, git `core.excludesFile=.vercelignore`):
```
git ls-files | git -c core.excludesFile=.vercelignore check-ignore --no-index --stdin
```
Output (exit 0), 23 files:
```
.agents/AGENTS.md
.agents/CURRENT_TASK.md
.agents/runs/run.mjs
.agents/runs/v1-core.mjs
.agents/runs/v2-fit.mjs
.agents/runs/v3-owl.mjs
.agents/runs/v4-input.mjs
.agents/runs/v5-pages.mjs
.agents/runs/v6-mode.mjs
.gitattributes
.gitignore
DESIGN.md
HANDOFF.md
PRODUCT.md
README.md
REFERENCE.md
docs/MASTER_PLAN.md
docs/STATUS.md
reference-source/GhostFibers.css
reference-source/GhostFibers.jsx
reference-source/ghost-fibers.js
server.mjs
tools/build-owl-atlas.py
```
Cross-check: `git ls-files .agents docs tools reference-source HANDOFF.md DESIGN.md PRODUCT.md README.md REFERENCE.md server.mjs .gitignore .gitattributes` printed the same 23 files, in the same order. The sets are identical.

### 2. No file the pages load is ignored
Command (39 files: `index.html`, `elogbook.html`, `arogya.html`, every root `*.css` and `*.js`, all of `assets/`, `fonts/`, `licenses/`, and `package.json`; `fly.mp4` is not in the pathspec, so the full published set is 40, see below):
```
git ls-files -- index.html elogbook.html arogya.html '*.css' '*.js' assets fonts licenses package.json | grep -v '^\(tools\|reference-source\|\.agents\|docs\)/' | git -c core.excludesFile=.vercelignore check-ignore --no-index --stdin
```
Output: empty. `exit=1` (git's "nothing ignored" code).

Files that will be published (the complement of evidence 1: 63 tracked files minus the 23 ignored = 40 files; the command above covers 39 of them because its pathspec leaves out `fly.mp4`), from `check-ignore -v -n`: `arogya.html`, `elogbook.html`, `index.html`, `chat.js`, `owl.js`, `site.js`, `section-scroll.js`, `logbook-showcase.js`, `styles.css`, `owl-chat.css`, `logbook-showcase.css`, `product-page.css`, `product-preview.css`, `package.json`, `assets/logo/gothos-logo.png`, `assets/logo/gothos-owl.svg`, `assets/owl/owl-atlas.json`, `assets/owl/owl-atlas.webp`, `assets/owl/source/owl-sheet.webp`, `assets/screens/arogya-preview.webp`, `assets/screens/elogbook-preview.webp`, `assets/logbook/training-flow.svg`, `assets/logbook/training-reflection.svg`, `fly.mp4`, twelve `fonts/*` files (manrope ×4, open-sauce-one ×2, poppins ×6), four `licenses/*` files.

### 3. Diff against origin/main
Replaced in fix round 1 (review M1): the earlier output was filtered by a path list, so it hid the other changed files. Fresh, unfiltered output, run after the last edit to every file except this block:

Command: `git diff --stat origin/main`
Output:
```
warning: in the working copy of '.agents/AGENTS.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.agents/CURRENT_TASK.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'HANDOFF.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/MASTER_PLAN.md', LF will be replaced by CRLF the next time Git touches it
 .agents/AGENTS.md       |   4 +-
 .agents/CURRENT_TASK.md | 339 ++++++--------------------
 HANDOFF.md              | 637 +++++++++---------------------------------------
 docs/MASTER_PLAN.md     |   1 +
 4 files changed, 193 insertions(+), 788 deletions(-)
```
Command: `git status --short -- .vercelignore`
Output:
```
?? .vercelignore
```
Reading it:
- `.agents/AGENTS.md` is the pre-existing, deliberately uncommitted change (Do NOT touch list). Never staged.
- `.agents/CURRENT_TASK.md` carries the guard-halt note, the review send-back note, the amended Verification items and the ticked boxes.
- `docs/MASTER_PLAN.md` is the one-line §9 append.
- `HANDOFF.md` is this file. The counts pasted above were captured before this file and the task file were last edited, so they differ from later runs of the same command (a later run showed `HANDOFF.md` 631 and `.agents/CURRENT_TASK.md` 348 changed lines). The committed diff is the authority.
- `REFERENCE.md` does not appear: the developer has not edited it (Manual item still open).
- `.vercelignore` is untracked, so `git diff` cannot show it; the `git status` line above does.
- The large counts for `.agents/CURRENT_TASK.md` and `HANDOFF.md` come from both files being replaced for this task (the previous task's content is in git). Git's LF-to-CRLF warnings are harmless. No other tracked file differs from `origin/main`.

### 4. Preview and 5. Production: not run
Need the Vercel project and DNS (developer only). Local evidence proves the ignore rules only; it does not prove Vercel honours them (§5.10). The probe list, expected codes, `/.vercelignore` report-only rule, 401/403 Deployment Protection rule and halt rules are in `.agents/CURRENT_TASK.md` `## Verification required`. That section is the authority; this file holds no copy of it. Preview probes run at close-out against the PR's Vercel preview URL; production probes run after the developer merges.

## Not done / needs the developer
- `REFERENCE.md` lines 42–43: Manual, not edited (still the `hoot-body.png` / `hoot-wing.png` lines at the time of fix round 1). Commit without it and leave it as a follow-up, per the task.
- Delete `.agents/commit-msg.txt` (Manual).
- Preview checks (run by the close-out session), then merge and production checks (developer).

## Noticed, out of scope (not acted on)
- `fly.mp4` and `assets/owl/source/owl-sheet.webp` will be published. The task already excludes deleting `fly.mp4`; the source sheet (`assets/owl/source/`) is the 4x4 art the atlas was built from. Neither is referenced by any `*.html`, `*.css` or `*.js` file (grep for `fly\.mp4|owl-sheet` returned no matches), so they are dead weight on the live site. Worth a follow-up decision on whether to ignore or delete them.
- `package.json` is published. The task says do not ignore it. If Vercel runs its `start` script, that is the preview-check halt above.

## Fix round 1 (review 2026-11-03, developer decision "Send back")
Docs only. Files touched: `HANDOFF.md`, `.agents/CURRENT_TASK.md`. Not touched: `.vercelignore`, any site file, `package.json`, `server.mjs`, `.agents/AGENTS.md`, `docs/STATUS.md`. Nothing staged, committed or pushed. Nothing written outside the repo.

| Finding | Check against the repo | Action |
|---|---|---|
| M1: item 3 output filtered, not pasted unfiltered | True: the old block ran `git diff --stat origin/main -- <4 paths>` | Replaced with fresh unfiltered `git diff --stat origin/main` and `git status --short -- .vercelignore` (Evidence 3) |
| m1: wrong counts | True: `git ls-files` = 63, ignored = 23, so 40 published; `ls fonts` = 12 (manrope 4, open-sauce-one 2, poppins 6) | Corrected in Evidence 2. The item-2 command still covers 39 because its pathspec omits `fly.mp4`; now stated |
| m2: stale "needs a close-out edit" line | True: the blocker is marked RESOLVED in the task file | Line removed |
| m3: unticked boxes | True | Ticked the five Agent boxes and the three local Verification boxes in `.agents/CURRENT_TASK.md`. Preview and production boxes, the Manual boxes and the MASTER_PLAN update box are left as they were |
| m4: no STATUS.md draft | True | Draft below; `docs/STATUS.md` not written |
| m5: no writes outside the repo or scratchpad | Followed | No `/tmp` use; the diff and status output above were captured by running the commands directly, not through a temp file |

## STATUS.md draft (rewritten at close-out for developer approval; `docs/STATUS.md` is written only after approval)
Insert under `## Baseline` one bullet, and append the entry and notes below. `PR: pending` and `Commits: pending` are replaced by the real PR number and short hashes after the PR is open; nothing else changes.

### Baseline (one added bullet)
- Repository: `Gotham28/gothos_labs` (private; Vercel deploys `main`) since 2026-11-03. `x3O8/Gothos-labs` is no longer updated.

### Catch-up — 2026-11-03 (hosting)
Moved the project to `Gotham28/gothos_labs` and added a root `.vercelignore` so Vercel publishes only the public site.
- Repository: the developer force-pushed the full history to `Gotham28/gothos_labs` `main`, replacing its single "Initial commit" (`bab69aa`); the tree was identical to `x3O8/Gothos-labs` `main` at `e554503` (PR #2 there, merged 2026-11-03).
- Domain, checked 2026-11-03: `gothoslabs.com` DNS and HTTPS live; `www.gothoslabs.com` is the main address and the apex redirects to it (308). On the same day, before this change, every path on `www.gothoslabs.com` and `gothoslabs.vercel.app` returned plain-text `Not found`, matching what `server.mjs` sends.
- Change: new root `.vercelignore` with 12 paths (`.agents/`, `docs/`, `tools/`, `reference-source/`, `HANDOFF.md`, `DESIGN.md`, `PRODUCT.md`, `README.md`, `REFERENCE.md`, `server.mjs`, `.gitignore`, `.gitattributes`); one-line MASTER_PLAN.md §9 entry. No page, style, script, asset or font file changed.
- Branch: vercel-publish
- PR: pending
- Commits: pending
- Review: high assurance, four lenses; one send-back (fix round 1) and a re-review; accepted by the developer 2026-11-03. Tier unratcheted (no independent Antigravity tier for a direct-executor task, AGENTS.md §12.9).
- Verification (HANDOFF.md, local only):
  - `git ls-files | git -c core.excludesFile=.vercelignore check-ignore --no-index --stdin` -> 23 tracked files, exactly the files under the 12 paths.
  - Same check over every file the pages load, plus `package.json` -> empty output (none ignored).
  - `git diff --stat origin/main` -> only `docs/MASTER_PLAN.md`, `HANDOFF.md`, `.agents/CURRENT_TASK.md` and the pre-existing, unstaged `.agents/AGENTS.md`; `.vercelignore` is new.
  - Local checks prove the ignore rules only. The Vercel preview and production probe results are recorded in the later go-live entry.
- Deferred: preview and production probes; unreferenced files still published (see Notes); REFERENCE.md lines 42-43 (existing note).

### Notes / Open Questions (to add)
- Not yet confirmed that Vercel honours `.vercelignore` and serves the site as static files; the preview and production probes in CURRENT_TASK.md settle it.
- `package.json` `start` still runs `node server.mjs`. If Vercel runs it, `/` may keep returning `Not found`; the fix would be a scoping question.
- `/.vercelignore` itself may be served; it lists path names only.
- Files no page references (`git grep` over tracked `*.html`, `*.css`, `*.js`) are still published: `fly.mp4`, the manrope and open-sauce-one fonts (6 files), `assets/owl/source/owl-sheet.webp`, `assets/logo/gothos-owl.svg`, `assets/logbook/training-flow.svg`, `assets/logbook/training-reflection.svg`. Ignore or delete is undecided.
- Expected, not tested here: Vercel Git deploys see only committed files, while CLI deploys upload the working directory, so untracked root items (`Gothos-labs/`, `show-*.jpg`, `.playwright-mcp/`, root `AGENTS.md` and `CLAUDE.md`) would not be covered by `.vercelignore` in a CLI deploy.

## Suggested review
High assurance, high effort (§10, deployment trigger). Stated as unratcheted: no independent Antigravity tier exists for this direct-executor task (§12.9).
