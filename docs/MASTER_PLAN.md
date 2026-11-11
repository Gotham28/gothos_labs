# Master Plan

## 1. Existing website baseline
- Preserve the buildless static site and dependency-free Node server.
- Preserve ELogBook six-screen illustrative preview, keyboard behavior, dialogs, reduced motion, motion pause, local fonts and local enquiry downloads.
- Product facts remain governed by PRODUCT.md. No invented metrics, customers, contacts or product functionality.

## 2. Import and governance bootstrap
- Import existing upstream history and content unchanged into D:\Company Website.
- Establish .agents/AGENTS.md, .agents/CURRENT_TASK.md, docs/STATUS.md and this document.
- Record fresh evidence in HANDOFF.md; independent review and developer acceptance precede close-out.

## 3. Pending owl redesign — separately scoped future work
- Supplied main brief and Addendum A are referenced by CURRENT_TASK.md.
- Green-and-white site, flat SVG owl flight and footer logo, Hoot company guide, light ELogBook preview and honest local enquiries.
- Section order: hero, 01 company/ELogBook, 02 separate Arogya Health Assistant, 03 enquiry, footer.
- Inspect hospital-ai-platform read-only before claiming assistant features; never read credentials, .env, seed data or PROJECT_NOTES.md login details; never log in or run its backend.
- Verify real demo URL, embedding policy and microphone delegation; keep unavailable demos disabled and make no unverified capability claims.
- Reference video is never committed. Preserve supplied logo/video sources and licensed local-font requirements.
- No redesign implementation or remote publication is authorized by bootstrap approval.

## 9. Unplanned / Ad-hoc Work
- 2026-11-02 — Owl scroll flight rework matching the reference video: `owl.js` flight path, owl size per stop, wing pose, hover and landing, phone path; removal of `.owl-reference-tools/`. Layout and copy unchanged; chat flight out of scope.
- 2026-11-02 — Landing page, product sections and real logo: company landing page (name and heading only), 01 ELogBook and 02 AROGYA sections using developer-supplied copy, the ELogBook interface preview moved into 01, the real logo mark (`assets/logo/gothos-logo.png`) in the header, favicon and AROGYA card, and owl stops re-fitted to the new layout. Ships with the owl flight entry above; owl turning follows separately.
- 2026-11-02 — Owl sprite animation from multi-angle art: the single front-facing owl is replaced by a 16-pose sprite set (four yaw angles by three wing states, plus perched, blink, perched three-quarter and take-off crouch) from a developer-supplied 4x4 sheet. New dev-only `tools/build-owl-atlas.py` builds `assets/owl/owl-atlas.webp` and `owl-atlas.json`; `owl.js` becomes the sprite renderer (yaw from travel, wingbeat, blink, crouch, perch turn); `chat.js` avatar and fly-to-chat code switch to the sprite. Page layout and copy unchanged. Ships with the entries above.
- 2026-11-02 — Full-screen section landing and product pages (Direction A, calm and airy). The landing page becomes six full-screen sections (hero, What we do, ELogBook, AROGYA, Talk to the owl, Contact) changed one at a time by a new `section-scroll.js` transition engine, with the owl flying between per-section perches during each transition. ELogBook and AROGYA detail, plus the interactive six-screen preview, move to the new `elogbook.html` and `arogya.html` (shared `product-page.css`), where a small perched owl replaces the floating chat button. New illustrative snapshots in `assets/screens/`. Chat conversation, routing and medical-refusal code are unchanged. Ships with the entries above; one combined High-assurance review and one close-out follow.
- 2026-11-03 — Vercel publish hygiene: a root `.vercelignore` keeps internal project files (governance, docs, dev tools, reference material, local server) off the live site at gothoslabs.com. Site files unchanged.

### 2026-11-05 — SEO basics
Not in the original plan. Add discovery files and page metadata to identify the canonical public pages, plus manual Search Console guidance.
Scope: index.html, elogbook.html, arogya.html, robots.txt, sitemap.xml, local server MIME mappings and docs/SEO.md. Related: CURRENT_TASK.md dated 2026-11-05.

