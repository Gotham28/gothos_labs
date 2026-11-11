#!/usr/bin/env python3
"""Dev-only: build the owl sprite atlas from the 4x4 source sheet.

Never loaded by the site. Needs Python 3 and Pillow only.

    python tools/build-owl-atlas.py [--sheet assets/owl/source/owl-sheet.webp]
                                    [--out assets/owl] [--contact contact.png]

The sheet is 16 owls on flat magenta, in a 4x4 grid. Columns are yaw (front,
three-quarter, side, rear three-quarter); rows 1-3 are wings up, level, down;
row 4 is perched front, perched blink, perched three-quarter, crouched take-off.

The script keys the magenta (unmixing edge pixels, then despilling and trimming
a 1px edge), slices the owls by connected components, recolours the black
talons on the flying rows to orange, scales every frame so the face is the same
height, and registers every frame to one head anchor (the face centre) inside
equal cells. Nothing is mirrored; the page mirrors at runtime about the anchor.

Everything is measured from the sheet, so a higher-resolution version of the
same art produces the same layout at that resolution with no code change.
"""
import argparse
import io
import json
import statistics
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

YAWS = ['front', 'quarter', 'side', 'rear']
WINGS = ['up', 'level', 'down']
PERCH = ['perch', 'blink', 'perch-quarter', 'crouch']
NAMES = [f'{yaw}-{wing}' for wing in WINGS for yaw in YAWS] + PERCH
ALPHA_FLOOR = 24
BELOW_FACE = .30      # talons are searched below the face, by this many face heights
DARK = 52             # a talon pixel: brightest channel at or below this
TALON_MIN, TALON_MAX = .04, .14   # blob area, in face heights squared
TALON_OPEN = .18      # share of a blob within reach of open air
TALON_DEPTH = .42     # only a blob's lowest part, in face heights, is recoloured
SCALE_BAND = .08      # a frame's scale may stray this far from its group's median
SHEET = Path('assets/owl/source/owl-sheet.webp')
OUT = Path('assets/owl')
BEHAVIORS = Path('assets/owl/source/mochi-liveliness-v1/artwork-manifest.json')


def key_magenta(sheet):
    """Return (RGBA with unmixed colour and soft alpha) for the whole sheet."""
    w, h = sheet.size
    corners = [sheet.getpixel(p) for p in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3))]
    key = tuple(int(statistics.median(c[i] for c in corners)) for i in range(3))
    red, green, blue = sheet.split()
    # How magenta a pixel is: both red and blue above green. No owl colour has
    # min(red, blue) above green, so any positive reading is key contamination.
    spill = ImageChops.subtract(ImageChops.darker(red, blue), green, scale=1, offset=40)
    # The offset reading saturates at 255, which is full key; a reading of v is
    # a key share of v/255 (the 40 offset trims faint fringe, never owl colour).
    t = spill
    alpha = ImageChops.invert(t)
    # Trim the 1px edge ring, where the unmix is least reliable.
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    r, g, b, a, tt = (list(i.getdata()) for i in (red, green, blue, alpha, t))
    out_r, out_g, out_b = bytearray(len(r)), bytearray(len(r)), bytearray(len(r))
    for i, (cr, cg, cb, ti) in enumerate(zip(r, g, b, tt)):
        if ti:
            k = ti / 255
            if k > .98:
                continue
            cr = (cr - k * key[0]) / (1 - k)
            cg = (cg - k * key[1]) / (1 - k)
            cb = (cb - k * key[2]) / (1 - k)
        cr = 0 if cr < 0 else 255 if cr > 255 else cr
        cg = 0 if cg < 0 else 255 if cg > 255 else cg
        cb = 0 if cb < 0 else 255 if cb > 255 else cb
        excess = min(cr, cb) - cg
        if excess > 0:                      # despill: remove the purple cast
            cr -= excess
            cb -= excess
        out_r[i], out_g[i], out_b[i] = int(cr), int(cg), int(cb)
    size = sheet.size
    rgb = [Image.frombytes('L', size, bytes(c)) for c in (out_r, out_g, out_b)]
    return Image.merge('RGBA', (*rgb, alpha)), key


