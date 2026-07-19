---
name: bikeshare-facts
description: >-
  Research and compile fun facts, a balanced news timeline, and an innovations
  rundown for each city's bikeshare system tracked in this project, writing to
  docs/bikeshare-fun-facts.md. Use when the user wants to gather, add, or refresh
  bikeshare facts, press coverage, or innovations for one or more cities. Encodes the
  canonical city list, per-city fact counts, native-language sourcing with language
  tags, inline per-fact citation format, the themed News & Press structure (including
  big single-day mobility events), the per-city Innovations section (tech, hardware,
  policy firsts), and the rule that news must be spread across the system's whole
  lifecycle as a timeline (never clustered at launch or the present).
---

# Bikeshare facts & news timeline

Compile three kinds of content for the bikeshare systems this project tracks:

1. **Fun Facts** — encyclopedic facts (history, rollout, special events, records,
   quirks), each with an inline source.
2. **News & Press** — a per-city, theme-tagged **timeline** of the biggest local news
   stories across the system's entire life.
3. **Innovations** — per-city technological, hardware, and policy firsts that made the
   system distinctive.

Everything is written to **`docs/bikeshare-fun-facts.md`** in that order (Fun Facts,
then News & Press, then Innovations) as three top-level sections.

## Step 1 — Get the canonical city list

The authoritative set of cities is the record in **`src/app/constants/cities.ts`**
(26 as of writing). It is keyed by long name (e.g. `new_york_city`, `san_francisco`,
`washington_dc`) — the same keys `cityBikeConfig.ts` uses — and each entry carries a
short `id` (`nyc`, `sf`, `dc`) plus `metroArea` and `country`.

```bash
grep -oE '^  [a-z_]+:' src/app/constants/cities.ts   # top-level city keys
```

Notes on the other files:
- `docs/city-bike-colors.csv` maps each city → system name & operator (use it for that).
- `src/data/system_statistics.json` covers only **23** of the 26 (it omits `seoul`,
  `daejeon`, and `rosario`) and keys by the short `id`. Use it for ridership stats, but
  it is **not** the city list — some cities won't have stats-derived facts.

Group cities by region (US / Canada / Latin America / Europe / Asia). Label each entry
with its `id` in parentheses so it maps back to the app.

## Step 2 — Native language per city (use it for ALL searches for that city)

Search the **primary local language** of each non-English city, and tag every
non-English source inline with a language code.

| Language (tag) | Cities |
|---|---|
| English (no tag) | all US cities, Toronto, Vancouver, London |
| French `(FR)` | Montreal |
| Spanish `(ES)` | Mexico City, Guadalajara, Rosario |
| Norwegian `(NO)` | Oslo, Bergen, Trondheim |
| Finnish `(FI)` | Helsinki |
| Korean `(KO)` | Seoul, Daejeon |
| Chinese – Traditional `(ZH)` | Taipei |

Native-language sourcing surfaces local stories that never reach English press — it is
the point, not a nicety. Prefer **local papers, city/operator sites, and regional
outlets** over aggregators.

## Step 3 — Fun Facts section

- **US systems: 5 facts each. Non-US systems: 8 facts each** (the extra 3 sourced from
  native-language reporting).
- Cover a spread of: founding/history, the rollout, special events, records/milestones,
  and quirky details. Avoid five variations of the same stat.
- **Every fact ends with its own inline source:** `([Outlet](url))`, or
  `([Outlet (ES)](url))` for a non-English source.
- Keep facts one sentence where possible; bold the striking number or name.

## Step 4 — News & Press section (the timeline)

Structure: **one subsection per city**, entries **tagged by theme** and laid out as a
**chronological timeline**.

### Themes to tag (in priority order)

1. **Special events** — valet programs, station closures/relocations for
   marathons/parades/protests, free-ride days during transit strikes or disasters.
2. **Big-day surges** — single-day events where the bikeshare moved a huge crush of
   people: FIFA World Cup / big matches, major concerts, New Year's Eve, festivals,
   fireworks, election or championship days. Capture the **record single-day ridership**
   and how the system coped (extra rebalancing, temporary docks, etc.).
3. **Conflicts** — parking/space fights, station-siting NIMBY pushback,
   operator/contract disputes, lawsuits, labor actions.
4. **Economics** — fare hikes, low-income / free-ridership plans, sponsorship changes,
   subsidy debates, surge-pricing complaints.
