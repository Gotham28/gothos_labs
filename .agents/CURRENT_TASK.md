# Current Task

## Feature
- Prepare SEO discovery metadata for all three public pages, with developer Search Console guidance; preserve visible copy and design.

## Plan reference
- docs/MASTER_PLAN.md §9 — Unplanned / Ad-hoc Work (new entry required).
- STATUS.md last updated 2026-11-03: hosting hygiene accepted; current task IDLE. SEO is additive follow-up, not a reopening of owl work.
- Scoped 2026-11-05; developer confirmed all three pages, Search Console guidance and local-only verification.

## MASTER_PLAN.md update
- [x] Append a dated SEO basics entry to §9; append only, no renumbering or edits to existing entries. This roadmap append has no separate wording approval checkpoint.

## Files/areas in scope
- index.html, elogbook.html, arogya.html — head-only canonical and Open Graph metadata; factual Organization JSON-LD on homepage.
- robots.txt — permit public crawling and reference production sitemap; not an access-control mechanism.
- sitemap.xml — exactly the three canonical public URLs.
- server.mjs — only add .txt and .xml response MIME types for local preview.
- docs/SEO.md — developer Search Console setup, indexing and post-deployment checks.
- docs/MASTER_PLAN.md — append-only §9 entry.
- HANDOFF.md — fresh verification evidence and proposed STATUS.md wording.
- .agents/CURRENT_TASK.md — portable task state.

## Explicitly out of scope
- Deployment, push, PR, merge, DNS changes and Search Console account actions.
- Ranking guarantees, backlinks, analytics, new dependencies, redirects and Vercel configuration.
- Visible copy changes, new marketing claims, visual redesign and product behavior.
- Editing docs/STATUS.md before wording approval.

## Do NOT touch
- Pre-existing governance edits, untracked artifacts, nested Gothos-labs repository and unrelated changes.
- CSS, page bodies, owl/chat/scroll scripts, assets and fonts.
- Credentials, account tokens, patient data and other repositories.

## Execution route
- B — Agent loop.
- Why: metadata consistency and local HTTP checks require judgment; route C test fails.
- Close-out: route B after accepted review and explicit authorization; no publication authorized.

## Manual (developer does)
- [ ] After review and separately authorized publication, add gothoslabs.com as a Search Console domain property and verify Google's exact TXT value through Spaceship.
- [ ] Once deployed, inspect the homepage and product URLs, submit sitemap.xml and request indexing where eligible; monitor indexing and brand queries separately.
- [x] Approve review outcome and proposed STATUS.md wording before close-out.

## Agent (does on its own, once scope is confirmed)
- [x] Record baseline state and preserve unrelated changes; follow dispatch-task in a fresh execution chat.
- [x] Add self-referencing canonical URLs using https://www.gothoslabs.com/, /elogbook.html and /arogya.html.
- [x] Add Open Graph title, description, URL, website type and existing logo image using absolute production URLs; reuse existing page titles/descriptions without altering claims.
- [x] Add valid Organization JSON-LD with only verified existing name, production URL and logo; no invented sameAs, address, contact or ratings.
- [x] Add UTF-8 robots.txt with public crawl permission and absolute sitemap URL; sitemap contains exactly the three public canonical URLs, without invented lastmod dates.
- [x] Add only .txt text/plain and .xml application/xml MIME mappings to local server; preserve npm run dev and loopback binding.
- [x] Write docs/SEO.md with domain verification, sitemap submission, URL Inspection, limitations and manual production checks; distinguish crawl/index/ranking and explain canonicals are hints.
- [x] Append the dated roadmap entry, verify locally and write HANDOFF.md with exact commands, fresh pasted output and touched files; propose STATUS wording without applying it.

## Blocked on developer input
- None for local execution. Account actions and publication remain manual and outside execution scope.

## Order
### Steps inside this task
1. Confirm APPROVED status, inspect baseline and preserve unrelated work.
2. Implement metadata, discovery files and minimal local MIME additions.
3. Write developer guidance and append roadmap entry.
4. Verify locally, record evidence and return for independent four-lens review; no PR.
### Where this task sits
- Before this: hosting hygiene closed 2026-11-03; no implementation prerequisite outstanding.
- After this: independent review, developer acceptance, separately authorized close-out/publication and manual Search Console work.

## Verification required before this is considered done
- [x] node --check server.mjs — exit 0, paste fresh output/exit code.
- [x] Start npm run dev on an available loopback port without disturbing existing servers; use PowerShell Invoke-WebRequest against /, /elogbook.html, /arogya.html, /robots.txt and /sitemap.xml. Paste exact commands and observed 200 statuses and MIME types; stop only the server started for this task.
- [x] Use a documented inline PowerShell XML/JSON parsing command to parse sitemap and homepage JSON-LD; assert exactly three canonical sitemap URLs, Organization name/URL/logo and no unapproved properties. Paste full command and fresh result.
- [x] Use a documented inline metadata check over all three HTML files to assert exactly one canonical and required Open Graph fields per page, matching canonical/og:url and absolute existing image URL; check sitemap/robots agreement and referenced local logo existence. Paste exact command and output.
- [x] git diff --check — no new whitespace errors; report any baseline failures separately.
- [x] Evidence that scoped page changes affect heads only, server changes only MIME mappings, and no referenced runtime asset is excluded by existing .vercelignore; reviewers inspect code independently.
- [x] HANDOFF lists files touched, known limits, manual Search Console steps and proposed STATUS wording; local checks do not claim production indexing or ranking.

## Flags (AGENTS.md rule triggers)
- §5.4 / §9 — halt before deployment, DNS, push, PR, merges or shared-state changes; none authorized here.
- §5.5 — no new clinical/legal/security claims; reuse approved metadata wording only.
- §5.9 — local loopback verification only; preserve unrelated servers.
- §5.10 — fresh exact verification evidence required; no ranking/indexing claims from local checks.
- §12.5 — halt on denied permissions, scope expansion or unexpected state.
- SEO is unplanned work; append-only MASTER_PLAN §9 update is in the Agent bucket and has no separate wording approval gate.

## Suggested review tier (set at scoping time)
- Standard / medium — functional metadata and local MIME changes; no deployment/security behavior changes. Four independent lenses required. Client effort setting not verified.

## Executor
- Direct.
- Why: small surgical changes need in-loop verification; code does not outweigh the spec.
- Antigravity model: n/a.
- Execution session: fresh agent chat using current suitable Codex model.

## Approval
- Status: APPROVED 2026-11-05 — developer: "pull and proceed". Planning session; execute in a fresh agent chat using the Direct executor. git pull --ff-only on vercel-publish completed: Already up to date. No publication authorized.

## Execution state
- 2026-11-05: developer explicitly instructed: do it here; separate-chat requirement overridden for this task.
- Agent implementation and local verification complete; exact commands and fresh successful output in HANDOFF.md.
- Four independent review lenses completed: scope, rules, evidence and blast radius. Bookkeeping finding corrected and independently confirmed resolved. Developer accepted review, STATUS wording and local commit close-out on 2026-11-05. No publication authorized.