def label(mask, step=4, grow=2):
    """Connected components of a binary mask, found on a reduced, grown copy
    so stray feather tips and talons join their owl. Returns bboxes in px."""
    small = mask.reduce(step).point(lambda v: 255 if v else 0).filter(ImageFilter.MaxFilter(2 * grow + 1))
    w, h = small.size
    px = small.load()
    seen = [[False] * w for _ in range(h)]
    boxes = []
    for y0 in range(h):
        for x0 in range(w):
            if not px[x0, y0] or seen[y0][x0]:
                continue
            queue = deque([(x0, y0)])
            seen[y0][x0] = True
            x1 = x2 = x0
            y1 = y2 = y0
            while queue:
                x, y = queue.popleft()
                x1, x2, y1, y2 = min(x1, x), max(x2, x), min(y1, y), max(y2, y)
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and px[nx, ny] and not seen[ny][nx]:
                            seen[ny][nx] = True
                            queue.append((nx, ny))
            if (x2 - x1 + 1) * (y2 - y1 + 1) > 400:       # ignore specks
                boxes.append(((x1 + grow) * step, (y1 + grow) * step, (x2 + 1 - grow) * step, (y2 + 1 - grow) * step))
    return boxes


def arrange(boxes):
    """Sort 16 boxes into reading order: 4 rows by centre y, 4 columns by x."""
    if len(boxes) != 16:
        sys.exit(f'HALT: expected 16 owls on the sheet, found {len(boxes)}: {boxes}')
    rows = []
    by_y = sorted(boxes, key=lambda b: (b[1] + b[3]) / 2)
    for r in range(4):
        rows.append(sorted(by_y[r * 4:(r + 1) * 4], key=lambda b: (b[0] + b[2]) / 2))
    ordered = [b for row in rows for b in row]
    for i, a in enumerate(ordered):
        for b in ordered[i + 1:]:
            if a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]:
                sys.exit(f'HALT: owl regions overlap, slicing is unsafe: {a} {b}')
    return ordered


def largest_cream(img):
    """Bounding box and centroid of the cream face disc (largest cream blob)."""
    w, h = img.size
    px = img.load()

    def cream(x, y):
        r, g, b, a = px[x, y]
        return a > 200 and r > 205 and g > 190 and b > 135 and r - b > 12 and abs(r - g) < 40
    seen = bytearray(w * h)
    best = None
    for y0 in range(h):
        for x0 in range(w):
            if seen[y0 * w + x0] or not cream(x0, y0):
                continue
            queue = deque([(x0, y0)])
            seen[y0 * w + x0] = 1
            n = sx = sy = 0
            x1 = x2 = x0
            y1 = y2 = y0
            while queue:
                x, y = queue.popleft()
                n += 1
                sx += x
                sy += y
                x1, x2, y1, y2 = min(x1, x), max(x2, x), min(y1, y), max(y2, y)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and cream(nx, ny):
                        seen[ny * w + nx] = 1
                        queue.append((nx, ny))
            if best is None or n > best['n']:
                best = {'n': n, 'box': (x1, y1, x2 + 1, y2 + 1), 'cx': sx / n, 'cy': sy / n}
    if best is None:
        sys.exit('HALT: no cream face found in a frame')
    return best


def perched_orange(frame):
    """The resting owl's talon colour, sampled from its lowest rows."""
    px = frame.load()
    w, h = frame.size
    box = frame.getbbox()
    samples = []
    for y in range(int(box[3] - (box[3] - box[1]) * .12), box[3]):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 200 and r > 200 and 70 < g < 170 and b < 90:
                samples.append((r, g, b))
    if len(samples) < 50:
        sys.exit('HALT: could not find the perched talon colour')
    return tuple(sum(s[i] for s in samples) / len(samples) for i in range(3))


