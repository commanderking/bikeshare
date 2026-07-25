# Plan for Bike Growth Timeline Race Chart

Goal: Create an engaging Bike Race Chart for Bikeshare growth across global cities.

Let's take the top biking cities globally and show a race.

## Requirements (original)

1. Horizontal Bar Chart is the main format. Each row is a city.
1. Increment is monthly (2 seconds / month to start).
1. Growth each month must be visually represented as a continuous increase (not a sudden addition each month).
1. Starts in the year the first city has data. There may be only one city on the chart to start.
1. As cities launch (get their first bikeshare ride), they join the chart (at the next slot) below the already-established bikeshares.
1. At the right end of each bar we place `Biker.tsx` for that city, continuing to pedal. Biker speed depends on that month's growth rate.
1. The end of the chart is always the max of the city with the most trips; all bars are relative, so a bar can shrink and expand.
1. Only the top 12 cities are shown at a time. Cities can drop off.
1. As a city surpasses the count of a city above it, they swap places.
1. Data lives at `https://cdn.jsdelivr.net/gh/commanderking/citybikeshare@main/analysis/<city>/visuals.json` (same dataset/calls as `useAllTimeTrips`).

## Resolved decisions

- **Bar metric:** **Cumulative total trips** — a running sum of every trip since the city launched. Monotonic; the leader's total defines the chart max and all bars are drawn relative to it.
- **Engine:** **Roll our own**, extending the existing `all_time_trips` bar pattern. Add a `requestAnimationFrame` clock and d3 interpolation for smooth within-month growth. No new dependencies (`d3` is already installed). Third-party race libraries own their own render and can't host the animated `Biker` per-city liveries.
- **City set:** **All 26 configured `systems`** are eligible; the top-12 window emerges from the data each frame and changes as cities launch and overtake.
- **Controls:** Play/pause, timeline scrubber (drag to any month, shows month/year), speed control (months-per-second multiplier), and replay at the end.

## Building blocks we reuse

- `fetchAllTimeTrips()` / `useAllTimeTrips()` — already fetches every city's `visuals.json` in parallel (memoized), returning `AllTimeCityTrips[]` with `months: [{ year, month, trips }]` sorted chronologically. No data-layer changes needed.
- `Biker` (`src/app/components/Biker`) — takes a `speed` prop (radians/frame; `DEFAULT_SPEED` in `geometry.ts`) and a cropped `viewBox`.
- `CITY_BIKE_CONFIG` (`src/app/components/Biker/cityBikeConfig.ts`) — per-city livery (colors, basket, skirt guard, down tube). All 26 systems are configured.
- `systems` (`src/app/constants/cities.ts`) — `metroArea` labels, etc.
- FLIP / width-transition ideas from `charts/AllTimeTripsBar` — but the race uses a simpler absolute-position + `translateY` transition for swaps (see below), because we drive width imperatively every frame.
- `CityLabel` + the outside-click-close logic in `AllTimeTripsBar/index.tsx` — an existing click-to-open info icon + popover next to a city name. The "data ended" marker (below) reuses this pattern directly.

## Architecture

### 1. Timeline model (pure, testable) — `buildRaceTimeline.ts`

Transform `AllTimeCityTrips[]` into a frame-ready model:

- **Month axis:** find the earliest and latest `(year, month)` across all cities; build an ordered array `months: { year, month }[]`. `monthIndex` (0-based) is the clock's unit.
- **Per-city cumulative series** indexed by `monthIndex`:
  - `firstIndex` — the month index of the city's first row with data (when it "joins").
  - `lastIndex` — the month index of the city's last row with data (after which it is "exhausted"; see endpoints below).
  - `cumulative[i]` — running sum of trips up to and including month `i`. Undefined/absent before `firstIndex` (the city is not rendered until it joins). From `lastIndex` onward it holds flat at the city's final total.
  - `monthlyTrips[i]` — that month's trips (the growth rate; drives biker speed). Missing interior months carry the previous cumulative forward with `monthlyTrips = 0` so interpolation stays well-defined and gaps read as "coasting".
