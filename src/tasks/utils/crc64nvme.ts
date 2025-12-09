import { CrtCrc64Nvme } from '@aws-sdk/crc64-nvme-crt'

export async function checksumCrc64Nvme(
  data: Buffer
): Promise<string> {
  const crc64Nvme = new CrtCrc64Nvme()

  crc64Nvme.update(data)
  const digest = await crc64Nvme.digest()

  return Buffer.from(digest).toString('base64')
}
