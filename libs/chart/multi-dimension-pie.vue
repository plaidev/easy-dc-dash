
<script lang='js'>
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {removeEmptyBins} from '../utils'

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
    },
    tooltipAccessor: function() {
      return (d, i) => {
        return {
          key: d.data.key,
          val: d.value
        }
      }
    }
  },

  mounted: function() {
    const chart = this.chart;
    chart
      .othersLabel(this.othersLabel)
      .cx(this.layoutSettings.chartCenter.x)
      .cy(this.layoutSettings.chartCenter.y)

    if(this.cap && this.cap > 0) chart.slicesCap(this.cap)
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
