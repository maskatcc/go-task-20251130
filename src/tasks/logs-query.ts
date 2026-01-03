import { styleText } from 'node:util'
import { ENV, funcArg, optionArg } from './_env.js'
import { parseNumber, parseTrue } from './utils/primitive.js'
import { getFuncLogsInsight } from './utils/lambda-logs-insight.js'

// console.info('logs-query')

const workload = ENV.workload
const func = funcArg()
const workload_func = `${func}-${workload}`

const query = optionArg('query') ?? 'fields @timestamp, @message'
const recentDays = optionArg('recent-days')
const filterPattern = optionArg('filter-pattern')
const noFilter = optionArg('no-filter')

const logsInsight = await getFuncLogsInsight(workload_func, query, {
  recentDays: parseNumber(recentDays),
  filterPattern: parseTrue(noFilter) ? undefined : filterPattern,
})

let lineCount = 0

for (const logLine of logsInsight) {
  if (lineCount++ === 0) {
    console.info(styleText('bold', logLine.join(', ')))
    continue
  }
  console.info(logLine.join(', '))
}
