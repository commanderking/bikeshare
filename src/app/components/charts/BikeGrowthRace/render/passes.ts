/**
 * The cities that overtook someone between two ranked orders — the ones that ring a
 * bell and wave. Each appears once however many places it gained.
 *
 * Only cities in *both* orders count. A city entering or leaving the visible field
 * displaces someone, but no overtake was watched on screen: the newcomer simply
 * appears at the bottom. Counting those would celebrate arrivals too.
 */
export const getPassers = (previous: string[], next: string[]): string[] => {
  const previousRank = new Map(previous.map((city, rank) => [city, rank]))
  const shared = next.filter((city) => previousRank.has(city))

  const passers: string[] = []
  for (let ahead = 0; ahead < shared.length; ahead++) {
    for (let behind = ahead + 1; behind < shared.length; behind++) {
      // `shared` is in the new order, so `ahead` outranks `behind` now. If it
      // didn't before, `ahead` did the passing.
      const wasAhead = previousRank.get(shared[ahead]) as number
      const wasBehind = previousRank.get(shared[behind]) as number
      if (wasAhead > wasBehind) {
        passers.push(shared[ahead])
        break
      }
    }
  }
  return passers
}
