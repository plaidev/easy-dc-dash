import d3 from 'd3'
import dc from 'dc'
import 'dc/dc.css'
import Store from '../store'
import {generateDomId, generateExtractor, reverseLegendOrder} from '../utils'

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
    extraDimension: {
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
      type: String,
      default: 'ordinal'
    },
    dateKey: {
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
    rotateXAxisLabel: {
      type: Boolean,
      default: true
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
      if(this.dateKey !== undefined) return `${this.dateKey}.${this.dimension}`
      return this.dimension;
    },
    dimensionExtractor: function() {
      const getter = generateExtractor(this.dimension, this.dateKey)
      if (!this.dimensionInterval) return getter
      return (d) => this.dimensionInterval(getter(d))
    },
    extraDimensionExtractor: function() {
      return generateExtractor(this.extraDimension, this.dateKey)
    },
    reducerExtractor: function() {
      return generateExtractor(this.reduce, this.dateKey)
    },
    grouping: function() {
      const grouping = this.dimensionExtractor;
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    },
    reducer: function() {
      const dim = this.grouping;
      if (!dim) return;
      const reducer = this.reducerExtractor;
      if (this.isRateReducer) {
        return dim.group().reduce(
          (p, v) => {
            const val = reducer(v)
            p.count += val.count;
            p.value += val.value;
            return p;
          },
          (p, v) => {
            const val = reducer(v)
            p.count -= val.count;
            p.value -= val.value;
            return p;
          },
          () => {
            return {count: 0, value: 0}
          }
        );
      }
      return dim.group().reduceSum(reducer)
    },
    isRateReducer: function() {
      const v = this.reducerExtractor({});
      if (v instanceof Object && 'count' in v)
        return true;
      return false
    },
    reduceKeys: function() {
      return []
    },
    accessor: function() {
      if (this.isRateReducer) return (d) => {
        return (d.value.count === 0 ? 0 : d.value.value / d.value.count)
      }
      return null;
    },
    min: function() {
      const dim = this.grouping;
      const getter = this.dimensionExtractor;
      if (!dim) return undefined;
      return getter(dim.bottom(1)[0]);
    },
    max: function() {
      const dim = this.grouping;
      const getter = this.dimensionExtractor;
      if (!dim) return undefined;
      return getter(dim.top(1)[0]);
    },
    dimAll: function() {
      const dim = this.grouping;
      return dim.group().all()
    },
    reducerAll: function() {
      return this.reducer.all();
    },
    reducerTotal: function() {
      const vals = this.reducerAll.map(d => d.value)
      return vals.reduce((a,b) => a+b)
    },
    dimensionScale: function () {
      if (!this.scale) return null;
      let [scale, unit] = this.scale.split('.');
      let _scale;

      if (scale == 'time') _scale = d3.time.scale;
      else _scale = d3.scale[scale];

      if (!_scale) return null;
      return _scale().domain([this.min, this.max])
    },
    dimensionInterval: function () {
      if (!this.scale) return null;
      const [scale, unit] = this.scale.split('.')
      if (scale === 'time' && unit && TIME_INTERVALS[unit]) {
        return TIME_INTERVALS[unit]
      }
      return null;
    },
    dimensionUnit: function () {
      if (!this.scale) return null;
      const [scale, unit] = this.scale.split('.')
      if (scale == 'time' && unit && TIME_INTERVALS[unit]) {
        return TIME_INTERVALS[unit].range
      }
      if (scale == 'ordinal' && dc.units[unit]) {
        return dc.units[unit]
      }
      return null;
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
    },
    tooltipAccessor: function() {
      return (d, i) => d
    },
    timeScale: function() { // 互換性のための一時的なメソッド
      if (!this.scale) return null;
      const [scale, unit] = this.scale.split('.')
      if (scale === 'time' && unit && unit in TIME_INTERVALS) {
        return unit
      }
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
    getKeyByLabel: function(label) {
      return Store.getKeyByLabel(label, {
        dataset: this.dataset,
        chartName: this.id
      })
    },
    getReduceKey: function(idx) {
      return this.reduceKeys && this.reduceKeys[idx] || idx
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
          const k = indexLabel? i: d.name;
          const key = this.getLabel(k)
          return key.length > 10 ? key.substring(0,10)+'...' : key
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
      const data = this.tooltipAccessor(d, i)
      data.key = this.getLabel(data.key)
      this.$refs.tooltip.show(data, fill)
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
    if (chart.x) {
      if (this.dimensionScale) chart.x(this.dimensionScale);
      if (this.dimensionUnit) chart.xUnits(this.dimensionUnit);
    }

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
    chart.on('pretransition', () => {
        if(!this.scale && !this.dateKey && !this.timeScale) {
          chart.selectAll('g.x text')
            .text(d => d.length > 10 ? d.substr(0,10)+'...' : d)
        }
        if(this.rotateXAxisLabel) {
          chart.selectAll('g.x text')
            .attr('transform', 'translate(-10,5) rotate(330)')
        }
    })
    if(this.renderTooltip) {
      chart.on('renderlet', () => {
        d3.selectAll(this.tooltipSelector)
          .on("mouseover", this.showTooltip)
          .on("mousemove", this.moveTooltip)
          .on("mouseout", this.removeTooltip)
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
