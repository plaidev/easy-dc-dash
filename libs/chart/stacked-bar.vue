<template>
  <div class="krt-dc-stacked-bar" :id="id">
    <krt-dc-tooltip ref='tooltip'></krt-dc-tooltip>
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
    <div v-text="title" style="font-size:24px; text-align:center;"></div>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {combineGroups, removeEmptyBins} from '../utils'


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
    },
    elasticX: {
      type: Boolean,
      default: true
    },
    elasticY: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    combinedGroup: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const _reducer = this.reducerExtractor;
      const groups = [];
      for (let i=0; i<this.reduceKeys.length; i++) {
        groups.push(dim.group().reduceSum((d) => _reducer(d)[i]))
      }
      return combineGroups(groups)
    },
    reducer: function() {
      return null; // disable default reducer
    },
    xScale: function() {
      return Base.computed.xScale.apply(this) || d3.scale.ordinal()
    },
    reduceKeys: function() {
      return Object.keys(this.reducerExtractor({}))
    }
  },
  methods: {
    showTooltip: function(d) {
      const data = {
        key: d.data.key,
        val: d.data.value.reduce((a,b) => a+b)
      }
      this.$refs.tooltip.show(data)
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .group(this.combinedGroup, this.getLabel(0), (d) => d.value[0])
      .xUnits(dc.units.ordinal)
      .brushOn(false)
      .clipPadding(10)
      .elasticX(this.elasticX)
      .elasticY(this.elasticY)
      .renderHorizontalGridLines(this.renderHorizontalGridLines)
      .on('renderlet', () => {
        d3.selectAll('.krt-dc-stacked-bar rect.bar')
          .on("mouseover", this.showTooltip)
          .on("mousemove", this.moveTooltip)
          .on("mouseout", this.removeTooltip);
      })
    // stack
    for (let i=1; i<this.reduceKeys.length; i++) {
      chart.stack(this.combinedGroup, this.getLabel(i), (d) => d.value[i]);
    }
    this.applyLegend({reverseOrder:true})
    return chart.render();
  }
}
</script>

<style scoped>
.krt-dc-stacked-bar .rect.bar:hover {
  fill-opacity: 1;
}
</style>