import fs from 'node:fs'
import { Buffer } from 'node:buffer'
import { CrtCrc64Nvme } from '@aws-sdk/crc64-nvme-crt'

export async function checksumCrc64Nvme(
  file: string
): Promise<string> {
  const crc64Nvme = new CrtCrc64Nvme()
  const stream = fs.createReadStream(file)
  let chunk: Buffer

  // さよならStream #JavaScript - Qiita
  // https://qiita.com/koh110/items/0fba3acbce38916928f1
  for await (chunk of stream) {
    crc64Nvme.update(chunk)
  }

  const digest = await crc64Nvme.digest()

  return Buffer.from(digest).toString('base64')
}
