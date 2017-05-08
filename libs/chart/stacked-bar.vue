<template>
  <div class="krt-dc-stacked-bar" :id="id">
    <a class="reset" style="display: none">reset</a>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {removeEmptyBins} from '../utils'

function _generateReducer(idx=0) {
  return function() {
    const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
    const _reducer = this.getReducerExtractor;
    const group = dim.group().reduceSum((d) => _reducer(d)[idx]);
    return this.removeEmptyRows ? removeEmptyBins(group) : group
  }
}
import {combineGroups, removeEmptyAndFilterBinsForCombinedGroup, reverseLegendOrder} from '../utils'

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
    // display limit
    rows: {
      type: Number
    },
    xAxisLabel: {
      type: String,
      default: 'xAxisLabel'
    },
    yAxisLabel: {
      type: String,
      default: 'yAxisLabel'
    },
    renderLabel: {
      type: Boolean,
      default: true
    },
    renderHorizontalGridLines: {
      type: Boolean,
      default: true
    },
    legendX: {
      type: Number,
      default: 0
    },
    legendY: {
      type: Number,
      default: 0
    },
    removeEmptyRows: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    combinedGroup: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const _reducer = this.getReducerExtractor;
      const groups = []
      for (let i=0; i<this.labels.length; i++) {
        groups.push(dim.group().reduceSum((d) => _reducer(d)[i]))
      }
      return removeEmptyAndFilterBinsForCombinedGroup(combineGroups(groups), this.rows)
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .group(this.combinedGroup, this.labels[0], (d) => d.value[0])
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .brushOn(false)
      .clipPadding(10)
      .elasticX(true)
      .elasticY(true)
      .xAxisLabel(this.xAxisLabel)
      .yAxisLabel(this.yAxisLabel)
      .renderLabel(this.renderLabel)
      .legend(dc.legend().x(this.legendX).y(this.legendY))
      .renderHorizontalGridLines(this.renderHorizontalGridLines)
    // stack
    for (let i=1; i<this.labels.length; i++) {
      chart.stack(this.combinedGroup, this.labels[i], (d) => d.value[i]);
    }
    // reverse dc.legend() order
    // See: http://stackoverflow.com/questions/39811210/dc-charts-change-legend-order
    dc.override(chart, 'legendables', function() {
        var items = chart._legendables();
        return items.reverse();
    });

    return chart.render();
  }
}
</script>