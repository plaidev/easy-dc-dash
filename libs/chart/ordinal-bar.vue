<template>
  <div class="krt-dc-ordinal-bar" :id="id">
    <a class="reset" style="display: none">reset</a>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'barChart'
    },
    xAxisLabel: {
      type: String,
      default: 'xAxisLabel'
    },
    yAxisLabel: {
      type: String,
      default: 'yAxisLabel'
    },
    barPadding: {
      type: Number,
      default: 0
    },
    outerPadding: {
      type: Number,
      default: 0.5
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .brushOn(false)
      .xAxisLabel(this.xAxisLabel)
      .yAxisLabel(this.yAxisLabel)
      .barPadding(this.barPadding)
      .outerPadding(this.outerPadding)
    return chart.render();
  }
}

</script>