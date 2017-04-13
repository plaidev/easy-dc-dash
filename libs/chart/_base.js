import d3 from 'd3'
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
    },
    scale: {
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
    },
    min: function() {
      const dim = this.grouping;
      const dimExtractor = this.getDimensionExtractor;
      return dimExtractor(dim.bottom(1)[0]);
    },
    max: function() {
      const dim = this.grouping;
      const dimExtractor = this.getDimensionExtractor;
      return dimExtractor(dim.top(1)[0]);
    },
    xScale: function() {
      let scale;
      if (!this.scale) return null;

      if (this.scale === 'time') scale = d3.time.scale;
      else scale = d3.scale[this.scale];

      if (!scale) return null;
      return scale().domain([this.min, this.max])
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
    if (this.xScale) chart.x(this.xScale);

    this.chart = chart;

    return chart;
  },

  destroyed: function() {
    Store.unregisterChart(this.id);
    Store.unregisterDimension(this.dimensionName)
  }
}
