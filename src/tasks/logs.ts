import { ENV, funcArg, optionArg } from './_env.js'
import { parseNumber } from './utils/primitive.js'
import { getFuncLogs } from './utils/lambda-logs.js'

// console.info('logs')

const workload = ENV.workload
const func = funcArg()
const workload_func = `${func}-${workload}`

const recentHours = optionArg('recent-hours')
const requestLimit = optionArg('request-limit')
const filterPattern = optionArg('filter-pattern')

const logs = await getFuncLogs(workload_func, {
  recentHours: parseNumber(recentHours),
  requestLimit: parseNumber(requestLimit),
  filterPattern
})

for (const log of logs) {
  console.info(log)
}
