import { ENV } from './_env.js'
import { checksumCrc64Nvme } from './utils/crc64nvme.js'
import { s3checksum } from './utils/s3checksum.js'
import { s3upload } from './utils/s3upload.js'

const bucketName = ENV.s3Bucket
const func = 'func1'
const objectKey = `${ENV.lambdaVersion}/${func}.zip`
const zipFile = `dist/packages/${func}.zip`
const funcZip = Buffer.from(zipFile)

const checksum_s3_upload = await s3upload(bucketName, objectKey, funcZip)
console.info(`${zipFile} upload checksum for s3: ${checksum_s3_upload}`)

const checksum_s3_get = await s3checksum(bucketName, objectKey)
console.info(`${zipFile} get checksum from s3: ${checksum_s3_get}`)

const checksum_local = await checksumCrc64Nvme(funcZip)
console.info(`${zipFile} get checksum in local: ${checksum_local}`)
