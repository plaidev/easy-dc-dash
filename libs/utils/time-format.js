import d3 from 'd3'

export const ymdFormat = d3.time.format('%Y-%m-%d')
export const ymFormat = d3.time.format('%Y-%m')
export const weekOfYearFormat = d3.time.format("%Y-w%W")
export const yearFormat = d3.time.format('%Y')
export const monthFormat = d3.time.format('%m')
export const weekFormat = d3.time.format('%w')
export const dayFormat = d3.time.format('%d')

export const yearInterval = d3.time.year
export const monthInterval = d3.time.month
export const weekInterval = d3.time.week
export const dayInterval = d3.time.day
export const hourInterval = d3.time.hour

export const TIME_FORMATS = {
  ymd: ymdFormat,
  ym: ymFormat,
  weekOfYear: weekOfYearFormat,
  year: yearFormat,
  month: monthFormat,
  week: weekFormat,
  day: dayFormat
}
export const TIME_INTERVALS = {
  year: yearInterval,
  month: monthInterval,
  week: weekInterval,
  day: dayInterval,
  hour: hourInterval
}