def recolour_talons(frame, orange, face, unit):
    """Black talons to orange. Feather gaps are just as dark as the talons, so
    pixels are not picked by colour alone: a talon is a compact blob of near-
    black pixels hanging in open air below the face, about 0.05 of a face
    height squared. (The wings-down owls hang their wings lower than their
    feet, so a search of the owl's lowest fifth misses them.) Only the lowest
    part of a blob is recoloured, in case a talon touches a feather gap.
    Keeps the original shading by scaling the orange with each pixel's brightness.
    `unit` is the face height in this frame's pixels."""
    px = frame.load()
    w, h = frame.size
    solid = frame.getchannel('A').point(lambda v: 255 if v > ALPHA_FLOOR else 0)
    air = 2 * max(1, round(unit * .04)) + 1
    near = solid.filter(ImageFilter.MinFilter(air)).load()   # 0: transparent within reach
    seen = bytearray(w * h)
    count = 0

    def dark(x, y):
        r, g, b, a = px[x, y]
        return a > ALPHA_FLOOR and max(r, g, b) <= DARK
    for y0 in range(int(face['box'][3] + unit * BELOW_FACE), h):
        for x0 in range(w):
            if seen[y0 * w + x0] or not dark(x0, y0):
                continue
            queue = deque([(x0, y0)])
            seen[y0 * w + x0] = 1
            blob = []
            while queue:
                x, y = queue.popleft()
                blob.append((x, y))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and dark(nx, ny):
                            seen[ny * w + nx] = 1
                            queue.append((nx, ny))
            size = len(blob) / (unit * unit)
            open_air = sum(1 for x, y in blob if near[x, y] == 0) / len(blob)
            below = (sum(y for _, y in blob) / len(blob) - face['box'][3]) / unit
            if size < TALON_MIN or size > TALON_MAX or open_air < TALON_OPEN or below < .5:
                continue
            floor = max(y for _, y in blob) - TALON_DEPTH * unit
            for x, y in blob:
                if y >= floor:
                    r, g, b, a = px[x, y]
                    shade = .72 + .28 * max(r, g, b) / DARK
                    px[x, y] = tuple(min(255, int(c * shade)) for c in orange) + (a,)
                    count += 1
    return count


def premultiplied_resize(frame, scale):
    size = (max(1, round(frame.width * scale)), max(1, round(frame.height * scale)))
    return frame.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def clean_behavior(frame, detached=False):
    """Keep the owl and its soft edge, excluding stray alpha islands.

    The feather-chase row deliberately has a detached feather. Never key the
    generated RGBA art, or register moving heads individually.
    """
    alpha = frame.getchannel('A')
    w, h = frame.size
    solid = alpha.point(lambda a: 255 if a > 100 else 0)
    pixels = solid.load()
    seen = bytearray(w * h)
    blobs = []
    for y in range(h):
        for x in range(w):
            if not pixels[x, y] or seen[y * w + x]:
                continue
            queue = deque([(x, y)])
            seen[y * w + x] = 1
            blob = []
            while queue:
                px, py = queue.popleft()
                blob.append((px, py))
                for nx, ny in ((px-1, py), (px+1, py), (px, py-1), (px, py+1)):
                    if 0 <= nx < w and 0 <= ny < h and pixels[nx, ny] and not seen[ny*w+nx]:
                        seen[ny*w+nx] = 1
                        queue.append((nx, ny))
            blobs.append(blob)
    if not blobs:
        sys.exit('HALT: empty behavior frame')
    blobs.sort(key=len, reverse=True)
    mask = Image.new('L', frame.size)
    target = mask.load()
    kept = [blobs[0]] + ([b for b in blobs[1:] if len(b) > 100] if detached else [])
    for blob in kept:
        for x, y in blob:
            target[x, y] = 255
    # One pixel preserves antialiasing without importing the disconnected specks.
    mask = mask.filter(ImageFilter.MaxFilter(3))
    frame.putalpha(ImageChops.multiply(alpha, mask))
    return frame


