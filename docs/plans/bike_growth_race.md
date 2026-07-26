# Bike Growth Timeline Race Chart

Goal: an engaging bar-chart **race** of cumulative bikeshare growth across global
cities. **Status: implemented** at `src/pages/visualizations/bike_growth_race.tsx`
→ `src/app/components/charts/BikeGrowthRace/`. This doc reflects the built system;
where the original plan evolved during the build, it's noted inline.

## Requirements (original)

1. Horizontal bar chart, one row per city.
1. Monthly increment, continuous growth (not a sudden jump each month).
1. Starts in the year the first city has data; may begin with a single city.
1. Cities join the chart when they get their first ride.
1. `Biker.tsx` rides at the end of each bar, pedalling at that month's growth rate.
1. Top 12 cities shown at a time; cities can drop off and swap places on overtake.
1. Data comes from `…/analysis/<city>/visuals.json` (same source as `useAllTimeTrips`).

> **Evolved during the build:** the original "bars are relative to the current
> leader" rule made the leader look permanently finished. It was replaced by a
> **milestone goal axis** (below) — each segment is a distinct race to a fixed
> line. This is the single biggest departure from the original plan.

## Key decisions (as built)

- **Bar metric:** cumulative total trips since a city's launch (monotonic).
- **X-axis:** fixed at the **current milestone goal**, not the leader. The race
  steps through `[1M, 10M, 50M, 100M, 200M, 300M, 400M]` (see §6). Bars are `value
  / goal`, so each segment is a real "race to the line."
- **Engine:** rolled our own — a `requestAnimationFrame` clock plus imperative
  DOM updates. No new dependencies (`d3` already present, used only for the biker
  speed scale).
- **City set:** all configured `systems` are eligible; the top-12 window emerges
  from the data each frame.
- **Playback:** play/pause, timeline scrubber (with year ticks), speed
  multiplier (0.5×/1×/2×/4×), replay at the end.
- **Final-month cap:** the race runs only to and including `FINAL_MONTH`
  (currently **Dec 2025**); see §8.

## Building blocks reused

- `useAllTimeTrips()` / `fetchAllTimeTrips()` — fetches every city's
  `visuals.json` in parallel (memoized) → `AllTimeCityTrips[]` with
  `months: [{ year, month, trips }]`. **No data-layer changes**; the race
  augments this in memory (see §7).
- `Biker` (`components/Biker`) — `speed` prop in rad/frame (`DEFAULT_SPEED` in
  `geometry.ts`), cropped `viewBox`; `CITY_BIKE_CONFIG` per-city liveries;
  `systems` for `metroArea` labels.
- The click-to-open info icon + outside-click-close pattern from
  `AllTimeTripsBar` — reused for the "data ends" marker.

## Architecture

### 1. Timeline model — `buildRaceTimeline.ts` (pure)

`buildRaceTimeline(data, finalMonth?)` → `{ months, cities: RaceCity[] }`.

- **Month axis:** earliest→latest `(year, month)` across all cities, capped at
  `finalMonth` when given. `monthIndex` (0-based) is the clock's unit.
- Each `RaceCity` has `firstIndex`, `lastIndex` (its **true** last data month —
  may sit *beyond* a capped axis, so a city still reporting past the cap is never
  marked exhausted), `cumulative[]` (running total; `undefined` before it joins,
  flat after `lastIndex`; index `firstIndex-1` seeded to 0 so it ramps in rather
  than pops in), and `monthlyTrips[]` (0 for gaps/pre-join/post-exhaust).
- Cities that only launch after the cap are dropped.
- Interpolation helpers: `valueAt(c, t)` lerps cumulative within a month;
  `growthAt(c, t)` is the current month's trips (constant within a month → drives
  biker cadence; changes only at month boundaries).

### 2. Milestones — `milestones.ts` (pure)

- `leaderValueAt(cities, t)` — the max cumulative across all cities (the leader,
  whoever it is).
