---
name: add-city-bike
description: >-
  Add a new city's bikeshare bicycle to the repo as a drawable Biker, from a city
  name plus a side-on photo of the bike. Use when the user wants to "add a bike",
  "add a city's bike", or "add a custom biker" for a system — NOT to add a city to
  the growth race (that needs trip data and is out of scope here). Encodes the exact
  files to touch (cities.ts, bikeImages.ts, city-bike-colors.csv, cityBikeConfig.ts,
  and Skirt.tsx if a new guard is needed), the BikerColors part vocabulary, the
  basket/skirt/down-tube enums, the CSV column order, and the color-derivation flow.
---

# Add a city bike

Turn a **city name + a side-on photo of that city's bikeshare bike** into a
drawable `Biker` in this repo. The photo may be a **local file path or an image
URL** — a URL is preferred, since it doubles as the stored `source_url`. The bike
then shows up automatically in the
[/bikes/all](../../../src/app/bikes/all/page.tsx) gallery and the rotating
`CyclingBiker`.

**Scope: the bike only, not the race.** The growth race is data-driven — a city
appears there only once it has trip data (CDN `visuals.json` or a backfill). This
skill deliberately stops short of that. Adding the `systems` entry below does _not_
force the city into the race: with no trip data, `fetchAllTimeTrips` skips it. So do
not add CDN data, `public/data/` CSVs, or `backfill/` loaders here.

## What "the bike" is made of

The per-city bike lives in one object in
[cityBikeConfig.ts](../../../src/app/components/Biker/cityBikeConfig.ts):

```ts
madrid: {
  basketType: 'wire',        // 'none' | 'wire' | 'box' | 'rack'
  skirtGuard: { type: 'CRESCENT', color: '#e2231a', outerGuard: lyftOuterGuard },
  downTube: 'lyft',          // optional: 'default' | 'lyft' | 'nordic'
  colors: { /* bike-part color overrides, see below */ },
}
```

**Only bike parts are configured. The rider stays default** (shirt, pants, skin,
helmet, shoe come from `DEFAULT_COLORS` — never set them). The `colors` object is a
`Partial<BikerColors>`; every existing city overrides exactly these 11 bike-part
keys:

| key           | what it is                                    |
| ------------- | --------------------------------------------- |
| `frame`       | main frame color                              |
| `frameDark`   | shaded frame / lugs (a darker shade of frame) |
| `frontFender` | front mudguard over the front wheel           |
| `basket`      | front basket / rack / carrier stroke          |
| `saddle`      | seat (usually near-black `#1b1b1b`)           |
| `tire`        | outer tire (usually `#1a1a1a`)                |
| `wheelRim`    | rim band (CSV column is `rim`)                |
| `spoke`       | spokes (usually `#c8cbce`)                    |
| `hub`         | wheel hub (usually `#7a7a7a`)                 |
| `ring`        | chainring                                     |
| `crank`       | crank arm                                     |

`skirtGuard` is the branded panel over the **rear** wheel; `outerGuard` is an
optional fender rib arcing over the rear wheel. Many Lyft-built systems share the
module-level `lyftOuterGuard` (`{ endDeg: 150, color: '#1a1a1a' }`) — reuse it when
the bike is a Lyft/Motivate design with a black rear rib.

## Files to touch (in order)

1. **[src/app/constants/cities.ts](../../../src/app/constants/cities.ts)** — add a
   `systems` entry. **Required even though we're skipping the race**: the gallery
   reads `systems[id].metroArea`, so a missing entry crashes `/bikes/all`. The
   `systems` object is **alphabetical by key** — insert in order. Fields: `id`
   (short slug, often same as key), `metroArea` (display name), `city` (= the key),
   `country`, `longitude`, `latitude`. `country` is typed as the closed `Country`
   union in [System.ts](../../../src/app/model/System.ts) — if the city's country
   isn't already a member, add it there too or `tsc` fails.
2. **[src/app/constants/bikeImages.ts](../../../src/app/constants/bikeImages.ts)** —
   add `<city_id>: '<public image url>'`. This must be a **public web URL** (it's
   the photo the gallery links each city name to). If the input was a URL, use it
   directly. If the user gave a local file, derive colors from it but **ask for the
   public source URL** to store here.
3. **[docs/city-bike-colors.csv](../../../docs/city-bike-colors.csv)** — append one
   provenance row (see column order below). This is the human source-of-record; no
   code imports it, but keep it in sync with the config.
4. **[cityBikeConfig.ts](../../../src/app/components/Biker/cityBikeConfig.ts)** — add
   the `<city_id>: { ... }` object. Its position in the file = display order in the
   gallery/rotation (`CONFIGURED_CITY_IDS = Object.keys(...)`); append at the end
   unless the user wants otherwise.
