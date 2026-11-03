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
