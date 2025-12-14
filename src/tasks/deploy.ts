import fs from 'node:fs'
import { ENV, funcArg } from './_env.js'
import { deployFunc } from './utils/lambda-codeupdate.js'
import { getFunc } from './utils/lambda-get.js'

// console.info('deploy')

const func = funcArg()
const workload = ENV.workload

if (!fs.existsSync(`dist/deploys/${workload}/${func}.codesha256`)) {
  console.error('lambda code sha256 not found. maybe func not created')
  process.exit(1)
}

const bucketName = ENV.s3Bucket
const objectKey = `${ENV.lambdaVersion}/${func}.zip`

const deployResult = await deployFunc(func, bucketName, objectKey)

// AWS Lambda関数の状態の追跡 | Amazon Web Services ブログ
// https://aws.amazon.com/jp/blogs/news/tracking-the-state-of-lambda-functions/
const deployState = deployResult.State
const deployUpdateStatus = deployResult.LastUpdateStatus
const deployMessage = `${deployResult.LastUpdateStatusReason} ${deployUpdateStatus}(${deployResult.LastUpdateStatusReasonCode})...`

if (deployState !== 'Active' || (deployUpdateStatus !== 'Successful' && deployUpdateStatus !== 'InProgress')) {
  throw new Error(deployMessage)
}

let codeSha256: string | undefined
let messageCache = deployMessage
const waitInterval = 200

process.stdout.write(deployMessage)

const wait = (msec: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, msec))
}

await wait(waitInterval)

let getResult = await getFunc(func)

while (true) {
  const state = getResult.Configuration?.State
  const updateStatus = getResult.Configuration?.LastUpdateStatus

  if (state === 'Active' && updateStatus === 'Successful') {
    codeSha256 = getResult.Configuration?.CodeSha256
    console.info(``)
    console.info(`lambda deploy successful!`)
    break
  }

  if (state !== 'Active' || updateStatus !== 'InProgress') {
    console.info(``)
    console.error(`unknown deploy error. ${getResult}`)
    break
  }

  const reasonCode = getResult.Configuration?.LastUpdateStatusReasonCode
  const reason = getResult.Configuration?.LastUpdateStatusReason
  const message = `${reason} ${updateStatus}(${reasonCode})...`

  if (message === messageCache) {
    process.stdout.write('.')
    await wait(waitInterval)
  }
  else {
    console.info(``)
    process.stdout.write(message)
    messageCache = message
  }

  getResult = await getFunc(func)
}

if (codeSha256) {
  fs.mkdirSync(`dist/deploys/${workload}`, { recursive: true })
  fs.writeFileSync(`dist/deploys/${workload}/${func}.codesha256`, codeSha256)
  console.info(`lambda code sha256 saved.`)
}