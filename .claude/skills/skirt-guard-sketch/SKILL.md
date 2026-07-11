---
name: skirt-guard-sketch
description: >-
  Interpret hand-drawn skirt-guard sketches and convert each into a clean, usable
  SVG in the Biker component's wheel coordinate space. Use when the user provides
  an image containing one or more labeled skirt-guard shapes — a black outline
  drawn over a gray circle (the rear wheel) — and wants each turned into a .svg
  file. Encodes the fixed geometry (a concentric top edge that hugs the wheel) and
  the anchor/primitive vocabulary that defines the varying bottom edge.
---

# Skirt-guard sketch → SVG

Turn simple hand drawings of rear-wheel skirt guards into clean SVGs. The input is
an image with one or more small sketches: each is a **gray circle = the rear wheel**
with a **black outline = the skirt-guard shape**, and a **text label = its name**.
Output **one `.svg` file per sketch**.

The whole trick is that these shapes are NOT free curves — they are built from a
tiny vocabulary. Interpret them by naming their parts, not by tracing pixels.

## Coordinate model (always the same)

- Sketch space: `200×200` viewBox. Wheel center `(100,100)`, radius `R=70`.
- Outer edge radius `RO=76` (≈8.5% above the rim).
- **Bike faces right** → the right side is the FRONT, the left side is the REAR.
- Describe everything left → right.
- Clock positions via `polar(angle, r)` where angle is degrees **clockwise from top**:
  9 o'clock `=-90`, 10 `=-60`, 11 `=-30`, 12 `=0`, 1 `=30`, 2 `=60`, 3 `=90`.

## The one fixed rule: the TOP edge is always concentric

