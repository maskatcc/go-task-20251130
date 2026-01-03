import {
  FilterLogEventsCommand, 
  type FilterLogEventsCommandOutput
} from '@aws-sdk/client-cloudwatch-logs'

import { styleText } from 'node:util'
import { ENV } from '../_env.js'
import { formatDateTime_with_age } from './date.js'
import { parseLambdaReport } from './lambda-regex.js'
import { CloudWatchLogsClientFactory } from './awsclient.js'

const Default = {
  recentHours: 8,    // last 8 hours
  requestLimit: 10,  // limit 10 requests
}

export type FuncLogsOptions = {
  recentHours?: number | undefined
  requestLimit?: number | undefined
  filterPattern?: string | undefined
}

export async function getFuncLogs(
  funcName: string,
  options: FuncLogsOptions = {}
): Promise<string[]> {
  const client = CloudWatchLogsClientFactory.create()
  const logGroupName = `/aws/lambda/${funcName}`
  const recentHour = options.recentHours ?? Default.recentHours
  const requestLimit = options.requestLimit ?? Default.requestLimit
  const dynamicFilterPattern = options.filterPattern ?  [options.filterPattern] : []
  const filterPatterns = [ ...ENV.logKeywords, ...dynamicFilterPattern ]

  const eventLogs: string[] = []
  let requestCount = 0
  let nextToken: string | undefined = undefined

  while (true) {
    const response: FilterLogEventsCommandOutput = await client.send(new FilterLogEventsCommand({
      logGroupName,
      startTime: Date.now() - Math.floor(recentHour * 60/*min*/ * 60/*sec*/ * 1000/*msec*/),
      limit: Math.min(requestLimit * 10, 10000),  // 要求リクエスト数の10倍のログ件数があれば足りると想定する
      nextToken,
    }))
    
    for (const event of response.events ?? []) {
      const datetime = formatDateTime_with_age(event.timestamp)
      const message = event.message?.trim() ?? ''
      const matchMessage = matchFilter(message, filterPatterns)

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

function matchFilter(message: string, patterns: string[]): string | undefined {
  if (patterns.length === 0) {
    return undefined
  }

  const flag = 'i' // 大文字・小文字を区別しない
  const regex = new RegExp(`(?<filter>${patterns.join('|')})`, flag)
  const match = message.match(regex)

  // フィルター条件にマッチした部分を強調表示して返す
  if (match && match.groups) {
    const matchingText = match.groups.filter!
    return message.replaceAll(matchingText, styleText('bgGray', matchingText))
  }
}