5. **COVID surge & labor** — 2020–21 pandemic ridership swings; rebalancing gig work
   and gamified programs (e.g. Citi Bike's "Bike Angels").
6. **Culture & competition** — proposals/weddings, film/TV cameos, celebrity or mayoral
   first rides, art wraps, and scooter/dockless market fights.

> Themes 1–4 are the core. Include 5 and 6 **only when a city has real coverage** —
> don't force them. (Safety/e-bike-recall and theft/vandalism/weather stories are
> intentionally **out of scope** unless the user reinstates them.)

### The timeline-balance rule (most important)

**Do not cluster stories at the launch or at the present day.** A system that launched
in 2013 should have coverage from the early years, the middle years, and recently —
not ten launch headlines and nothing since.

Method:
1. Establish the system's lifespan: **launch year → now**.
2. Divide it into rough **eras** (e.g. *Rollout* · *Growth/expansion* · *Mid-life
   shifts* · *Recent*). For a very old system use more eras; for a young one, fewer.
3. For **each era**, find the **~2 biggest / most-covered stories** (across any theme).
4. There is **no cap** on total articles — note as many strong ones as you find, but
   the distribution across eras matters more than the raw count. If one era is thin,
   say so rather than back-filling with launch or present-day stories.

### Entry format

Order entries **oldest → newest**. Prefix each with its date and a theme tag:

```markdown
### <City> — <System> (`city_id`)

- **2013 · Special event —** During the Tube strike, hires spiked to a single-day
  record as riders swapped the Underground for bikes. ([Outlet](url))
- **2016 · Big day —** New Year's Eve fireworks drove the busiest day of the year, with
  N,NNN rides. ([Outlet](url))
- **2018 · Economics —** Fare raised from £X to £Y, drawing rider backlash. ([Outlet](url))
- **2021 · Culture —** ... ([Outlet (ES)](url))
```

- Every entry gets a **date** (year, or `Mon YYYY` when known), a **theme tag**, a
  one-line summary, and an **inline source**.
- Non-English sources keep their language tag.

## Step 5 — Innovations section

Structure: **one subsection per city**, entries **tagged by innovation type**, with
inline (native-language) sources. Capture genuine **firsts or distinctive innovations**
— what was novel, and whether other systems copied it. If a city has nothing
noteworthy, say so in a line rather than padding.

### Innovation types to tag

1. **Tech** — hardware/software firsts: smart/GPS locks (e.g. Trondheim's self-designed
   hybrid lock), **solar-powered docks** (BIXI, Capital Bikeshare), app-based unlocking,
   RFID / transit-card integration, e-bike motor or battery-swap tech.
2. **Bike / hardware** — a physical bike unique to the city: self-designed frames,
   station-dispensed **helmets** (Mobi), cargo or adaptive variants, distinctive
   return/fault signals (YouBike's flip-the-saddle).
3. **Policy** — pricing/access firsts: novel fare structures, **transit-fare
   integration** (LA's TAP card, single-ticket schemes), **equity programs for
   marginalized groups** (Indego's $5 Access Pass + cash payment), deposit/membership
   models, or first-of-kind ownership/operating structures.

Many innovations overlap facts already collected — **cross-reference, don't duplicate
verbatim**; frame them here as innovations (what made it novel, who adopted it later).

### Entry format

```markdown
### <City> — <System> (`id`)

- **Tech —** First large-scale system to power its stations entirely by **solar**, so
  docks could be sited anywhere without grid wiring — later widely copied. ([Outlet](url))
- **Policy —** **$5 Access Pass** plus a cash-payment option for low-income riders, an
  early US equity model. ([Outlet](url))
```

## Step 6 — Write & verify

- Append/merge into `docs/bikeshare-fun-facts.md`; keep the existing header,
  region grouping, and the closing provenance note ("Compiled from public web
  sources, <month year>…").
- Spot-check that no city's news is all-launch or all-recent (the balance rule).
- Confirm the city set still matches `cities.ts` (26 cities) before finishing.

## Efficiency notes

- Batch WebSearch calls (several cities in parallel) rather than one at a time.
- One well-phrased query can span multiple themes, e.g.
  `"<system> fare increase backlash valet program station closed protest"`.
- Reuse facts already in the doc; don't re-research what's cited.