- Output: `{ months, cities: RaceCity[] }` where each `RaceCity` has `{ city, metroArea, firstIndex, lastIndex, cumulative, monthlyTrips }`.

**Ragged endpoints (resolved): keep all data, mark exhaustion.** Every city's feed ends at a different real month (e.g. Taipei ~Feb 2026, most US cities ~May, Mexico City ~June), and some end because the system genuinely shut down. We keep every city's full series and run the clock over the entire earliest→latest span rather than truncating to a shared "safe" month — truncation would discard recent data and hide real shutdowns. A city is **exhausted** at clock month `M` when `M > lastIndex`: its cumulative is already flat by construction, so the bar simply stops growing and (via `monthlyTrips = 0`) its biker stops pedaling. Exhaustion is surfaced honestly in the UI with a marker (see `RaceRow`), so a frozen bar reads as "data ended," not "declined." Interior gaps are *not* exhaustion — the city resumes, so it carries forward with no marker.

_Deferred:_ we are **not** trimming a partial trailing month for now. A feed whose last row is a stub (e.g. an export landing on the 1st of a month with a handful of trips) will show one flat month before the exhaustion marker appears. Acceptable for v1; a value-based trim can be layered into this model later without changing anything downstream.

### 2. Interpolation (continuous growth)

At clock time `t` (a float in monthIndex units): `M = floor(t)`, `frac = t - M`.
- `value(city, t) = lerp(cumulative[M], cumulative[M+1], frac)` → smooth, continuous increase.
- `growthRate(city, t) = cumulative[M+1] - cumulative[M]` = `monthlyTrips[M+1]` → constant within a month (step function), so biker speed only needs updating at month boundaries.

### 3. Clock — `useRaceClock.ts`

- `requestAnimationFrame` loop advancing `t += (dtSeconds * monthsPerSecond)`.
- `monthsPerSecond` default `0.5` (2 s/month); speed control scales it (0.5×/1×/2×/4×).
- State/API: `t` (via ref for per-frame reads), `playing`, `play()`, `pause()`, `seek(t)`, `setSpeed()`, and an `onEnd` when `t` reaches `months.length - 1` (stop + allow replay).
- Respects `prefers-reduced-motion`: no auto-run; scrubber still works, bikers render paused.

### 4. Rendering strategy (performance)

26 cities at 60 fps — avoid a React re-render every frame:

- **Every frame (imperative, via refs):** set each visible bar's `width` and value-label text; update the scrubber/progress position. No CSS width transition (rAF already interpolates smoothly).
- **On month change (React state `monthIndex`):** update each Biker's `speed` prop (growth rate is constant within a month) and the month/year readout, and toggle any city that just crossed `lastIndex` into the exhausted state (marker on, biker paused).
- **On rank-order change (React state):** compute the sort order each frame in the rAF; only `setState` when the actual top-12 order changes. Rows are keyed by city id and absolutely positioned at `translateY(rank * ROW_HEIGHT)` with a `transform` transition (~400 ms ease) — so a swap slides smoothly while widths keep updating imperatively. Cities entering the top 12 fade/slide in; cities dropping off fade out.

Net: React re-renders only on swaps and month boundaries (both rare vs. 60 fps); everything continuous is imperative.

### 5. Biker speed mapping — `speed.ts`

Map a city's current `growthRate` (trips/month) to a pleasant pedaling cadence. Use a `d3.scaleSqrt` (so small systems still visibly pedal) from `[0, referenceGrowth]` → `[MIN_SPEED, MAX_SPEED]` in rad/frame, anchored around `DEFAULT_SPEED`. `referenceGrowth` = a fixed high-percentile of monthly trips across the dataset (stable, not per-frame, so cadence is comparable across the race). Paused/scrubbing → `paused` bikers.

### 6. Chart max / relative bars

