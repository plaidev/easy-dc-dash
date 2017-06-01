<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import coordinateGridBase from './_coordinateGridBase.js'
import {splitKey, extractName} from '../utils'
import Store from '../store'

export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'seriesChart'
    },
    seriesLabel: {
      type: String,
      default: ''
    },
    seriesFormat: {
      type: String,
      default: ''
    },
    scale: {
      default: 'linear'
    },
    extraDimension: {
      require: true
    }
  },
  computed: {
    dimensionName: function() {
      // extraDimension, dimensionの順番なので、baseの処理と異なる
      let dimName = this.extraDimension + '+' + this.dimension
      if (this.dateKey !== undefined) return `${this.dateKey}.${dimName}`
      return dimName;
    },
    seriesKey: function() {
      return this.dimensionKeys[0]
    },
    xKey: function() {
      return this.dimensionKeys[1]
    },
    grouping: function() {
      const getter = this.dimensionExtractor
      const extraGetter = this.extraDimensionExtractor
      let grouping = getter
      if (extraGetter) {
        // FIXME: _baseのものとここだけ逆...
        grouping = (d) => [extraGetter(d), getter(d)]
      }
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    },
    dimensionRange: function() {
      const all = this.reducerAll
      // FIXME: d.key[1]などとする必要がある
      if (this.dimensionScale.unit === dc.units.ordinal) {
        return all.map((d) => d.key[1]).filter(function (x, i, self) {
          return self.indexOf(x) === i;
        })
      }
      return d3.extent(all, (d) => d.key[1])
    }
  },
  methods: {
    showTooltip: function(d) {
      const fill = d3.event.target.getAttribute('fill');
      const stroke = d3.event.target.getAttribute('stroke');
      const color = fill || stroke;

      if (d.x && d.y) {
        const key = d.layer
        const vals = {
          x: d.x,
          y: d.y
        }
        const data = {
          key: key,
          vals: vals
        }
        this.$refs.tooltip.show(data, color)
      }
      else {
        const key = d.name
        const vals = d.values.reduce((a,b) => a.y+b.y);
        const data = {
          key: key,
          val: vals
        }
        this.$refs.tooltip.show(data, color)
      }
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .chart((c) => dc.lineChart(c).interpolate('linear'))
      .seriesAccessor((d) => d.key[0])
      .keyAccessor((d) => d.key[1])

    return chart.render();
  }
}

</script>