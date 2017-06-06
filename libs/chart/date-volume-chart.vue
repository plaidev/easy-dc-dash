
<script lang="js">
import dc from 'dc'
import Base from './_base.js'
import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'
import {ymdFormat} from '../utils/time-format'

export default {
  extends: coordinateGridBase,
  props: {
    chartType: {
      type: String,
      default: 'barChart'
    },
    width: {
      type: Number,
      default: 240 * 4
    },
    height: {
      type: Number,
      default: 90
    },
    scale: {
      default: 'time.day'
    },
    useLegend: {
      default: false
    }
  },
  computed: {
    dimensionRange: function() {
      // TODO: elasticX(false)の時、xAxisPadding*が効かない問題への対処
      const min = this.min // dc.utils.subtract(this.min, 0, 'day')
      const max = dc.utils.add(this.max, 1, 'day')
      return [min, max]
    },
    layoutSettings: function() {
      const settings = Base.computed.layoutSettings.apply(this)
      settings.legend = null;
      return settings;
    }
  },
  methods: {
    removeFilterAndRedrawChart: function() {
      const focusChart = this.chart.focusChart()
      if(focusChart) focusChart.filterAll();
      this.chart.filterAll();
      dc.redrawAll();
    }
  },
  mounted: function() {
    const chart = this.chart
    chart
      .gap(1)
      .elasticX(false)
      .elasticY(true)
      .round(d3.time.day.round)
      .alwaysUseRounding(true)
      .brushOn(true)
      .centerBar(false)

    chart
      .yAxis().ticks(0)

    return chart.render()
  }
}
</script>