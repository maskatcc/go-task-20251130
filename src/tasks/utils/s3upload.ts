import { Upload } from '@aws-sdk/lib-storage'
import { S3ClientFactory } from './awsclient.js'
import { checksumCrc64Nvme } from './crc64nvme.js'
import { ProgressBar } from './progressbar.js'

export async function s3upload(
  bucketName: string, 
  objectKey: string, 
  objectBody: Buffer
): Promise<string | undefined> {
  const progressBar = new ProgressBar(`uploading '${objectKey}' to '${bucketName}'`)

  try {
    const checksum = await checksumCrc64Nvme(objectBody)

    const upload = new Upload({
      client: S3ClientFactory.create(),
      params: {
        Bucket: bucketName,
        Key: objectKey,
        Body: objectBody,
        ChecksumAlgorithm: 'CRC64NVME',
        ChecksumCRC64NVME: checksum,
      },
    })

    upload.on("httpUploadProgress", ({ loaded, total }) => progressBar.update(loaded, total))

    await upload.done()

    return checksum
  }
  catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`s3 multipart upload was aborted. ${error.message}`)
    }
    else if (error instanceof Error) {
      console.error(`s3 upload failed. ${error.message}`)
    }
    else {
      console.error(`s3 unknown error. ${error}`)
    }
  }
}
