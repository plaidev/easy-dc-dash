<template>
  <div class="krt-dc-stacked-bar" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {removeEmptyBins, reverseLegendOrder} from '../utils'

function _generateReducer(idx=0) {
  return function() {
    const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
    const _reducer = this.getReducerExtractor;
    const group = dim.group().reduceSum((d) => _reducer(d)[idx]);
    return this.removeEmptyRows ? removeEmptyBins(group) : group
  }
}

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'barChart'
    },
    labels: {
      type: Array
    },
    renderHorizontalGridLines: {
      type: Boolean,
      default: true
    },
    legend: {
      type: Object,
      default: () => {return {x:0, y:0, gap: 5, width: 300, itemWidth: 70, itemHeight: 12, horizontal: false}}
    },
    removeEmptyRows: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    reducer: _generateReducer(0)
  },
  mounted: function() {
    const chart = this.chart;
    const barNum = this.labels.length

    chart
      .group(this.reducer, this.labels[0])
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .brushOn(false)
      .clipPadding(10)
      .elasticX(true)
      .elasticY(true)
      .xAxisLabel(this.xAxisLabel)
      .yAxisLabel(this.yAxisLabel)
      .renderLabel(this.renderLabel)
      .renderHorizontalGridLines(this.renderHorizontalGridLines)
      .title(function(d) {
        return d.key + '[' + this.layer + ']: ' + d.value
      })
    // stack
    for (let i=1; i<barNum; i++) {
      chart.stack(_generateReducer(i).apply(this), this.labels[i]);
    }
    this.applyLegend({reverseOrder:true})
    return chart.render();
  }
}
</script>