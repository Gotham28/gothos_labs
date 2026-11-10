# References used for this revision

## Current visual references

The developer-supplied owl logo PNG and 40-second motion reference guide this green/white redesign. The company logo's leaf silhouette is retained as flat SVG for navigation and the final lockup. The developer's later instruction explicitly adopts the video's realistic dimensional mascot shading for flight/chat; presentation-sheet captions, browser chrome and garbled copy remain excluded. Video and temporary frame-inspection tooling are never committed.

The main brief and identical Addendum A attachments are referenced in .agents/CURRENT_TASK.md. Addendum A determines the five-stop order and the separation of ELogBook, the hospital assistant and Mochi (the website guide, formerly shown as Hoot).

## Preserved ELogBook evidence provenance

Earlier product/interface evidence was read without changing:
- artifacts/mockup-sandbox/src/components/Dashboard.tsx: resident dashboard/profile/category links/targets/verified activity/recent entries.
- artifacts/mockup-sandbox/src/components/layout/AppLayout.tsx: product identity, navigation, role responsibilities, evaluation queues, assessments, rotations, requirements, access and leave approvals.
- artifacts/mockup-sandbox/src/components/LoginProductPreview.tsx: preview composition.
- artifacts/mockup-sandbox/src/index.css: original theme/font reference.

The redesigned light-glass preview preserves that six-screen factual structure. It is neither a screenshot nor a live authenticated embed. No real records or fabricated totals are loaded.

## Separate assistant source evidence

https://github.com/Gotham28/hospital-ai-platform/tree/f0f7b013bd11ad7544d3bed8bc52cbe74c46dcd1 was inspected read-only. PRODUCT.md records exact relevant paths/lines for verified language, voice, branding, hospital information and administrative capability claims, as well as route/header evidence and limitations.

A named live tenant was found; a dedicated public demo was not. Marketing defaults to the disabled demo state. No account login, patient text, microphone activation, prohibited configuration/seed/credential reads, implementation copying or repository changes occurred.

## Archived GhostFibers provenance

The original pasted React Bits GhostFibers source and CSS remain in reference-source/GhostFibers.jsx and GhostFibers.css. Its buildless adapter is archived as reference-source/ghost-fibers.js. licenses/GhostFibers-NOTICE.md remains unchanged. No renderer, canvas, shaders or runtime hooks are loaded by the new page.

## Fonts and content boundaries

Poppins Latin WOFF2 weights 300/400/500/600/700/800 were downloaded from the official Google Fonts stylesheet/font hosts; the upstream google/fonts ofl/poppins/OFL.txt is bundled as licenses/Poppins-OFL.txt. No runtime font service is contacted.

No invented pricing, testimonials, customer endorsements, clinical outcomes, provider keys or contact addresses. Enquiries are local text downloads, never simulated delivery. Mochi is a company guide and does not give medical advice.



## Dimensional mascot artwork

Mode: built-in image_gen, not CLI/API fallback. The developer explicitly approved the dimensional appearance in this chat on 2026-10-28.

Selected local assets:
- assets/owl/hoot-body.png — transparent RGBA, 1254 × 1254.
- assets/owl/hoot-wing.png — transparent RGBA, 1774 × 887.

The source outputs are retained in the Codex generated-images directory. The original reference video and the extracted 7.6-second reference frame are outside the repository.

### Body prompt

Use case: stylized-concept / identity-preserving extraction. Create the OWL CHARACTER ONLY from the attached reference video frame as a high-resolution, dimensional 3D-rendered website mascot asset on a genuinely transparent background. Preserve this particular character's identity and proportions: front-facing symmetrical plump upright green owl, large cream circular/heart face disc, enormous glossy white eyes with round very dark forest-green pupils and soft white catchlights, small faceted dark green beak, pointed sweeping leaf-like brow/ear tufts, beautifully overlapping scalloped leaf-shaped emerald and forest-green feather layers, folded rounded side wings, short layered tail, tiny dark claws. Match the reference owl closely, including its broad leaf brow, friendly alert expression and matte sculpted feather material. This should look like the dimensional owl in the video, not the earlier flat leaf logo and not a wildlife photograph. Real volume, softly bevelled feather edges, convincing ambient occlusion between overlapping layers, gentle studio light from upper left, soft highlights, rich green variation. Keep it polished and realistic in the reference's stylized 3D manner, no plastic shine or fluffy fur. Exact front camera, both eyes level, wings fully folded at sides, no tilt, no perspective yaw. Entire owl including ear tips, tail and feet visible, centered, occupying about 85% of the square image height, adequate transparent padding on all sides. Deliver just one finished character cutout, no ground plane, no baked floor shadow, no scenery, no background shapes, no text, no wordmark, no browser, no UI, no watermark. This asset will be rigged in code for wings, gaze and blink.

### Wing prompt

Use case: identity-preserving character component derivation. Using the attached owl as the exact material, color, lighting and feather-style reference, render ONE separate fully outstretched LEFT WING animation component on genuine transparency. The body is reference only: do NOT include any body, face, eyes, feet or tail. Wing orientation is horizontal: its compact rounded shoulder/root is on the RIGHT, and its fan of tapered leaf-shaped flight feathers reaches outward toward the LEFT. Slight upward curve at the far left tip, lower feathers fan gently down. Three distinct overlapping layers of broad sculpted leaf feathers, with dark forest-green upper structural feathers, emerald mid-feathers, and lighter green leading surfaces, exactly matching the owl's soft matte dimensional 3D material, bevelled edges, subtle leaf texture and ambient occlusion. This is a stylized owl's organic leaf-feather wing, not a bat wing, mechanical wing, flat icon or real brown bird wing. Entire single wing visible with transparent padding, no cropped tips. Wide landscape composition, wing about twice as wide as tall, consistent front-view camera and soft upper-left studio light. Designed to sit behind the reference owl's body at the shoulder and to flap/fold through code transforms. No other objects, no mirrored second wing, no text, no background, no floor or baked shadow.

