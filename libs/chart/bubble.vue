<template>
  <div class="krt-dc-ordinal-bar" :id="id">
    <a class="reset" style="display: none">reset</a>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'

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
    xAxis: {
      type: String
    },
    xAxisFormat: {
      type: String,
      default: ''
    },
    yAxis: {
      type: String
    },
    yAxisFormat: {
      type: String,
      default: ''
    },
    radius: {
      type: String
    },
    radiusFormat: {
      type: String,
      default: ''
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
    }
  },
  computed: {
    getDimensionExtractor: function() {
      const format = this.getFormat()
      if(format != null) return generateExtractor(`${format}(${this.dimension})`)
      return generateExtractor(this.dimensionName)
    },
    getReducersExtractor: function() {
      return generateExtractor(this.reduces)
    },
    data: function() {
      return (this.getReducersExtractor)(this.firstRow)
    },
    dataKeys: function() {
      return Object.keys(this.data)
    },
    firstRow: function() {
      const dim = Store.getDimension(this.dimensionName, this.getDimensionExtractor, {dataset: this.dataset});
      return dim.top(1)[0]
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, this.getDimensionExtractor, {dataset: this.dataset});
      const dimensionKey = this.extractDimensionName(this.dimension);
      return dim.group().reduce(
        (p, v) => {
          const vals = this.getReducersExtractor(v);
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
          const vals = this.getReducersExtractor(v);
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
    extractRateValue: function(val) {
      if(val instanceof Number || typeof val === 'number') return val
      else if(val instanceof Object || typeof val === 'object') {
        if(val.per != undefined) return val.per
      }
    },
    getFormat: function() {
      if (this.timeScale === undefined) return null
      else if (this.timeScale === 'ymd') return `d3.time.format('%Y-%m-%d')`
      else if (this.timeScale === 'ym') return `d3.time.format('%Y-%m')`
      else if(this.timeScale === 'year') return `d3.time.format('%Y')`
      else if (this.timeScale === 'month') return `d3.time.format('%m')`
      else if (this.timeScale === 'day') return `d3.time.format('%d')`
    }
  },
  mounted: function() {
    const chart = this.chart;
    const all = this.reducer.all()

    chart.transitionDuration(1500)
      .colors(d3.scale.category10())
      .keyAccessor((p) => this.extractRateValue(p.value[this.xAxis]))
      .valueAccessor((p) => this.extractRateValue(p.value[this.yAxis]))
      .radiusValueAccessor((p) => this.extractRateValue(p.value[this.radius]))
      .maxBubbleRelativeSize(this.maxBubbleRelativeSize)
      .sortBubbleSize(this.sortBubbleSize)
      .elasticRadius(this.elasticRadius)
      .x(d3.scale.linear().domain(d3.extent(all, (d) => this.extractRateValue(d.value[this.xAxis]))))
      .y(d3.scale.linear().domain(d3.extent(all, (d) => this.extractRateValue(d.value[this.yAxis]))))
      .r(d3.scale.linear().domain(d3.extent(all, (d) => this.extractRateValue(d.value[this.radius]))))
      .elasticY(true)
      .elasticX(true)
      .xAxisPadding(500)
      .yAxisPadding(100)
      .renderHorizontalGridLines(true)
      .renderVerticalGridLines(true)
      .renderLabel(true)
      .renderTitle(true)
      .label((p) => p.key)
      .title((p) => {
        return `[${p.key}]\n`
          + `${this.xAxis}: ${this.extractRateValue(p.value[this.xAxis])}${this.xAxisFormat}\n`
          + `${this.yAxis}: ${this.extractRateValue(p.value[this.yAxis])}${this.yAxisFormat}\n`
          + `${this.radius}: ${this.extractRateValue(p.value[this.radius])}${this.radiusFormat}`
      })
    chart.xAxis().tickFormat((v) => v + `${this.xAxisFormat}`)
    chart.yAxis().tickFormat((v) => v + `${this.yAxisFormat}`)
    return chart.render();
  }
}

</script>