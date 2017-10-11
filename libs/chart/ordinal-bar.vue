
<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import coordinateGridBase from './_coordinateGridBase'
import Store from '../store'

export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'barChart'
    },
    elasticX: {
      type: Boolean,
      default: true
    },
    elasticY: {
      type: Boolean,
      default: true
    },
    barPadding: {
      type: Number,
      default: 0.1
    },
    outerPadding: {
      type: Number,
      default: 0.5
    },
    removeEmptyRows: {
      default: true
    },
    useLegend: {
      default: false
    }
  },
  mounted: function() {
    const chart = this.chart;
    chart
      .barPadding(this.barPadding)
      .outerPadding(this.outerPadding)
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .elasticX(this.elasticX)
      .elasticY(this.elasticY)
      .renderVerticalGridLines(false)
    return chart
  }
}

</script>