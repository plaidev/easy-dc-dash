<template>
  <div class="krt-dc-segment-pie" :id="id">
    <a class="reset" style="display: none">reset</a>
  </div>
</template>

<script lang='js'>

import d3 from "d3"

import Base from './_base'
import Store from '../store'


const _weekFormat = d3.time.format("%w")

export default {
  props: Object.assign({}, Base.props, {
    chartType: {
      type: String,
      default: 'rowChart'
    }
  }),
  computed: Object.assign({}, Base.computed, {
    dimensionName: function() {
      return `week(${this.dimension})`
    },
    grouping: function() {
      const getter = new Function('d', 'return ' + this.dimension);
      const grouping = (d) => Number(_weekFormat(getter(d)))
      return Store.registerDimension(this.dimensionName, grouping)
    }
    // TODO: 週平均の方がいい
  }),
  mounted: function() {
    const chart = Base.mounted.apply(this)

    chart
      .width(240).height(200)
      .margins({
        top: 0,
        right: 0, // 50
        bottom: 20,
        left: 0 // 60
      })
      .title(function(p) {
        return "test"
      })
      .label(function(d) {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.key]
      })
      .ordinalColors(['#bd3122', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb', '#d66b6e'])
      .renderTitle(true)
      .x(d3.scale.linear().domain([0, 7]))
      .elasticX(true);

      //.y(d3.scale.linear().domain([500, 5000]))

    return chart.render();
  }
}

</script>