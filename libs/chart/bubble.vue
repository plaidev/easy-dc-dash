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
    yAxis: {
      type: String
    },
    radius: {
      type: String
    }
  },
  computed: {
    getDimensionExtractor: function() {
      if(this.timeScale) return new Function('d', `return d3.${this.timeScale}(${this.dimensionName})`)
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
      .maxBubbleRelativeSize(0.3)
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
      // .label(function (p) {
      //     return p.key.getFullYear();
      // })
      // .title(function (p) {
      //     return p.key.getFullYear()
      //             + "\n"
      //             + "Index Gain: " + numberFormat(p.value.absGain) + "\n"
      //             + "Index Gain in Percentage: " + numberFormat(p.value.percentageGain) + "%\n"
      //             + "Fluctuation / Index Ratio: " + numberFormat(p.value.fluctuationPercentage) + "%";
      // })
      // .yAxis().tickFormat(function (v) {
      //     return v + "%";
      // });
    return chart.render();
  }
}

</script>