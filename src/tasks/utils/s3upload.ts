import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { ProgressBar } from './progressbar.js'

export async function s3upload(bucketName: string, objectKey: string, objectBody: Buffer): Promise<void> {
  const progressBar = new ProgressBar(`uploading '${objectKey}' to '${bucketName}'`)

  try {
    const upload = new Upload({
      client: new S3Client({}),
      params: {
        Bucket: bucketName,
        Key: objectKey,
        Body: objectBody,
      },
    })

    upload.on("httpUploadProgress", ({ loaded, total }) => progressBar.update(loaded, total))

    await upload.done()
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
