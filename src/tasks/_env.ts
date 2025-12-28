const ENV = {
  s3Bucket: process.env.S3_BUCKET || 'maskat-lambda-repo',
  lambdaVersion: process.env.LAMBDA_VERSION || 'latest',
  workload: process.env.WORKLOAD || `poc`,
  logKeywords: (process.env.LOG_KEYWORDS || '').split(' ').filter(Boolean),
  s3Stub: false,
}

// yyyy-mm-dd
const Today = new Date().toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit", day: "2-digit"}).replaceAll('/', '-')

// yyyy/mm/dd hh:mm:ss
function formatDateTime(datetime: Date | number | undefined): string {
  if (!datetime) {
    return '0000-00-00 00:00:00'
  }
  
  if (typeof datetime === 'number') {
    datetime = new Date(datetime)
  }

  return datetime.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replaceAll('/', '-')
}

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
  formatDateTime,
  funcArg,
}
