
<script lang='js'>
import dc from 'dc'
import Base from './_base'
import Store from '../store'

export default {
  extends: Base,

  props: {
    dimension: {
      type: String,
    },
    chartType: {
      type: String,
      default: 'pieChart'
    },
    useLegend: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    grouping: function() {
      const getter = this.dimensionExtractor;
      const grouping = (d) => {
        let v = getter(d);
        if (!(v instanceof Array)) v = [v];
        return v.join(',');
      }
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset});
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
    const chart = this.chart;
    chart
      .cx(this.layoutSettings.chartCenter.x)
      .cy(this.layoutSettings.chartCenter.y)

    return chart.render()
  },

  destroyed: function() {
    Store.unregisterDimension(this.dimension, {dataset: this.dataset})
  }
}


</script>

<style scoped>
.pie-label-group text {
  pointer-events: none;
}
</style>
