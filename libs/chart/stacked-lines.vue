<template>
  <div class="krt-dc-stacked-lines" :id="id">
    <a class="reset" style="display: none">reset</a>
  </div>
</template>

<script lang='js'>

import d3 from 'd3'
import Base from './_base'
import Store from '../store'

function _generateReducer(idx=0) {
  return function() {
    const dim = Store.getDimension(this.dimensionName);
    const _reducer = this.getReducerExtractor;
    return dim.group().reduceSum((d) => _reducer(d)[idx]);
  }
}

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'lineChart'
    }
  },

  computed: {
    reducer: _generateReducer(0)
  },

  mounted: function() {
    const chart = this.chart;

    // 超手抜き
    const dim = this.grouping;
    const _reducer = this.getReducerExtractor;
    const lineNum = _reducer(dim.top(1)[0]).length;

    chart
      .renderArea(true)

    for (let i=1; i<lineNum; i++) {
      chart.stack(_generateReducer(i).apply(this));
    }

    return chart.render()
  }
}

</script>