<script lang='js'>

import d3 from "d3"
import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'
import {extractName} from '../utils'

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
    xAxisLabelPadding: {
      type: Number,
      default: 500
    },
    yAxisLabelPadding: {
      type: Number,
      default: 100
    }
  },
  computed: {
    dimensionName: function() {
      if(this.dateKey && this.timeScale) return `${this.timeScale}(${this.dateKey})`
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
      const grouping = !interval ? getter : (d) => interval(getter(d))
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, this.dimensionExtractor, {dataset: this.dataset});
      const dimensionKey = extractName(this.dimensionName);
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
      const v = d.value
      const k = d.key
      const format = this.getTimeFormat(this.timeScale)
      const _k = format ? format(k) : k
      const data = {
        key: _k,
        vals: {
          [this.xAxisLabel]: v[this.xAxisLabel].per ? v[this.xAxisLabel].per : v.x,
          [this.yAxisLabel]: v[this.yAxisLabel].per ? v[this.yAxisLabel].per : v.y,
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
      .elasticX(this.elasticX)
      .elasticY(this.elasticY)
      .elasticRadius(this.elasticRadius)
      .sortBubbleSize(this.sortBubbleSize)
      .maxBubbleRelativeSize(this.maxBubbleRelativeSize)
      .label((p) => this.formatKey(p.key))
      .keyAccessor((p) => this.extractValue(p.value[this.xAxisLabel]))
      .valueAccessor((p) => this.extractValue(p.value[this.yAxisLabel]))
      .radiusValueAccessor((p) => this.extractValue(p.value[this.radiusLabel]))
      .x(d3.scale.linear().domain(d3.extent(all, (d) => this.extractValue(d.value[this.xAxisLabel]))))
      .y(d3.scale.linear().domain(d3.extent(all, (d) => this.extractValue(d.value[this.yAxisLabel]))))
      .r(d3.scale.linear().domain(d3.extent(all, (d) => this.extractValue(d.value[this.radiusLabel]))))

    if(this.timeScale) {
      chart.filterPrinter(filters => {
        const format = this.getTimeFormat(this.timeScale)
        return filters.map(f => format(f));
      });
    }
    return chart.render();
  }
}

</script>

<style scoped>
.node text {
  pointer-events: none;
}
</style>
