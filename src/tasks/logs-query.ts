import { styleText } from 'node:util'
import { ENV, funcArg } from './_env.js'
import { getFuncLogsInsight } from './utils/lambda-logs-insight.js'

// console.info('logs-query')

const workload = ENV.workload
const func = funcArg()
const workload_func = `${func}-${workload}`

const query = optionArg('query', 'fields @timestamp, @message')
const recentDays = optionArg('recent-days', '1')
const filterPattern = optionArg('filter-pattern', '')
const noFilter = optionArg('no-filter', 'false')

const logsInsight = await getFuncLogsInsight(workload_func, query, {
  recentDays: tryNumber(recentDays),
  filterPattern: noFilter.toLowerCase() === 'true' ? undefined : filterPattern,
})

let count = 0

for (const logLine of logsInsight) {
  if (count++ === 0) {
    console.info(styleText('bold', logLine.join(', ')))
    continue
  }
  console.info(logLine.join(', '))
}

function tryNumber(value: string | undefined): number | undefined {
  if (value) {
    const num = Number(value)

    if (!isNaN(num)) {
      return num
    }

    console.warn(`invalid number value: ${value}`)
  }
}

function optionArg(name: string, defaultValue: string): string {
  const optionArgIndex = 3

  if (optionArgIndex < process.argv.length) {
    for (const arg of process.argv.filter((_, index) => optionArgIndex <= index)) {
      if (arg.startsWith(`--${name}=`)) {
        return arg.split('=')[1] ?? defaultValue
      }
    }
  }

  return defaultValue
}
