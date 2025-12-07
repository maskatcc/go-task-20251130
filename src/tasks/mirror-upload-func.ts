import fs from 'fs'
import { ENV } from './_env.js'

// console.info('download')

const funcArgIndex = 2
const func = process.argv[funcArgIndex]
const bucketName = ENV.s3Bucket

if (process.argv.length < funcArgIndex + 1) {
  console.error('func arg not found.')
  process.exit(1)
}

const s3BucketDir = `.s3/${bucketName}`
const awsUploadFile = `${s3BucketDir}/${func}.zip`
const localUploadDir = `dist/uploads`
const localUploadFile = `${localUploadDir}/${func}.zip`

if (fs.existsSync(awsUploadFile)) {
  if (!fs.existsSync(localUploadFile)) {
    fs.mkdirSync(localUploadDir, { recursive: true })
    fs.copyFileSync(awsUploadFile, localUploadFile)
    console.info(`[s3 sync] create zip in local uploads: ${localUploadFile}`)
  }
  else {
    fs.copyFileSync(awsUploadFile, localUploadFile)
    console.info(`[s3 sync] update zip in local uploads: ${localUploadFile}`)
  }
}
else {
  if (fs.existsSync(localUploadFile)) {
    fs.rmSync(localUploadFile, { force: true })
    console.info(`[s3 sync] delete zip in local uploads: ${localUploadFile}`)
  }
}
