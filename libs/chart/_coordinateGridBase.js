import d3 from 'd3'
import Base from './_base.js'
import 'dc/dc.css'
import Store from '../store'
import {generateExtractor} from '../utils'
import {splitKey, extractName} from '../utils'
import {TIME_FORMATS, TIME_INTERVALS} from '../utils/time-format'

export default {
  extends: Base,
  props: {
    dateKey: {
      type: String
    },
    timeScale: {
      type: String
    },
    timeFormat: {
      type: String
    },
    firstKeyLabel: {
      type: String,
      default: 'first'
    },
    firstKeyFormat: {
      type: String,
      default: ''
    },
    secondKeyLabel: {
      type: String,
      default: 'second'
    },
    secondKeyFormat: {
      type: String,
      default: ''
    },
    valueLabel: {
      type: String
    },
    valueFormat: {
      type: String,
      defeault: ''
    },
    renderHorizontalGridLines: {
      type: Boolean,
      default: true
    },
    renderVerticalGridLines: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    dimensionName: function() {
      if(this.dateKey != undefined) return `${this.firstKey}(${this.dateKey})`
      return this.dimension
    },
    dimensionKeys: function() {
      if(this.dimension) return splitKey(extractName(this.dimension))
    },
    firstKey: function() {
      if(this.dimensionKeys) return this.dimensionKeys[0]
    },
    secondKey: function() {
      if(this.dimensionKeys) return this.dimensionKeys[1]
    },
    firstRow: function() {
      const dim = Store.getDimension(this.dimensionName, this.dimensionExtractor, {dataset: this.dataset});
      return dim.top(1)[0]
    },
    data: function() {
      return (this.dimensionExtractor)(this.firstRow)
    },
    dataKeys: function() {
      return Object.keys(this.data)
    },
    isTimeChart: function() {
      if(this.scale || this.dateKey || this.timeScale) return true
      return false
    },
    dimensionExtractor: function() {
      if (this.dateKey != undefined) return generateExtractor(this.dateKey)
      return generateExtractor(this.dimensionName)
    },
    grouping: function() {
      const getter = this.dimensionExtractor;
      const firstInterval = this.getTimeInterval(this.firstKey)
      const secondInterval = this.getTimeInterval(this.secondKey)
    if(!firstInterval && !secondInterval) {
        const grouping = (d) => [getter(d)[0], getter(d)[1]]
        return Store.registerDimension(this.dimensionName, getter, {dataset: this.dataset})
      }
      else {
        const grouping = (d) => [firstInterval(getter(d)), secondInterval(getter(d))]
        return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
      }
    },
    firstKeyAccessor: function() {
      return (d) => this.formatKey('first', d.key[0])
    },
    secondKeyAccessor: function() {
      return (d) => this.formatKey('second', d.key[1])
    },
    valueAccessor: function() {
      return (d) => +d.value
    }
  },
  methods: {
    formatKey: function(priority, key) {
      if(!priority && this.timeScale) return this.getTimeFormat(key)

      const firstTimeFormat = this.getTimeFormat(this.firstKey)
      const secondTimeFormat = this.getTimeFormat(this.secondKey)
      const FORMATS = {
        first: firstTimeFormat,
        second: secondTimeFormat
      }
      return !FORMATS[priority] ? key : FORMATS[priority](key)
    },
    getTimeInterval: function(key) {
      if(this.isTimeChart) return TIME_INTERVALS[key]
      else return null
    },
    getTimeFormat: function(key) {
      if(this.timeFormat) return d3.time.format(this.timeFormat)
      else if(this.isTimeChart) return TIME_FORMATS[key]
      else return null
    }
  },
  mounted: function() {
    const chart = this.chart;
    const xAxisLabel = this.xAxisLabel || this.xKey
    const yAxisLabel = this.yAxisLabel || this.yKey
    const valueLabel = this.valueLabel || extractName(this.reduce)

    chart
      .colors(d3.scale.category20b())

    if(this.isTimeChart && this.dimensionKeys) {
      chart.x(d3.time.scale().domain([this.min, this.max]).nice(d3.time[this.timeScale]))
      chart.xAxis().tickFormat((d) => this.formatKey('x', d))
      chart.filterPrinter(filters => {
        return filters.map(filter => {
          return filter.map((f,i) => {
            return `${TIME_FORMATS[this.dimensionKeys[i]](f)}`
          }).join(',').replace(/\,/, '-')
        });
      });
    }
    if(!this.isTimeChart && this.scale === 'linear') {
      chart.x(d3.scale.linear().domain(d3.extent(this.all, (d) => this.formatKey('x', d.key[1]))))
      chart.xAxis().tickFormat((d) => d + `${this.xAxisFormat}`)
      chart.yAxis().tickFormat((d) => d + `${this.yAxisFormat}`)
    }
    if(this.chartType != ('heatMap' || 'bubbleChart')) {
      const xKeys = this.all.map(a => a.key[1]).filter((x,i,self) => self.indexOf(x) === i)
      chart.x(d3.scale.ordinal().domain(xKeys))
      chart.xAxis().tickFormat((d) => d + `${this.xAxisFormat}`)
      chart.yAxis().tickFormat((d) => d + `${this.yAxisFormat}`)
    }
    this.chart = chart;
    return chart;
  }
}