Each frame, `max = value(rank-1 city, t)`. Bar width % = `value / max`. Leader stays near full; others are relative shares, so a bar visibly shrinks as the leader pulls ahead (matches the "bars can shrink and expand" requirement). Cap the longest bar short of full width (reuse `BAR_MAX_PCT` idea) so the trailing biker always has room.

### 7. Exhausted-city marker

When a city passes its `lastIndex`, `RaceRow` shows an info marker next to the city name whose popover reads "Data ends MMM YYYY" (from the city's last month), and the city's biker renders `paused`. This reuses the existing `CityLabel` icon + popover pattern and the outside-click-close logic from `AllTimeTripsBar/index.tsx`. Design notes: don't encode meaning by color alone — pair any red tint with a distinct shape (info/finish-flag) and a descriptive `aria-label`; optionally also show an always-visible "ended MMM YYYY" gray sub-label (the row already supports `subLabel`) so it reads without a click on a moving chart.

## File-by-file plan

```
src/pages/visualizations/bike_growth_race.tsx      # route + page shell (mirrors all_time_trips.tsx)
src/app/components/charts/BikeGrowthRace/
  index.tsx            # orchestrator: hook -> timeline -> clock -> rows + controls
  buildRaceTimeline.ts # pure: AllTimeCityTrips[] -> { months, cities } (cumulative + monthlyTrips)
  useRaceClock.ts      # rAF clock: t, play/pause/seek/speed, onEnd
  RaceRow.tsx          # one city: label (+ exhausted marker) + bar + Biker, positioned by rank; width set via ref
  Controls.tsx         # play/pause, scrubber (month/year), speed buttons, replay
  speed.ts             # growthRate -> biker speed scale (d3.scaleSqrt)
  constants.ts         # timing, ROW_HEIGHT, TOP_N=12, MONTHS_PER_SEC, speed range, colors
```

Reused unchanged: `fetchAllTimeTrips`, `useAllTimeTrips`, `Biker`, `CITY_BIKE_CONFIG`, `systems`.

## Phased implementation

1. **Timeline model + tests.** `buildRaceTimeline.ts` with cumulative + monthly series, join indices, month axis, gap carry-forward. Sanity-check against a couple of real `visuals.json` payloads.
2. **Static frame.** Render the top-12 at a fixed `monthIndex` (no motion): label + relative bar + resting Biker. Validates layout, sizing, and livery wiring.
3. **Clock + continuous growth.** Add `useRaceClock`, drive bar widths imperatively each frame, add the month/year readout. Verify smooth within-month growth.
4. **Ranking swaps + join/drop.** Absolute `translateY` positioning by rank with transition; cities enter on launch, drop when they fall out of the top 12.
5. **Exhausted marker.** When a city passes `lastIndex`, show the "Data ends MMM YYYY" info marker and pause its biker (reuses the `CityLabel` icon/popover pattern).
6. **Biker speed.** Wire `growthRate` → `speed` at month boundaries; tune the scale so cadence reads well.
7. **Controls.** Play/pause, scrubber (seek + live position), speed multiplier, replay; wire reduced-motion.
8. **Polish.** Page copy/title, mobile sizing, `prefers-reduced-motion`, and a `/run` pass to confirm it works in the real app.

## Open questions / risks

- **Data volume & the earliest year.** The earliest city (likely an early-2010s US system, or Taipei-adjacent) sets `t=0`; with 2 s/month a 15-year span is ~6 min at 1×. The speed control and scrubber mitigate this, but we may want a higher default (e.g. 1–1.5 months/sec) — easy to tune in `constants.ts`.
- **Partial trailing month (deferred).** We keep all data for v1, so a feed whose last row is a partial/stub month (e.g. London's `2026-06 = 3 trips`) shows one flat month before its exhaustion marker. Accepted for now; a value-based trim can be added to `buildRaceTimeline.ts` later.
- **Very small early systems** may pedal too slowly; the sqrt scale + `MIN_SPEED` floor addresses this, but needs a visual tuning pass.
- **`metroArea` label width** on mobile for a 12-row stack — reuse the compact label column from `AllTimeTripsBar`.
```
