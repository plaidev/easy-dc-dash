<template>
  <div class="krt-dc-segment-pie" :id="id">
    <a class="reset" style="display: none">reset</a>
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
    }
  },

  computed: {
    dimensionName: function() {
      return `segments(${this.segments.join(',')})`
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
      return Store.registerDimension(this.dimensionName, grouping);
    },
    segmentIds: function() {
      if (this.segments instanceof Array) return this.segments;
      return this.segments.split(',')
    }
  },

  methods: {
    segmentLabel: function(segmentId) {
      return segmentId in this.labels ? this.labels[segmentId]: segmentId;
    }
  },

  mounted: function() {
    const chart = this.chart;
    chart
      .width(240).height(200)
      .label((d) => this.segmentLabel(d.key))
      .render()
    return chart
  },

  destroyed: function() {
    Store.unregisterDimension(this.dimension)
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