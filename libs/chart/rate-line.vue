
<script lang='js'>

import d3 from "d3"
import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'


export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'lineChart'
    },
    useLegend: {
      default: false
    }
  },
  mounted: function() {
    return this.chart
      .y(d3.scale.linear().domain([0, 1]))
      .elasticY(false)
      .hidableStacks(true)
  }
}

</script>