def append_wave(atlas, data, manifest_path):
    """Keep the approved raised wing; continuous motion uses the base perch."""
    manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
    spec, action = next(
        (sheet, row) for sheet in manifest['sheets']
        for row in sheet['rows'] if row['id'] == 'shy-wave'
    )
    source = Image.open(manifest_path.parent / spec['file']).convert('RGBA')
    row = action['row']

    def cell(col):
        return clean_behavior(source.crop((
            round(col * source.width / 4), round(row * source.height / 4),
            round((col + 1) * source.width / 4), round((row + 1) * source.height / 4)
        )))

    neutral = cell(0)
    face = largest_cream(neutral)
    scale = data['faceHeight'] / (face['box'][3] - face['box'][1])
    orange_y = []
    pixels = neutral.load()
    for y in range(neutral.height // 2, neutral.height):
        for x in range(neutral.width):
            r, g, b, a = pixels[x, y]
            if a > 180 and r > 150 and 55 < g < 195 and b < 100:
                orange_y.append(y)
    if not orange_y:
        sys.exit('HALT: no planted foot baseline in ' + spec['file'])
    ox = round(data['anchor'][0] - face['cx'] * scale)
    oy = round(data['frames']['perch']['bbox'][3] - (max(orange_y) + 1) * scale)
    img = premultiplied_resize(cell(1), scale)
    box = img.getbbox()
    bbox = [box[0]+ox, box[1]+oy, box[2]+ox, box[3]+oy]
    cw, ch = data['cell']
    if min(bbox[:2]) < 0 or bbox[2] > cw or bbox[3] > ch:
        sys.exit('HALT: approved wave pose exceeds its cell')
    result = Image.new('RGBA', (atlas.width, atlas.height + ch))
    result.alpha_composite(atlas)
    result.alpha_composite(img, (ox, atlas.height + oy))
    data['baseOrder'] = list(data['order'])
    data['order'].append('shy-wave-1')
    data['frames']['shy-wave-1'] = {
        'x': 0, 'y': atlas.height, 'bbox': bbox,
        'faceCentre': [data['anchor'][0], round(face['cy'] * scale + oy, 2)],
        'scale': round(scale, 4)
    }
    data['version'] = 3
    data['image'] = 'owl-atlas.webp?v=polish-1'
    data['atlas'] = list(result.size)
    print(f'Runtime atlas: {len(data["baseOrder"])} preserved poses and one approved wave pose')
    return result


def build(sheet_path, out, contact, behaviors=BEHAVIORS):
    sheet = Image.open(sheet_path).convert('RGB')
    rgba, key = key_magenta(sheet)
    print(f'sheet {sheet.size[0]}x{sheet.size[1]}, key colour {key}')
    solid = rgba.getchannel('A').point(lambda v: 255 if v > 127 else 0)
    boxes = arrange(label(solid))
    frames = []
    for name, box in zip(NAMES, boxes):
        pad = 6
        crop = rgba.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(sheet.width, box[2] + pad), min(sheet.height, box[3] + pad)))
        crop = crop.crop(crop.getchannel('A').point(lambda v: 255 if v > ALPHA_FLOOR else 0).getbbox())
        frames.append({'name': name, 'img': crop})
    orange = perched_orange(frames[12]['img'])
    print(f'perched talon orange {tuple(round(c) for c in orange)}')
    for f in frames:
        f['face0'] = largest_cream(f['img'])
    target = statistics.median(f['face0']['box'][3] - f['face0']['box'][1] for f in frames[:12])
    for f in frames:
        f['talons'] = 0 if f['name'] in PERCH else recolour_talons(f['img'], orange, f['face0'], target)
    # Normalise by face height. A wing can hide part of the face on the turned-
    # back frames, which would read as a small face and blow the frame up, so
    # each scale is held within a band around its group's median (flying, perched).
    for f in frames:
        f['scale'] = target / (f['face0']['box'][3] - f['face0']['box'][1])
    for group in (frames[:12], frames[12:]):
        mid = statistics.median(f['scale'] for f in group)
        for f in group:
            held = min(mid * (1 + SCALE_BAND), max(mid * (1 - SCALE_BAND), f['scale']))
            f['held'] = held != f['scale']
            f['scale'] = held
    # Re-measure the face on each scaled frame.
    for f in frames:
        f['img'] = premultiplied_resize(f['img'], f['scale'])
        f['face'] = largest_cream(f['img'])
        f['bbox'] = f['img'].getbbox()
    # Registration: the face centre is the head anchor, shared by every frame.
    left = max(f['face']['cx'] - f['bbox'][0] for f in frames)
    right = max(f['bbox'][2] - f['face']['cx'] for f in frames)
    above = max(f['face']['cy'] - f['bbox'][1] for f in frames)
    below = max(f['bbox'][3] - f['face']['cy'] for f in frames)
    margin = 3
    half = int(max(left, right)) + margin + 1
    cell_w, cell_h = half * 2, int(above) + int(below) + 2 * margin + 2
    anchor = (half, int(above) + margin + 1)
    atlas = Image.new('RGBA', (cell_w * 4, cell_h * 4), (0, 0, 0, 0))
    meta = {}
    for i, f in enumerate(frames):
        col, row = i % 4, i // 4
        ox = round(anchor[0] - f['face']['cx'])
        oy = round(anchor[1] - f['face']['cy'])
        atlas.alpha_composite(f['img'], (col * cell_w + ox, row * cell_h + oy))
        bx = f['bbox']
        meta[f['name']] = {
            'x': col * cell_w, 'y': row * cell_h,
            'bbox': [bx[0] + ox, bx[1] + oy, bx[2] + ox, bx[3] + oy],
            'face': [round(f['face']['box'][i] + (ox if i % 2 == 0 else oy), 1) for i in range(4)],
            'faceCentre': [round(f['face']['cx'] + ox, 2), round(f['face']['cy'] + oy, 2)],
            'talons': f['talons'], 'scale': round(f['scale'], 4)}
    boxes_all = [m['bbox'] for m in meta.values()]
    union = [min(b[0] for b in boxes_all), min(b[1] for b in boxes_all), max(b[2] for b in boxes_all), max(b[3] for b in boxes_all)]
    centre = [round(statistics.mean((b[0] + b[2]) / 2 for b in boxes_all), 1), round(statistics.mean((b[1] + b[3]) / 2 for b in boxes_all), 1)]
    data = {
        'version': 1, 'image': 'owl-atlas.webp', 'order': list(NAMES),
        'atlas': [atlas.width, atlas.height], 'cell': [cell_w, cell_h],
        'anchor': list(anchor), 'centre': centre, 'union': union,
        'faceHeight': round(target, 2), 'frames': meta}
    if behaviors and behaviors.exists():
        atlas = append_wave(atlas, data, behaviors)
    out.mkdir(parents=True, exist_ok=True)
    quality = 90
    while True:
        encoded = io.BytesIO()
        atlas.save(encoded, 'WEBP', quality=quality, alpha_quality=100, method=4)
        size = encoded.tell()
        if size < 1_500_000 or quality <= 60:
            break
        quality -= 6
    (out / 'owl-atlas.webp').write_bytes(encoded.getvalue())
    (out / 'owl-atlas.json').write_text(json.dumps(data, indent=1) + '\n')
    print(f'cell {cell_w}x{cell_h}, anchor {anchor}, atlas {atlas.width}x{atlas.height}, webp q{quality} {size / 1024:.0f} KB')
    print(f'{"frame":<15}{"size":>10}{"face h":>8}{"scale":>7}{"talons":>8}')
    for f in frames:
        m = meta[f['name']]
        fh = m['face'][3] - m['face'][1]
        note = '  scale held (face part-hidden)' if f['held'] else ''
        print(f'{f["name"]:<15}{f["img"].width:>5}x{f["img"].height:<4}{fh:>8.1f}{f["scale"]:>7.3f}{f["talons"]:>8}{note}')
    if contact:
        render_contact(atlas, cell_w, cell_h, anchor, contact)
    return data


