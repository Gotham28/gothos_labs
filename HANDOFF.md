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

Exit code: 0
```
Verification commands changed no source files. npm started only the preview; inline checks read HTML/XML/JSON, original git blobs and public asset paths. The implementation changes are listed above. Pre-execution full git diff --check reported a new blank line at EOF in the planning task file; normalized at execution state update. Line-ending warnings do not indicate content failures.

## Scope and limitations
- Only local checks performed. No proof of live Google indexing, ranking, DNS propagation, deployment or external sharing previews.
- robots.txt is not access control; existing Vercel exclusions remain unchanged.
- Canonical signals and indexing requests do not guarantee selection or inclusion.
- No steps skipped or implementation scope expanded. Runtime asset check included 26 HTML/CSS/JS-discovered references plus discovery files.
- Manual follow-up after accepted review and separately authorized publication: perform docs/SEO.md steps using the developer's Google/Spaceship accounts.

## Suggested review tier
Standard / medium — unratcheted direct-executor assessment; no independent Antigravity tier exists. No high-risk deployment or security behavior changes; client effort setting unknown. Four independent review lenses required.

## Proposed STATUS.md wording — not applied
### Catch-up — 2026-11-05 (SEO basics)
Added canonical URLs and Open Graph metadata to the homepage and both product pages, homepage Organization structured data, robots.txt and a three-page sitemap. Added local preview text/XML MIME mappings and developer Search Console guidance. Local checks returned HTTP 200 with expected content types for all five routes, parsed the metadata, checked unchanged page bodies and confirmed referenced public assets remain included. Publication and Search Console setup are pending.
Notes / Open Questions: live indexing, ranking and external sharing previews have not been checked. No ranking guarantee.