- `computeMilestoneTimes(cities, MILESTONES, maxT)` — one forward pass returning
  the (fractional) time the leader first reaches each milestone. Drives the goal
  axis, the playback holds, and the finish. `Infinity` for never-reached goals.
- `goalIndexAt(t, times)` — the active goal index at time `t` (count of
  milestones reached, clamped).
- `firstCrossing(prev, t, times)` — the milestone crossed in `(prev, t]`, or -1.
  The half-open interval means held/seeked frames never re-trigger.

### 3. Clock — `useRaceClock.ts`

rAF loop advancing `t += dt * monthsPerSecond`. API: `tRef` (per-frame reads
without re-render), `playing`, `play`/`pause`/`seek`, `onEnd` (at `maxT`), and
**`hold(ms)`** — freezes time without changing `playing`, repainting the frozen
frame, then calling `onHoldEnd`. Default pace `DEFAULT_MONTHS_PER_SEC = 2`
(the whole race ≈ 1.5 min at 1×); speed buttons scale it.

### 4. Rendering strategy (performance)

Everything continuous is **imperative** (via refs), so React re-renders are rare:

- **Every frame:** bar widths, value labels, the month/year readout, the goal
  label, the top-axis ticks, and the scrubber position — all set on refs. No CSS
  width transition (rAF already interpolates).
- **On month change (state):** biker `speed` props and the exhausted flags.
- **On rank-order change (state):** rows are keyed by city and absolutely
  positioned at `translateY(rank * ROW_HEIGHT)` with a `transform` transition, so
  a swap slides while widths keep updating imperatively.

### 5. Biker speed — `speed.ts`

`makeSpeedScale(referenceGrowth)` maps a month's growth rate → biker cadence with
`d3.scaleSqrt` (small systems still visibly pedal), clamped to
`[MIN_SPEED, MAX_SPEED]` around the biker's `DEFAULT_SPEED`. `referenceGrowth` is
a fixed high percentile of monthly trips (stable across the race). Exhausted /
paused / scrubbing → `paused` bikers.

### 6. Milestone goal axis + rescale choreography

Bars are `value / currentGoal` (capped at `BAR_MAX_PCT`). When the leader reaches
the current goal, the clock **freezes and runs a three-beat transition** (each
1 s: `REACHED_MS`, `EASE_MS`, `HOLD_MS`), driven imperatively from a `transition`
ref while `t` is clamped to the crossing:

1. **Reached** — hold at the line, leader's bar full, label shows the goal reached.
2. **Ease** — the axis eases open from the reached goal to the next
   (`smoothstep`); every bar shrinks smoothly into the new scale. The top-axis
   intermediate ticks fade out and a single "traveler" max marker peels off the
   old right edge and slides to its home on the new scale.
3. **Hold** — new-scale ticks fade in, traveler crossfades out; a beat to
   re-orient before resuming.

The **final goal (400M)** is a finish line: it's crossed *without* a hold
(`k < MILESTONES.length - 1` in the crossing check) and the winning bar is allowed
to overshoot past `BAR_MAX_PCT` up to `BAR_HARD_MAX_PCT` (88%).

### 7. Historical backfills — `backfill.ts` (+ per-city loaders)

Some cities have pre-`visuals.json` history available only as **annual** totals.
These are folded into the race in memory (race-only; other charts are untouched)
via a small config-driven pipeline:

```
BACKFILLS = [
  { city: 'taipei',   mode: 'sum',  load: loadYouBike1 },      // youbike1.ts
  { city: 'montreal', mode: 'fill', load: loadMontrealBixi },  // montrealBixi.ts
]
```

- **`mode: 'sum'`** — a distinct co-running system; overlapping months add
  (Taipei YouBike 1.0 ran alongside 2.0).
- **`mode: 'fill'`** — the same system extended backward; real months always win,
  the backfill only fills months with no real data (Montreal BIXI pre-2014).
- `useBackfills()` loads all in parallel (a failure is logged and skipped, never
  blocking the race); `applyBackfills(trips, byCity)` merges each into its city.
