# SEO basics — execution handoff
Date: 2026-11-05
Baseline and HEAD: 4b9dd396e4891738b41feffd7ae59e03aa21f1d7; working-tree review on vercel-publish.
Developer explicitly overrode the separate-chat requirement with "do it here". Direct executor. No commit, staging, push, PR, deployment, DNS or account changes.

## Changes
- index.html, elogbook.html, arogya.html: head-only canonical and five Open Graph fields using existing titles/descriptions and logo; homepage factual Organization JSON-LD.
- robots.txt: allow crawling and reference sitemap.
- sitemap.xml: exactly the three production canonical URLs.
- server.mjs: only .txt and .xml MIME mappings.
- docs/SEO.md: manual Search Console verification, sitemap submission, inspection, monitoring and limits, linked to official Google references.
- docs/MASTER_PLAN.md: dated append-only §9 entry.
- .agents/CURRENT_TASK.md: execution override and verification state.
- HANDOFF.md: this report.
Pre-existing .agents/AGENTS.md modifications, untracked artifacts and nested repository were left untouched. No visible copy/design or runtime script changes.

## Verification
Started preview with:
```powershell
$env:PORT = '49174'
npm run dev
```
Fresh output:
```text
> gothos-labs@1.0.0 dev
> node server.mjs
Gothos Labs preview: http://127.0.0.1:49174
```
The sandbox denied socket access on the first preview attempt. Supported escalation was used for loopback preview and checks; no guard was changed. Initial checks also encountered a proxy/connection failure and a PowerShell reserved-variable error; corrected the check to use -NoProxy, a 10-second timeout and $homepageHtml. Final full run below exited 0. Both previews started by this task were stopped via Ctrl+C in their tool sessions; unrelated servers were not stopped.

