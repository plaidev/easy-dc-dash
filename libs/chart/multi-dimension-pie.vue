
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
    },
    tooltipAccessor: function() {
      return (d, i) => {
        const _rate = (d.endAngle - d.startAngle) / (2*Math.PI) * 100;
        const rate = roundDecimalFormat(_rate, 2)
        if (this.tooltipFormatter) {
          const _tooltipFormat = d3.format(this.tooltipFormatter)
          d.value = _tooltipFormat(d.value)
        }
        return {
          key: d.data.key,
          val: d.value,
          rate: rate
        }
      }
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

    if(!this.showLabel) {
      chart.label(d => null)
    }
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
