import { ENV, funcArg } from './_env.js'
import { getFuncLogs } from './utils/lambda-logs.js'

// console.info('logs')

const workload = ENV.workload
const func = funcArg()
const workload_func = `${func}-${workload}`

const recentHours = optionArg('recent-hours')
const requestLimit = optionArg('request-limit')
const filterPattern = optionArg('filter-pattern')

const logs = await getFuncLogs(workload_func, {
  recentHours: tryNumber(recentHours),
  requestLimit: tryNumber(requestLimit),
  filterPattern
})

for (const log of logs) {
  console.info(log)
}

function tryNumber(value: string | undefined): number | undefined {
  if (value) {
    const num = parseInt(value)

    if (!isNaN(num)) {
      return num
    }

    console.warn(`invalid number value: ${value}`)
  }
}

function optionArg(name: string): string | undefined {
  const optionArgIndex = 3

  if (optionArgIndex < process.argv.length) {
    for (const arg of process.argv.filter((_, index) => optionArgIndex <= index)) {
      if (arg.startsWith(`--${name}=`)) {
        return arg.split('=')[1] ?? undefined
      }
    }
  }
}
