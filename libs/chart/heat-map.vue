
<script lang='js'>

import d3 from "d3"
import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'
import {splitKey, extractName} from '../utils'

export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'heatMap'
    },
    width: {
      type: Number,
      default: 45 * 20 + 80
    },
    height: {
      type: Number,
      default: 45 * 5 + 40
    },
    yBorderRadius: {
      type: Number,
      defaulat: 6.75
    }
  },
  methods: {
    showTooltip: function(d) {
      const fill = d3.event.target.getAttribute('fill')
      const xAxisLabel = this.xAxisLabel || this.firstKey
      const yAxisLabel = this.yAxisLabel || this.secondKey
      const data = {
        keys: {
          [xAxisLabel]: this.formatKey('x', d.key[0]),
          [yAxisLabel]: this.formatKey('y', d.key[1])
        },
        val: d.value
      }
      this.$refs.tooltip.show(data, fill)
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .keyAccessor(this.firstKeyAccessor)
      .valueAccessor(this.secondKeyAccessor)
      .colorAccessor(this.valueAccessor)
      .yBorderRadius(this.yBorderRadius)
      .colsLabel((d) => d + `${this.xAxisFormat}`)
      .rowsLabel((d) => d + `${this.yAxisFormat}`)
      .on('postRender', () => {
          if(!this.dateKey) {
            chart.selectAll('g.cols.axis text')
              .text(d => d.length > 10 ? d.substr(0,10)+'...' : d)
          }
      })
    return chart.render();
  }
}

</script>

<style scoped>
.box-group .heat-box:hover{
  fill-opacity: 0.5;
}
</style>
