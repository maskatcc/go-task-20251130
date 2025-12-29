const ENV = {
  s3Bucket: process.env.S3_BUCKET || 'maskat-lambda-repo',
  lambdaVersion: process.env.LAMBDA_VERSION || 'latest',
  workload: process.env.WORKLOAD || `poc`,
  logKeywords: (process.env.LOG_KEYWORDS || '').split(' ').filter(Boolean),
  s3Stub: false,
}

// yyyy-mm-dd
const Today = formatDate(new Date())

// yyyy/mm/dd
function formatDate(datetime: Date | number | undefined): string {
  if (!datetime) {
    return '0000-00-00'
  }
  
  if (typeof datetime === 'number') {
    datetime = new Date(datetime)
  }

  return datetime.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replaceAll('/', '-')
}

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

// 1.0h | 1d 23.4h
function formatDateTime_with_age(datetime: Date | number | undefined, ageDays: number = 2): string {
  if (!datetime) {
    return '0000-00-00 00:00:00'
  }
  
  if (typeof datetime === 'number') {
    datetime = new Date(datetime)
  }

  const localTime = datetime.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const current = new Date()
  const diff_msec = current.getTime() - datetime.getTime()
  const diff_hours = diff_msec / (60 /* min */ * 60 /* sec */ * 1000 /* msec */)

  if  ((ageDays /* day */ * 24 /* hour */) < Math.abs(diff_hours)) {
    return formatDateTime(datetime)
  }

  const diff_days = diff_hours / 24
  const remainder_hours = Math.abs(diff_hours) % 24

  if (diff_days < 1) {
    const hours_part = `${diff_hours.toFixed(1)}h`.padStart(10, ' ')
    return `${hours_part} ${localTime}`
  }

  const days_part = `${diff_days.toFixed(0)}d`.padStart(4, ' ')
  const hours_part = `${remainder_hours.toFixed(1)}h`.padStart(5, ' ')
  return `${days_part} ${hours_part} ${localTime}`
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
  formatDate,
  formatDateTime,
  formatDateTime_with_age,
  funcArg,
}
