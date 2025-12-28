export class LambdaReport {
  public constructor(
    public readonly requestId: string,
    public readonly durationMS: number,
    public readonly billedDurationMS: number,
    public readonly memorySizeMB: number,
    public readonly maxMemoryUsedMB: number,
    public readonly initDurationMS: number
  ) {}

  public toString(): string {
    const totalDuration = this.durationMS + this.initDurationMS
    const totalDuration_padded = totalDuration.toFixed(2).padStart(10, ' ')
    const initRate = this.initDurationMS / totalDuration * 100
    const initRate_padded = initRate.toFixed(0).padStart(3, ' ')
    const memoryUsedRate = this.maxMemoryUsedMB / this.memorySizeMB * 100
    const memoryUsedRate_padded = memoryUsedRate.toFixed(0).padStart(3, ' ')

    return `${this.requestId} ${totalDuration_padded} ms (init: ${initRate_padded} %)  mem: ${memoryUsedRate_padded} %`
  }

  public toRawString(): string {
    return `RequestId: ${this.requestId}, Duration: ${this.durationMS} ms, Billed Duration: ${this.billedDurationMS} ms, Memory Size: ${this.memorySizeMB} MB, Max Memory Used: ${this.maxMemoryUsedMB} MB, Init Duration: ${this.initDurationMS} ms`
  }
}

export function parseLambdaReport(message: string): LambdaReport | undefined {
  const reportRegex = /REPORT RequestId: (?<requestId>[\w-]+)\s+Duration: (?<duration>\d+\.\d+) ms\s+Billed Duration: (?<billedDuration>\d+) ms\s+Memory Size: (?<memorySize>\d+) MB\s+Max Memory Used: (?<maxMemoryUsed>\d+) MB/
  const match = message.match(reportRegex)

  if (!match || !match.groups) {
    return undefined
  }

  const initRegex = /Init Duration: (?<initDuration>\d+\.\d+) ms/
  const initMatch = message.match(initRegex)

  return new LambdaReport(
    match.groups.requestId ?? '',
    parseFloat(match.groups.duration ?? '0'),
    parseFloat(match.groups.billedDuration ?? '0'),
    parseFloat(match.groups.memorySize ?? '0'),
    parseFloat(match.groups.maxMemoryUsed ?? '0'),
    initMatch && initMatch.groups ? parseFloat(initMatch.groups.initDuration ?? '0') : 0
  )
}
