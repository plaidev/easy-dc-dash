
<script lang='js'>

import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'


export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'lineChart'
    }
  },
  mounted: function() {
    return this.chart
      .renderDataPoints({fillOpacity: 0.6, strokeOpacity: 0.6, radius: 6})
      .hidableStacks(true)
      .render()
  }
}

</script>