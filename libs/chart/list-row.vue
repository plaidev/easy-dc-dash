<template>
  <div class="krt-dc-list-row" :id="id">
    <a class="reset" style="display: none">reset</a>
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
    barHeight: {
      type: Number,
      default: 30
    },
    gap: {
      type: Number,
      default: 5
    },
    labelOffsetX: {
      type: Number,
      default: 10
    },
    labeloffsetY: {
      type: Number,
      default: 15
    },
    titleLabelOffsetX: {
      type: Number,
      default: 2
    },
    elasticX: {
      type: Boolean,
      default: true
    },
    renderTitleLabel: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      cfSize: Store.getCfSize({dataset: this.dataset})
    }
  },
  mounted: function() {
    const chart = this.chart;
    // const count = top(N)
    chart
      .width(this.width)
      .height(this.cfSize * this.barHeight)
      .x(d3.scale.linear().domain([0, this.cfSize]))
      .labelOffsetX(this.labelOffsetX)
      .labelOffsetY(this.labeloffsetY)
      .elasticX(this.elasticX)
      .renderTitleLabel(this.renderTitleLabel)
      .titleLabelOffsetX(this.titleLabelOffsetX)
      // .gap(this.gap)
      // .fixedBarHeight(this.height - (count + 1) * this.gap - this.barHeight / count)
      .ordinalColors(['#bd3122', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb', '#d66b6e'])
      .ordering(function(d) { return -d.value })
    return chart.render();
  }
}

</script>