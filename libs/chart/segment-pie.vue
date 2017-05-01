<template>
  <div class="krt-dc-segment-pie" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>
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
    width: {
      type: Number,
      default: 240
    },
    height: {
      type: Number,
      default: 200
    }
  },

  computed: {
    dimensionName: function() {
      return `segments(${this.segmentIds.join(',')})`
    },
    grouping: function() {
      const segments = this.segmentIds;
      const getter = this.getDimensionExtractor;
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
      .render()
    return chart
  },

  destroyed: function() {
    Store.unregisterDimension(this.dimension, {dataset: this.dataset})
  }
}


</script>

<style scoped>
a.reset {
  display: block;
  position: absolute;
  width: 5em;
  right: 0;
}
</style>