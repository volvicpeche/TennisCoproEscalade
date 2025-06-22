const TIME_ZONE = 'Europe/Paris'

function getTZOffset(date, timeZone = TIME_ZONE) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
    .formatToParts(date)
    .find(p => p.type === 'timeZoneName')?.value
  const m = part && part.match(/GMT([+-])(\d{1,2})(:?\d{2})?/) 
  if (!m) return 0
  const sign = m[1] === '-' ? -1 : 1
  const hours = parseInt(m[2], 10)
  const minutes = m[3] ? parseInt(m[3].slice(1), 10) : 0
  return sign * (hours * 60 + minutes)
}

function createZonedDate(day, hour, minute = 0, second = 0, timeZone = TIME_ZONE) {
  const year = day.getFullYear()
  const month = day.getMonth()
  const date = day.getDate()
  const utc = new Date(Date.UTC(year, month, date, hour, minute, second))
  const offset = getTZOffset(utc, timeZone)
  return new Date(utc.getTime() - offset * 60 * 1000)
}

function formatDateInZone(date, timeZone = TIME_ZONE) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(date).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value
    return acc
  }, {})
  return `${parts.year}-${parts.month}-${parts.day}`
}

function formatTimeInZone(date, timeZone = TIME_ZONE) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const parts = fmt.formatToParts(date).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value
    return acc
  }, {})
  return `${parts.hour}:${parts.minute}:${parts.second}`
}

export {
  TIME_ZONE,
  createZonedDate,
  formatDateInZone,
  formatTimeInZone,
}
