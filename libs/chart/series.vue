<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import coordinateGridBase from './_coordinateGridBase.js'
import {splitKey, extractName} from '../utils'

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
    }
  },
  computed: {
    dimensionName: function() {
      if(this.dateKey != undefined) return `${this.seriesKey}(${this.dateKey})`
      return this.dimension
    },
    dimensionKeys: function() {
      return _splitkey(_extractName(this.dimension))
    },
    seriesKey: function() {
      return this.dimensionKeys[0]
    },
    xKey: function() {
      return this.dimensionKeys[1]
    },
    dimensionScale: function() {
      const all = this.reducer.all()
      const scale = d3.scale.linear()
      const range = d3.extent(all, (d) => d.key[1])
      return scale.domain(range)
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
      .chart((c) => dc.lineChart(c).interpolate('basis'))
      .clipPadding(10)
      .brushOn(false)
      .elasticY(this.elasticY)
      .mouseZoomable(false)
      .seriesAccessor((d) => Number(d.key[0]))
      .keyAccessor((d) => d.key[1])

    return chart.render();
  }
}

</script>