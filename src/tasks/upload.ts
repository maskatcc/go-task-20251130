import fs from 'node:fs'
import { ENV, funcArg } from './_env.js'
import { s3upload } from './utils/s3upload.js'
import { checksumCrc64Nvme } from './utils/crc64nvme.js'

// console.info('upload')

const func = funcArg()
const bucketName = ENV.s3Bucket
const packageFile = `dist/packages/${func}.zip`

if (!fs.existsSync(packageFile)) {
  console.error(`func package '${packageFile}' not found.`)
  process.exit(1)
}

const objectKey = `${ENV.lambdaVersion}/${func}.zip`
let checksum: string | undefined;

if (ENV.s3Stub) {
  checksum = await checksumCrc64Nvme(packageFile)

  fs.mkdirSync(`.s3Stub/${bucketName}/${ENV.lambdaVersion}`, { recursive: true })
  fs.writeFileSync(`.s3Stub/${bucketName}/${objectKey}.checksum`, checksum)
}
else {
  // upload to s3 (s3 bucket required)
  checksum = await s3upload(bucketName, objectKey, packageFile)
}

if (checksum) {
  console.info(`upload successful!`)

  fs.mkdirSync(`dist/uploads/${ENV.lambdaVersion}`, { recursive: true })
  fs.writeFileSync(`dist/uploads/${objectKey}.checksum`, checksum)
  console.info(`zip checksum-crc64nvme calculated.`)
}