- Only **raw official figures** are stored (in `public/data/`); every monthly
  value is derived at load time — nothing pre-computed is saved:
  - `taipei_youbike_1.0.json` (annual) + `taipei_youbike_1.0_2021_monthly.json`
    (reported Apr–Dec 2021). `expandYouBike1`: 2012 = December only; 2013–2020 =
    annual/12; 2021 = reported months + Jan–Mar as the averaged remainder.
    Result: Taipei ≈ **414M** (197M 1.0 + 216M 2.0) → **wins the race**.
  - `montreal_bixi_backfill.json` (annual 2009–2013, with sources/notes as
    provenance). `expandMontrealBixi`: annual spread across the **operating
    season** only (Apr–Nov; May–Nov in 2009), matching BIXI's seasonal data.
    Result: Montreal **joins in May 2009 and leads the early race** (1M, 10M)
    before Taipei takes over in 2014.

A footnote under the chart discloses both estimates.

### 8. Final-month cap — `FINAL_MONTH`

`buildRaceTimeline(augmentedTrips, FINAL_MONTH)` caps the axis at (and including)
`FINAL_MONTH` (currently Dec 2025; set `null` for the latest available month).
Because each city keeps its true `lastIndex`, cities still reporting past the cap
stay "live" (no exhausted marker) — only cities that genuinely stopped earlier
(e.g. Seoul, Jun 2025) get one. Handy side effect: the race **finishes on the
winner** — Taipei crosses 400M right around Dec 2025 instead of trailing on with
frozen bars.

### 9. Exhausted-city marker — `RaceRow.tsx`

When `monthTick ≥ lastIndex`, the row shows a red info marker (filled dot + "i",
not color alone) with an `aria-label`; clicking opens a "Data ends MMM YYYY"
popover, and the biker parks. Reuses the `AllTimeTripsBar` popover pattern +
outside-click-close.

## File map

```
src/pages/visualizations/bike_growth_race.tsx   # page shell
src/app/components/charts/BikeGrowthRace/
  index.tsx            # orchestrator: data → timeline → clock → imperative paint + rows + axis
  buildRaceTimeline.ts # pure timeline model (+ optional finalMonth cap), valueAt/growthAt
  milestones.ts        # leaderValueAt, computeMilestoneTimes, goalIndexAt, firstCrossing
  useRaceClock.ts      # rAF clock: play/pause/seek/hold, onEnd/onHoldEnd
  speed.ts             # growthRate → biker cadence (d3.scaleSqrt)
  RaceRow.tsx          # one city: name (+ exhausted marker) + bar + Biker + value
  barColor.ts          # bar fill derived from the city's Biker livery
  Controls.tsx         # play/pause, scrubber + year ticks, speed buttons, replay
  backfill.ts          # generalized backfill config + merge (sum/fill) + useBackfills
  youbike1.ts          # Taipei YouBike 1.0 loader/expander
  montrealBixi.ts      # Montreal BIXI loader/expander (season-aware)
  constants.ts         # sizes, timing, MILESTONES, FINAL_MONTH, formatters
public/data/
  taipei_youbike_1.0.json, taipei_youbike_1.0_2021_monthly.json
  montreal_bixi_backfill.json
```

## Open items / follow-ups

- **Adding a backfill** is now a one-liner: a loader + a `{ city, mode, load }`
  entry. New estimates should keep raw figures in `public/data/` and expand at
  load time.
- **Milestone ladder** is tuned for the current data (Taipei ≈ 414M). If totals
  change materially, re-check pacing and the 400M finish in `constants.ts`.
- **`FINAL_MONTH`** is a config constant; could be exposed as an in-chart control.
- **Partial trailing month** is still not trimmed (kept simple); a value-based
  trim could be added to the timeline model later.
- **Initial load** fetches all cities' `visuals.json` + the backfill files (~8 s);
  a nicer progress state could replace the plain "Loading…".
```
