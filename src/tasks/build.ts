import fs from 'node:fs'
import path from 'node:path'
import esbuild from 'esbuild'
import { funcArg } from './_env.js'

// console.info('build')

const func = funcArg()
const handler = 'index.ts'
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
  outExtension: { '.js': '.mjs' },    // 出力ファイルを.mjs（ESM）とする
})
.then(() => {
  console.info('build successful!')
})
.catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})
