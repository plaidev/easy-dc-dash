<template>
  <div class="krt-dc-bubble-chart" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'

const _ymdFormat = (key) => d3.time.format("%Y-%m-%d")(key)
const _ymFormat = (key) => d3.time.format("%Y-%m")(key)
const _yearFormat = (key) => d3.time.format('%Y')(key)
const _monthFormat = (key) => d3.time.format('%m')(key)
const _dayFormat = (key) => d3.time.format('%d')(key)
const _yearInterval = (key) => d3.time.year(key)
const _monthInterval = (key) => d3.time.month(key)
const _dayInterval = (key) => d3.time.day(key)

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'bubbleChart'
    },
    reduces: {
      type: String
    },
    timeScale: {
      type: String
    },
    timeFormat: {
      type: String
    },
    xAxis: {
      type: String,
      default: 'x'
    },
    xAxisFormat: {
      type: String,
      default: ''
    },
    yAxis: {
      type: String,
      default: 'y'
    },
    yAxisFormat: {
      type: String,
      default: ''
    },
    radius: {
      type: String,
      default: 'radius'
    },
    radiusFormat: {
      type: String,
      default: ''
    },
    renderLabel: {
      type: Boolean,
      default: true
    },
    renderTitle: {
      type: Boolean,
      default: true
    },
    renderHorizontalGridLines: {
      type: Boolean,
      default: true
    },
    renderVerticalGridLines: {
      type: Boolean,
      default: true
    },
    maxBubbleRelativeSize: {
      type: Number,
      default: 0.3
    },
    sortBubbleSize: {
      type: Boolean,
      default: false
    },
    elasticRadius: {
      type: Boolean,
      default: false
    },
    xAxisPadding: {
      type: Number,
      default: 500
    },
    yAxisPadding: {
      type: Number,
      default: 100
    }
  },
  computed: {
    dimensionName: function() {
      if(this.timeScale != undefined) return `${this.timeScale}(${this.dimension})`
      return this.dimension
    },
    data: function() {
      return (this.getReducerExtractor)(this.firstRow)
    },
    dataKeys: function() {
      return Object.keys(this.data)
    },
    firstRow: function() {
      const dim = Store.getDimension(this.dimensionName, this.getDimensionExtractor, {dataset: this.dataset});
      return dim.top(1)[0]
    },
    grouping: function() {
      const getter = this.getDimensionExtractor;
      const interval = this.getTimeInterval()
      const grouping = (d) => interval(getter(d))
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, this.getDimensionExtractor, {dataset: this.dataset});
      const dimensionKey = this.extractDimensionName(this.dimension);
      return dim.group().reduce(
        (p, v) => {
          const vals = this.getReducerExtractor(v);
          this.dataKeys.forEach((k) => {
            if (typeof(p[k]) === 'string' && typeof(vals[k]) === 'string') {
              p[k] = vals[k]
            }
            else if (vals[k].count) {
              p[k].count += vals[k].count;
              p[k].value += vals[k].value;
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else p[k] += vals[k]
          })
          p._count++;
          return p;
        },
        (p, v) => {
          const vals = this.getReducerExtractor(v);
          this.dataKeys.forEach((k) => {
            if (k === dimensionKey) {
              p[k] = vals[k]
            }
            else if (vals[k].count) {
              p[k].count -= vals[k].count;
              p[k].value -= vals[k].value;
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else p[k] -= vals[k]
          })
          p._count--;
          return p;
        },
        () => {
          const p = this.getSchema()
          p._count = 0;
          return p
        }
      )
    }
  },
  methods: {
    extractDimensionName: function(name) {
      return name.replace(/d\./, '')
    },
    getSchema: function() {
      const schema = {}
      this.dataKeys.forEach((k) => {
        val = this.data[k]
        if(val instanceof String || typeof val === 'string') val = '';
        else if(val instanceof Number || typeof val === 'number') val = 0;
        else if(val instanceof Object || typeof val === 'object') {
          val = {count: 0, value:0, per:0}
        }
        Object.assign(schema, {[k]: val})
      })
      return schema
    },
    extractValue: function(val) {
      if(val instanceof Number || typeof val === 'number') return val
      else if(val instanceof Object || typeof val === 'object') {
        if(val.per != undefined) return val.per
      }
    },
    getTimeInterval: function() {
      if(this.timeScale === undefined) return null
      else if(this.timeScale === 'year') return _yearInterval
      else if (this.timeScale === 'month') return _monthInterval
      else if (this.timeScale === 'day') return _dayInterval
    },
    getTimeFormat: function() {
      if (this.timeFormat === undefined) return null
      else if (this.timeFormat === 'ymd') return _ymdFormat
      else if (this.timeFormat === 'ym') return _ymFormat
      else if(this.timeFormat === 'year') return _yearFormat
      else if (this.timeFormat === 'month') return _monthFormat
      else if (this.timeFormat === 'day') return _dayFormat
    }
  },
  mounted: function() {
    const chart = this.chart;
    const all = this.reducer.all()
    const format = this.getTimeFormat()

    chart.transitionDuration(1500)
      .colors(d3.scale.category10())
      .keyAccessor((p) => this.extractValue(p.value[this.xAxis]))
      .valueAccessor((p) => this.extractValue(p.value[this.yAxis]))
      .radiusValueAccessor((p) => this.extractValue(p.value[this.radius]))
      .maxBubbleRelativeSize(this.maxBubbleRelativeSize)
      .sortBubbleSize(this.sortBubbleSize)
      .elasticRadius(this.elasticRadius)
      .x(d3.scale.linear().domain(d3.extent(all, (d) => this.extractValue(d.value[this.xAxis]))))
      .y(d3.scale.linear().domain(d3.extent(all, (d) => this.extractValue(d.value[this.yAxis]))))
      .r(d3.scale.linear().domain(d3.extent(all, (d) => this.extractValue(d.value[this.radius]))))
      .elasticX(true)
      .elasticY(true)
      .xAxisPadding(this.xAxisPadding)
      .yAxisPadding(this.yAxisPadding)
      .renderHorizontalGridLines(this.renderHorizontalGridLines)
      .renderVerticalGridLines(this.renderVerticalGridLines)
      .renderLabel(this.renderLabel)
      .renderTitle(this.renderTitle)
      .label((p) => format(p.key))
      .title((p) => {
        return `[${format(p.key)}]\n`
          + `${this.xAxis}: ${this.extractValue(p.value[this.xAxis])}${this.xAxisFormat}\n`
          + `${this.yAxis}: ${this.extractValue(p.value[this.yAxis])}${this.yAxisFormat}\n`
          + `${this.radius}: ${this.extractValue(p.value[this.radius])}${this.radiusFormat}`
      })
    chart.xAxis().tickFormat((v) => v + `${this.xAxisFormat}`)
    chart.yAxis().tickFormat((v) => v + `${this.yAxisFormat}`)
    return chart.render();
  }
}

</script>