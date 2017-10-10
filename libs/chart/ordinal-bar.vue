
<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import coordinateGridBase from './_coordinateGridBase'
import Store from '../store'
import {removeEmptyBins} from '../utils'

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
      type: Boolean,
      default: true
    },
    useLegend: {
      default: false
    }
  },
  computed: {
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.reducerExtractor;
      const group = dim.group().reduceSum(reducer)
      return this.removeEmptyRows ? removeEmptyBins(group) : group
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