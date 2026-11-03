# Current Task

## Feature
- Serve only the public website on Vercel: add a root `.vercelignore` so internal project files are not published at gothoslabs.com. This also makes Vercel serve the site as static files instead of running `server.mjs`, which is the cause of the current live 404s.

## Plan reference
- Not in MASTER_PLAN.md: no section covers hosting. Unplanned work, logged under §9.
- STATUS.md "Last updated" 2026-11-03: rebuild closed (`350c524`, `5d2b9c2`); PR #2 merged to `main` as `e554503` on 2026-11-03 by the developer. STATUS.md does not record the merge yet.
- Live state, checked 2026-11-03 in the planning session: DNS is live (`gothoslabs.com` A `216.198.79.1`; `www` CNAME to `0e616471c19d546e.vercel-dns-017.com`), HTTPS is valid, and apex → www is a 308 redirect. Every path returns 404, on `www.gothoslabs.com` and `gothoslabs.vercel.app` alike, including `/`, `/elogbook.html`, `/assets/owl/owl-atlas.json` and `/fonts/poppins-400.woff2`. The 404 has body `Not found` and `Content-Type: text/plain`, which is exactly what `server.mjs` sends in its catch branch. Vercel is running `server.mjs` as a Node function, and the function can't read the static files. Ignoring `server.mjs` should make Vercel fall back to static serving; the preview check below must prove it.
- Repository move (developer decision, 2026-11-03: "Move to Gotham28 entirely"). Vercel deploys from `Gotham28/gothos_labs` (private, `main`), not `x3O8/Gothos-labs`. At scoping, its only commit was `bab69aa` "Initial commit", with a tree (`0c96bd9c`) identical to `x3O8/Gothos-labs` `main` at `e554503`. From now on `Gotham28/gothos_labs` is the only repo for this project; `x3O8/Gothos-labs` is no longer updated.
- Hosting decisions (developer, 2026-11-02; repo updated 2026-11-03): Vercel project `gothos_labs`, imported from `Gotham28/gothos_labs` `main`, preset Other, no build command, root output; domain `gothoslabs.com` registered at Spaceship, Spaceship nameservers kept; the developer makes every Vercel and DNS click.

## MASTER_PLAN.md update
- [x] Append to §9 Unplanned / Ad-hoc Work, matching the existing bullet format: `- 2026-11-03 — Vercel publish hygiene: a root `.vercelignore` keeps internal project files (governance, docs, dev tools, reference material, local server) off the live site at gothoslabs.com. Site files unchanged.` Append only; do not edit or renumber any section.

## Files/areas in scope
- `.vercelignore` (new, repo root): ignore exactly these paths, one per line, gitignore syntax:
  - `.agents/`
  - `docs/`
  - `tools/`
  - `reference-source/`
  - `HANDOFF.md`
  - `DESIGN.md`
  - `PRODUCT.md`
  - `README.md`
  - `REFERENCE.md`
  - `server.mjs`
  - `.gitignore`
  - `.gitattributes`
- `docs/MASTER_PLAN.md`: the §9 append above, and nothing else.
- `REFERENCE.md` lines 42–43: Manual (developer), see below. Written by the developer, committed with this task.

## Explicitly out of scope
- `vercel.json`, redirects, headers, caching, clean URLs: not needed for a static site with preset Other.
- Deleting or moving any file, including unreferenced `fly.mp4`: a separate decision.
- `package.json`: Vercel reads it; it contains nothing sensitive. Do not ignore it.
- `licenses/`: the font licences must ship with the fonts. Do not ignore it.
- Any Vercel dashboard, Spaceship or DNS change: developer only (§5.4, §9).
- Any change to page HTML, CSS, JS, `assets/` or `fonts/`.

## Do NOT touch
- Every file the pages load: `index.html`, `elogbook.html`, `arogya.html`, all root `*.css` and `*.js`, `assets/`, `fonts/`, `licenses/`.
- `.agents/AGENTS.md` (modified, uncommitted on purpose) and the untracked items listed by the last close-out (`.agents/owl-contact-sheet.png`, `.claude/`, `.playwright-mcp/`, `Gothos-labs/`, root `AGENTS.md` and `CLAUDE.md`, `show-*.jpg`, `tools/__pycache__/`, `.agents/runs/out-v*.json`, `smoke.mjs`, `scroll-shots.mjs`).
- `main`: never commit to it directly, never merge.
- The guard hook and its allow list.