Exact final command (PowerShell):
```powershell
$ErrorActionPreference = 'Stop'
node --check server.mjs
if ($LASTEXITCODE -ne 0) { throw 'Syntax check failed' }
'PASS node --check server.mjs (exit 0; no output)'
foreach ($route in @('/','/elogbook.html','/arogya.html','/robots.txt','/sitemap.xml')) {
 $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -NoProxy -Uri ("http://127.0.0.1:49174" + $route)
 if ($r.StatusCode -ne 200) { throw "HTTP failure $route" }
 $expected = if ($route -eq '/robots.txt') {'text/plain'} elseif ($route -eq '/sitemap.xml') {'application/xml'} else {'text/html'}
 if ($r.Headers['Content-Type'] -notlike "$expected*") { throw "MIME failure $route" }
 "$route : $($r.StatusCode) $($r.Headers['Content-Type'])"
}
[xml]$sitemap = Get-Content sitemap.xml -Raw
$urls = @($sitemap.urlset.url | ForEach-Object { $_.loc })
$expectedUrls = @('https://www.gothoslabs.com/','https://www.gothoslabs.com/elogbook.html','https://www.gothoslabs.com/arogya.html')
if ($sitemap.DocumentElement.NamespaceURI -ne 'http://www.sitemaps.org/schemas/sitemap/0.9' -or $urls.Count -ne 3 -or (Compare-Object $urls $expectedUrls)) { throw 'Sitemap mismatch' }
$homepageHtml = Get-Content index.html -Raw
$orgMatches = [regex]::Matches($homepageHtml, '<script type="application/ld\+json">([\s\S]*?)</script>')
if ($orgMatches.Count -ne 1) { throw 'JSON-LD count' }
$org = $orgMatches[0].Groups[1].Value | ConvertFrom-Json
if (Compare-Object @($org.PSObject.Properties.Name) @('@context','@type','name','url','logo')) { throw 'Unexpected organization properties' }
$logo = 'https://www.gothoslabs.com/assets/logo/gothos-logo.png'
if ($org.'@context' -ne 'https://schema.org' -or $org.'@type' -ne 'Organization' -or $org.name -ne 'Gothos Labs' -or $org.url -ne $expectedUrls[0] -or $org.logo -ne $logo) { throw 'Organization mismatch' }
'PASS sitemap XML: exactly three expected canonical URLs; Organization JSON: five expected properties and values'
$pages = @('index.html','elogbook.html','arogya.html')
for ($i=0; $i -lt $pages.Count; $i++) {
 $html = Get-Content $pages[$i] -Raw
 $canon = [regex]::Matches($html, '<link rel="canonical" href="([^"]+)">')
 if ($canon.Count -ne 1 -or $canon[0].Groups[1].Value -ne $expectedUrls[$i]) { throw 'Canonical mismatch' }
 $title = [regex]::Match($html,'<title>(.*?)</title>').Groups[1].Value
 $description = [regex]::Match($html,'<meta name="description" content="([^"]*)">').Groups[1].Value
 $values = @{title=$title; description=$description; url=$expectedUrls[$i]; type='website'; image=$logo}
 foreach ($field in $values.Keys) {
  $m = [regex]::Matches($html, ('<meta property="og:'+$field+'" content="([^"]*)">'))
  if ($m.Count -ne 1 -or $m[0].Groups[1].Value -cne $values[$field]) { throw "OG mismatch $field" }
 }
 $original = (git show ("HEAD:" + $pages[$i])) -join "`n"
 $beforeBody = [regex]::Match($original,'(?s)</head>(.*)$').Groups[1].Value.Replace("`r",'').TrimEnd()
 $afterBody = [regex]::Match($html,'(?s)</head>(.*)$').Groups[1].Value.Replace("`r",'').TrimEnd()
 if ($beforeBody -cne $afterBody) { throw "Body modified $($pages[$i])" }
 "PASS $($pages[$i]): canonical, five OG fields, unchanged body"
}
$robots = Get-Content robots.txt -Raw
if ($robots -notmatch '(?m)^User-agent: \*\r?$' -or $robots -notmatch '(?m)^Allow: /\r?$' -or $robots -notmatch '(?m)^Sitemap: https://www\.gothoslabs\.com/sitemap\.xml\r?$') { throw 'Robots mismatch' }
if (-not (Test-Path assets/logo/gothos-logo.png)) { throw 'Logo missing' }
'PASS robots permission/sitemap agreement and existing logo'
$originalServer = ((git show HEAD:server.mjs) -join "`n").TrimEnd()
$currentServer = (Get-Content server.mjs -Raw).Replace("`r",'').TrimEnd()
$expectedServer = $originalServer.Replace("const types = { ", "const types = { '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', ")
if ($currentServer -cne $expectedServer) { throw 'Unexpected server changes' }
'PASS server: only two MIME mappings changed'
$originalPlan = ((git show HEAD:docs/MASTER_PLAN.md) -join "`n").TrimEnd()
if (-not (Get-Content docs/MASTER_PLAN.md -Raw).Replace("`r",'').StartsWith($originalPlan)) { throw 'Roadmap not append-only' }
'PASS roadmap: original content retained as prefix'
$refs = [System.Collections.Generic.HashSet[string]]::new()
foreach ($p in $pages) {
 $html = Get-Content $p -Raw
 foreach ($m in [regex]::Matches($html,'(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"')) {
  $v=$m.Groups[1].Value
  if ($v -notmatch '^[a-z]+:' -and $v -ne '/') { [void]$refs.Add($v.TrimStart('/')) }
 }
}
foreach ($p in @(Get-ChildItem -File *.css,*.js)) {
 foreach ($m in [regex]::Matches((Get-Content $p.FullName -Raw), '(?:assets|fonts)/[a-zA-Z0-9_./-]+')) { [void]$refs.Add($m.Value) }
}
foreach ($v in @('robots.txt','sitemap.xml')) { [void]$refs.Add($v) }
foreach ($v in $refs) { if (-not (Test-Path -LiteralPath $v)) { throw "Missing reference $v" } }
$excluded = @($refs | git -c core.excludesFile=.vercelignore check-ignore --no-index --stdin)
if ($LASTEXITCODE -gt 1 -or $excluded.Count -gt 0) { throw "Public references excluded: $excluded" }
"PASS $($refs.Count) public page/runtime/discovery references exist and none are excluded by .vercelignore"
git diff --check -- index.html elogbook.html arogya.html server.mjs docs/MASTER_PLAN.md
if ($LASTEXITCODE -ne 0) { throw 'Scoped whitespace check failed' }
'PASS scoped git diff --check (exit 0)'

