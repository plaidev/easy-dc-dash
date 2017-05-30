
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
    renderHorizontalGridLines: {
      type: Boolean,
      default: true
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
      const fill = d3.event.target.getAttribute('fill')
      const data = {
        key: d.data.key,
        val: d.data.value.reduce((a,b) => a+b)
      }
      this.$refs.tooltip.show(data, fill)
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
    // stack
    for (let i=1; i<this.reduceKeys.length; i++) {
      chart
        .stack(this.combinedGroup, this.getLabel(i), (d) => d.value[i])
        .hidableStacks(true)
    }
    this.applyLegend({reverseOrder:true})
    return chart.render();
  }
}
</script>