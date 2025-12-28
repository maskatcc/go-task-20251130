import { S3Client } from '@aws-sdk/client-s3'
import { LambdaClient } from '@aws-sdk/client-lambda'
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs'

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

export class CloudWatchLogsClientFactory {
  static create(): CloudWatchLogsClient {
    return new CloudWatchLogsClient({})
  }
}
