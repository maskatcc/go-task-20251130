import { UpdateFunctionCodeCommand } from '@aws-sdk/client-lambda'
import { LambdaClientFactory } from './awsclient.js'

export async function deployFunc(funcName: string, bucketName: string, objectKey: string) {
  const client = LambdaClientFactory.create()
  
  return await client.send(new UpdateFunctionCodeCommand({
    FunctionName: funcName,
    S3Bucket: bucketName,
    S3Key: objectKey,
  }))
}