Every skirt guard's outer/top edge is a **concentric arc with the wheel** — a
constant small offset (`RO`) above the rim, so it tracks the wheel's curve and
clears the tire (it protects the top so a skirt can't catch). Never trace the top
freehand and never let it bulge away from the wheel.

In SVG this is `A RO RO 0 <large-arc> 1 x,y` with **large-arc = 0** (unless the span
> 180°) and **sweep = 1**. That combination selects the circle centered on the wheel
center. `large-arc = 1` picks the wrong center and the top bulges off the wheel —
that is the #1 bug to avoid. Use `concentric_arc()` in `render_skirt.py`.

## Vocabulary — what the BOTTOM edge is made of

The bottom (inner) edge is what distinguishes the types. It is straight segments
between a few kinds of **anchors**:

- **hub / center** `(100,100)` — the shape may pass *through* it or *along* its line.
- **clock points** on the rim — `polar(angle, R)`.
- **horizontal levels** — a chosen `y` (e.g. the center line `y=100`, or higher).

Primitive segments:
- **radius** — a line from the center to a rim/arc point. Two radii meeting at the
  center make a **pie sector** (the `_CIRCLE` family).
- **chord** — a straight line between two rim points (rare; usually it's actually
  two radii through the center — verify whether the vertex is at the hub).
- **horizontal level** — a flat run at some `y` (the `LEVEL` family).
- **diagonal step** — connects two levels at an angle (e.g. 45°) with a given height.
- **scoop** — a quarter-oval (elliptical arc) that carves a concave curve into an
  edge, e.g. from a point near the hub arcing out to a clock position. Used to
  "eat into" a filled sector (the `CRESCENT` family).
- **tangent step-arc** — a single circular arc joining two levels, tangent to the
  lower level (leaves it horizontally) and easing up to the upper one. Replaces the
  straight diagonal step (the `LEVEL_2` family). Tangent-at-the-lower-level radius:
  for a rise `h` over a horizontal run `w`, `r = (w² + h²) / (2h)`.
- **inside-the-wheel edge + cap** — a horizontal edge may stop short of the rim,
  ending *inside* the wheel; close it back to the top arc with a straight **cap**
  segment, often to a **snapped clock position** (e.g. the top arc's left end pinned
  to 10 o'clock, `polar(-60, 76)`).

### Compound shapes

A guard need not be a single primitive. Read a complex outline as a **base shape
plus operations**: e.g. `CRESCENT` = a right sector (12→3, filled to the center) +
a left sector (9→12) with a **scoop** subtracted from its lower corner. When a
sketch isn't one clean primitive, decompose it: which part is filled to the hub,
which edges are radii vs. arcs vs. scoops, and where do they meet. Describe that
decomposition back to the user before committing.

## Shape families seen so far

- **`_CIRCLE` (e.g. `9_1_CIRCLE`, `10_3_CIRCLE`)** = a **pie sector**: concentric
  arc between the two named clock angles, then both ends run straight to the CENTER.
  The two lines meet at the hub. Use `sector(a_left, a_right)`.
  - `9_1_CIRCLE` = `sector(-90, 30)`   (9 o'clock → 1 o'clock)
  - `10_3_CIRCLE` = `sector(-60, 90)`  (10 o'clock → 3 o'clock)
- **`LEVEL_n`** = concentric arc + a bottom of **two horizontal levels** (lower one
  along the center line to the right edge; a higher one on the left), joined by a
  **step**. The number/variant is mostly about *how* they're joined:
  - `LEVEL_1`: right horizontal on the center line → **45° diagonal step up** →
    higher-left horizontal that runs out to the rim.
  - `LEVEL_2`: same two levels, but joined by a **single tangent step-arc** (no
    diagonal), and the upper-left horizontal **stops inside the wheel**, capped by a
    straight edge up to the top arc's left end **snapped to 10 o'clock**.
  Confirm step size/depth and where the upper edge ends with the user if unsure.
- **`CRESCENT`** = a **compound** shape: right sector (12→3) + left sector (9→12)
  with a **scoop** carved out of the lower-left. Use `crescent(a_right, a_left)`;
  `crescent(90, -60)` is the confirmed shape (right radius at 3 o'clock, top arc up
  to 10 o'clock, quarter-oval scoop eating the 9 o'clock corner). Tune the scoop via
  `hub=` (where it lands near the center) and `scoop=(rx, ry)`.
- **`FIN`** = a **symmetric truncated wedge**: concentric arc from 10 o'clock to
  2 o'clock, then each side runs down to a **flat bottom** across the center line —
  the two bottom points sit 1/5·R either side of the center (`(86,100)` and
  `(114,100)`), so there's no single vertex at the hub.

## Process

1. **View the image.** It may contain several sketches in a grid.
2. For **each** sketch, read three things: the gray wheel, the black guard outline,
   and the **label (name)** — usually text under or above it, plus a city list.
3. **If a sketch has no name, prompt the user** for it (AskUserQuestion) before
   writing its file. Never invent a name.
4. **Interpret the bottom edge as primitives + anchors** — decide: does it pass
   through the hub (sector)? along the center line with steps (level)? The top is
   concentric by rule, so you only reason about the bottom.
   - If the construction is ambiguous, **ask** rather than guess. State your reading
     ("two radii meeting at the center" / "horizontal at center line then a 45° step")
     and let the user correct it. Guessing and patching wastes rounds.
5. **Build the path** using `render_skirt.py` helpers (`polar`, `concentric_arc`,
   `sector`, `crescent`, or a hand-written bottom edge). For compound shapes, compose
   from these or add a new helper once the construction is confirmed.
6. **Save two files per confirmed sketch**, default into `docs/skirt-sketches/`:
   `<NAME>.svg` (clean, via `write`) and `<NAME>-labeled.svg` (vertex markers, via
   `write_labeled`) for feedback. Ask the user if they want a different directory.
   While still iterating, a single labeled draft is enough — label the vertices so
   the user can point precisely ("raise B", "C closer to O").
7. **Verify**: render the SVG to PNG (`rsvg-convert`) and eyeball it against the
   input. Check the top is concentric (constant gap to the wheel) and the bottom
   anchors match. Iterate on the bottom edge only.

## Reference paths (confirmed)

```
LEVEL_1      M29.53,71.53 A76,76 0 0 1 176,100 L170,100 L108,100 L93,85 L31.6,85 Z
LEVEL_2      M34.18,62.0 A76,76 0 0 1 176.0,100.0 L122,100 A29,29 0 0 0 96,84 L58.39,84 Z
9_1_CIRCLE   M24.0,100.0 A76,76 0 0 1 138.0,34.18 L100,100 Z          (sector(-90, 30))
10_3_CIRCLE  M34.18,62.0 A76,76 0 0 1 176.0,100.0 L100,100 Z          (sector(-60, 90))
11_3_CIRCLE  M62.0,34.18 A76,76 0 0 1 176.0,100.0 L100,100 Z          (sector(-30, 90))
FIN          M34.18,62.0 A76,76 0 0 1 165.82,62.0 L114.0,100 L86.0,100 Z   (truncated wedge, flat bottom ±R/5)
CRESCENT     M100,100 L176.0,100.0 A76,76 0 0 0 34.18,62.0 A54,38 0 0 1 88,100 Z  (crescent(90, -60))
```

## Notes

- This sketch space (R=70 @ 100,100) is for design/preview. The real Biker rear
  wheel is R=18 @ (66,87); scale by 18/70 ≈ 0.257 when porting a path into
  `src/app/components/Biker/Skirt.tsx`.
- Output SVGs are self-contained (gray wheel + guard + center line) so they preview
  directly and compare 1:1 with the input drawing.
