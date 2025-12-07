import fs from 'fs'
import { ENV } from './_env.js'

// console.info('upload')

const funcArgIndex = 2
const func = process.argv[funcArgIndex]
const bucketName = ENV.s3Bucket

if (process.argv.length < funcArgIndex + 1) {
  console.error('func arg not found.')
  process.exit(1)
}

const localPackageFile = `dist/packages/${func}.zip`

if (!fs.existsSync(localPackageFile)) {
  console.error(`func package '${localPackageFile}' not found.`)
  process.exit(1)
}

const s3BucketDir = `.s3/${bucketName}`
const localUploadDir = `dist/uploads`

fs.mkdirSync(s3BucketDir, { recursive: true })
fs.copyFileSync(localPackageFile, `${s3BucketDir}/${func}.zip`)

fs.mkdirSync(localUploadDir, { recursive: true })
fs.copyFileSync(localPackageFile, `${localUploadDir}/${func}.zip`)

console.info(`upload successful!`)
