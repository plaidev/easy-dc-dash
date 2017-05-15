<template>
  <div class="krt-dc-series-chart" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'
import {TIME_FORMATS, TIME_INTERVALS} from '../utils/time-format'

function _splitkey(k) {
  return k.split(',')
}
function _extractName(dimension) {
  // FIXME: Replace if there is a better way
  return dimension.replace(/(\[)|(\s)|(d.)|(\])/g, '')
}

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'seriesChart'
    },
    dimension: {
      type: String
    },
    dateKey: {
      type: String
    },
    width: {
      type: Number,
      default: 768
    },
    height: {
      type: Number,
      default: 480
    },
    brushOn: {
      type: Boolean,
      default: false
    },
    elasticY: {
      type: Boolean,
      default: true
    },
    // label
    renderLabel: {
      type: Boolean,
      default: true
    },
    seriesLabel: {
      type: String,
      default: ''
    },
    seriesFormat: {
      type: String,
      default: ''
    },
    xAxisLabel: {
      type: String,
      default: ''
    },
    xAxisFormat: {
      type: String,
      default: ''
    },
    yAxisLabel: {
      type: String,
      default: ''
    },
    yAxisFormat: {
      type: String,
      default: ''
    },
    // legend
    // TODO: refactoring => legend="{x: 350, y:350, w: 140, itemHeight: 13}..."
    useLegend: {
      type: Boolean,
      default: true
    },
    legendX: {
      type: Number,
      default: 350
    },
    legendY: {
      type: Number,
      default: 350
    },
    legendWidth: {
      type: Number,
      default: 140
    },
    legendItemWidth: {
      type: Number,
      default: 70
    },
    legendItemHeight: {
      type: Number,
      default: 13
    },
    legendGap: {
      type: Number,
      default: 5
    },
    legendHorizontal: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    dimensionName: function() {
      if(this.dateKey != undefined) return `${this.seriesKey}(${this.dateKey})`
      return this.dimension
    },
    dimensionKeys: function() {
      return _splitkey(_extractName(this.dimension))
    },
    seriesKey: function() {
      return this.dimensionKeys[0]
    },
    xKey: function() {
      return this.dimensionKeys[1]
    },
    yKey: function() {
      return _extractName(this.reduce)
    },
    firstRow: function() {
      const dim = Store.getDimension(this.dimensionName, this.getDimensionExtractor, {dataset: this.dataset});
      return dim.top(1)[0]
    },
    data: function() {
      return (this.getDimensionExtractor)(this.firstRow)
    },
    dataKeys: function() {
      return Object.keys(this.data)
    },
    getDimensionExtractor: function() {
      if (this.dateKey != undefined) return generateExtractor(this.dateKey)
      return generateExtractor(this.dimensionName)
    },
    grouping: function() {
      const getter = this.getDimensionExtractor;
      const xInterval = this.getTimeInterval(this.seriesKey)
      const yInterval = this.getTimeInterval(this.xKey)
      if((xInterval && yInterval) === null) {
        return Store.registerDimension(this.dimensionName, getter, {dataset: this.dataset})
      }
      else {
        const grouping = (d) => [xInterval(getter(d)), yInterval(getter(d))]
        return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
      }
    }
  },
   methods: {
    getTimeInterval: function(key) {
      if(this.dateKey === undefined) return null
      else return TIME_INTERVALS[key]
    },
    getTimeFormat: function(key) {
      if(this.dateKey === undefined) return null
      else return TIME_FORMATS[key]
    },
    formatKey: function(axis, key) {
      const seriesTimeFormat = this.getTimeFormat(this.seriesKey)
      const xTimeFormat = this.getTimeFormat(this.xKey)
      const FORMATS = {
        series: seriesTimeFormat,
        x: xTimeFormat
      }
      if(FORMATS[axis] === null) return +key
      return Number(FORMATS[axis](key))
    }
  },
  mounted: function() {
    const chart = this.chart;
    const all = this.reducer.all()

    chart
      .chart((c) => dc.lineChart(c).interpolate('basis'))
      .brushOn(this.brushOn)
      .renderLabel(this.renderLabel)
      .xAxisLabel(this.xAxisLabel)
      .yAxisLabel(this.yAxisLabel)
      .clipPadding(10)
      .elasticY(this.elasticY)
      .mouseZoomable(false)
      .x(d3.scale.linear().domain(d3.extent(all, (d) => this.formatKey('x', d.key[1]))))
      .seriesAccessor((d) => this.formatKey('series', d.key[0]))
      .keyAccessor((d) => this.formatKey('x', d.key[1]))
      .valueAccessor((d) => +d.value)
      .title((d) => {
        return `${this.seriesLabel}[${this.seriesKey}]: ${this.formatKey('series', d.key[0])}\n`
          + `${this.xAxisLabel}[${this.xKey}]: ${this.formatKey('x', d.key[1])}\n`
          + `${this.yAxisLabel}[${this.yKey}]: ${d.value}`
      })
    chart.xAxis().tickFormat((d) => d + `${this.xAxisFormat}`)
    chart.yAxis().tickFormat((d) => d + `${this.yAxisFormat}`)
    if(this.useLegend) {
      chart.legend(dc.legend()
      .x(this.legendX)
      .y(this.legendY)
      .gap(this.legendGap)
      .legendWidth(this.legendWidth)
      .itemWidth(this.legendItemWidth)
      .itemHeight(this.legendItemHeight)
      .horizontal(this.legendHorizontal))
    }
    return chart.render();
  }
}

</script>