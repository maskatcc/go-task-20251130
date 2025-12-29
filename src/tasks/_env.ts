export const ENV = {
  s3Bucket: process.env.S3_BUCKET || 'maskat-lambda-repo',
  lambdaVersion: process.env.LAMBDA_VERSION || 'latest',
  workload: process.env.WORKLOAD || `poc`,
  logKeywords: (process.env.LOG_KEYWORDS || '').split(' ').filter(Boolean),
  s3Stub: false,
}


export function funcArg(): string {
  const funcArgIndex = 2

  if (process.argv.length < funcArgIndex + 1) {
    console.error('func arg not found.')
    process.exit(1)
  }

  return process.argv[funcArgIndex] || ''
}
