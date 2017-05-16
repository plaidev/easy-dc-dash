import d3 from 'd3'
import dc from 'dc'
import Store from '../store'
import {generateDomId, generateExtractor, reverseLegendOrder} from '../utils'
import ResetButton from './components/reset-button.vue'

export default {

  template: `<div class="krt-dc-component" :id="id"><reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button></div>`,

  components: {
    'reset-button': ResetButton
  },

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
    },
    margins: {
      type: Object
    },
    xAxisLabel: {
      type: String,
      default: ''
    },
    xAxisFormat: {
      type: String,
      default: ''
    },
    yAxisLabel: {
      type: String,
      default: ''
    },
    yAxisFormat: {
      type: String,
      default: ''
    },
    renderLabel: {
      type: Boolean,
      default: true
    },
    renderTitle: {
      type: Boolean,
      default: true
    },
    useLegend: {
      type: Boolean,
      default: true
    },
    transitionDuration: {
      type: Number,
      default: 750
    },
    labels: {
    }
  },

  computed: {
    parent: function() {
      return `#${this.id}`;
    },
    dimensionName: function() {
      return this.dimension;
    },
    dimensionExtractor: function() {
      return generateExtractor(this.dimension)
    },
    reducerExtractor: function() {
      return generateExtractor(this.reduce)
    },
    grouping: function() {
      const grouping = this.dimensionExtractor;
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.reducerExtractor;
      return dim.group().reduceSum(reducer)
    },
    accessor: function() {
      return null;
    },
    min: function() {
      const dim = this.grouping;
      const dimExtractor = this.dimensionExtractor;
      return dimExtractor(dim.bottom(1)[0]);
    },
    max: function() {
      const dim = this.grouping;
      const dimExtractor = this.dimensionExtractor;
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

  methods: {
    removeFilterAndRedrawChart: function() {
      this.chart.filterAll();
      dc.redrawAll();
    },
    applyLegend: function(options={}) {
      if(!this.useLegend || !this.legend) return

      const {
        indexLabel = false,
        reverseOrder = false
      } = options;

      const l = this.legend
      
      const legendInstance = dc.legend()
        .x(l.x).y(l.y)
        .gap(l.gap).legendWidth(l.width)
        .itemWidth(l.itemWidth).itemHeight(l.itemHeight)
        .horizontal(l.horizontal)
        .legendText((d, i) => {
          const k = indexLabel? i: d.name;
          return this.getLabel(k)
        })

      this.chart.legend(legendInstance)
      if(reverseOrder) reverseLegendOrder(this.chart)
    },
    getLabel: function(key) {
      return Store.getLabel(key, {
        dataset: this.dataset,
        chartName: this.id
      })
    }
  },

  mounted: function() {
    const chart = Store.registerChart(
      this.parent,
      this.id,
      this.chartType,
      {volume: this.volume}
    );

    if (this.labels) {
      let labels = this.labels;
      if (typeof this.labels === 'string' || this.labels instanceof String) 
        labels = this.labels.split(',');
      Store.setLabels(labels, {
        dataset: this.dataset,
        chartName: this.id
      })
    }

    if (this.grouping) chart.dimension(this.grouping);
    if (this.reducer) chart.group(this.reducer);
    if (this.accessor) chart.valueAccessor(this.accessor);
    if (this.xScale) chart.x(this.xScale);
    if (this.width) chart.width(this.width);
    if (this.height) chart.height(this.height);
    if (this.margins) chart.margins(this.margins);
    if (this.xAxisLabel) chart.xAxisLabel(this.xAxisLabel)
    if (this.yAxisLabel) chart.yAxisLabel(this.yAxisLabel)

    chart
      .renderLabel(this.renderLabel)
      .renderTitle(this.renderTitle)
      .transitionDuration(this.transitionDuration)
      .label((d) => {
        return this.getLabel(d.key)
      })
      .filterPrinter((filters) => {
        return filters
          .map((filter) => {
            return this.getLabel(dc.printers.filter(filter))
          })
          .join(', ')
      })

    this.chart = chart;

    return chart;
  },

  destroyed: function() {
    Store.unregisterChart(this.id);
    Store.unregisterDimension(this.dimensionName, {dataset: this.dataset})
  }
}
