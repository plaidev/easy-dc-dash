import d3 from 'd3'
import dc from 'dc'
import 'dc/dc.css'
import Store from '../store'
import {generateDomId, generateExtractor, reverseLegendOrder} from '../utils'
import {TIME_FORMATS, TIME_INTERVALS} from '../utils/time-format'
import ResetButton from '../components/reset-button.vue'
import CardContainer from '../components/card.vue'

export default {

  template: `
    <card :title="title" :width="width" :height="height">
      <div class="krt-dc-component" :id="id" style="display: flex; align-items: center; justify-content: center">
        <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
      </div>
    </card>
  `,

  components: {
    'card': CardContainer,
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
    title: {
      type: String,
      default: ''
    },
    dateKey: {
      type: String
    },
    timeScale: {
      type: String
    },
    volume: {
      type: String
    },
    scale: {
      type: String
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
    },
    width: {
    },
    height: {
    },
    layout: {
      type: String,
      default: 'overlay-legend'
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
    reduceKeys: function() {
      return []
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
    },
    layoutSettings: function() {
      const {width, height} = this.getContainerInnerSize()
      return Store.getTheme().layout(this.layout, {width, height});
    }
  },

  methods: {
    removeFilterAndRedrawChart: function() {
      this.chart.filterAll();
      dc.redrawAll();
    },
    getLabel: function(key) {
      return Store.getLabel(key, {
        dataset: this.dataset,
        chartName: this.id
      })
    },
    getReduceKey: function(idx) {
      return this.reduceKeys && this.reduceKeys[idx] || idx
    },
    getTimeInterval: function(key) {
      if((this.dateKey || this.timeScale) === undefined) return null
      else return TIME_INTERVALS[key]
    },
    getTimeFormat: function(key) {
      if((this.dateKey || this.timeScale) === undefined) return null
      else if (this.timeFormat) return d3.time.format(this.timeFormat)
      else return TIME_FORMATS[key]
    },
    applyLegend: function(options={}) {
      const {
        indexLabel = false,
        reverseOrder = false
      } = options;

      const {
        legend: legendOptions
      } = this.layoutSettings;

      this.legend = dc.legend()
        .legendText((d, i) => {
          const k = indexLabel? i: d.name;
          return this.getLabel(k)
        })

      const {
        x = 0, y = 0, width = 200, horizontal = true,
        itemWidth = 70, itemHeight = 12, gap = 5
      } = legendOptions || {};

      this.legend
        .x(x).y(y).legendWidth(width).horizontal(horizontal)
        .itemWidth(itemWidth).itemHeight(itemHeight)
        .gap(gap)

      this.chart.legend(this.legend)

      if(reverseOrder) reverseLegendOrder(this.chart)
    },
    getContainerInnerSize: function() {
      let width, height;
      if (typeof this.parent === 'string' || this.parent instanceof String) {
        const el = document.querySelector(this.parent).parentNode
        width = el.clientWidth
        height = el.clientHeight
      }
      else {
        width = this.parent.width()
        height = this.parent.height()
      }
      if (this.width) width = parseFloat(this.width);
      if (this.height) height = parseFloat(this.height);

      return {width, height}
    },
    applyStyles: function() {
      const chart = this.chart;
      const legend = this.legend;

      const {width: defaultWidth, height: defaultHeight} = this.getContainerInnerSize()
      const {
        width = defaultWidth,
        height = defaultHeight,
        margins,
        legend: legendOptions
      } = this.layoutSettings;

      chart
        .width(width)
        .height(height)

      if (this.margins) chart.margins(this.margins);

    }
  },

  mounted: function() {
    const chart = Store.registerChart(
      this.parent,
      this.id,
      this.chartType,
      {volume: this.volume}
    );

    this.chart = chart;

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
    if (this.reducer) {
      chart.group(this.reducer, this.getReduceKey(0));
    }
    if (this.accessor) chart.valueAccessor(this.accessor);
    if (this.xScale) chart.x(this.xScale);
    if (this.xAxisLabel) chart.xAxisLabel(this.xAxisLabel)
    if (this.yAxisLabel) chart.yAxisLabel(this.yAxisLabel)

    if (this.useLegend) this.applyLegend();
    this.applyStyles();

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

    return chart;
  },

  destroyed: function() {
    Store.unregisterChart(this.id);
    Store.unregisterDimension(this.dimensionName, {dataset: this.dataset})
  }
}