## Execution route
- B — Agent loop.
- Why: route C test point 2 fails. Deployment config is a §10 high-assurance trigger.
- Close-out: route B via `close-task`. Never route C. Push of `vercel-publish` and a PR to `main` on `Gotham28/gothos_labs` are authorized by the developer for this task ("Yes, scope it", 2026-11-03, after the go-live instructions; repo per "Move to Gotham28 entirely"). No push to `x3O8/Gothos-labs`. No force push by the agent. Merge stays with the developer.

## Manual (developer does)
- [x] Move this folder to `Gotham28/gothos_labs`, keeping full history. Run in `D:\Company Website`:
  1. `git remote rename origin x3o8` (keeps the old repo reachable for reference)
  2. `git remote add origin https://github.com/Gotham28/gothos_labs.git`
  3. `git fetch origin` and `git fetch x3o8`
  4. `git push --force-with-lease=main:bab69aa origin refs/remotes/x3o8/main:refs/heads/main` (a one-time force push that replaces the "Initial commit" with the real history; the files are identical, so nothing is lost; it refuses if anyone has pushed to `Gotham28` `main` since `bab69aa`)
  5. `git branch -u origin/main main` if a local `main` exists
  Vercel redeploys the same files; the site keeps returning 404 until this task merges.
- [ ] Edit `REFERENCE.md` lines 42–43 by hand (the guard blocks the agent): replace the two `hoot-body.png` / `hoot-wing.png` lines with `- Superseded: the owl now uses the sprite atlas `assets/owl/owl-atlas.webp` / `owl-atlas.json` (built by `tools/build-owl-atlas.py`).` Or tell the execution session to leave the file as it is.
- [ ] Delete `.agents/commit-msg.txt` (close-out scratch file).
- [x] The go-live clicks, separately and at any time: Vercel import (preset Other), add `gothoslabs.com` and `www.gothoslabs.com`, then in Spaceship Advanced DNS remove the two parking A records and add Vercel's A (`@`) and CNAME (`www`).
- [ ] After review: merge the PR into `main`.

