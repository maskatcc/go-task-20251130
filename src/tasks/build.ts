import fs from 'fs'
import path from 'path'
import esbuild from 'esbuild'

// console.info('build')

// for(var i = 0; i < process.argv.length; i++) {
//   console.log('argv[' + i + '] = ' + process.argv[i])
// }

const funcArgIndex = 2
const handlerArgIndex = 3

if (process.argv.length < funcArgIndex + 1) {
  console.error('func arg not found.')
  process.exit(1)
}

const func = process.argv[funcArgIndex]
const handler = process.argv.length >= handlerArgIndex + 1 ? process.argv[handlerArgIndex]! : 'index.ts'
const sourceDir = `src/funcs/${func}`
const distDir = `dist/funcs/${func}`

if (!fs.existsSync(sourceDir)) {
  console.error(`func directory '${sourceDir}' not found.`)
  process.exit(1)
}

const entryPoint = path.join(sourceDir, handler)

console.log('build for func: ' + entryPoint)

// esbuild - API
// https://esbuild.github.io/api/
const result = await esbuild.build({
  entryPoints: [ entryPoint ],
  outdir: distDir,
  platform: 'node',
  target: ['node22'],
  format: 'esm',
  mainFields: ['module', 'main'],     // ESMをCJSより優先する
  charset: 'utf8',
  bundle: true,
  external: [],                       // バンドル対象外を指定する
  minify: true,
  sourcemap: true,
  metafile: true,
})
.catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})

console.info('build successful!')
