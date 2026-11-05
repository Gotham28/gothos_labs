# Gothos Labs

Buildless marketing website for Gothos Labs and its two products, ELogBook and AROGYA.

## Run locally

Requires Node.js 18 or later. No dependency install or build step.

```sh
npm run dev
```

Open http://127.0.0.1:4177/. The existing server binds to loopback only. PORT can select another local port.

## Website

The landing page (index.html) is six full-screen sections that change one at a time: hero, What we do, ELogBook, AROGYA, Ask the owl (Hoot) and Talk to us (enquiry form, with a slim footer line). One wheel or trackpad gesture, swipe or key press moves exactly one section in a 1.0–1.2 second ease-in-out transition that cannot be stopped midway. A feathered sprite owl, drawn from sixteen poses so it turns through front, three-quarter, side and rear views as it flies, perches in each section and flies to the next perch during each transition. Deep links `#what-we-do`, `#elogbook`, `#arogya`, `#owl` and `#contact` work, as do the header links, side dots, back and forward. The site uses cream, sage and forest-green tokens (direction "calm and airy") and locally bundled Poppins 300/400/500/600/700/800.

ELogBook and AROGYA detail live on two ordinary scrolling pages, elogbook.html and arogya.html, with a small perched owl that opens Hoot. The product copy for the landing page, ELogBook and AROGYA is developer-supplied (2026-11-02) and is used as given; the "What we do" wording is a developer-approved draft built from the developer's direction. See PRODUCT.md.

elogbook.html carries the original six illustrative screens, keyboard tabs and shared expanded dialog. Empty states are intentional: no authenticated, resident or patient records are loaded. The two landing-page screenshots in assets/screens/ are snapshots of those previews, labelled illustrative.

Hoot is the website guide, separate from both products. Company questions go to a private OpenAI-backed endpoint; the editable HOOT_KNOWLEDGE.md supplies product facts. Medical questions receive a local refusal, and demo enquiries are sent only after explicit visitor confirmation and email-provider acceptance. It never confirms a booking. Inputs stay in browser memory, are rendered as text and are cleared when Hoot closes. Only the motion-pause preference uses sessionStorage.

## Source layout

- index.html: the six landing sections, the Hoot dialog and the owl's sprite host. Each section has an empty `.perch` box that reserves the owl's resting place.
- elogbook.html, arogya.html: product pages (shared header, scrolling layout, native dialogs, a perched owl in place of a chat button).
- styles.css: page tokens, local font declarations, header, buttons, the section deck and each section's layout, forms and dialogs.
- product-page.css: shared styles for the two product pages and the illustrative AROGYA chat card.
- section-scroll.js: the transition engine. Wheel gestures end only after 160ms of quiet, so momentum cannot start a second move; keys, swipes, links, history and focus all go through one `go()` that ignores input while a move runs.
- logbook-showcase.css / logbook-showcase.js: ELogBook page role tabs, feature list and preview placement.
- product-preview.css: light frosted-glass ELogBook interface.
- site.js: shared motion state, dialogs, preview tabs and expanded dialog (ELogBook page only), enquiry submission and assistant configuration.
- owl.js: one shared requestAnimationFrame scheduler, the sprite renderer (pose, yaw, wingbeat, blink), per-section perches read from the layout, and flights driven by the transition's eased progress. On product pages it only perches the owl.
- assets/screens/: elogbook-preview.webp and arogya-preview.webp, snapshots of the illustrative previews captured from the local pages (no personal data).
- chat.js / owl-chat.css: Hoot interactions, conversation state and presentation.
- assets/logo/gothos-logo.png: the real Gothos Labs mark, cropped from the supplied logo image (mark only, background keyed to transparent, no redrawing or recolouring). Used for the header, favicon and the AROGYA card. On the dark header state it sits on a small light plate.
- assets/logo/gothos-owl.svg: the earlier flat mark, no longer referenced by the page.
- assets/owl/owl-atlas.webp and owl-atlas.json: the owl's 16 poses in one atlas with frame rects and a shared head anchor. Built, not hand-edited; rebuild with `python tools/build-owl-atlas.py` (Python 3 and Pillow, dev only, never loaded by the site). assets/owl/source/owl-sheet.webp is the 4x4 source sheet it reads; a higher-resolution sheet of the same art can be passed with `--sheet` and gives the same frame layout. See DESIGN.md.
- tools/build-owl-atlas.py: the dev-only atlas builder above.
- fonts/ and licenses/: local assets and original licenses; Poppins has its own SIL OFL file.
- reference-source/: original GhostFibers sources and archived buildless adapter. None is loaded at runtime.
- server.mjs: dependency-free local server and private Hoot API route.