5. **[Skirt.tsx](../../../src/app/components/Biker/Skirt.tsx)** — _only if_ the rear
   panel doesn't match an existing `SkirtType`. See "Skirt guard" below.

Use one `<city_id>` everywhere: lowercase `snake_case` (e.g. `mexico_city`,
`new_york_city`). It's the key in all four maps.

## Deriving the livery from the photo

1. **View the image.** If it's a URL, download it to the scratchpad first
   (`curl -sL <url> -o <scratchpad>/bike.<ext>`) and Read that file — color
   sampling needs the actual pixels, which a bare URL doesn't give you. Read the
   bike side-on, front wheel to the right.
2. For each of the 11 bike-part keys above, pick a hex sampled from the photo.
   Practical conventions from existing cities:
   - `frameDark` ≈ the frame color darkened ~20–30%.
   - When a part reads black in the photo, use `#1a1a1a`/`#1b1b1b`, not pure black.
   - `saddle` `#1b1b1b`, `tire` `#1a1a1a`, `spoke` `#c8cbce`, `hub` `#7a7a7a` are the
     usual defaults unless the photo clearly differs.
   - `wheelRim` is often a cream/silver (`#ece8df`, `#c4c7ca`) — check the photo.
3. Pick `basketType` from the front carrier: `wire` (open mesh), `box` (solid
   cargo box), `rack` (flat tubular rack — the default), `none`.
4. Pick `downTube` if the frame's down-tube sweep is distinctive: `lyft` (Lyft
   e-bikes), `nordic` (Urban Sharing bikes — Oslo/Bergen/Trondheim), else omit.
5. Choose the `skirtGuard` (next section).

## Skirt guard

The rear panel is a named `SkirtType` with inline SVG paths in
[Skirt.tsx](../../../src/app/components/Biker/Skirt.tsx): `halfDisc`, `LEVEL_1`,
`LEVEL_2`, `9_1_CIRCLE`, `10_3_CIRCLE`, `11_3_CIRCLE`, `FIN`, `CRESCENT`,
`OUTER_GUARD_150`.

- **Match first.** If the photo's rear panel resembles one of these, use it. State
  your reading to the user ("BiciMAD has a small red crescent → `CRESCENT`").
- **No branded panel?** Use a bare fender rib: `skirtGuard: { type: 'CRESCENT',
color: <fender> }` or `{ type: 'OUTER_GUARD_150', color: '#1a1a1a' }`, matching how
  Paris/Seoul/DC handle fender-only bikes.
- **Distinctive new shape?** Invoke the **`skirt-guard-sketch`** skill to design and
  render a new SVG, then add the new `SkirtType` (a `PATHS` entry, scaled to the real
  wheel R=18 @ (66,87) — the sketch space is R=70 @ (100,100), scale by 18/70).

If the construction is ambiguous, **ask** (AskUserQuestion) rather than guess.

## CSV row format

Column order (header is the first line of the file):

```
city_id,city,system_name,operator,image_type,source_url,confidence,basket_type,frame,frame_dark,front_fender,basket,skirt_type,skirt_guard,saddle,tire,rim,spoke,hub,ring,crank,accent,details
```

- `city` = display name; `system_name`/`operator` = the real bikeshare brand.
- `image_type` = e.g. `side-photo`, `product-render`, `side-photo (station)`.
- `source_url` = same public URL used in `bikeImages.ts`.
- `confidence` = `high` | `medium` | `low` (how sure the livery reading is).
- Color columns mirror the config; `rim` = `wheelRim`. `accent` is a documentation
  extra (a notable secondary color) with no config equivalent — pick the standout
  accent or repeat the skirt color.
- `details` = a quoted sentence: brand, colors, and any caveats (e.g. a defaulted
  skirt type, a watermarked photo). Quote fields containing commas.

## Verify

- `npx tsc --noEmit` (clean == good).
- Optionally run the app and open `/bikes/all` to eyeball the new bike against the
  photo; iterate on colors/skirt.

## Process

1. Get the **city name** and **image** (a URL or a local path; if local, also get a
   public image URL to store). Derive the `city_id` and confirm it isn't already
   configured.
2. **View the image** and derive livery colors, `basketType`, `downTube`, and the
   skirt guard per the sections above. Describe your reading back to the user.
3. Edit the four core files (+ `Skirt.tsx` only if a new guard type is needed).
4. Run `npx tsc --noEmit`; offer to open `/bikes/all` to verify visually.
