import { ENV } from './_env.js'
import { checksumCrc64Nvme } from './utils/crc64nvme.js'
import { s3checksum } from './utils/s3checksum.js'
import { s3upload } from './utils/s3upload.js'
import { deployFunc } from './utils/lambda-codeupdate.js'
import { getFunc } from './utils/lambda-get.js'
import { getFuncLogs } from './utils/lambda-logs.js'

const bucketName = ENV.s3Bucket
const func = 'func1'
const objectKey = `${ENV.lambdaVersion}/${func}.zip`
const zipFile = `dist/packages/${func}.zip`

// const checksum_s3_upload = await s3upload(bucketName, objectKey, zipFile)
// console.info(`${zipFile} upload checksum for s3: ${checksum_s3_upload}`)

// const checksum_s3_get = await s3checksum(bucketName, objectKey)
// console.info(`${zipFile} get checksum from s3: ${checksum_s3_get}`)

// const checksum_local = await checksumCrc64Nvme(zipFile)
// console.info(`${zipFile} get checksum in local: ${checksum_local}`)

// const lambdaGetResult = await getFunc('func1')
// console.info(`lambda get result: ${JSON.stringify(lambdaGetResult, null, 2)}`)

// const lambdaDeployResult = await deployFunc('func1', bucketName, objectKey)
// console.info(`lambda deploy result: ${JSON.stringify(lambdaDeployResult, null, 2)}`)

const logs = await getFuncLogs('func1-poc', {})

for (const log of logs) {
  console.info(log)
}
