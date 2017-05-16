<template>
  <div class="krt-dc-multidim-pie" :id="id">
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
    },
    chartType: {
      type: String,
      default: 'pieChart'
    },
    height: {
      type: Number,
      default: 160
    },
    width: {
      type: Number,
      default: 200
    },
    useLegend: {
      type: Boolean,
      default: true
    },
    legendGap: {
      type: Number,
      default: 5
    },
    legendX: {
      type: Number,
      default: 0
    },
    legendY: {
      type: Number,
      default: 0
    },
    legendItemHeight: {
      type: Number,
      default: 12
    },
    legendItemWidth: {
      type: Number,
      default: 70
    },
    legendHorizontal: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    grouping: function() {
      const getter = this.dimensionExtractor;
      const grouping = (d) => {
        let v = getter(d);
        if (!(v instanceof Array)) v = [v];
        return v.join(',');
      }
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset});
    }
  },

  methods: {
    segmentLabel: function(segmentId) {
      let label = segmentId;
      if (this.labels && segmentId in this.labels) {
        label = this.labels[segmentId]
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
    if(this.useLegend) {
      chart.legend(dc.legend().gap(this.legendGap).x(this.legendX).y(this.legendY).legendWidth(this.width).itemWidth(this.legendItemWidth).itemHeight(this.legendItemHeight).horizontal(this.legendHorizontal))
    }
    return chart.render()
  },

  destroyed: function() {
    Store.unregisterDimension(this.dimension, {dataset: this.dataset})
  }
}


</script>