const ENV = {
  s3Bucket: process.env.S3_BUCKET || 'maskat-lambda-repo',
  lambdaVersion: process.env.LAMBDA_VERSION || 'latest',
  workload: process.env.WORKLOAD || `poc`,
  s3Stub: false,
}

// yyyy-mm-dd
const Today = new Date().toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit", day: "2-digit"}).replaceAll('/', '-')

function funcArg(): string {
  const funcArgIndex = 2

  if (process.argv.length < funcArgIndex + 1) {
    console.error('func arg not found.')
    process.exit(1)
  }

  return process.argv[funcArgIndex] || ''
}

export {
  ENV, 
  Today,
  funcArg,
}
