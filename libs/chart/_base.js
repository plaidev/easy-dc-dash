import dc from 'dc'
import Store from '../store'
import {generateDomId} from '../utils'


export default {

  template: `<div class="krt-dc-component" :id="id"></div>`,

  props: {
    dimension: {
      type: String
    },
    reduce: {
      type: String
    },
    id: {
      type: String,
      default: generateDomId
    },
    chartType: {
      type: String,
      default: 'barChart'
    },
    volume: {
      type: String
    }
  },

  computed: {
    parent: function() {
      return `#${this.id}`;
    },
    dimensionName: function() {
      return this.dimension;
    },
    getDimensionExtractor: function() {
      return new Function('d', 'return ' + this.dimension)
    },
    getReducerExtractor: function() {
      return new Function('d', 'return ' + this.reduce)
    },
    grouping: function() {
      const grouping = this.getDimensionExtractor;
      return Store.registerDimension(this.dimensionName, grouping)
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName);
      const reducer = this.getReducerExtractor;
      return dim.group().reduceSum(reducer)
    },
    accessor: function() {
      return null;
    }
  },

  mounted: function() {
    const chart = Store.registerChart(
      this.parent,
      this.id,
      this.chartType,
      {volume: this.volume}
    );

    if (this.grouping) chart.dimension(this.grouping);
    if (this.reducer) chart.group(this.reducer);
    if (this.accessor) chart.valueAccessor(this.accessor);

    this.chart = chart;

    return chart;
  },

  destroyed: function() {
    Store.unregisterChart(this.id);
    Store.unregisterDimension(this.dimensionName)
  }
}
