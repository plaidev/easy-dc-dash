
<script lang='js'>

import d3 from "d3"
import Base from './_base'
import Store from '../store'
import {removeEmptyBins} from '../utils'

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'rowChart'
    },
    scale: {
      type: String,
      default: 'linear'
    },
    // order by
    descending: {
      type: Boolean,
      default: true
    },
    // vertical gap space between rows
    gap: {
      type: Number,
      default: 5
    },
    // label
    labelOffsetX: {
      type: Number,
      default: 10
    },
    labeloffsetY: {
      type: Number,
      default: 10
    },
    useLegend: {
      default: false
    }
  },
  computed: {
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.reducerExtractor;
      return removeEmptyBins(dim.group().reduceSum(reducer))
    }
  },
  methods: {
    showTooltip: function(d) {
      const fill = d3.event.target.getAttribute('fill')
      const data = {
        key: d.key,
        val: d.value
      }
      this.$refs.tooltip.show(data, fill)
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .x(d3.scale[this.scale]())
      .gap(this.gap)
      .elasticX(true)
      .othersLabel(this.othersLabel)
      .labelOffsetX(this.labelOffsetX)
      .labelOffsetY(this.labeloffsetY)
      .ordinalColors(['#bd3122', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb', '#d66b6e'])
      .ordering((d) => this.descending ? -d.value : d.value)
    if(this.cap && this.cap > 0) chart.rowsCap(this.cap)
    return chart.render();
  }
}

</script>

<style scoped>
g.row text {
  pointer-events: none;
}
g.row text.titlerow {
  fill: #000000
}
</style>