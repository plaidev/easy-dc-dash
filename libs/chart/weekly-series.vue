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
    seriesLabel: {
      type: String,
      default: ''
    },
    seriesFormat: {
      type: String,
      default: ''
    },
    useLegend: {
      type: Boolean,
      default: true
    },
    labels: {
      default: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'
    }
  },
  computed: {
    dimensionName: function() {
      return `weekofyear(${this.dimension})`
    },
    extraDimensionExtractor: function() {
      const getter = this.dimensionExtractor;
      return (d) => TIME_INTERVALS.week(getter(d))
    },
    grouping: function() {
      const getter = this.dimensionExtractor;
      const exGetter = this.extraDimensionExtractor;
      const grouping = (d) => [
        exGetter(d),
        Number(TIME_FORMATS.week(getter(d)))
      ]
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    },
    dimensionScale: function() {
      return d3.scale.linear()
        .domain([0, 6])
    },
    dimensionUnit: function() {
      return null // dc.units.integers
    }
  },
  methods: {
    showTooltip: function(d) {
      const format = this.timeFormat ? this.timeFormat : TIME_FORMATS.ymd;
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
      .chart((c) => {
        return dc.lineChart(c).interpolate('basis')
      })
      .brushOn(this.brushOn)
      .renderVerticalGridLines(true)
      .renderHorizontalGridLines(true)
      .clipPadding(10)
      .elasticY(this.elasticY)
      .mouseZoomable(false)
      .seriesAccessor((d) => this.getTimeFormat('weekOfYear')(d.key[0]))
      .keyAccessor((d) => d.key[1])

    chart
      .xAxis().tickFormat((d) => this.getLabel(d))

    return chart.render();
  }
}

</script>