### 2026-11-10 — Website enquiry delivery
Not in the original plan. Connect the contact form and visitor-confirmed Hoot demo requests to a shared Resend endpoint delivering to the developer-confirmed inbox. Preserve local-only brief downloads as a distinct helper; sending requires secure runtime configuration and actual inbox verification.
Scope: index.html, site.js, chat.js, api/enquiry.mjs, server.mjs, tests/enquiry.test.mjs, .vercelignore, README.md and PRODUCT.md. Related: CURRENT_TASK.md dated 2026-11-10. No deployment or cross-repository changes.

### 2026-11-10 — "Perfected by AI" repositioning, Our products panel and Mochi
Not in the original plan. The home page is repositioned around "Software, perfected by AI": a new Our products section after What we do, section names as the large headings, the owl guide renamed Mochi in everything visitors see, and a deck that takes further product sections without code changes.
Scope: index.html, elogbook.html, arogya.html, styles.css, product-page.css, section-scroll.js, chat.js and hoot-api.mjs (name strings only), HOOT_KNOWLEDGE.md, README.md, PRODUCT.md, DESIGN.md, REFERENCE.md and .agents/runs scripts. Related: CURRENT_TASK.md dated 2026-11-10. Animation robustness follows as a separate task; no deployment.

### 2026-11-10 — Enquiry email via Resend, configured like eLogbook
Not in the original plan. The deployed contact form already posts to `/api/enquiry`, but no Resend key or sender is set. The endpoint switches to eLogbook's `RESEND_API_KEY` / `EMAIL_FROM` settings, sends to `gothoslabs@gmail.com`, and gets real tests, setup notes and a verified `gothoslabs.com` sending subdomain.
Scope: enquiry-api.mjs, tests/enquiry.test.mjs, package.json (test script), EMAIL_SETUP.md, README.md enquiry lines, index.html noscript line, .agents/runs/v5-pages.mjs item 13. Related: CURRENT_TASK.md dated 2026-11-10. DNS, Vercel settings, merge and deployment are developer steps.

### 2026-11-10 — Mochi natural, cute and chat animations
Not in the original plan. Adds 20 character sequences using five developer-approved source sheets: natural habits, playful moments and reactions driven by chat state. A shared controller schedules quiet intervals and cancels gestures for flight, transfers, motion settings and document visibility; original 16-pose flight geometry is retained.
Scope: owl.js, chat.js animation hooks, owl-chat.css, owl atlas/source assets, tools/build-owl-atlas.py, owl asset version tokens in the three pages, .agents/runs/v7-owl-idle.mjs and local artwork/animation evidence. Related: CURRENT_TASK.md dated 2026-11-10. Local implementation; independent review and acceptance precede close-out. No publication.

### 2026-11-11 — Six-motion Mochi refinement
The revised mascot waves on arrival, tilts its head in What we do, bows in Ask Mochi, breathes at rest, nods on direct activation, and flies between perches and chat. The two section gestures replay on entry after separate 12-second cooldowns. Direct activation uses the same button for mouse, touch and keyboard.

The animation uses the approved perched artwork with continuously transformed head and wing geometry. The original 16 atlas frames retain their registration, and one approved wave frame supplies the raised wing. Motion settings and an interrupted gesture allow chat to open without waiting for the motion to finish. Scope and local verification are recorded in `.agents/CURRENT_TASK.md` and `HANDOFF.md`.

### 2026-11-11 — Public website privacy and DPDP preparation

Adds a local Privacy Policy draft for Gothos Lab Private Limited, short notices for contact enquiries and Mochi, and an operator review draft for privacy requests and data handling. The scope covers the public website and its enquiry and AI flows. Policy approval, production configuration verification and release are tracked in `.agents/CURRENT_TASK.md`.
