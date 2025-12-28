import { styleText } from 'node:util'
import { FilterLogEventsCommand, type FilterLogEventsCommandOutput } from '@aws-sdk/client-cloudwatch-logs'
import { CloudWatchLogsClientFactory } from './awsclient.js'
import { parseLambdaReport } from './lambda-regex.js'
import { formatDateTime } from '../_env.js'

type FuncLogsOptions = {
  recentHours?: number | undefined   // default: last 8 hours
  requestLimit?: number | undefined  // default: 10
  filterPattern?: string | undefined
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
  let requestCount = 0
  let nextToken: string | undefined = undefined

  while (true) {
    const response: FilterLogEventsCommandOutput = await client.send(new FilterLogEventsCommand({
      logGroupName,
      startTime: Date.now() - recentHour * 60/*min*/ * 60/*sec*/ * 1000/*msec*/,
      limit: Math.min(requestLimit * 10, 10000),  // 要求リクエスト数の10倍のログ件数があれば足りると想定する
      nextToken,
    }))
    
    for (const event of response.events ?? []) {
      const datetime = formatDateTime(event.timestamp)
      const message = event.message?.trim() ?? ''
      const matchMessage = matchFilter(message, options.filterPattern)

      if (matchMessage) {
        eventLogs.push(`[${datetime}] ${matchMessage}`)
      }

      const report = parseLambdaReport(message)

      if (report) {
        eventLogs.push(`[${datetime}] ${report}`)

        if (requestLimit <= ++requestCount) {
          return eventLogs
        }
      }
    }

    if (!response.nextToken) {
      break
    }

    nextToken = response.nextToken
  }
  
  return eventLogs
}

function matchFilter(message: string, pattern: string | undefined): string | undefined {
  if (!pattern) {
    return undefined
  }

  const flag = 'i' // 大文字・小文字を区別しない
  const regex = new RegExp(`(?<filter>${pattern})`, flag)
  const match = message.match(regex)

  // フィルター条件にマッチした部分を強調表示して返す
  if (match && match.groups) {
    const matchingText = match.groups.filter!
    return message.replaceAll(matchingText, styleText('bgGray', matchingText))
  }
}