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
      default: 'seriesChart'
    },
    dimensions: {
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
    xAxisLabel: {
      type: String,
      default: ''
    },
    yAxisLabel: {
      type: String,
      default: ''
    }
  },
  computed: {
    dimensionName: function() {
      if(this.dateKey != undefined) return `${this.xKey}(${this.dateKey})`
      return this.dimensions
    },
    dimensionKeys: function() {
      return _splitkey(_extractName(this.dimensions))
    },
    xKey: function() {
      return this.dimensionKeys[0]
    },
    yKey: function() {
      return this.dimensionKeys[1]
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
      const xInterval = this.getTimeInterval(this.xKey)
      const yInterval = this.getTimeInterval(this.yKey)
      if((xInterval && yInterval) === null) {
        return Store.registerDimension(this.dimensionName, getter, {dataset: this.dataset})
      }
      else {
        const grouping = (d) => [d3.time.year(getter(`${this.dateKey}`)), d3.time.month(getter(`${this.dateKey}`))]
        // const grouping = (d) => [Number(xInterval(getter(d))), Number(yInterval(getter(d)))]
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
      else return TIME_FORMAT[key]
    },
    formatKey: function(axis, key) {
      const xTimeFormat = this.getTimeFormat(this.xKey)
      const yTimeFormat = this.getTimeFormat(this.yKey)
      const FORMATS = {
        x: xTimeFormat,
        y: yTimeFormat
      }
      if(FORMATS[axis] === null) return key
      return Number(FORMATS[axis](key))
    }
  },
  mounted: function() {
    const chart = this.chart;
    const xAxisLabel = this.xAxisLabel || this.xKey
    const yAxisLabel = this.xAxisLabel || this.yKey
    const valueLabel = this.valueLabel || _extractName(this.reduce)
    const all = this.reducer.all()
    console.log(all);

    chart
      .chart((c) => dc.lineChart(c).interpolate('basis'))
      .brushOn(false)
      .xAxisLabel(this.xAxisLabel)
      .yAxisLabel(this.yAxisLabel)
      .clipPadding(10)
      .elasticY(true)
      .mouseZoomable(false)
      // .x(d3.scale.linear().domain(d3.extent(all, (d) => this.formatKey('x', d.key[0]))))
      .x(d3.scale.linear().domain(d3.extent(all, (d) => console.log(d))))
      // .seriesAccessor((d) => this.formatKey('x', d.key[0]))
      // .keyAccessor((d) => this.formatKey('y', d.key[1]))
      // .valueAccessor((d) => console.log(this.formatKey('x',d.key[0]), this.formatKey('y',d.key[1])))
      .legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70))
    // chart.xAxis().tickFormat((d) => d3.format('d')(d))
    // chart.xAxis().tickFormat((d) => console.log(d))
    // chart.xAxis().tickFormat((d) => d)
    return chart.render();
  }
}

</script>