```

Fresh final output:
```text
PASS node --check server.mjs (exit 0; no output)
/ : 200 text/html; charset=utf-8
/elogbook.html : 200 text/html; charset=utf-8
/arogya.html : 200 text/html; charset=utf-8
/robots.txt : 200 text/plain; charset=utf-8
/sitemap.xml : 200 application/xml; charset=utf-8
PASS sitemap XML: exactly three expected canonical URLs; Organization JSON: five expected properties and values
PASS index.html: canonical, five OG fields, unchanged body
PASS elogbook.html: canonical, five OG fields, unchanged body
PASS arogya.html: canonical, five OG fields, unchanged body
PASS robots permission/sitemap agreement and existing logo
PASS server: only two MIME mappings changed
PASS roadmap: original content retained as prefix
PASS 26 public page/runtime/discovery references exist and none are excluded by .vercelignore
warning: in the working copy of 'arogya.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/MASTER_PLAN.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'elogbook.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'index.html', LF will be replaced by CRLF the next time Git touches it
PASS scoped git diff --check (exit 0)

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

## 2026-11-03 — Owl timing and ambient leaves

User authorized fixes 1 and 2 in this chat and requested local-start instructions only; no server was started, no dependencies installed, and no deployment performed.

- owl.js: stage take-off/landing against section transition progress, hold flight direction from perch endpoints, turn front/quarter/side/front instead of treating upward velocity as rear-facing, use asymmetric wingbeat holds, and shorten flight pose blending from 100ms to 35ms. Pausing settles active sprite fades; completed fades are released.
- site.js / styles.css: create five decorative, aria-hidden leaves per landing section with staggered 15–21 second breeze cycles, small drift and rotation, and low opacity. Existing pause/reduced-motion and hidden-tab controls apply. Static background leaves remain when JavaScript is disabled.
- Existing sprite art reused; no additional image frames generated. AI and enquiry behavior unchanged.

Verification: node --check owl.js; node --check site.js; git diff --check — passed. A temporary Node VM check exercised the actual pose function for nine flights (left/right/vertical at 30/60/120 fps), validated pose names against the shipped atlas, checked take-off/landing and reduced-motion rest, and verified that pausing during an unchanged sprite pose cancels its active fade — passed.

Limitations: no browser visual review or local HTTP server run, respecting the request not to start local hosting. Visual smoothness, leaf appearance, and mobile layout still need a browser check after the user starts the site. Node v22.16.0 is already installed on this machine; npm.cmd run dev starts the dependency-free preview at http://127.0.0.1:4177/.

## 2026-11-03 — Stronger leaf breeze

User requested visibly stronger background-leaf movement. styles.css now uses separate horizontal and vertical cycles offset by a quarter period, 48–68px horizontal travel, 40–64px vertical travel, stronger rotation, 9–14 second loops, and .22 opacity. Mobile leaf size is reduced slightly; motion controls remain shared.

Verified actual stylesheet in headless Chrome with an isolated leaf fixture (no HTTP server): five leaves displaced 7.9–19.3px over one second at 1440px width, and 8.8–18.6px at 390px width. Both animations present; pause and hidden-tab styles paused them, and reduced motion removed animations. git diff --check passed. Full-site visual review remains pending; no local hosting or deployment started.

## 2026-11-03 — Hoot AI implementation (local, unconfigured)

User requested task 3 implementation with the model and API key in one editable local file, plus an editable knowledge document. Added `hoot.config.local.json` with empty `apiKey` and `model: gpt-4o-mini`; `.gitignore` and `.vercelignore` exclude the config. The config file was not staged or committed. On Vercel, one private `HOOT_CONFIG_JSON` environment variable carries the same JSON object. `HOOT_KNOWLEDGE.md` contains approved product and contact facts and can be edited directly.

