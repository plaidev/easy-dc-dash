
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
      default: 'time.day'
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
    showTooltip: function(d) {
      const fill = d3.event.target.getAttribute('fill')
      const data = {
        key: d.data.key,
        val: d.data.value
      }
      this.$refs.tooltip.show(data, fill)
    }
  },
  mounted: function() {
    const chart = this.chart
    chart
      .centerBar(true)
      .gap(1)
      .elasticY(true)
      .round(d3.time.day.round)
      .alwaysUseRounding(true)

    chart
      .yAxis().ticks(0)

    return chart.render()
  }
}
</script>