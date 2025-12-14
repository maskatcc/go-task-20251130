import fs from 'node:fs'
import { ENV, funcArg } from './_env.js'
import { s3checksum } from './utils/s3checksum.js'

// console.info('sync from repo')

const func = funcArg()
const bucketName = ENV.s3Bucket
const objectKey = `${ENV.lambdaVersion}/${func}.zip`
const hashFile = `dist/uploads/${objectKey}.checksum`

let checksum: string | undefined

if (ENV.s3Stub) {
  const s3Checksum = `.s3Stub/${bucketName}/${objectKey}.checksum`

  if (fs.existsSync(s3Checksum)) {
    checksum = fs.readFileSync(s3Checksum, 'utf-8')
  }
}
else {
  // sync from s3 (s3 bucket required)
  checksum = await s3checksum(bucketName, objectKey)
}

if (checksum) {
  // func created (maybe created by others)
  if (!fs.existsSync(hashFile)) {
    fs.mkdirSync(`dist/uploads/${ENV.lambdaVersion}`, { recursive: true })
    fs.writeFileSync(hashFile, checksum)
    console.info(`[s3 sync] create checksum in local uploads: ${hashFile}`)
  }
  // func changed (maybe updated by others)
  else if (fs.readFileSync(hashFile, 'utf-8') !== checksum) {
    fs.writeFileSync(hashFile, checksum)
    console.info(`[s3 sync] update checksum in local uploads: ${hashFile}`)
  }
}
else {
  // func removed (maybe deleted by others)
  if (fs.existsSync(hashFile)) {
    fs.rmSync(hashFile, { force: true })
    console.info(`[s3 sync] delete checksum in local uploads: ${hashFile}`)
  }
}