`hoot-api.mjs` validates short conversations, screens medical requests, reads the knowledge document, calls the Responses API with `store: false`, limits output and per-instance requests, and returns clear errors. `server.mjs` serves POST `/api/chat` locally and blocks the config and internal files from static GET; `api/chat.mjs` serves the same logic in Vercel, with `vercel.json` including the knowledge file. `chat.js` now sends company questions to the endpoint instead of keyword replies; its demo-brief collection remains honest and local. The three Hoot dialogs disclose external AI processing. No live key, provider call, email, server startup, or deployment occurred.

Checks passed: Node syntax checks for chat.js, hoot-api.mjs, api/chat.mjs and server.mjs; `git diff --check`; `git check-ignore` confirms the local config is excluded. A mock provider test covered config, validation, knowledge in the prompt, model/key placement in the private request, medical refusal, provider failure, and `store: false`. A headless browser test loaded the product page with intercepted files and a fake `/api/chat` response, then confirmed Hoot sent the question and displayed the answer with no script errors. Live OpenAI quality, billing, and Vercel deployment remain unverified.

## 2026-11-03 — Enquiry email delivery implementation

User authorized implementing task 4 and asked for detailed account/domain steps. Added `enquiry-api.mjs`, local `POST /api/enquiry` in `server.mjs`, and Vercel `api/enquiry.mjs`, with the recipient fixed to `therealgautam2004@gmail.com`. The Resend key and verified-domain sender are read from Git-ignored `enquiry.config.local.json` locally or private `ENQUIRY_CONFIG_JSON` on Vercel. `.vercelignore` excludes the local config and setup guide. The endpoint validates fields, sends plain text with Reply-To, uses a client submission ID as Resend's idempotency key, applies a hidden-field spam check and per-instance rate limit, and returns errors without provider details. `site.js` submits the Talk to us form, keeps content on failure and reports acceptance only after provider confirmation. `chat.js` asks for explicit yes before sending a demo enquiry and reports acceptance after the endpoint confirms it. `HOOT_KNOWLEDGE.md` and README were updated to match. `EMAIL_SETUP.md` gives the owner's Resend, domain DNS, key, Vercel, local test, and inbox verification steps.

Validation: `node --check` for enquiry-api.mjs, api/enquiry.mjs, server.mjs, site.js, chat.js passed; `git diff --check` passed; `git check-ignore enquiry.config.local.json` confirms the key file is ignored. Mock-provider tests covered invalid fields, missing config, fixed destination, Reply-To, idempotency header, provider failure, and honeypot. A headless browser test with intercepted site assets and mocked `/api/enquiry` checked form failure/retry/success and Hoot demo confirmation; no browser errors. The browser test used a synthetic secure origin for crypto.randomUUID. No local HTTP server, real Resend call, real email, deployment, or DNS change was performed. Live delivery requires the owner's private account setup and a real inbox test.

## 2026-11-03 — Hoot local error diagnosis

The user reported Hoot's generic failure on a local preview after adding an OpenAI key. Confirmed without revealing the key that `hoot.config.local.json` is valid JSON, contains an `apiKey`, and selects `gpt-4o-mini`. This workspace's direct provider call failed with `ENOTFOUND` before any HTTP response; that is the execution environment's network restriction and does not establish the user's local network condition. The local preview process could not be inspected from this workspace. An old preview process predating the `/api/chat` route is a plausible cause and needs a restart.

Updated `hoot-api.mjs` to map provider key, quota, model, and network failures to safe specific messages. Updated `chat.js` to display endpoint errors and to identify 404/405 from an old preview process as a restart case. Syntax and diff checks passed. Mocked provider tests covered the four failure classes. A headless browser test with a synthetic 405 `/api/chat` response confirmed Hoot now says the local preview needs restarting. No real OpenAI response, deployment, or server start occurred.
