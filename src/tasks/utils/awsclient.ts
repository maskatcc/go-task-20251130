import { LambdaClient } from '@aws-sdk/client-lambda'
import { S3Client } from '@aws-sdk/client-s3'

export class S3ClientFactory {
  static create(): S3Client {
    return new S3Client({})
  }
}

export class LambdaClientFactory {
  static create(): LambdaClient {
    return new LambdaClient({})
  }
}
