import { ENV, funcArg } from './_env.js'
import { getFuncLogs } from './utils/lambda-logs.js'

// console.info('logs')

const workload = ENV.workload
const func = funcArg()
const workload_func = `${func}-${workload}`

const logs = await getFuncLogs(workload_func, {})

for (const log of logs) {
  console.info(log)
}
