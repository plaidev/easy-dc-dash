<template>
  <div class="krt-dc-segment-pie" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import Base from './_base'
import Store from '../store'


export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'lineChart'
    }
  },

  computed: {
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.getReducerExtractor;

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
  },

  mounted: function() {
    return this.chart
      .group(this.reducer, this.labels[0])
      .render()
  }
}

</script>