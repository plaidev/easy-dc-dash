<template>
  <div class="krt-dc-segment-pie" :id="id">
    <a class="reset" style="display: none">reset</a>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'

import Base from './_base'
import Store from '../store'


export default {
  props: Object.assign({}, Base.props, {
    chartType: {
      type: String,
      default: 'lineChart'
    }
  }),
  computed: Object.assign({}, Base.computed, {
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName);
      const reducer = new Function('d', 'return ' + this.reduce);

      return dim.group().reduce(
        (p, v) => {
          const {count, value} = reducer(v);
          p.count += count;
          p.total += value;
          return p;
        },
        (p, v) => {
          const {count, value} = reducer(v);
          p.count -= count;
          p.total -= value;
          return p;
        },
        () => {
          return {
            count: 0,
            total: 0
          }
        }
      );
    },
    accessor: function() {
      return function(p) {
        return p.value.count > 0 ? p.value.total / p.value.count : 0;
      }
    }
  }),
  mounted: function() {
    const dim = this.grouping;
    const reducer = new Function('d', 'return ' + this.dimension);

    const min = reducer(dim.bottom(1)[0]);
    const max = reducer(dim.top(1)[0]);

    return Base.mounted.apply(this)
      .x(d3.time.scale().domain([min, max]))
      .render()
  }
}

</script>