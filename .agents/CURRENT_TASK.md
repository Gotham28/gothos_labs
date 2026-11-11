# Current Task

## Feature
- Prepare the public Gothos Labs website for India’s Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025.
- Planning date: 2026-11-11. Operator name supplied by the developer: Gothos Lab Private Limited. Confirmed monitored public privacy contact: gothoslabs@gmail.com.
- Deliver a standalone Privacy Policy, notices at collection, and a workable privacy requests and grievance process for this website.

## Plan reference
- docs/MASTER_PLAN.md §9, “Website enquiry delivery” and “Enquiry email via Resend, configured like eLogbook,” provide context for the existing data flows. The privacy work is a new §9 item.
- docs/STATUS.md header says Last updated: 2026-11-05. The relevant catch-up is dated 2026-11-10 and leaves live chat verification open. Preserve that history.
- The developer accepted the Mochi experience and requested the privacy task next. The previous active task is preserved at `.agents/runs/artifacts/mochi-animations/CURRENT_TASK.accepted-2026-11-11.md`. Preserve existing Mochi source changes, review records and handoff.

## MASTER_PLAN.md update
- [x] Appended the dated §9 entry describing the local public website privacy draft and scope.

## Confirmed scope and factual baseline
- Public website only, including the ELogBook and AROGYA marketing pages, the contact form, Mochi chat and the confirmed demo enquiry route.
- The working enquiry code uses Resend and the developer-confirmed recipient gothoslabs@gmail.com for website and confirmed Mochi demo enquiries. Verify the deployed version and actual inbox delivery separately.
- General Mochi questions send recent conversation context through `/api/chat` to the OpenAI Responses API. The request sets `store: false`. Verify production provider configuration, retention and applicable agreements before making retention, hosting or transfer promises.
- The site source uses session storage for the motion preference. Both APIs use request address information for abuse controls. Verify whether production hosting adds logging, analytics, cookies or other services before making claims about the public deployment.
- The current AROGYA marketing preview is illustrative. Its external demo URL is blank in the working site configuration. Confirm production configuration before describing any third-party embed.
- Primary sources: [DPDP Act](https://www.indiacode.nic.in/indiacode/handle/123456789/22037?view_type=browse), [DPDP Rules and corrigendum index](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025%3B), [commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf). Check current notifications and distinguish the obligations in force from phased obligations. Most website-facing provisions are scheduled for May 2027.
- Draft notice summary for review: “Gothos Lab Private Limited uses the details you send with an enquiry to review and respond to it. When you ask Mochi a question, your message and recent conversation context are sent to OpenAI to generate a reply. To make a privacy request, email gothoslabs@gmail.com.” Review complete wording and actual production flows before public use.

## Files/areas in scope
- `privacy.html` and, if required, a small dedicated privacy stylesheet. Use the existing public site design and accessible plain-language structure.
- `index.html`, `elogbook.html`, `arogya.html` and `sitemap.xml` for policy navigation, collection notices and discovery. Preserve existing product claims and animation changes.
- `site.js` and `chat.js` for collection notices and any approved consent, withdrawal or enquiry confirmation behavior. Preserve animation and existing routing behavior except for explicitly approved privacy requirements.
- `api/chat.mjs`, `api/enquiry.mjs`, `hoot-api.mjs`, `enquiry-api.mjs` and `server.mjs` for inspection and mocked verification. Scope any necessary API-contract, recipient-routing or storage change before editing it.
- `docs/WEBSITE_PRIVACY_OPERATIONS.md` for the site data map and request, retention, deletion, provider and incident procedures. Keep private operational details out of publicly served content.
- Focused local privacy fixtures, existing enquiry tests, `HANDOFF.md`, this task file and the scoped §9 append.
- Re-scoped 2026-11-11 at review: the enquiry recipient change to gothoslabs@gmail.com in `enquiry-api.mjs` (one line), and the matching recipient references in `README.md` and `EMAIL_SETUP.md`, are part of this task. The developer accepted the reviewer's recommendation.

## Explicitly out of scope
- Live ELogBook, AROGYA, hospital, WhatsApp and resident deployments. They require separate scopes.
- Production rollout, mailbox or provider account changes, DNS, analytics installation, unrelated form or chatbot redesign, and certification or approval claims.
- Product health or privacy claims beyond the verified public website data flows.

## Do NOT touch
- `.agents/AGENTS.md`, root AGENTS.md, guards, credentials, production data and other repositories.
- Existing Mochi animation source and art, product claims, prior review records and unrelated staged or unstaged changes.
- `docs/STATUS.md` before accepted close-out.

## Execution route
- B — Agent loop, with Direct Codex implementation. The work requires legal and data-flow judgment, local verification and independent review.
- Close-out is separate and requires developer acceptance and project authorization.

## Manual (developer does)
- [x] Confirm public website scope, operator name and monitored privacy inbox.
- [x] Accept the Mochi experience and authorize switching the active task.
- [ ] Review the proposed policy and point-of-collection wording before it is represented as approved.
- [x] Intended enquiry destination confirmed 2026-11-11: gothoslabs@gmail.com. Deployed delivery is still a separate release check.
- [ ] Confirm operational owners, applicable provider settings and actual data retention and deletion practices. Use redacted confirmations. Keep credentials and real visitor or patient information outside this task.
- [ ] Decide on public release after high-assurance review and the project’s close-out steps.

## Agent (does on its own, once scope is approved)
- [ ] Map actual data flows, categories, purposes, recipients, storage and third-party processing for the public website. Verify the confirmed privacy mailbox separately from enquiry delivery. Resolve differences between the working source, documentation and production evidence.
- [ ] Review the applicable DPDP notices, lawful grounds, withdrawal, rights, language access, grievance, child-data handling, provider safeguards, retention and breach duties against official sources. Bring material unresolved legal and operational decisions back for review.
- [ ] Draft the standalone policy and short notices for the contact form and Mochi. Describe the approved basis for each flow and implement affirmative consent and comparable withdrawal paths where applicable. Use existing verified practices for any claim.
- [ ] Draft the internal workflow for access, correction, erasure, nomination and grievance requests, including minimal identification, responsibility, response period, retention and deletion across providers, and incident escalation. Get the responsible operator to verify it is workable.
- [ ] Build the local website preview and verify navigation, notices and network behavior using synthetic data and mock providers.
- [ ] Record the evidence, unresolved items and draft status wording in the handoff. Append the scoped §9 entry. Hand off to independent high-assurance review before acceptance.

## Blocked on developer input
- [ ] Policy and notice wording. Decided at review on 2026-11-11: the contact, Mochi and demo notices stay visibly marked as draft until the developer approves their text. Nothing is pushed or deployed before that approval.
- [ ] Legacy enquiry suite. Decided at review on 2026-11-11: `tests/enquiry.test.mjs` is recorded as a known failure that predates this task. It imports `createEnquiryHandler`, which `api/enquiry.mjs` has never exported. It will be fixed in its own separately scoped task. Do not stage `tests/enquiry.test.mjs` at close-out.
- [ ] Policy wording and operational claims — waiting on verified production data handling, selected legal basis and language-access approach, approved retention and deletion practice, approved rights and grievance workflow, and final wording approval.
- [ ] Live enquiry delivery claims — waiting on verification that the production deployment uses the confirmed recipient gothoslabs@gmail.com and the mailbox actually receives the message.
- [ ] Public release — separately authorized after verification and review.
- [x] RESOLVED 2026-11-11: Executor relabelled to Sonnet direct at the developer's instruction; fix round 1 then completed. Was: guard hook blocks fix-round writes (fresh Claude Code execution session). `antigravity-guard.ps1` rejected edits to `index.html`, `elogbook.html`, `arogya.html`, `chat.js` and `privacy.html`. It only allows source writes when `## Executor` reads `Sonnet direct`, and this file says `Direct Codex`. Only fix-round step 1 (`docs/WEBSITE_PRIVACY_OPERATIONS.md`, hosting row and line-12 correction) is done. Steps 2–6 wait for the developer to either change the Executor label to a form the hook accepts or widen the hook's allow list. No edit was made around the hook.

## Order
1. Approve this scope and hand it to a fresh Direct Codex execution chat.
2. Inventory the website flows and check applicable requirements. Resolve production and ownership questions before publishing claims.
3. Present the concrete local notice and workflow for review. Integrate and verify approved behavior locally.
4. Complete four independent review lenses and stop for developer acceptance. Save evidence in HANDOFF.md.
- Prerequisite: nothing for the local audit and drafting. Any production-provider evidence that depends on account settings is an operator verification item.

## Verification required
- [ ] Record a data map with source locations for enquiry, chat, demo, hosting and session storage. Distinguish repo observations from verified live settings and list unresolved evidence explicitly.
- [ ] Confirm policy and notices use the approved exact operator and privacy address, identify purposes, describe how to exercise rights and request redressal, and make accurate processor and retention statements. Verify the approved language-access approach.
- [ ] Run `node --test tests/enquiry.test.mjs` and any scoped browser tests. With synthetic enquiries and mocked OpenAI and Resend, prove that collection notices are available before submission, the approved consent or acknowledgement flow works, demo confirmation still gates delivery, and no real messages are sent.
- [ ] Check the local Privacy Policy route and footer links from all three pages, keyboard use, narrow mobile layout and form/Mochi regressions. Verify data and consent state according to the approved flow. Record exact commands and outputs in HANDOFF.md.
- [ ] Review the deletion, grievance and incident workflows with the responsible operator. Record owner confirmation and unresolved compliance items without claiming third-party approval.

## Flags
- §5.1 and §5.6: protect credentials and avoid real visitor, patient or resident data and sensitive logs. Mock all live providers in tests.
- §5.3: API contract, storage or workflow changes require explicit scope. Verify first.
- §5.4 and §9: local preview only. Production deployment and irreversible steps require separate authorization.
- §5.5: privacy, security and legal statements require verified facts and developer wording approval.
- §5.7 and §5.8: one public website privacy task, with separate product and tenant boundaries.
- §5.10 and §10: concrete evidence and high-assurance independent review.

## Suggested review tier
- High assurance, high effort. Privacy notices, data flows and operating procedures trigger §10.

## Executor
- Sonnet direct, route B. Relabelled from "Direct Codex" on 2026-11-11 at the developer's instruction so the guard hook accepts direct-executor writes. Same executor type (direct); no change to scope or review tier.

## Approval
- Status: APPROVED, 2026-11-11. The developer approved the written public website privacy scope with “proceed”. The legal operator and monitored privacy inbox are confirmed. Policy wording approval remains a separate later checkpoint.

## Execution checkpoint
- 2026-11-11. The Privacy Policy draft, three footer links, contact and Mochi notices, and proposed operations workflow are ready for local review.
- Five focused mocked provider tests, ten browser assertions and 52 Mochi checks passed (re-run after fix round 1; see HANDOFF.md "Fix round 1 evidence"). The existing enquiry suite still fails to import its older handler export.
- Next: operator confirmation of enquiry routing, production processor and retention facts, the grievance workflow and notice wording. Independent high-assurance review remains due before acceptance.
- 2026-11-11. The developer confirmed gothoslabs@gmail.com as the destination for both public contact and confirmed Mochi demo enquiries.

## Review status
- 2026-11-11: four-lens high-assurance review (Claude Code, Opus coordinator and lenses). The verdict is accept with fixes: 7 Major, 10 Minor, no Critical. The full report is in `.agents/runs/artifacts/website-privacy/REVIEW.md`.
- The developer accepted the reviewer's recommendations on 2026-11-11 ("Yes, as recommended"):
  1. Recipient change: accepted into this task's scope. See the Files/areas in scope line about the 2026-11-11 re-scope.
  2. Notice wording: stays marked as draft until the developer approves it. See Blocked on developer input.
  3. Legacy `tests/enquiry.test.mjs`: recorded as a known failure that predates this task, to be fixed in a separate task.
  4. Close-out order: close out the accepted Mochi task first, then this privacy task. The privacy hunks in `chat.js` and the page heads depend on the uncommitted Mochi `owl.js`.
- Fix round 1 (all six items) completed 2026-11-11 by a Sonnet direct session; evidence is in HANDOFF.md "Fix round 1 evidence". Next: Order step 4, a high-assurance re-review, then developer acceptance.
- Fix round brief. Direct executor, fresh Sonnet session or Codex:
  1. Add a hosting (Vercel) row to the data map in `docs/WEBSITE_PRIVACY_OPERATIONS.md`. Correct line 12: the rate-limit maps live in `enquiry-api.mjs:6`, and `api/enquiry.mjs` only forwards the address.
  2. Mark the contact notice (`index.html:95`), the Mochi notices (`index.html:102`, `elogbook.html:70`, `arogya.html:47`) and the demo reply (`chat.js:157`) visibly as draft, consistent with `privacy.html:26`. Propose, but do not finalize, wording for `privacy.html:35` that names hosting-provider request logs as unverified.
  3. Restore "No booking is made until the team confirms it." to the pre-submit notice at `index.html:95`.
  4. Re-run `.agents/runs/v2-fit.mjs` at its viewports for the contact slide, and paste the output.
  5. Paste exact command output for `node --check`, `git diff --check` and the discovery check (no privacy entry in sitemap; noindex) into HANDOFF.md. Correct the stale lines at `HANDOFF.md:323` and `:302-304`, and in this file the Manual destination item and the "Four focused" checkpoint.
  6. Revise the draft status wording at `HANDOFF.md:325` to "checked locally with mocked providers". Name the recipient change, and list the open items: wording, hosting/provider/retention facts, operator review, language access, legacy suite.
  - Verify each finding against the codebase before acting on it. If one is wrong for this codebase, push back with technical reasoning rather than implementing it. Do not agree performatively. Fix it and show the code.
- Close-out hazards for close-task:
  - Reconcile the stale staged index from 2026-11-10 (`.agents/AGENTS.md`, the old `.agents/CURRENT_TASK.md` blob, `PRODUCT.md`, `docs/MASTER_PLAN.md`) before staging.
  - Stage the files explicitly, never `tests/` wholesale.
  - `.vercelignore` does not exclude `tests/`. Raise this as a follow-up.
  - Remove the unrecorded `codex/website-privacy-review` worktree. Scope the one-line recipient update in enquiry-api.mjs, the corresponding recipient references in README.md and EMAIL_SETUP.md, and mocked assertions for both enquiry types. Verify production delivery separately after release authorization.
