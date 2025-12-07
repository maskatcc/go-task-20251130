import fs from 'fs'
import * as archiver from 'archiver'

// console.info('package')

const funcArgIndex = 2

if (process.argv.length < funcArgIndex + 1) {
  console.error('func arg not found.')
  process.exit(1)
}

const func = process.argv[funcArgIndex]
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
