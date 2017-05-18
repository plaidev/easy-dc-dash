
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
    useLegend: {
      type: Boolean,
      default: true
    },
    layout: {
      default: 'square-and-legend'
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

  mounted: function() {
    const chart = this.chart;

    return chart.render()
  },

  destroyed: function() {
    Store.unregisterDimension(this.dimension, {dataset: this.dataset})
  }
}


</script>