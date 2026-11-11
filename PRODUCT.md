# Gothos Labs

<!-- impeccable:product-schema 1 -->

## Platform and stack

Independent static marketing site. Buildless HTML, CSS, classic JavaScript, inline SVG and local fonts; no runtime GhostFibers/WebGL, framework, bundler or npm dependency.

## Product purpose

Gothos Labs makes software perfected by AI (developer-approved positioning, 2026-11-10: "Software, perfected by AI."). It describes how Gothos builds software, not an AI feature of any product. The site presents two products under the names the developer supplied: ELogBook, a digital logbook for postgraduate medical training, and AROGYA, a multilingual (English and Malayalam) AI assistant for hospitals. “Arogya ELogBook” and “Arogya Health Assistant” are no longer used in page copy, but Mochi's scripted replies in `chat.js` still say them; that wording is out of scope here and open for a later task. Mochi (the owl, formerly shown as Hoot; internal identifiers keep the old name) is only this website's company guide.

## Approved site copy (developer-supplied 2026-11-02)

The landing page hero (company name and one heading), the ELogBook page (headline, one-liner, problem, role lines, six features, pilot line, privacy line) and the AROGYA page (headline, one-liner, four points, proof line) use the developer's wording exactly. The landing-page ELogBook and AROGYA sections use short intros condensed from that copy, with the product name as the large heading and the former headline as the tagline. Since 2026-11-10 the hero heading is "Software, perfected by AI." and the "What we do" section ("What we do", the tagline "We use AI to perfect the software you rely on." and its paragraph) and the "Our products" section (heading, tagline "Each one starts from a real workflow. More are on the way." and the two one-line entries) use wording the developer approved that day; this replaces the 2026-11-02 "We bring AI to your software" draft. The product-page headings "Bring ELogBook to your department" and "Bring AROGYA to your hospital" are approved. The Ask Mochi section carries only the approved heading, line and button; it has no further Mochi copy. Developer decisions recorded with it: WhatsApp, booking confirmations and WhatsApp reminders are live; the Kerala hospital has agreed to the line “In live use at a hospital in Kerala.”, and that hospital is never named; the data-separation statement (“a hospital's data never appears in another hospital's answers”) is the developer's wording and must not be strengthened or extended. The earlier code-check caution that WhatsApp is not advertised is superseded by these decisions for the site copy; the evidence notes below are historical. The section disclaimer is unchanged.

## Product Evidence: Arogya ELogBook

Historical copy/interface evidence was checked against the local application's Dashboard.tsx, AppLayout.tsx, LoginProductPreview.tsx and index.css. These confirm dashboard insights, department-defined completion targets, case/procedure logs, academic activities, postings/rotations, assessments, thesis/certification records, leave records/approvals, faculty evaluation queues and a printable logbook. Feature availability depends on department configuration. This redesign preserves that evidence; it did not re-inspect or modify Electronic-LogBook.

The six original screen definitions are retained: Dashboard, Postings & Rotations, Case Logs, Procedure Logs, Academic Activities and Assessments. The light interface is illustrative, not an authenticated app or screenshot. No invented training totals or real clinical records are shown.

## Product Evidence: Arogya Health Assistant

Read-only source revision: f0f7b013bd11ad7544d3bed8bc52cbe74c46dcd1 in https://github.com/Gotham28/hospital-ai-platform.

- English/Malayalam: frontend/src/themes/iris-hospitals/Chat.tsx:141 and backend/app/api/v1/endpoints/ai.py:425.
- Voice input with VAD: frontend/src/hooks/useHospitalChat.tsx:203; language/STT paths ai.py:1101.
- Hospital branding: frontend/src/themes/registry.ts:3 and ThemeLoader.tsx:7.
- Hospital-specific information: ai.py:296 (hospital-associated ingestion) and :686 (context).
- Doctor availability, hospital details and offered lab information: ai.py:187.
- Appointment requests: ai.py:937. The success path at :1026 says the hospital calls to confirm; do not imply an instant confirmed appointment.
- Canonical public route: frontend/src/App.tsx:250, /p/:hospitalSlug. IrisPage.tsx:4 supplies a named-tenant redirect. No dedicated demo tenant was established.
- Older components/iris/chat-bot-ui.tsx uses a different hardcoded tenant ID and Web Speech path. It is not the canonical themed route; no code or tenant identifiers were copied.
- vite.config.js:3 documents a VAD development-server caveat. Its production-success comment is not our runtime test.

These are code-backed capabilities, not end-to-end production chat/voice checks, clinical validation, diagnostic/treatment claims, voice-output claims, compliance certifications or evidence for WhatsApp advertising. WhatsApp is not advertised.

Repository metadata lists https://hospital-ai-platform.vercel.app. HEAD checks on the root and named-tenant page on 2026-10-28 returned 200 without observed X-Frame-Options, Content-Security-Policy or Permissions-Policy. Absence of these headers does not establish functioning embedding or delegated microphone access. frontend/vercel.json contains SPA rewrites; backend/app/main.py:44 configures CORS rather than proving embedding policy.

No credentials, .env, seed data or PROJECT_NOTES.md login details were read; no login, backend execution, chat submission or microphone activation occurred.

## Showcase and demo boundaries

The exact approved section and preview disclaimer is:
“General information only. It does not diagnose or replace a doctor. In an emergency, contact your local emergency services.”

The administrative sample is explicitly labelled “Illustrative preview, not a live conversation”. Appointment/doctor/lab topics are source-backed; no symptoms, medicines, patient identities or fabricated results appear.

SITE_CONFIG.assistantUrl remains empty and the live-demo button is disabled. A future dedicated public demo requires actual URL and frame-policy checks. If blocked, use a new tab; any frame-ancestors change belongs to a separate task in the assistant repository. Iframe microphone delegation alone does not grant browser permission.

## Mochi and enquiries

Mochi gives company/product information and handles support questions. Its demo flow collects name/email, shows a summary and requires explicit visitor confirmation before submitting an enquiry through the website endpoint. Its empty CHAT_ENDPOINT means company replies are scripted, not an active remote AI service. Medical intent overrides the collection and confirmation states and produces the supplied refusal. It never routes a medical question into the demo.

Both enquiry paths use `/api/enquiry` to submit a plain-text enquiry through Resend to the developer-confirmed `gothoslabs@gmail.com` inbox. The endpoint requires server-only `RESEND_API_KEY` and eligible `EMAIL_FROM`; missing configuration produces an error. Provider acceptance is not proof of inbox delivery or a confirmed booking. No browser provider keys, analytics, enquiry database, local sensitive-input logging or persistent chat history are added. Resend and the receiving mailbox process the submitted enquiry. A separate download helper still creates local-only briefs and must never claim sending. Runtime setup, actual inbox delivery and deployment need their own verification.

## Brand and constraints

Green/white identity ("calm and airy"), Poppins, sage shapes, seven full-screen sections and an owl that flies between per-section perches during each transition. The developer's latest appearance instruction replaces the flat mascot with a realistic dimensional, leaf-feather owl matching the video. The real Gothos Labs logo mark (assets/logo/gothos-logo.png, cropped from the developer-supplied image) is used in navigation, the favicon and the AROGYA card. The supplied video is reference material only and is not committed.

No invented metrics, testimonials, prices, customer/hospital endorsements, languages beyond source evidence, certifications or ELogBook AI features. Product applications, databases and personal records remain outside this repository.


