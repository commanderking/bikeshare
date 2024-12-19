import systemStats from '@/data/system_statistics.json'
import { RawSystemData, SystemData } from '@/app/model/SystemStatistics'

const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        )
        acc[camelCaseKey] = toCamelCase(value)
        return acc
      },
      {} as Record<string, any>
    )
  }
  return obj
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', options)
}

const prepareCityData =
  (data: Record<string, RawSystemData>) =>
  (cityName: string): SystemData | null => {
    if (!(cityName in data)) return null

    const formattedData = toCamelCase(data[cityName]) as SystemData

    return {
      ...formattedData,
      firstTrip: formatDate(formattedData.firstTrip),
      lastTrip: formatDate(formattedData.lastTrip),
    }
  }

export const formatCitySystemData = prepareCityData(systemStats)
