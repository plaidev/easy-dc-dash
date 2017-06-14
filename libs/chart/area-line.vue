
<script lang='js'>

import StackedLines from './stacked-lines.vue'

export default {
  extends: StackedLines,
  props: {
    useDataPoints: {
      default: false
    }
  },
  methods: {
    _getValue: function(d, idx) {
      if (this.isRateReducer) {
        return d.value[idx].count !== 0 ? d.value[idx].value / d.value[idx].count : 0
      }
      return d.value[idx]
    },
    generateValueAccessor: function(idx) {
      return (d) => {
        if (idx === 0) return this._getValue(d, 0)
        else {
          return this._getValue(d, idx) - this._getValue(d, 0)
        }
      }
    }
  }
}
</script>

<style lang="less" module>
.chart-root :global {
  .dc-chart .stack._0 .area {
    fill-opacity: 0;
  }
}
</style>
