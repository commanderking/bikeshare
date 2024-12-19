import StatsCard from './StatsCard'

type Props = {
  cities: string[]
}

const StatsCards = ({ cities }: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
      {cities.map((city) => {
        return <StatsCard key={city} city={city} />
      })}
    </div>
  )
}

export default StatsCards
