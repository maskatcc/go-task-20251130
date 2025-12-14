import { GetFunctionCommand } from '@aws-sdk/client-lambda'
import { LambdaClientFactory } from './awsclient.js'

export async function getFunc(funcName: string) {
  const client = LambdaClientFactory.create()
  
  return await client.send(new GetFunctionCommand({
    FunctionName: funcName
  }))
}
