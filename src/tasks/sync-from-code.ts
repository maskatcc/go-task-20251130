import fs from 'node:fs'
import { ENV, funcArg } from './_env.js'
import { getFunc } from './utils/lambda-get.js'
import { ResourceNotFoundException } from '@aws-sdk/client-lambda'

// console.info('sync from code')

const workload = ENV.workload
const workload_func = `${funcArg()}-${workload}`
const hashFile = `dist/deploys/${workload}/${workload_func}.codesha256`

let codeSha256: string | undefined = undefined

try {
  const getResult = await getFunc(workload_func)
  codeSha256 = getResult.Configuration?.CodeSha256
}
catch (error: any) {
  if (error instanceof ResourceNotFoundException) {
    console.info(error.message)
  }
  else {
    throw error
  }
}

if (codeSha256) {
  // func deployed (maybe created by others)
  if (!fs.existsSync(hashFile)) {
    fs.mkdirSync(`dist/deploys/${workload}`, { recursive: true })
    fs.writeFileSync(hashFile, codeSha256)
    console.info(`[lambda sync] create codesha256 in local deploys: ${hashFile}`)
  }
  // func code changed (maybe updated by others)
  else if (fs.readFileSync(hashFile, 'utf-8') !== codeSha256) {
    fs.writeFileSync(hashFile, codeSha256)
    console.info(`[lambda sync] update codesha256 in local deploys: ${hashFile}`)
  }
}
else {
  // func removed (maybe deleted by others)
  if (fs.existsSync(hashFile)) {
    fs.rmSync(hashFile, { force: true })
    console.info(`[lambda sync] delete codesha256 in local deploys: ${hashFile}`)
  }
}