## Assistant configuration

AROGYA is a separately maintained product in https://github.com/Gotham28/hospital-ai-platform. This site does not copy its code, call its backend, or contain credentials.

The single SITE_CONFIG block in site.js controls assistantUrl, assistantFrameAllowed and assistantVoiceVerified. assistantUrl is empty: no dedicated public demo was established, and the button reads “Live demo coming soon”. The accessible named tenant found in planning is not presented as a demo or endorsement.

For a genuine configured demo, verify its public route and current frame policy first. If framing is blocked, set assistantFrameAllowed false and use the new-tab path; changing that product's frame-ancestors policy is separate work in its own repository. The conditional dialog always includes a new-tab link, the personal-health-information notice and the supplied medical disclaimer. Its iframe is created only on activation and removed on close. Microphone delegation is added only when assistantVoiceVerified is true; actual browser permission is still necessary. No embedded voice interaction has been validated here.

Hoot's editable facts live in `HOOT_KNOWLEDGE.md`. Keep them approved, concise and free of secrets or patient data. Its API code is in `hoot-api.mjs`, exposed locally by `server.mjs` and on Vercel by `api/chat.mjs`. It accepts POST `{messages}` and returns `{reply}`. API calls use `store: false`; no chat transcript is written by this repository. The browser shows a plain unavailable message when the API is not configured or fails.

For the local preview, edit the ignored `hoot.config.local.json` and put the OpenAI key in `apiKey`; change `model` in the same file. It starts with `gpt-4o-mini` because the owner asked to choose the model, but official documentation currently marks that model deprecated. Set a supported model when ready. Never commit the local file. In Vercel, create a private environment variable named `HOOT_CONFIG_JSON` whose value is the same JSON object containing `apiKey` and `model`; it overrides the local file. Redeploy after setting it. No API key belongs in HTML, `chat.js`, a committed file, or a chat message. The local preview stays dependency-free (`npm.cmd run dev`).

## Honest local enquiries

The form and Hoot's confirmed demo enquiries now call `/api/enquiry`, implemented locally in `server.mjs` and on Vercel in `api/enquiry.mjs`. The recipient is fixed to `therealgautam2004@gmail.com`; the sender and Resend key come from Git-ignored `enquiry.config.local.json` locally, or a private `ENQUIRY_CONFIG_JSON` environment variable on Vercel. No booking is made. See `EMAIL_SETUP.md` for domain, key, deployment, and live delivery checks. The site retains the form contents on failure and uses a retry ID to avoid duplicate emails.

## Motion and accessibility

The landing page replaces native scrolling with the section deck, so keyboard and focus handling is explicit: ArrowDown, PageDown and Space go next; ArrowUp, PageUp and Shift+Space go back; Home and End go first and last. Keys are left alone while focus is in a form field or a dialog is open. Tabbing to an element in another section brings that section in; after a move, focus goes to the new section's heading. Swipes at either end are not intercepted (checked with synthetic touch events only; pull-to-refresh itself is not verified on a device). Dot and header clicks, back/forward and focus changes that arrive during a move are ignored. When the move ends the screen follows the address bar after back/forward, and follows the focused section after a focus change (which starts a second move and adds a history entry). Shift with the arrow, Page and Home/End keys is left to the browser. The skip link lands on the section on screen.

The deck runs only where every section fits. `section-scroll.js` checks at load, on resize and rotation, when fonts load, and when content changes size. It turns on from 360x640 up if every section fits, stays on down to 600px high, and turns off when a section no longer fits; growth of the content alone can only turn it off, and a resize is what turns it back on. When it is off the sections stack and the page scrolls normally, header links and deep links scroll to the section and move focus to its heading, and the owl perches small in the corner. Switching modes keeps the section in view, and keeps the address bar and focus in step with it; measuring never moves the page. Native modal dialogs, labelled buttons, focus return/trapping, roving preview tabs, pause control and prefers-reduced-motion support remain. Under reduced motion or Pause motion a section change is instant with an under-200ms crossfade and the owl appears at its perch. The AROGYA illustration on arogya.html plays once on entry then rests. Hidden tabs finish a move at once.

## Verification

Fresh commands, browser results, screenshots and limitations belong in HANDOFF.md. Syntax checks use node --check. The browser verification scripts are in `.agents/runs/` (`run.mjs` and `v1`–`v6`); they are dev tooling that is never loaded by the site, use playwright-core from the local npx cache and add no package dependency to it. Screenshots stay outside the repository except the two in assets/screens/. Source evidence is not a clinical or production-chat validation.

Open items: dedicated demo URL, real embedding/microphone verification, and any later enquiry-delivery integration. No deployment/domain work is included.


