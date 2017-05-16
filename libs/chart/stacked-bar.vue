<template>
  <div class="krt-dc-stacked-bar" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {combineGroups, removeEmptyBins} from '../utils'

function _extractReduceKey(reduce) {
  // FIXME: Replace if there is a better way
  return reduce.match(/d.\w*/g)
}

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
      for (let i=0; i<this._labels.length; i++) {
        groups.push(dim.group().reduceSum((d) => _reducer(d)[i]))
      }
      return combineGroups(groups)
    },
    reduceKeys: function() {
      return _extractReduceKey(this.reduce)
    },
    _labels: function() {
      return this.labels || this.reduceKeys
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .group(this.combinedGroup, this._labels[0], (d) => d.value[0])
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .brushOn(false)
      .clipPadding(10)
      .elasticX(this.elasticX)
      .elasticY(this.elasticY)
      .renderHorizontalGridLines(this.renderHorizontalGridLines)
      .title(function(d) {
        return d.key + '[' + this.layer + ']: ' + d.value
      })
    // stack
    for (let i=1; i<this._labels.length; i++) {
      chart.stack(this.combinedGroup, this._labels[i], (d) => d.value[i]);
    }
    this.applyLegend({reverseOrder:true})
    return chart.render();
  }
}
</script>