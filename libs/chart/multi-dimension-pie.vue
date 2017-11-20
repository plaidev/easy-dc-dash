
<script lang='js'>
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {roundDecimalFormat} from '../utils'

export default {
  extends: Base,
  props: {
    chartType: {
      type: String,
      default: 'pieChart'
    },
    color: {
      type: String,
      default: 'tint'
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

  watch: {
    layoutSettings: function() {
      this.chart
        .cx(this.layoutSettings.chartCenter.x)
        .cy(this.layoutSettings.chartCenter.y)
      this.render()
    }
  },

  mounted: function() {
    const chart = this.chart;
    chart
      .othersLabel(this.othersLabel)

    // TODO: このあたりもlayoutとして調整するか？
    if(this.cap && this.cap > 0) chart.slicesCap(this.cap)
    return chart
  },

  destroyed: function() {
    Store.unregisterDimension(this.dimension, {dataset: this.dataset})
  }
}


</script>

<style lang='less' module>
.chart-root :global {
  .pie-label-group text {
    pointer-events: none;
  }
}
</style>
