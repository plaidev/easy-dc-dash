<script lang='js'>

import d3 from "d3"
import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'
import {extractName, roundDecimalFormat} from '../utils'

export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'bubbleChart'
    },
    // labels, formats
    radius: {
      type: String,
      default: 'radius'
    },
    radiusFormat: {
      type: String,
      default: ''
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
    xAxisLabel:{
      type: String,
      default: 'x'
    },
    yAxisLabel: {
      type: String,
      default: 'y'
    },
    radiusLabel: {
      type: String,
      default: 'radius'
    },
    radiusFormat: {
      type: String,
      default: ''
    },
    xAxisPadding: {
      type: [String, Number],
      default: '20%'
    },
    yAxisPadding: {
      type: [String, Number],
      default: '20%'
    },
    useLegend: {
      default: false
    },
    color: {
      default: 'analogous'
    }
  },
  computed: {
    firstRow: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      return dim.top(1)[0]
    },
    data: function() {
      return (this.reducerExtractor)(this.firstRow)
    },
    dataKeys: function() {
      return Object.keys(this.data)
    },
    dimensionScale: function() {
      // dimensionのscaleはxのscaleでない。bubbleの特有の現象
      return {
        domain: null
      }
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      // TODO: このあたりはdata-tableのdimensionの処理とほぼ同じ
      return dim.group().reduce(
        (p, v) => {
          const vals = this.reducerExtractor(v);
          this.dataKeys.forEach((k) => {
            if (vals[k].count) {
              p[k].count += vals[k].count;
              p[k].value += vals[k].value;
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else if (typeof vals[k] === 'string' || vals[k] instanceof String) {
              const words = p[k].split(', ').filter((w) => w != vals[k])
              words.push(vals[k])
              p[k] = words.join(', ')
            }
            else
              p[k] += vals[k]
          })
          p._count++;
          return p;
        },
        (p, v) => {
          const vals = this.reducerExtractor(v);
          this.dataKeys.forEach((k) => {
            if (vals[k].count) {
              p[k].count -= vals[k].count;
              p[k].value -= vals[k].value;
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else if (typeof vals[k] === 'string' || vals[k] instanceof String) {
              const words = p[k].split(', ').filter((w) => w != vals[k])
              p[k] = words.join(', ')
            }
            else
              p[k] -= vals[k]
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
    showTooltip: function(d) {
      const fill = d3.event.target.getAttribute('fill')
      const _format = this.dimensionScale.format
      const v = d.value
      const k = d.key
      const _k = _format ? _format(k) : k
      const data = {
        key: _k,
        vals: {
          [this.xAxisLabel]: v[this.xAxisLabel].per ? roundDecimalFormat(v[this.xAxisLabel].per, 2) : v[this.xAxisLabel],
          [this.yAxisLabel]: v[this.yAxisLabel].per ? roundDecimalFormat(v[this.yAxisLabel].per, 2) : v[this.yAxisLabel],
          [this.radiusLabel]: v[this.radiusLabel].per ? roundDecimalFormat(v[this.radiusLabel].per, 2) : v[this.radiusLabel]
        }
      }
      if (this.tooltipFormatter) {
        const _tooltipFormat = d3.format(this.tooltipFormatter)
        data.vals.x = _tooltipFormat(data.vals.x)
        data.vals.y = _tooltipFormat(data.vals.y)
      }
      this.$refs.tooltip.show(data, fill)
    }
  },
  mounted: function() {
    const chart = this.chart;
    chart
      .elasticX(this.elasticX)
      .elasticY(this.elasticY)
      .elasticRadius(this.elasticRadius)
      .sortBubbleSize(this.sortBubbleSize)
      .maxBubbleRelativeSize(this.maxBubbleRelativeSize)
      // .label((p) => this.formatKey(p.key))
      .keyAccessor((p) => this.extractValue(p.value[this.xAxisLabel]))
      .valueAccessor((p) => this.extractValue(p.value[this.yAxisLabel]))
      .radiusValueAccessor((p) => this.extractValue(p.value[this.radiusLabel]))
      .x(d3.scale.linear().domain(d3.extent(this.reducerAll, (d) => this.extractValue(d.value[this.xAxisLabel]))))
      .y(d3.scale.linear().domain(d3.extent(this.reducerAll, (d) => this.extractValue(d.value[this.yAxisLabel]))))
      .r(d3.scale.linear().domain(d3.extent(this.reducerAll, (d) => this.extractValue(d.value[this.radiusLabel]))))
      .xAxisPadding(this.xAxisPadding)
      .yAxisPadding(this.yAxisPadding)

    if(!this.showLabel) {
      chart.label(d => null)
    }

    if(this.timeScale) {
      chart.filterPrinter(filters => {
        const format = this.getTimeFormat(this.timeScale)
        return filters.map(f => format(f));
      });
    }
    return chart
  }
}

</script>

<style lang="less" module>
.chart-root :global {
  .node text {
    pointer-events: none;
  }
}
</style>
