
<script lang='js'>

import d3 from "d3"
import Base from './_base'
import Store from '../store'
import {removeEmptyBins} from '../utils'

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'rowChart'
    },
    scale: {
      type: String,
      default: 'linear'
    },
    removeEmptyRows: {
      default: true
    },
    // vertical gap space between rows
    gap: {
      type: Number,
      default: 5
    },
    // label
    labelOffsetX: {
      type: Number,
      default: 10
    },
    labeloffsetY: {
      type: Number,
      default: 10
    },
    useLegend: {
      default: false
    },
    rotateXAxisLabel: {
      default: true
    }
  },
  methods: {
    keyTextPostProcess: function(key) {
      let label = this.getLabel(key)
      return label.length > 20 ? label.substring(0,20)+'...' : label
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .x(d3.scale[this.scale]())
      .gap(this.gap)
      .elasticX(true)
      .othersLabel(this.othersLabel)
      .labelOffsetX(this.labelOffsetX)
      .labelOffsetY(this.labeloffsetY)
      .ordinalColors(['#bd3122', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb', '#d66b6e'])
      .on('pretransition', () => {
          chart.selectAll('g.row text')
            .text((d) => this.keyTextPostProcess(d.key))

          if (this.rotateXAxisLabel) {
            chart.selectAll(`#${this.id} g.axis text`)
              .attr('transform', 'translate(-5, 5) rotate(330)')
          }
      })

    if (this.cap && this.cap > 0) chart.rowsCap(this.cap)
    return chart
  }
}

</script>

<style lang="less" module>
.chart-root :global {
  g.row text {
    fill: #000;
    pointer-events: none;
  }
}
</style>