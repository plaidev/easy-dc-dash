
<script lang='js'>

import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'
import {combineGroups} from '../utils'

export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'lineChart'
    },
    scale: {
      default: 'linear'
    }
  },

  computed: {
    combinedGroup: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const _reducer = this.reducerExtractor;
      const lineNum = _reducer(dim.top(1)[0]).length;
      const groups = [];
      for (let i=0; i<lineNum; i++) {
        groups.push(dim.group().reduceSum((d) => _reducer(d)[i]))
      }
      return combineGroups(groups)
    },
    reducer: function() {
      return null; // disable default reducer
    }
  },
  mounted: function() {
    const chart = this.chart;
    const dim = this.grouping
    const _reducer = this.reducerExtractor;

    if (!dim.top(1).length) return chart;

    const lineNum = _reducer(dim.top(1)[0] || {}).length;

    chart
      .brushOn(false)
      .group(this.combinedGroup, this.getLabel(this.getReduceKey(0)), (d) => d.value[0])
      .renderArea(true)
    for (let i=1; i<lineNum; i++) {
      chart
        .stack(this.combinedGroup, this.getLabel(this.getReduceKey(i)), (d) => d.value[i])
        .hidableStacks(true)
    }
    // FIXME:
      // Stack Overflow causes when `dc.override(chart, 'legendables', () => {/*...*/)` executing.
      // this called from dc/line-chart.js and utils/reverseLegendOrder()
    // if(this.useLegend) this.applyLegend({reverseOrder: true})
    return chart.render()
  }
}

</script>