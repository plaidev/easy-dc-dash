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
    const _reducer = new Function('d', 'return ' + this.reduce);
    return dim.group().reduceSum((d) => _reducer(d)[idx]);
  }
}

export default {
  props: Object.assign({}, Base.props, {
    chartType: {
      type: String,
      default: 'lineChart'
    }
  }),
  computed: Object.assign({}, Base.computed, {
    reducer: _generateReducer(0)
  }),
  mounted: function() {
    const chart = Base.mounted.apply(this)

    const dim = this.grouping;
    const _getter = new Function('d', 'return ' + this.dimension);
    const min = _getter(dim.bottom(1)[0]);
    const max = _getter(dim.top(1)[0]);

    // 超手抜き
    const _reducer = new Function('d', 'return ' + this.reduce);
    const lineNum = _reducer(dim.top(1)[0]).length;

    chart
      .renderArea(true)
      .x(d3.time.scale().domain([min, max]))

    for (let i=1; i<lineNum; i++) {
      chart.stack(_generateReducer(i).apply(this));
    }

    return chart.render()
  }
}

</script>