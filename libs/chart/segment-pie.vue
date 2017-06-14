
<script lang='js'>
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {removeEmptyBins, roundDecimalFormat} from '../utils'

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'pieChart'
    },
    segments: {
      required: true
    },
    useLegend: {
      type: Boolean,
      default: true
    }
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
    },
    tooltipAccessor: function() {
      return (d, i) => {
        const _rate = (d.endAngle - d.startAngle) / (2*Math.PI) * 100;
        const rate = roundDecimalFormat(_rate, 2)
        return {
          key: this.segmentLabel(d.data.key),
          val: d.value,
          rate: rate
        }
      }
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
      .othersLabel(this.othersLabel)
      .cx(this.layoutSettings.chartCenter.x)
      .cy(this.layoutSettings.chartCenter.y)
      .label((d) => this.segmentLabel(d.key))
    if(this.cap && this.cap > 0) chart.slicesCap(this.cap)
    return chart.render()
  },

  destroyed: function() {
    Store.unregisterDimension(this.dimension, {dataset: this.dataset})
  }
}

</script>

<style lang="less" module>
.chart-root {
  .pie-label-group text {
    pointer-events: none;
  }
}
</style>
