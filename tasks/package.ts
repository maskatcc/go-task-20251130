import fs from 'fs'
import { ZipArchive } from 'archiver'

// console.info('package')

const funcArgIndex = 2

if (process.argv.length < funcArgIndex + 1) {
    console.error('func arg not found.')
    process.exit(1)
}

const func = process.argv[funcArgIndex]
const distFuncDir = `dist/funcs/${func}`
const distPackageFile = `dist/packages/${func}.zip`

if (!fs.existsSync(distFuncDir)) {
    console.error(`func directory '${distFuncDir}' not found.`)
    process.exit(1)
}

const zipArchiver = zip.archiver.create('zip', {});
const streamWriter = fs.createWriteStream(distPackageFile);

streamWriter.on("close", () => console.log(`zip archive successful!`))
zipArchiver.pipe(streamWriter)
zipArchiver.glob('*.js')
zipArchiver.glob('*.js.map')
zipArchiver.finalize();
