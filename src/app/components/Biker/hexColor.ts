/** Split a #rgb or #rrggbb color into its 0–255 [red, green, blue] channels. */
export const parseHexChannels = (hex: string): [number, number, number] => {
  const hexDigits = hex.replace('#', '')
  const fullDigits =
    hexDigits.length === 3
      ? hexDigits
          .split('')
          .map((char) => char + char)
          .join('')
      : hexDigits
  return [
    parseInt(fullDigits.slice(0, 2), 16),
    parseInt(fullDigits.slice(2, 4), 16),
    parseInt(fullDigits.slice(4, 6), 16),
  ]
}
