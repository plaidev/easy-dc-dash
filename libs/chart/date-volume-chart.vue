
<script lang="js">
import Base from './_base'
import Store from '../store'
import {ymdFormat} from '../utils/time-format'

export default {
  extends: Base,
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
      default: 'time'
    }
  },
  computed: {
    layoutSettings: function() {
      const settings = Base.computed.layoutSettings.apply(this)
      settings.legend = null;
      return settings;
    }
  },
  mounted: function() {
    const chart = this.chart
    chart
      .centerBar(true)
      .gap(1)
      .elasticY(true)
      .round(d3.time.day.round)
      //.round(time.week.round)
      .alwaysUseRounding(true)
      .xUnits(d3.time.days)
      .yAxis().ticks(0)

    return chart.render()
  }
}
</script>