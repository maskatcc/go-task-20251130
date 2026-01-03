import {
  StartQueryCommand, 
  type StartQueryCommandOutput,
  GetQueryResultsCommand, 
  type ResultField, 
  QueryStatus,
} from "@aws-sdk/client-cloudwatch-logs";

import { styleText } from "node:util";
import { ENV } from "../_env.js";
import { formatDateTime } from "./date.js";
import { CloudWatchLogsClientFactory } from "./awsclient.js";

type FuncLogsInsightOptions = {
  recentDays?: number | undefined   // default: last 1 day
  filterPattern?: string | undefined
}

export async function getFuncLogsInsight(
  funcName: string,
  queryString: string = 'fields @timestamp, @message',
  options: FuncLogsInsightOptions = {}
): Promise<string[][]> {
  const client = CloudWatchLogsClientFactory.create()
  const logGroupName = `/aws/lambda/${funcName}`
  const recentDays = options.recentDays ?? 1
  let filter: string[] | undefined = undefined

  if (options.filterPattern !== undefined) {
    const adhocFilter = options.filterPattern.trim() ?? ''
    filter = adhocFilter ? adhocFilter.split(' ') : ENV.logKeywords
  }

  if (filter && filter.every(x => x !== '')) {
    queryString = `filter @message like /(?i)${filter.join('|')}/ | ${queryString}`
  }

  console.info(styleText('inverse', queryString.replace(/\n/g, ' ')))

  let queryResponse: StartQueryCommandOutput

  try {
    const nowSec = Math.floor(Date.now() / 1000)   // the number of seconds since 1970/1/1 UTC

    queryResponse = await client.send(new StartQueryCommand({
      logGroupName,
      startTime: nowSec - Math.floor(recentDays * 24/*hour*/ * 60/*min*/ * 60/*sec*/),
      endTime: nowSec,
      queryString,
      limit: 100,   // クエリー結果の上限は100件までとする
    }))
  }
  catch (error) {
    if (error instanceof Error) {
      console.error(`query failed. ${error.message}`)
    }
    else {
      console.error(`query unknown error. ${error}`)
    }
    return []
  }

  if (!queryResponse.queryId) {
    throw new Error('failed to query by logs insights.')
  }

  const { queryId } = queryResponse
  let status: QueryStatus = 'Scheduled'

  while (status === 'Running' || status === 'Scheduled') {
    const resultsResponse = await client.send(new GetQueryResultsCommand({ queryId }))

    if (!resultsResponse.status) {
      throw new Error('failed to get query status by logs insights.')
    }

    status = resultsResponse.status

    if (status === 'Failed' || status === 'Cancelled' || status === 'Timeout' || status === 'Unknown') {
      throw new Error(`failed to get query results by logs insights. status: ${status}`)
    }

    if (status === 'Complete') {
      if (!resultsResponse.results) {
        throw new Error('failed to get query results by logs insights.')
      }
      return makeOutput(resultsResponse.results)
    }

    await new Promise(resolve => setTimeout(resolve, 1/*sec*/ * 1000/*msec*/));
  }

  throw new Error(`failed to get query results by logs insights. status: ${status}`)
}

function makeOutput(results: ResultField[][]): string[][] {
  const output: string[][] = []
  const names = makeOutputNames(results)
  const valuesLines = makeOutputValues(results, names)

  output.push(names)

  for (const valuesLine of valuesLines) {
      output.push(valuesLine)
  }

  return output
}

function makeOutputNames(results: ResultField[][]): string[] {
  const headerLine: string[] = []

  if (results.length < 1 || !results[0]) {
      return headerLine
  }

  for (const row of results[0]) {
    if (row.field === '@ptr') {
      continue
    }
    headerLine.push(row.field ?? '')
  }
  
  return headerLine
}

function makeOutputValues(results: ResultField[][], names: string[]): string[][] {
  const valuesRows: string[][] = []

  for (const result of results) {
      const valuesRow: string[] = []

      for (const name of names) {
        const target = result.find(row => row.field === name)
        const value = (target?.value ?? '').trimEnd()

        if (target?.field === '@timestamp') {
          valuesRow.push(formatDateTime(new Date(value + 'UTC')))
        }
        else {
          valuesRow.push(value)
        }
      }

      valuesRows.push(valuesRow)
  }

  return valuesRows
}