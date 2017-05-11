<template>
  <div class="krt-dc-ordinal-bar" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {removeEmptyBins} from '../utils'

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'barChart'
    },
    barPadding: {
      type: Number,
      default: 0.1
    },
    outerPadding: {
      type: Number,
      default: 0.5
    },
    removeEmptyRows: {
      type: Boolean,
      default: true
    },
  },
  computed: {
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.getReducerExtractor;
      const group = dim.group().reduceSum(reducer)
      return this.removeEmptyRows ? removeEmptyBins(group) : group
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .xAxisLabel(this.xAxisLabel)
      .yAxisLabel(this.yAxisLabel)
      .barPadding(this.barPadding)
      .outerPadding(this.outerPadding)
      .renderLabel(this.renderLabel)
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .elasticX(true)
      .elasticY(true)
    return chart.render();
  }
}

</script>