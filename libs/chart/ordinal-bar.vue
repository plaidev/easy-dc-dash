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
import {removeEmptyAndFilterBins} from '../utils'

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
      default: 0.05
    },
    outerPadding: {
      type: Number,
      default: 0
    },
    removeEmptyRows: {
      type: Boolean,
      default: true
    },
    // display limit
    rows: {
      type: Number
    }
  },
  computed: {
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.getReducerExtractor;
      const group = dim.group().reduceSum(reducer)
      return this.removeEmptyRows ? removeEmptyAndFilterBins(group, this.rows) : group
    },
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .xAxisLabel(this.xAxisLabel)
      .yAxisLabel(this.yAxisLabel)
      .barPadding(this.barPadding)
      .outerPadding(this.outerPadding)
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .elasticX(true)
      .elasticY(true)
    return chart.render();
  }
}

</script>