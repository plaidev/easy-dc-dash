<template>
  <div class="krt-dc-heat-map" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
    <div v-text="title" style="font-size:24px; text-align:center;"></div>
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
      default: 'heatMap'
    },
    dimension: {
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
    yBorderRadius: {
      type: Number,
      defaulat: 6.75
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
      if(this.dateKey != undefined) return `${this.xKey}(${this.dateKey})`
      return this.dimension
    },
    dimensionKeys: function() {
      return _splitkey(_extractName(this.dimension))
    },
    xKey: function() {
      return this.dimensionKeys[0]
    },
    yKey: function() {
      return this.dimensionKeys[1]
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
    dimensionExtractor: function() {
      if (this.dateKey != undefined) return generateExtractor(this.dateKey)
      return generateExtractor(this.dimensionName)
    },
    grouping: function() {
      const getter = this.dimensionExtractor;
      const xInterval = this.getTimeInterval(this.xKey)
      const yInterval = this.getTimeInterval(this.yKey)
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

    chart
      .keyAccessor((d) => this.formatKey('x', d.key[0]))
      .valueAccessor((d) => this.formatKey('y', d.key[1]))
      .colorAccessor((d) => +d.value)
      .colors(d3.scale.category20b())
      .yBorderRadius(this.yBorderRadius)
      .colsLabel((d) => d + `${this.xAxisFormat}`)
      .rowsLabel((d) => d + `${this.yAxisFormat}`)
      .title((d) => {
          return `${xAxisLabel}: ${this.formatKey('x', d.key[0])}${this.xAxisFormat}\n`
                 + `${yAxisLabel}: ${this.formatKey('y', d.key[1])}${this.yAxisFormat}\n`
                 + `${valueLabel}: ${+d.value}${this.valueFormat}`
      })
    if(this.dateKey) {
      chart.filterPrinter(filters => {
        return filters.map(filter => {
          return filter.map((f,i) => {
            return `${TIME_FORMATS[this.dimensionKeys[i]](f)}`
          }).join(',').replace(/\,/, '-')
        });
      });
    }
    return chart.render();
  }
}

</script>