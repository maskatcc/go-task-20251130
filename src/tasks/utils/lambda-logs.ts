import { FilterLogEventsCommand, type FilterLogEventsCommandOutput } from '@aws-sdk/client-cloudwatch-logs'
import { CloudWatchLogsClientFactory } from './awsclient.js'
import { parseLambdaReport } from './lambda-regex.js'
import { formatDateTime } from '../_env.js'

type FuncLogsOptions = {
  recentHours?: number   // default: last 8 hours
  requestLimit?: number  // default: 10
}

export async function getFuncLogs(
  funcName: string,
  options: FuncLogsOptions = {}
): Promise<string[]> {
  const client = CloudWatchLogsClientFactory.create()
  const logGroupName = `/aws/lambda/${funcName}`
  const recentHour = options.recentHours ?? 8
  const requestLimit = options.requestLimit ?? 10

  const eventLogs: string[] = []
  let nextToken: string | undefined = undefined

  while (true) {
    const response: FilterLogEventsCommandOutput = await client.send(new FilterLogEventsCommand({
      logGroupName,
      startTime: Date.now() - recentHour * 60/*min*/ * 60/*sec*/ * 1000/*msec*/,
      limit: Math.max(requestLimit * 10, 10000),  // 要求リクエスト数の10倍のログ件数があれば足りると想定する
      nextToken,
    }))
    
    for (const event of response.events ?? []) {
      const datetime = formatDateTime(event.timestamp)
      const message = event.message?.trim() ?? ''

      const report = parseLambdaReport(message)
      if (report) {
        eventLogs.push(`[${datetime}] ${report}`)
      }
    }

    nextToken = response.nextToken
    
    if (!nextToken || eventLogs.length >= requestLimit) {
      break
    }
  }
  
  return eventLogs
}
