<template>
  <div class="krt-dc-segment-pie" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>
import dc from 'dc'
import Base from './_base'
import Store from '../store'

export default {
  extends: Base,

  props: {
    dimension: {
      type: String,
      default: 'd.segments'
    },
    chartType: {
      type: String,
      default: 'pieChart'
    },
    segments: {
      required: true
    },
    labels: {
      type: Object
    },
    height: {
      type: Number,
      default: 160
    },
    width: {
      type: Number,
      default: 200
    },
    legend: {
      type: Object,
      default: () => {return {x:0, y:0, gap: 5, width: 200, itemWidth: 70, itemHeight: 12, horizontal: true}}
    },
  },

  computed: {
    dimensionName: function() {
      return `segments(${this.segmentIds.join(',')})`
    },
    grouping: function() {
      const segments = this.segmentIds;
      const getter = this.dimensionExtractor;
      const grouping = (d) => {
        const segs = getter(d).split(',');
        const idx = segments.findIndex((segment) => {
          return (segs.findIndex((seg) => seg == segment) >= 0)
        })
        return idx >= 0 ? segments[idx]: 'none';
      }
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset});
    },
    segmentIds: function() {
      if (this.segments instanceof Array) {
        return this.segments;
      }
      if (typeof this.segments === 'string' || this.segments instanceof String) {
        return this.segments.split(',')
      }
      else if (this.segments instanceof Object) {
        return Object.keys(this.segments)
      }
      return []
    }
  },

  methods: {
    segmentLabel: function(segmentId) {
      let label = segmentId;
      if (this.labels && segmentId in this.labels) {
        label = this.labels[segmentId]
      }
      else if (this.segments instanceof Object && this.segments[segmentId]) {
        label = this.segments[segmentId]
      }
      else {
        label = Store.getLabel(segmentId)
      }
      return label;
    }
  },

  mounted: function() {
    const chart = this.chart;
    chart
      .label((d) => this.segmentLabel(d.key))
    this.applyLegend()
    return chart.render()
  },

  destroyed: function() {
    Store.unregisterDimension(this.dimension, {dataset: this.dataset})
  }
}


</script>