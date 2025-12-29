// yyyy-mm-dd
export const Today = formatDate(new Date())

// yyyy/mm/dd
export function formatDate(datetime: Date | number | undefined): string {
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
export function formatDateTime(datetime: Date | number | undefined): string {
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

// 1d 23.4h | 1.2h | 12m | now
export function formatDateTime_with_age(datetime: Date | number | undefined, ageDays: number = 2): string {
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
    const remainder_minutes = remainder_hours * 60

    if (remainder_minutes < 1) {
      const minutes_part = 'now'.padStart(10, ' ')
      return `${minutes_part} ${localTime}`
    }
    else if (remainder_minutes < 60) {
      const minutes_part = `${Math.trunc(remainder_minutes)}m`.padStart(10, ' ')
      return `${minutes_part} ${localTime}`
    }

    const hours_part = `${remainder_hours.toFixed(1)}h`.padStart(10, ' ')
    return `${hours_part} ${localTime}`
  }

  const days_part = `${Math.trunc(diff_days)}d`.padStart(4, ' ')
  const hours_part = `${remainder_hours.toFixed(1)}h`.padStart(5, ' ')
  return `${days_part} ${hours_part} ${localTime}`
}
