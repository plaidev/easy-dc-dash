import d3 from 'd3'

export const ymdFormat = d3.time.format('%Y-%m-%d')
export const ymFormat = d3.time.format('%Y-%m')
export const yearFormat = d3.time.format('%Y')
export const monthFormat = d3.time.format('%m')
export const weekFormat = d3.time.format('%w')
export const dayFormat = d3.time.format('%d')

export const yearInterval = d3.time.year
export const monthInterval = d3.time.month
export const dayInterval = d3.time.day

export const TIME_FORMATS = {
  ymdFormat: ymdFormat,
  ymFormat: ymFormat,
  year: yearFormat,
  month: monthFormat,
  day: dayFormat
}
export const TIME_INTERVALS = {
  year: yearInterval,
  month: monthInterval,
  day: dayInterval
}
