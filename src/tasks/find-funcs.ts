import fs from 'fs'
import path from 'path'

const funcsDir = './src/funcs'
const funcNames = fs.readdirSync(funcsDir).filter((name) => fs.statSync(path.join(funcsDir, name)).isDirectory())

for (const funcName of funcNames) {
  console.log(funcName)
}
