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
      default: 'seriesChart'
    },
    brushOn: {
      type: Boolean,
      default: false
    },
    elasticY: {
      type: Boolean,
      default: true
    },
    // label
    renderLabel: {
      type: Boolean,
      default: true
    },
    seriesLabel: {
      type: String,
      default: ''
    },
    seriesFormat: {
      type: String,
      default: ''
    },
    xAxisFormat: {
      type: String,
      default: ''
    },
    yAxisFormat: {
      type: String,
      default: ''
    },
    useLegend: {
      type: Boolean,
      default: true
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
      const format = this.timeFormat ? this.timeFormat : d3.time.format('%Y-%m-%d');
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
    const all = this.reducer.all()

    chart
      .chart((c) => dc.lineChart(c).interpolate('basis'))
      .brushOn(this.brushOn)
      .renderVerticalGridLines(true)
      .renderHorizontalGridLines(true)
      .clipPadding(10)
      .elasticY(this.elasticY)
      .mouseZoomable(false)
      .seriesAccessor((d) => Number(d.key[0]))
      .keyAccessor((d) => d.key[1])

    return chart.render();
  }
}

</script>