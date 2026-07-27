# Working notes for agents

How the maintainer likes to work, distilled from past sessions. Optimize for
these — they consistently matter more than shipping fast.

## Plan before implementing

- For anything non-trivial, **propose an approach first and wait** — don't jump
  straight to code. Requests are often explicitly "propose what might help, don't
  do it yet" or "propose a plan for doing so."
- Offer a **small menu of concrete options with trade-offs**; the maintainer
  picks (e.g. replies "1-3"). Give a clear recommendation, but let them choose.

## Readability is the top priority

- Continuously refactors for legibility. Expect requests to **split large
  functions into named, single-responsibility steps** and to **extract helpers,
  hooks, and components into their own files/folders** (`hooks/`, `components/`,
  small pure util modules).
- The ideal: a top-level function that reads as a **clear pipeline**
  (`prepare → bounds → build → assemble`), with the dense work in well-named
  helpers underneath.

## Naming is scrutinized closely

- **Functions lead with a verb**: `getX`, `buildX`, `computeX`, `groupX`,
  `handleX` for React handlers. Noun-named functions get flagged (e.g.
  `axisBounds → getAxisBounds`).
- **Variables are descriptive; no single letters** except sort comparators
  (`a, b`) and the unused-arg placeholder (`_`).
- **Vague names get called out** (`prepareCities` was "vague"). Names should say
  what the thing is/does. Explicitness wins: `monthOrdinal` over `dateOrdinal`,
  `byMonthOrdinal` over `byOrdinal`.

## Question complexity; prefer the simplest model

- The maintainer **pushes back on abstractions that don't earn their keep**
  ("Do you see value in keeping X and Y separate? Why not just use one?"). When
  two concepts can collapse into one, prefer that — keep the extra concept only
  when it prevents a real bug class.

## Understand the system before/around changing it

- Frequently asks **conceptual questions** ("what does the ordinal refer to?",
  "is each month precomputed or computed as it plays?"). Answer clearly and
  concretely, with small examples. Understanding is part of the work, not a
  detour.

## Pragmatic, not dogmatic

- Rules come with sensible exceptions ("descriptive variables **except in
  sorting**"). Apply conventions with judgment; keep genuinely conventional short
  names (`dt`, `ts`, `id`, `el`).
- Prefers **small, focused, iterative changes** over big rewrites. Preserve the
  maintainer's own in-progress edits rather than reverting them.

## Verifying

- Check work with `npx tsc --noEmit` (clean == good).
- `next lint` currently fails from a parent-directory `.eslintrc.cjs` (missing
  `@typescript-eslint` plugin) — that's environmental, unrelated to any change.
