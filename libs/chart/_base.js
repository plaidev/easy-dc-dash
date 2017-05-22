import d3 from 'd3'
import dc from 'dc'
import 'dc/dc.css'
import Store from '../store'
import {generateDomId, generateExtractor, reverseLegendOrder} from '../utils'
import {TIME_FORMATS, TIME_INTERVALS} from '../utils/time-format'

import ResetButton from '../components/reset-button.vue'
import CardContainer from '../components/card.vue'
import KrtDcTooltip from '../components/krt-dc-tooltip.vue'

export default {

  template: `
    <card :title="title" :width="width" :height="height">
      <div class="krt-dc-component" :id="id" style="display: flex; align-items: center; justify-content: center">
        <krt-dc-tooltip ref='tooltip'></krt-dc-tooltip>
        <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
      </div>
    </card>
  `,

  components: {
    'card': CardContainer,
    'reset-button': ResetButton,
    'krt-dc-tooltip': KrtDcTooltip
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
    volume: {
      type: String
    },
    scale: {
      type: String
    },
    filter: {
      type: [String, Number]
    },
    dateKey: {
      type: String
    },
    timeScale: {
      type: String
    },
    timeFormat: {
      type: String
    },
    cap: {
      type: Number,
      default: 10,
      validator: (val) => {return val > 0}
    },
    othersLabel: {
      type: String,
      default: 'Others'
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
      default: false
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
      default: 'auto'
    },
    renderTooltip: {
      type: Boolean,
      default: true
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
      return Store.getTheme().layout(this.chartType, this.layout, {width, height});
    },
    tooltipSelector: function() {
      if(this.chartType === 'barChart') return `#${this.id} .bar`
      if(this.chartType === 'lineChart') return `#${this.id} .stack .area, #${this.id} circle.dot`
      if(this.chartType === 'heatMap') return `#${this.id} .heat-box`
      if(this.chartType === 'rowChart') return `#${this.id} .row rect`
      if(this.chartType === 'pieChart') return `#${this.id} .pie-slice`
      if(this.chartType === 'bubbleChart') return `#${this.id} .bubble`
      if(this.chartType === 'seriesChart') return `#${this.id} .line, #${this.id} circle.dot`
      if(this.chartType === 'compositeChart') return `#${this.id} .stack .area, #${this.id} circle.dot`
      if(this.chartType === 'geoChoroplethChart') return `#${this.id} .pref`
    }
  },

  methods: {
    removeFilterAndRedrawChart: function() {
      // for volume chart
      Object.values(EasyDC.Store._charts).filter(f => {
        if(f.filter() && f.filter().filterType === 'RangedFilter') {
          return f.filterAll()
        }
      })
      this.chart.filterAll();
      dc.redrawAll();
    },
    getLabel: function(key) {
      return Store.getLabel(key, {
        dataset: this.dataset,
        chartName: this.id
      })
    },
    getKeyByLabel: function(label) {
      return Store.getKeyByLabel(el.textContent, {
        dataset: this.dataset,
        chartName: this.id
      })
    },
    getReduceKey: function(idx) {
      return this.reduceKeys && this.reduceKeys[idx] || idx
    },
    getTimeInterval: function(key) {
      if((this.scale || this.dateKey || this.timeScale) === undefined) return null
      else return TIME_INTERVALS[key]
    },
    getTimeFormat: function(key) {
      if((this.scale || this.dateKey || this.timeScale) === undefined) return null
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

      if (legendOptions === null) return;

      this.legend = dc.legend()
        .legendText((d, i) => {
          if(indexLabel && reverseOrder) i = +this.reduceKeys.slice().reverse()[i]
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
        legend: legendOptions,
        axis
      } = this.layoutSettings;

      chart
        .width(width)
        .height(height)

      if (margins && chart.margins) {
        chart.margins(margins)
      }

      if (chart.xAxisLabel) {
        if (this.xAxisLabel) chart.xAxisLabel(this.xAxisLabel, axis.xLabel.padding)
        if (this.yAxisLabel) chart.yAxisLabel(this.yAxisLabel, axis.yLabel.padding)
      }
    },
    showTooltip: function(d, i) {
      const fill = d3.event.target.getAttribute('fill')
      this.$refs.tooltip.show(d, fill)
    },
    moveTooltip: function() {
      this.$refs.tooltip.move(d3.event.clientX, d3.event.clientY);
    },
    removeTooltip: function() {
      this.$refs.tooltip.remove();
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

    if(this.renderTooltip) {
      chart.on('renderlet', () => {
        d3.selectAll(this.tooltipSelector)
          .on("mouseover", this.showTooltip)
          .on("mousemove", this.moveTooltip)
          .on("mouseout", this.removeTooltip)
      })
    }
    if(this.filter) {
      chart.on('postRender', () => {
        chart.filter(this.filter)
        dc.redrawAll()
      })
    }
    this.chart = chart;

    return chart;
  },

  destroyed: function() {
    Store.unregisterChart(this.id);
    Store.unregisterDimension(this.dimensionName, {dataset: this.dataset})
  }
}