def render_contact(atlas, cell_w, cell_h, anchor, path):
    """Every frame on light and dark backgrounds, anchor cross drawn on each."""
    sheets = []
    for colour in ((247, 246, 241, 255), (18, 61, 43, 255)):
        canvas = Image.new('RGBA', atlas.size, colour)
        canvas.alpha_composite(atlas)
        draw = ImageDraw.Draw(canvas)
        for r in range(atlas.height // cell_h):
            for c in range(4):
                ax, ay = c * cell_w + anchor[0], r * cell_h + anchor[1]
                draw.line((ax - 6, ay, ax + 6, ay), fill=(255, 0, 0, 255))
                draw.line((ax, ay - 6, ax, ay + 6), fill=(255, 0, 0, 255))
                draw.rectangle((c * cell_w, r * cell_h, (c + 1) * cell_w - 1, (r + 1) * cell_h - 1), outline=(160, 160, 160, 255))
        sheets.append(canvas)
    both = Image.new('RGBA', (atlas.width * 2, atlas.height), (255, 255, 255, 255))
    both.paste(sheets[0], (0, 0))
    both.paste(sheets[1], (atlas.width, 0))
    both.convert('RGB').save(path)
    print(f'contact sheet {path}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--sheet', type=Path, default=SHEET)
    parser.add_argument('--out', type=Path, default=OUT)
    parser.add_argument('--contact', type=Path, default=None, help='write a light/dark contact sheet PNG here')
    parser.add_argument('--behaviors', type=Path, default=BEHAVIORS, help='approved RGBA behavior manifest')
    args = parser.parse_args()
    build(args.sheet, args.out, args.contact, args.behaviors)
