# Gothos Labs design

## Design read

A spacious product-studio marketing site for teams and hospital buyers: a custom cream/sage/forest identity, with dimensional owl storytelling. Direction chosen by the developer on 2026-11-02 from two mockups: "calm and airy" (cream and white, large confident type, soft green gradients, a faint leaf texture, generous space). The deep-green immersive direction was not taken. Design variance 6, motion intensity 7 when enabled, visual density 3.

## Composition

Six full-screen sections (100dvh with svh/vh fallbacks), changed one at a time. Every section fits its screen with no internal scrolling at 360x640 and up; a screenshot is the one flexible block and shrinks, whole and uncropped, to what is left. Developer decision (2026-11-02): on short or zoomed screens, or where a section's content does not fit, the page scrolls normally instead of using the deck, and the owl then perches small in the corner as on the product pages. The thresholds are an implementation choice, not the developer's: the deck turns on from 360x640 up and only if every section fits, stays on down to 600px high, and is re-checked on resize and when content changes size (growth alone can only turn it off; a resize turns it back on). It holds at wide, short windows such as 1920x640 because the screenshot also shrinks to the available height.
1. Hero: "Gothos Labs" and the headline only, centred (left on phones); owl perched bottom right.
2. What we do: heading and the approved paragraph on the left, the owl perched on the right (under the text on phones). No other copy.
3. ELogBook: intro, an illustrative screenshot and "Explore ELogBook"; owl perched beside the button.
4. AROGYA: mirrored layout, screenshot on the left, the one-line disclaimer, "Explore AROGYA", owl beside the button.
5. Ask the owl: heading, the approved two lines and "Talk to Hoot" with the owl beside it.
6. Talk to us: heading with the owl beneath it, the enquiry form, and a slim footer line (©, Pause motion, links).

Each section keeps an empty `.perch` box in its own layout (in flow wherever possible), sized from the owl's body size, so the owl never covers text, buttons, the screenshot or the form. Navigation: header links, six side dots (aria-current), keyboard, swipes and history all drive the same engine. Mobile navigation remains an expanded menu.

Product pages (elogbook.html, arogya.html) use the same header, logo, fonts and tokens, scroll normally, and keep the landing page's gradients and pill buttons.

## Tokens and typography

Background #F7F6F1, sage #DDE9DF, emerald #2F8F5B, forest #1E5B3F, deep #123D2B, ink #14231B and muted #4A5F53. Locally bundled Poppins weights 300–800 use font-display:swap and upstream SIL OFL licensing. Existing unused font assets/licenses remain for provenance; their old font-face rules are removed.

Native controls, pill CTAs, one glass language for product previews/dialogs, generous space and soft sage shapes. No photos, flowers, invented logos or social links.

## Owl and motion

The owl is a sprite rig over one atlas of 16 developer-supplied poses (assets/owl/owl-atlas.webp, frame rects in owl-atlas.json). Pose is yaw x wing state: four angles (front, three-quarter, side, rear three-quarter with the head turned back) by three wing states (up, level, down), plus a perched front frame, a blink frame, a perched three-quarter frame and a take-off crouch. Every frame is scaled to the same face height and registered to one head anchor, with each atlas cell symmetric about it, so leftward travel mirrors a frame about the anchor without moving the head. Two stacked frame layers crossfade each swap (about 100ms for an angle or mode change, 60ms for a wing change). The shadow stays separate. The rig adds no rendering library or runtime service.

Yaw follows screen travel and turns one angle at a time: sideways travel is side view, sideways and descending is three-quarter, sideways and climbing is rear three-quarter, and take-off, landing, hover and slow travel are front. Turns pass through neighbouring angles in order with hysteresis, at most four angle changes a second. Wingbeats cycle up, level, down, level at 1.4 to 1.6 beats a second while airborne (1.4 slowest, rising to 1.6 at speed); the code's own counter of wing cycles per airborne second reads 1.54 to 1.60 over the landing-page transitions (the counter is the code's, not an independent measurement). Take-off and landing pass through the crouch frame for about 150ms. A perched owl blinks every 3.5 to 6 seconds and turns to the perched three-quarter frame when the pointer has stayed well to one side for over 0.6 seconds, which replaces pupil gaze. Bank is capped at 10 degrees. Reduced motion and Pause motion show the perched front frame at each stop with no flap, turn or blink.

