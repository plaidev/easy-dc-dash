<template>
  <div class="krt-dc-stacked-lines" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from 'd3'
import Base from './_base'
import Store from '../store'
import {combineGroups} from '../utils'

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'lineChart'
    }
  },

  computed: {
    combinedGroup: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const _reducer = this.getReducerExtractor;
      const lineNum = _reducer(dim.top(1)[0]).length;
      const groups = [];
      for (let i=0; i<lineNum; i++) {
        groups.push(dim.group().reduceSum((d) => _reducer(d)[i]))
      }
      return combineGroups(groups)
    }
  },

  mounted: function() {
    const chart = this.chart;

    // 超手抜き
    const dim = this.grouping;
    const _reducer = this.getReducerExtractor;
    const lineNum = _reducer(dim.top(1)[0]).length;
    chart
      .group(this.combinedGroup, '0', (d) => d.value[0])
      .renderArea(true)

    for (let i=1; i<lineNum; i++) {
      chart.stack(this.combinedGroup, ''+i, (d) => d.value[i]);
    }

    return chart.render()
  }
}

</script>