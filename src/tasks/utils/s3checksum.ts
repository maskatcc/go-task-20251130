import { S3ClientFactory } from './awsclient.js'

import {
  GetObjectAttributesCommand,
  NoSuchKey, 
  S3ServiceException,
} from '@aws-sdk/client-s3'

export async function s3checksum(
  bucketName: string, 
  objectKey: string
): Promise<string | undefined> {
  try {
    const client = S3ClientFactory.create()

    const response = await client.send(new GetObjectAttributesCommand({
      Bucket: bucketName,
      Key: objectKey,
      ObjectAttributes: [ 'Checksum' ],
    }))

    const checksum = response.Checksum

    if (checksum && checksum.ChecksumType === 'FULL_OBJECT') {
      return checksum.ChecksumCRC64NVME
    }
  }
  catch (error) {
    if (error instanceof NoSuchKey) {
      console.error(`s3 object '${objectKey}' in '${bucketName}' not found.`);
    }
    else if (error instanceof S3ServiceException) {
      console.error(`s3 object checksum get failed for ${bucketName}. ${error.name}: ${error.message}`)
    }
    else {
      console.error(`s3 unknown error. ${error}`)
    }
  }
}
