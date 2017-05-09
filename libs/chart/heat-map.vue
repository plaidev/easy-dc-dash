<template>
  <div class="krt-dc-heat-map" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'

function _splitkey(k) {
  return k.split(',')
}datata

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'heatMap'
    },
    dimensions: {
      type: String
    },
    width: {
      type: Number,
      default: 45 * 20 + 80
    },
    height: {
      type: Number,
      default: 45 * 5 + 40
    }
  },
  computed: {
    dimensionName: function() {
      return this.dimensions
    },
    getDimensionExtractor: function() {
      return generateExtractor(this.dimensions)
    }
  },
  methods: {
    extractName: function(name) {
      return name.replace(/d\./, '')
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .width(this.width)
      .height(this.height)
      .keyAccessor((d) => d.key[0])
      .valueAccessor((d) => d.key[1])
      .colorAccessor((d) => d.value)
      .title(function(d) {
          return `${this.extractName(_splitkey(d.key)[0])}: ${d.key[0]}\n`
                 + `${this.extractName(_splitkey(d.key)[1])}: ${d.key[1]}\n`
                 + `#{this.extractName(this.reduce)} ${d.value} ${this.valueFormat}})`
      .colors(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
    return chart.render();
  }
}

</script>