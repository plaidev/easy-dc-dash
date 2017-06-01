
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
      default: 60
    },
    scale: {
      default: 'time.day'
    }
    useLegend: {
      default: false
    }
  },
  computed: {
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
      // .centerBar(true)
      .gap(1)
      .elasticY(true)
      .round(d3.time.day.round)
      .alwaysUseRounding(true)
      .brushOn(true)

    chart
      .yAxis().ticks(0)

    return chart.render()
  }
}
</script>