<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import coordinateGridBase from './_coordinateGridBase.js'
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
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'seriesChart'
    },
    labels: {
      default: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'
    },
    scale: {
      default: 'ordinal.ordinal'
    }
  },
  computed: {
    dimensionName: function() {
      return `weekofyear(${this.dimension})`
    },
    extraDimensionExtractor: function() {
      const getter = generateExtractor(this.dimension, this.dateKey)
      return (d) => TIME_INTERVALS.week(getter(d))
    },
    dimensionScale: function() {
      return {
        domain: d3.scale.ordinal().domain,
        unit: dc.units.ordinal,
        interval: (t) => Number(TIME_FORMATS.week(t))
      }
    },
    dimensionRange: function() {
      return [0, 1, 2, 3, 4, 5, 6]
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .chart((c) => {
        // return dc.lineChart(c).interpolate('basis')
        return dc.lineChart(c) //.interpolate()
      })
      // .clipPadding(10)
      .keyAccessor((d) => d.key[0])
      .seriesAccessor((d) => TIME_FORMATS['weekOfYear'](d.key[1]))

    chart
      .xAxis().tickFormat((d) => this.getLabel(d))

    return chart.render();
  }
}

</script>