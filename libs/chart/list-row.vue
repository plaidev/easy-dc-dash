<template>
  <div class="krt-dc-list-row" :id="id">
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
      default: 'rowChart'
    },
    height: {
      type: Number,
      default: 400
    },
    width: {
      type: Number,
      default: 200
    },
    scale: {
      type: String,
      default: 'linear'
    },
    // display limit
    rows: {
      type: Number
    },
    // order by
    descending: {
      type: Boolean,
      default: true
    },
    // vertical gap space between rows
    gap: {
      type: Number,
      default: 5
    },
    // label
    labelOffsetX: {
      type: Number,
      default: 10
    },
    labeloffsetY: {
      type: Number,
      default: 10
    },
    titleLabelOffsetX: {
      type: Number,
      default: 2
    },
    renderTitleLabel: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.getReducerExtractor;
      return this.filteredGroup(dim.group().reduceSum(reducer))
    },
    rowNums: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const size = dim.group().size()
      if(!this.rows) return size
      return (this.rows > size) ? size : this.rows
    }
  },
  methods: {
    filteredGroup: function(group) {
      return {
        all: () => {
          return group.top(this.rowNums)
        }
      }
    }
  },
  mounted: function() {
    const chart = this.chart;
    const spaceForScales = 70;

    chart
      .height(this.height)
      .x(d3.scale[this.scale]())
      .gap(this.gap)
      .elasticX(true)
      .labelOffsetX(this.labelOffsetX)
      .labelOffsetY(this.labeloffsetY)
      .titleLabelOffsetX(this.titleLabelOffsetX)
      .renderTitleLabel(this.renderTitleLabel)
      .ordinalColors(['#bd3122', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb', '#d66b6e'])
      .fixedBarHeight((this.height - (this.rowNums + 1) * this.gap - spaceForScales) / this.rowNums)
      .ordering((d) => this.descending ? -d.value : d.value)
    return chart.render();
  }
}

</script>

<style scoped>
.krt-dc-list-row g.row text.titlerow {
    fill: #000000
  }
</style>