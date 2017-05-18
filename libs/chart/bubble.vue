<template>
  <div class="krt-dc-bubble-chart" :id="id">
    <krt-dc-tooltip ref='tooltip'></krt-dc-tooltip>
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


export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'bubbleChart'
    },
    timeScale: {
      type: String
    },
    timeFormat: {
      type: String
    },
    // labels, formats
    xAxis: {
      type: String,
      default: 'x'
    },
    yAxis: {
      type: String,
      default: 'y'
    },
    radius: {
      type: String,
      default: 'radius'
    },
    radiusFormat: {
      type: String,
      default: ''
    },
    renderHorizontalGridLines: {
      type: Boolean,
      default: true
    },
    renderVerticalGridLines: {
      type: Boolean,
      default: true
    },
    sortBubbleSize: {
      type: Boolean,
      default: false
    },
    elasticRadius: {
      type: Boolean,
      default: false
    },
    elasticX: {
      type: Boolean,
      defualt: true
    },
    elasticY: {
      type: Boolean,
      default: true
    },
    // styles
    maxBubbleRelativeSize: {
      type: Number,
      default: 0.3
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
      return (this.reducerExtractor)(this.firstRow)
    },
    dataKeys: function() {
      return Object.keys(this.data)
    },
    firstRow: function() {
      const dim = Store.getDimension(this.dimensionName, this.dimensionExtractor, {dataset: this.dataset});
      return dim.top(1)[0]
    },
    grouping: function() {
      const getter = this.dimensionExtractor;
      const interval = this.getTimeInterval(this.timeScale)
      const grouping = (interval === null) ? getter : (d) => interval(getter(d))
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, this.dimensionExtractor, {dataset: this.dataset});
      const dimensionKey = this.extractDimensionName(this.dimension);
      return dim.group().reduce(
        (p, v) => {
          const vals = this.reducerExtractor(v);
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
          const vals = this.reducerExtractor(v);
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
    formatKey: function(key) {
      const format = this.getTimeFormat(this.timeScale)
      if (format === null) return key
      return format(key)
    },
    showTooltip: function(d) {
      const fill = d3.event.target.getAttribute('fill')
      const v = d.value
      const format = this.getTimeFormat(this.timeScale)
      const k = format ? format(d.key) : d.key
      const data = {
        key: k,
        vals: {
          [this.xAxis]: v[this.xAxis].per ? v[this.xAxis].per : v.x,
          [this.yAxis]: v[this.yAxis].per ? v[this.yAxis].per : v.y,
          [this.radius]: v[this.radius].per ? v[this.radius].per : v.radius
        }
      }
      this.$refs.tooltip.show(data, fill)
    }
  },
  mounted: function() {
    const chart = this.chart;
    const all = this.reducer.all()

    chart
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
      .elasticX(this.elasticX)
      .elasticY(this.elasticY)
      .xAxisPadding(this.xAxisPadding)
      .yAxisPadding(this.yAxisPadding)
      .renderHorizontalGridLines(this.renderHorizontalGridLines)
      .renderVerticalGridLines(this.renderVerticalGridLines)
      .label((p) => this.formatKey(p.key))
    chart.xAxis().tickFormat((v) => v + `${this.xAxisFormat}`)
    chart.yAxis().tickFormat((v) => v + `${this.yAxisFormat}`)
    if(this.timeScale) {
      const format = this.getTimeFormat(this.timeScale)
      chart.filterPrinter(filters => {
        return filters.map(f => format(f));
      });
    }
    return chart.render();
  }
}

</script>

<style scoped>
.krt-dc-bubble-chart .node text {
  pointer-events: none;
}
</style>