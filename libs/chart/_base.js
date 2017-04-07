import dc from 'dc'
import Store from '../store'
import {generateDomId} from '../utils'


export default {
  props: {
    dimension: {
      type: String,
      required: true
    },
    reduce: {
      type: String,
      required: true
    },
    id: {
      type: String,
      default: generateDomId
    },
    chartType: {
      type: String,
      required: true
    }
  },
  computed: {
    dimensionName: function() {
      return this.dimension;
    },
    grouping: function() {
      const grouping = new Function('d', 'return ' + this.dimension);
      return Store.registerDimension(this.dimensionName, grouping)
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName);
      const reducer = new Function('d', 'return ' + this.reduce);
      return dim.group().reduceSum(reducer)
    },
    accessor: function() {
      return null;
    }
  },
  mounted: function() {
    const chart = new dc[this.chartType](`#${this.id}`);

    if (this.grouping) chart.dimension(this.grouping);
    if (this.reducer) chart.group(this.reducer);
    if (this.accessor) chart.valueAccessor(this.accessor);

    this.chart = chart;
    return chart;
  },
  destroyed: function() {
    Store.unregisterDimension(this.dimensionName)
  }
}
