import fs from 'node:fs'
import * as archiver from 'archiver'
import { funcArg } from './_env.js'

// console.info('package')

const func = funcArg()
const distFuncDir = `dist/funcs/${func}`
const distPackageDir = `dist/packages`
const distPackageFile = `${distPackageDir}/${func}.zip`

if (!fs.existsSync(distFuncDir)) {
  console.error(`func directory '${distFuncDir}' not found.`)
  process.exit(1)
}

if (!fs.existsSync(distFuncDir)) {
  console.error(`func directory '${distFuncDir}' not found.`)
  process.exit(1)
}

if (!fs.existsSync(distPackageDir)) {
  fs.mkdirSync(distPackageDir)
}

const zipArchiver = archiver.default('zip', {});
const streamWriter = fs.createWriteStream(distPackageFile);

streamWriter.on("close", () => console.log(`zip archive successful!`))
zipArchiver.pipe(streamWriter)
zipArchiver.glob(`*.js`, { cwd: distFuncDir })
zipArchiver.glob(`*.js.map`, { cwd: distFuncDir })
zipArchiver.finalize();
