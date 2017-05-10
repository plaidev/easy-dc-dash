<template>
  <div class="krt-dc-heat-map" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'

function _splitkey(k) {
  return k.split(',')
}
function _extractName(dimensions) {
  return dimensions.replace(/(\[)|(\s)|(d.)|(\])/g, '')
}

const TIME_FORMAT = {
  year: d3.time.format('%Y'),
  month: d3.time.format('%m'),
  day: d3.time.format('%d')
}
const TIME_INTERVALS = {
  year: d3.time.year,
  month: d3.time.month,
  day: d3.time.day
}

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'heatMap'
    },
    dateKey: {
      type: String
    },
    dimensions: {
      type: String
    },
    width: {
      type: Number,
      default: 45 * 20 + 80
    },
    height: {
      type: Number,
      default: 45 * 5 + 40
    },
    xAxisLabel: {
      type: String
    },
    xAxisFormat: {
      type: String,
      default: ''
    },
    yAxisLabel: {
      type: String
    },
    yAxisFormat: {
      type: String,
      default: ''
    },
    valueLabel: {
      type: String
    },
    valueFormat: {
      type: String,
      default: ''
    }
  },
  computed: {
    dimensionName: function() {
      if(this.dateKey != undefined) return `${this.dimensionKeys[0]}(${this.dateKey})`
      return this.dimensions
    },
    dimensionKeys: function() {
      return _splitkey(_extractName(this.dimensions))
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
      const interval = this.getTimeInterval()
      const grouping = (interval === null) ?  getter : (d) => (interval(getter(d)))
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    }
  },
  methods: {
    getTimeInterval: function() {
      if(this.dateKey === undefined) return null
      else return TIME_INTERVALS[this.dimensionKeys[0]]
    },
    getTimeFormat: function(key) {
      if(this.dateKey === undefined) return null
      else if (this.timeFormat != undefined) return d3.time.format(this.timeFormat)
      else return TIME_FORMAT[key]
    },
    formatKey: function(axis, key) {
      const xTimeFormat = this.getTimeFormat(this.dimensionKeys[0])
      const yTimeFormat = this.getTimeFormat(this.dimensionKeys[1])
      const FORMAT = {
        x: xTimeFormat,
        y: yTimeFormat
      }
      if(FORMAT[axis] === null) return key
      return Number(FORMAT[axis](key))
    }
  },
  mounted: function() {
    const chart = this.chart;
    const xAxisLabel = this.xAxisLabel || this.dimensionKeys[0]
    const yAxisLabel = this.xAxisLabel || this.dimensionKeys[1]
    const valueLabel = this.valueLabel || _extractName(this.reduce)

    chart
      .width(this.width)
      .height(this.height)
      .keyAccessor((d) => this.formatKey('x', d.key))
      .valueAccessor((d) => this.formatKey('y', d.key))
      .colorAccessor((d) => +d.value)
      .colors(d3.scale.category20b())
      .title((d) => {
          return `${xAxisLabel}: ${this.formatKey('x', d.key)}${this.xAxisFormat}\n`
                 + `${yAxisLabel}: ${this.formatKey('y', d.key)}${this.yAxisFormat}\n`
                 + `${valueLabel}: ${+d.value}${this.valueFormat}`
      })
    return chart.render();
  }
}

</script>