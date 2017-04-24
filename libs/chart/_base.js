import d3 from 'd3'
import dc from 'dc'
import Store from '../store'
import {generateDomId, generateExtractor} from '../utils'


export default {

  template: `<div class="krt-dc-component" :id="id"></div>`,

  props: {
    dataset: {
      type: String,
      default: 'default'
    },
    dimension: {
    },
    reduce: {
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
    },
    width: {
      type: Number
    },
    height: {
      type: Number
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
      return generateExtractor(this.dimension)
    },
    getReducerExtractor: function() {
      return generateExtractor(this.reduce)
    },
    grouping: function() {
      const grouping = this.getDimensionExtractor;
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
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
    if (this.width) chart.width(this.width);
    if (this.height) chart.width(this.height);

    this.chart = chart;

    return chart;
  },

  destroyed: function() {
    Store.unregisterChart(this.id);
    Store.unregisterDimension(this.dimensionName, {dataset: this.dataset})
  }
}
