#!/usr/bin/env python3
"""
Helper for the `skirt-guard-sketch` skill.

Everything is drawn in the sketch space used across docs/skirt-sketches:
a gray wheel centered at (100,100) with radius R=70, in a 200x200 viewBox.
The bike faces RIGHT (front = right, rear = left).

Usage (from the agent):
    python3 render_skirt.py --name LEVEL_1 --out docs/skirt-sketches/LEVEL_1.svg \
        --d "M29.53,71.53 A76,76 0 0 1 176,100 L170,100 L108,100 L93,85 L31.6,85 Z"

or import the helpers:
    from render_skirt import CX, CY, R, RO, polar, concentric_arc, sector, svg
"""
import argparse
import math

CX, CY, R = 100, 100, 70      # wheel center + radius
RO = 76                       # outer edge radius = concentric arc, ~8.5% above the rim


def polar(angle_deg, r=R):
    """Point on a circle of radius r, angle measured CLOCKWISE from top (12 o'clock).
    9 o'clock = -90, 12 = 0, 1 = 30, 3 = 90, 6 = 180."""
    a = math.radians(angle_deg)
    return (round(CX + r * math.sin(a), 2), round(CY - r * math.cos(a), 2))


def concentric_arc(a_left, a_right, ro=RO):
    """Path SEGMENT for the top edge: a concentric arc riding just above the rim,
    from the left clock-angle to the right clock-angle, going OVER THE TOP.

    Emit it right after a MoveTo the left outer point, e.g.:
        d = f"M{polar(a_left, ro)[0]},{polar(a_left, ro)[1]} " + concentric_arc(a_left, a_right)

    The flags are the whole point: large-arc = 0 (unless the span exceeds 180),
    sweep = 1 -> this selects the circle CENTERED ON THE WHEEL CENTER, so the arc
    tracks the wheel at a constant offset. (large-arc = 1 picks the wrong center
    and the top bulges away from the wheel — that was the classic bug.)"""
    xr, yr = polar(a_right, ro)
    large_arc = 1 if (a_right - a_left) > 180 else 0
    return f"A{ro},{ro} 0 {large_arc} 1 {xr},{yr}"


def sector(a_left, a_right, ro=RO):
    """A `_CIRCLE` / pie-sector guard: concentric arc between two clock angles,
    then both ends run straight to the wheel CENTER (the two radii meet at the hub).
    e.g. sector(-90, 30) == 9_1_CIRCLE, sector(-60, 90) == 10_3_CIRCLE."""
    xl, yl = polar(a_left, ro)
    return f"M{xl},{yl} {concentric_arc(a_left, a_right, ro)} L{CX},{CY} Z"


def crescent(a_right, a_left, hub=(88, 100), scoop=(54, 38), ro=RO):
    """A compound guard: a right sector's straight radius, a concentric top arc, and
    a LEFT edge that is a quarter-oval `scoop` carved back to a point near the hub.

    Trace: center -> straight radius out to `a_right` clock angle -> concentric top
    arc over the top from `a_right` to `a_left` (drawn right->left, sweep 0) -> an
    elliptical-arc scoop (rx,ry = `scoop`) from the `a_left` end down to `hub` (a
    point slightly to one side of the center) -> close back to center.

    `crescent(90, -60)` == the confirmed CRESCENT (3 o'clock right radius, top arc up
    to 10 o'clock, quarter-oval scoop eating the 9 o'clock corner)."""
    pr = polar(a_right, ro)
    pl = polar(a_left, ro)
    large_arc = 1 if (a_right - a_left) > 180 else 0
    return (
        f"M{CX},{CY} L{pr[0]},{pr[1]} "
        f"A{ro},{ro} 0 {large_arc} 0 {pl[0]},{pl[1]} "     # concentric top, right -> left
        f"A{scoop[0]},{scoop[1]} 0 0 1 {hub[0]},{hub[1]} Z"  # quarter-oval scoop to the hub
    )


def svg(name, d, show_center_line=True):
    """Wrap a guard path `d` into the standard preview SVG (gray wheel + guard)."""
    line = (
        f'<line x1="20" y1="{CY}" x2="180" y2="{CY}" stroke="#e77" '
        f'stroke-width="0.8" stroke-dasharray="3 3"/>'
        if show_center_line else ""
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" '
        f'width="440" height="440"><title>{name}</title>'
        f'<rect width="200" height="200" fill="white"/>'
        f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="#c9c9c9"/>'
        f'{line}'
        f'<path d="{d}" fill="#8ab4d8" fill-opacity="0.5" stroke="#111" '
        f'stroke-width="2.6" stroke-linejoin="round"/>'
        f'<circle cx="{CX}" cy="{CY}" r="2.5" fill="#555"/></svg>'
    )


def _label_markers(points):
    """points: list of (label, x, y) or (label, x, y, dx, dy) for the text offset."""
    out = []
    for p in points:
        c, x, y = p[0], p[1], p[2]
        dx = p[3] if len(p) > 3 else 4
        dy = p[4] if len(p) > 4 else -3
        out.append(f'<circle cx="{x}" cy="{y}" r="1.7" fill="#d22"/>')
        out.append(
            f'<text x="{x+dx}" y="{y+dy}" font-family="sans-serif" font-size="8" '
            f'font-weight="bold" fill="#b00">{c}</text>'
        )
    return "".join(out)


def svg_labeled(name, d, points, show_center_line=True):
    """Same as svg() but with labeled vertex markers overlaid — for feedback."""
    return svg(name, d, show_center_line).replace("</svg>", _label_markers(points) + "</svg>")


def write(name, d, out_path, show_center_line=True):
    with open(out_path, "w") as f:
        f.write(svg(name, d, show_center_line))
    return out_path


def write_labeled(name, d, points, out_path, show_center_line=True):
    with open(out_path, "w") as f:
        f.write(svg_labeled(name, d, points, show_center_line))
    return out_path


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True, help="skirt-guard name (from the sketch label)")
    ap.add_argument("--d", required=True, help="SVG path data for the guard outline")
    ap.add_argument("--out", required=True, help="output .svg path")
    ap.add_argument("--no-center-line", action="store_true")
    args = ap.parse_args()
    write(args.name, args.d, args.out, show_center_line=not args.no_center_line)
    print("wrote", args.out)