The chat avatar and the fly-to-chat clone use the same 400px sprite box as the page owl, scaled by chat.js, so they land on each other exactly; the transfer plays crouch, one wingbeat, crouch, then the perched frame the avatar shows.

owl.js owns one coordinated requestAnimationFrame loop. At rest the owl stands on the current section's perch box, feet on its bottom edge. During a transition it reads the deck's eased progress (section-scroll.js `sample()`), so the owl and the sections move in step: it crouches and opens its wings in the first fifth of the move, glides along an arc between the two perches and folds into a landing crouch in the last quarter. A jump across several sections is one direct flight (1.0 to 1.2 seconds in all). The owl is visible on every frame and the header gap holds at 12px or more. Reversing direction simply flies it back. Perch positions are re-read on resize, fonts and content size changes. Hidden-tab work pauses and a hidden tab finishes any move at once. On product pages the owl is a small perched sprite at the bottom right that opens Hoot; it does not fly.

### Rebuilding the atlas

`python tools/build-owl-atlas.py` (Python 3 and Pillow; dev only, never loaded by the site) reads assets/owl/source/owl-sheet.webp, a 4x4 sheet on flat magenta, and writes the atlas and JSON. It unmixes and despills the magenta key and trims a 1px edge, slices the 16 owls by connected components, recolours the black talons on the flying rows to the perched owl's orange (found as compact near-black blobs in open air below the face), scales every frame to the same face height, and registers every frame to the face centre. A turned-back head can have its face part hidden by a wing, which reads as a small face, so each frame's scale is held within 8% of its group's median. Everything is measured from the sheet, so a higher-resolution sheet of the same art passed with `--sheet` produces the same layout at that resolution with no code change. `--contact path.png` writes every frame on light and dark backgrounds for checking.

Flight targets clamp visual bounds within the viewport.

Animation uses transforms and opacity with static blur/masks. Letter reveals replace animated letter-spacing; chat uses scale/opacity rather than animated clipping. Reduced-motion/paused states remove flight, flapping, turning, blinking and parallax and show the assistant conversation statically.

## Product interactions

The original six-screen preview now lives on elogbook.html; its expanded view is one native dialog that returns the window to its home on close. Keyboard tabs, empty states and focus return are preserved. The assistant illustration on arogya.html is an administrative example and plays once, then rests. The landing page shows only still, labelled snapshots of the two previews.

Hoot's native modal moves the interactive owl into the modal layer, flies it to the panel and restores it on close. At 390px it becomes a bottom sheet. Native focus trapping is reinforced for keyboard edges, Esc closes, and labelled controls have visible focus rings.

## Reference inspection

The supplied 40-second 1280x720 video was inspected through six actual frames at 0.05, 7.6, 15.2, 22.8, 30.4 and 38.4 seconds using a temporary loopback-only viewer. This establishes representative composition/poses, not frame-perfect continuous-motion matching.

Retained reference signals: cream/sage background, large pale numerals, wing spread/fold, curved motion, dark leaves and the chat dock. Ignored: browser chrome, garbled text, inconsistent navigation/section labels, phone flash, unsupported buttons and unsupported page artifacts. The reference video and inspection tooling are not site assets.

## Verification

See HANDOFF.md for actual screenshots, functional results and limitations. Visual verification is at desktop, a short laptop viewport and 390px; full-motion, pause and reduced-motion states must be reported separately. A configured synthetic iframe check is not a live assistant or microphone validation.


## Approved appearance change

The developer explicitly requested a realistic 3D look matching the video after the flat implementation. This overrides the earlier instruction to ignore the video's dimensional owl shading. Body and wing assets use the built-in image generation tool, remain local and preserve transparent alpha. No provider key, runtime dependency or live endpoint is introduced.


