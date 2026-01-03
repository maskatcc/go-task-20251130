export function parseNumber(value: string | undefined): number | undefined {
  if (value) {
    const num = Number(value)

    if (!isNaN(num)) {
      return num
    }

    console.warn(`invalid number value: ${value}`)
  }
}

export function parseTrue(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true'
}
