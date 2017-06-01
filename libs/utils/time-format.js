import d3 from 'd3'

export const ymdhmsFormat = d3.time.format('%Y-%m-%d %H:%M:%S')
export const ymdhmFormat = d3.time.format('%Y-%m-%d %H:%M')
export const ymdhFormat = d3.time.format('%Y-%m-%d %H')
export const ymdFormat = d3.time.format('%Y-%m-%d')
export const ymFormat = d3.time.format('%Y-%m')
export const weekOfYearFormat = d3.time.format("%Y-w%W")
export const yearFormat = d3.time.format('%Y')
export const monthFormat = d3.time.format('%m')
export const weekFormat = d3.time.format('%w')
export const dayFormat = d3.time.format('%d')
export const hourFormat = d3.time.format('%H')
export const minuteFormat = d3.time.format('%M')
export const secondFormat = d3.time.format('%S')

export const yearInterval = d3.time.year
export const monthInterval = d3.time.month
export const weekInterval = d3.time.week
export const dayInterval = d3.time.day
export const hourInterval = d3.time.hour
export const minuteInterval = d3.time.minute
export const secondInterval = d3.time.second

export const TIME_FORMATS = {
  ymdhms: ymdhmsFormat,
  ymdhm: ymdhmFormat,
  ymdh: ymdhFormat,
  ymd: ymdFormat,
  ym: ymFormat,
  weekOfYear: weekOfYearFormat,
  year: yearFormat,
  month: monthFormat,
  week: weekFormat,
  day: dayFormat,
  hour: hourFormat,
  minute: minuteFormat,
  second: secondFormat
}
export const TIME_INTERVALS = {
  year: yearInterval,
  month: monthInterval,
  week: weekInterval,
  day: dayInterval,
  hour: hourInterval,
  minute: minuteInterval,
  second: secondInterval
}
