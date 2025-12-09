import { ENV } from './_env.js'
import { s3upload } from './utils/s3upload.js'

const func = 'func1'
const objectKey = `${ENV.lambdaVersion}/${func}.zip`
const zipFile = `dist/packages/${func}.zip`

await s3upload(ENV.s3Bucket, objectKey, Buffer.from(zipFile))