## Agent (does on its own, once scope is confirmed)
- [x] First check that `git remote get-url origin` is `https://github.com/Gotham28/gothos_labs.git` and that `origin/main` contains `e554503`. If not, halt: the Manual repo move isn't done.
- [x] Create branch `vercel-publish` from `origin/main`. Carry the uncommitted working-tree items over untouched.
- [x] Write `.vercelignore` with exactly the listed paths. (Created by the developer by hand after the guard blocked the agent; verified to hold exactly the 12 paths.)
- [x] Append the §9 entry to `docs/MASTER_PLAN.md`.
- [x] Run the local verification below and write evidence into root `HANDOFF.md` (replace the previous task's content; it is preserved in git at `5d2b9c2`).

## Blocked on developer input
- RESOLVED 2026-11-03: the developer created `.vercelignore` by hand; execution finished and verified locally (see HANDOFF.md). Was: (execution session, §12.5/§7): the guard hook (`~/.claude/hooks/antigravity-guard.ps1`) blocked `Write` to `D:/Company Website/.vercelignore`, an in-scope path. It allows only `.agents/`, `docs/`, `HANDOFF.md`, so it does not yet allow direct-executor writes to the repo root. Nothing was routed around. Needs the developer to widen `$AllowedWritePatterns` for `.vercelignore` (and `HANDOFF.md` is already allowed), or to create `.vercelignore` by hand with the 12 listed paths. Done so far: branch `vercel-publish` from `origin/main` (`e554503`), §9 entry appended to `docs/MASTER_PLAN.md`. Not done: `.vercelignore`, the local verification, `HANDOFF.md` evidence.
- Review 2026-11-03 (high assurance; four lenses): verdict accept with fixes. Developer decision: "Send back". Fix round 1 is docs-only: `HANDOFF.md` (M1 pasted unfiltered item-3 output, m1 counts 40 published files / 12 fonts, m2 stale line 14, m4 STATUS.md draft in HANDOFF with residual risks under Notes / Open Questions) and ticking completed boxes here (m3). No writes outside the repo or scratchpad (m5). Do not touch `.vercelignore` or any site file. Resume from Order step 2 (HANDOFF/verification only), then re-review at the same tier. Scope change approved by the developer ("Yes, amend it"): Verification item 3 reworded, preview probes add `/.vercelignore` and the `x-matched-path`/`x-vercel-id` headers, and close-out pushes with an explicit `git push -u origin vercel-publish`.
- Re-review 2026-11-03 (high assurance; four lenses, after fix round 1): verdict accept with fixes. Earlier M1 and m1–m3 confirmed fixed. Two new Majors were in this task file's own checks, not the executor's work: the production redirect was the wrong way round, and there was no rule for Vercel preview login. Minors: no general halt rule, a PowerShell `curl` alias problem, the PR repo not pinned, and in `HANDOFF.md` a stale probe list, transient STATUS wording and the wrong direction at line 84. Developer decision: "Fix task file, then close out". The planning session amended Verification (probe rules, preview, production) and Order step 4. The work is accepted; next is `close-task` in a fresh Sonnet session. The HANDOFF-side minors are handled at close-out per Order step 4.
- Original note, at scoping: none open. Likely halt: if the guard blocks writing `.vercelignore` or `docs/MASTER_PLAN.md`, stop and report the path (§7). Do not route around it.

## Order
### Steps inside this task
1. Developer does the repo move (Manual) before the execution session starts. The developer can also edit `REFERENCE.md` or say to leave it, any time before close-out.
2. Agent: branch, `.vercelignore`, §9 append, local verification, HANDOFF.md.
3. Independent `code-review` at the high-assurance tier, then a developer decision.
4. `close-task`: commit the scoped files (`.vercelignore`, `docs/MASTER_PLAN.md`, `HANDOFF.md`, `REFERENCE.md` if edited, this file; never `.agents/AGENTS.md`), push with exactly `git push -u origin vercel-publish` (the branch tracks `origin/main`, so a bare `git push` must not be used), and open the PR with exactly `gh pr create --repo Gotham28/gothos_labs --base main --head vercel-publish`. Close-out also:
   - Runs the preview and production probes from this file's Verification section, never from the older list in `HANDOFF.md` (around line 90).
   - Rewrites the `HANDOFF.md` STATUS draft into durable, committed facts (commit hashes, PR number), puts residual risks only under Notes / Open Questions, writes the live 404 as a dated observation ("checked 2026-11-03: every path returned plain-text `Not found`"), hedges the Vercel CLI-vs-Git-deploy note, and gets the developer's approval before writing `docs/STATUS.md`.
   - Ticks the MASTER_PLAN update box, the Manual repo-move box and the Manual go-live box (all done and verified).
   - Expects the committed `.vercelignore` blob to be LF (`* text=auto`), so its size and md5 differ from the reviewed 142-byte CRLF working copy; compare the 12 lines, not the hash.
5. Before merging: the preview checks below, run against the Vercel preview URL for the PR, if the Vercel project exists by then.
6. Developer merges. Then the production checks below.

### Where this task sits
- Before this: PR #2 merged (done, `e554503`).
- After this: production checks at gothoslabs.com once DNS is live; a STATUS.md catch-up recording the merge and go-live, with wording approved by the developer.

## Verification required before this is considered done
- [x] Local: `git ls-files | git -c core.excludesFile=.vercelignore check-ignore --no-index --stdin` lists every tracked file under the ignored paths and nothing else. Paste the output.
- [x] Local: the same check against each file the pages load (`index.html`, `elogbook.html`, `arogya.html`, the root `*.css` and `*.js`, `assets/logo/gothos-logo.png`, `assets/owl/owl-atlas.webp`, `assets/owl/owl-atlas.json`, `assets/screens/*.webp`, `fonts/*`, `licenses/*`) prints nothing, so none of them is ignored. Paste the command and its empty output.
- [x] Local (amended 2026-11-03 after review, M1): the unfiltered `git diff --stat origin/main` shows only `docs/MASTER_PLAN.md`, `HANDOFF.md`, `.agents/CURRENT_TASK.md`, `REFERENCE.md` if the developer edited it, and the pre-existing `.agents/AGENTS.md` change (named as pre-existing, never staged). Separately, `git status --short -- .vercelignore` shows `?? .vercelignore`. Paste both outputs, fresh and unfiltered.
- Probe rules (amended 2026-11-03 after re-review, M1/M2/m1/m2; apply to both checks below):
  - Command: in PowerShell use `curl.exe -s -o NUL -w "%{http_code}" <url>`; in Git Bash use `curl -s -o /dev/null -w "%{http_code}" <url>`. Never PowerShell's `curl` alias. Headers: `curl.exe -sI <base>/`. Record `x-matched-path` and `x-vercel-id` for information only; no decision depends on them.
  - Expect 200: `/`, `/elogbook.html`, `/arogya.html`, `/assets/owl/owl-atlas.json`. Expect 404: `/HANDOFF.md`, `/.agents/AGENTS.md`, `/docs/STATUS.md`, `/server.mjs`. Report-only: `/.vercelignore` (report its code to the developer; never halt on it).
  - Halt and report to the developer if any expected-200 probe returns anything other than 200 (including plain-text `Not found`, Vercel's own 404 page, 5xx or `FUNCTION_INVOCATION_FAILED`), or if any expected-404 probe returns 200. The fix is then a scoping question; do not edit `package.json`, `server.mjs` or Vercel settings.
- [ ] Preview (at close-out, before merge, if the Vercel project exists): the probe rules against the PR's Vercel preview URL. If the preview answers 401 or 403 (Vercel Deployment Protection), record "preview not verifiable (Deployment Protection)", leave this box unticked, and do not use or ask for a bypass token. The production check right after the merge then becomes the gate; tell the developer so before they merge.
- [ ] Production (after merge): the probe rules against `https://www.gothoslabs.com` (the main address). Also `http://gothoslabs.com/` and `https://gothoslabs.com/` must each return 308 with `Location` `https://www.gothoslabs.com/` (or 308 to `https://gothoslabs.com/` first for the http one, then 308 to www). Never "fix" the domain redirect; it is the developer's Vercel setting.

## Flags (AGENTS.md rule triggers)
- §5.4 / §9: deployment. This task changes what Vercel publishes. All Vercel and DNS actions stay with the developer; the agent makes no remote change beyond close-out's authorized push and PR.
- §5.4 / §9: the repo move needs a one-time force push to `Gotham28/gothos_labs` `main`. The developer runs it by hand (Manual). `--force-with-lease` pinned to `bab69aa` stops it from overwriting anything new.
- §5.7: `x3O8/Gothos-labs` becomes a separate, inactive boundary. Nothing is pushed there.
- §5.8: the `REFERENCE.md` line fix is a separate docs correction. It rides along only as a developer-manual edit in the same commit, because the close-out already approved it and the guard blocks the agent.
- §5.10: local evidence proves the ignore rules. Only the preview and production checks prove Vercel honours them.
- §12.5: halt if the guard denies an in-scope write, or if a preview shows an ignored path still served.
- §4 / §5.1: none. No content, claims or sensitive data change.
- §9 append: lands without its own approval checkpoint (see the note in the hand-off).

## Suggested review tier (set at scoping time)
- High assurance, high effort. §10 trigger: deployment. Rounded up despite the small diff, because a wrong ignore rule either publishes internal files or breaks the live site.

## Executor
- Direct (legacy label: Sonnet direct).
- Why: Antigravity test point 1 fails. About 15 lines that need in-loop checks.
- Antigravity model: n/a.
- Execution session: a fresh Sonnet session in Claude Code.

## Approval
- Status: APPROVED 2026-11-03 — planning session, re-scoped for `Gotham28/gothos_labs`. Execute in a fresh agent session (Sonnet in Claude Code). Blocked on developer input: none open. The first agent step halts if the Manual repo move isn't done. The `REFERENCE.md` edit is a Manual item; if the developer hasn't made it by close-out, commit without it and leave it as a follow-up.
