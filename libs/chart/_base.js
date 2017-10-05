import d3 from 'd3'
import dc from 'dc'
import 'dc/dc.css'
import Store from '../store'
import {generateDomId, generateExtractor, reverseLegendOrder, splitKey, extractName, roundDecimalFormat} from '../utils'
import {TIME_INTERVALS, TIME_FORMATS} from '../utils/time-format'
import assignDeep from 'assign-deep'

import ResetButton from '../components/reset-button.vue'
import CardContainer from '../components/card.vue'
import KrtDcTooltip from '../components/krt-dc-tooltip.vue'
import ChartLink from '../components/chart-link.vue'


// TODO:
// データの処理、レイアウト関係の処理、汎用のパーツの組み込みが混ざっているので分離


export default {

  template: `
    <card :title="title || cardSettings.defaultCaption" :width="width" :height="height" @resized="updateContainerInnerSize" :hide-legend="hideLegend" :class="$style['chart-root']" :caption-height="cardSettings.captionHeight" :self-margined="cardSettings.selfMargined">
      <div class="krt-dc-component" :id="id" style="display: flex; align-items: center; justify-content: center; position: relative; width: 100%; height: 100%">
        <krt-dc-tooltip ref='tooltip'></krt-dc-tooltip>
        <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
        <chart-link ref='chartLink'></chart-link>
      </div>
    </card>
  `,

  components: {
    'card': CardContainer,
    'reset-button': ResetButton,
    'krt-dc-tooltip': KrtDcTooltip,
    'chart-link': ChartLink
  },

  props: {
    dataset: {
      type: String,
      default: 'default'
    },
    chartType: {
      type: String,
      default: 'barChart'
    },
    id: {
      type: String,
      default: generateDomId
    },

    // dimension, extra-dimension
    dimension: {
      require: true
    },
    extraDimension: {},
    scale: {
      type: String,
      default: 'ordinal.ordinal'
    },
    extraScale: {
      type: String,
      default: 'ordinal.ordinal'
    },
    dateKey: {
      type: String
    },
    reduce: {},

    // basic render content
    useDataPoints: {
      type: Boolean,
      default: true
    },
    renderLabel: {
      type: Boolean,
      default: true
    },
    renderTitle: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    // animation
    transitionDuration: {
      type: Number,
      default: 750
    },

    // sub parts
    title: {
      type: String,
      default: ''
    },
    useLegend: {
      type: Boolean,
      default: true
    },
    renderTooltip: {
      type: Boolean,
      default: true
    },

    // formatter
    linkFormatter: {
      type: String
    },

    // size / layout
    theme: {
      type: String,
      default: 'default'
    },
    layout: {
      type: String,
      default: 'auto'
    },
    width: {
    },
    height: {
    },
    layoutDetails: {
      type: String
    },
    color: {
      type: String
    },

    // chart specific labels
    labels: {
    },

    // volumed
    volume: {
      type: String
    },

    // cap mixin
    cap: {
      type: Number,
      default: 10,
      validator: (val) => {return val > 0}
    },
    othersLabel: {
      type: String,
      default: 'Others'
    },
  },

  data: function() {
    // umm.
    return {
      isMounted: false,
      isFullscreen: false,
      containerInnerSize: null
    }
  },

  computed: {
    $style: function() {
      return this.$options.cssModules || {'chart-root': 'easy-dc-chart-root'}
    },
    parent: function() {
      return `#${this.id}`;
    },
    dimensionName: function() {
      let dimName = this.dimension
      if (this.extraDimension) dimName += '+' + this.extraDimension
      if (this.dateKey !== undefined) return `${this.dateKey}.${dimName}`
      return dimName;
    },
    dimensionExtractor: function() {
      const extractor = generateExtractor(this.dimension, this.dateKey)
      if (!this.dimensionScale.interval) return extractor
      return (d) => this.dimensionScale.interval(extractor(d))
    },
    extraDimensionExtractor: function() {
      if (!this.extraDimension) return null
      const getter = generateExtractor(this.extraDimension, this.dateKey)
      if (!this.extraDimensionScale.interval) return getter
      return (d) => this.extraDimensionScale.interval(getter(d))
    },
    reducerExtractor: function() {
      return generateExtractor(this.reduce, this.dateKey)
    },
    grouping: function() {
      if (this.dimensionName[0] === '$') {
        return Store.getDimension(this.dimensionName, {dataset: this.dataset})
      }
      const getter = this.dimensionExtractor
      const extraGetter = this.extraDimensionExtractor
      let grouping = getter
      if (extraGetter) {
        grouping = (d) => [getter(d), extraGetter(d)]
      }
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
    dimensionKeys: function() { // TODO: 整理
      if (!this.extraDimension) return [extractName(this.dimension)]
      return [extractName(this.dimension), extractName(this.extraDimension)]
    },
    reduceKeys: function() {
      return []
    },
    isRateReducer: function() {
      const v = this.reducerExtractor({});
      if (v instanceof Object && 'count' in v)
        return true;
      return false
    },
    valueAccessor: function() {
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
    dimensionRange: function() {
      let [scale, unit] = this.scale.split('.');
      if (unit === 'ordinal') return;
      return [this.min, this.max]
    },
    dimAll: function() {
      const dim = this.grouping;
      return dim.group().all()
    },
    reducerAll: function() {
      if(!this.reducer || !this.reducer.all) return null
      return this.reducer.all();
    },
    dimensionScale: function () {
      return this.generateScales(this.scale)
    },
    extraDimensionScale: function () {
      return this.generateScales(this.extraScale)
    },
    cardSettings: function() {
      const theme = Store.getTheme(this.theme)
      const options = {}
      const setting = theme.card(this.chartType, this.layout, options)
      return setting
    },
    layoutSettings: function() {
      if (!this.containerInnerSize) return {}
      const {width, height} = this.containerInnerSize
      const legendable = this.useLegend
      const theme = Store.getTheme(this.theme)
      const layoutOptions = {
        width,
        height,
        legendable,
        fullscreen: this.isFullscreen
      }
      const setting = theme.layout(this.chartType, this.layout, layoutOptions)
      if (this.layoutDetails) {
        const custom = generateExtractor(this.layoutDetails)(setting)
        return assignDeep({}, setting, custom)
      }
      return setting
    },
    colorSettings: function() {
      const theme = Store.getTheme(this.theme)
      return theme.colors(this.chartType, this.color)
    },
    colors: function() {
      return this.colorSettings.ordinal
    },
    textSelector: function() {
      if(this.chartType === 'bubbleChart') return `#${this.id} .node text`
      else if(this.chartType === 'heatMap') return `#${this.id} g.cols.axis text`
      else return `#${this.id} g.x text`
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
      if(this.chartType === 'geoChoroplethChart') return `#${this.id} g path`
    },
    tooltipAccessor: function() {
      const _format = this.dimensionScale.format

      return (d, i) => {
        let key = null;
        let val = null;
        if (d.x != undefined && d.y != undefined) {
          key = _format ? _format(d.x) : d.x;
          val = roundDecimalFormat(d.y, 2);
        }
        else {
          key = d.name.replace(/^(left|right):/, '')
        }
        key = this.getLabel(key)
        return {key, val}
      }
    },
    timeScale: function() { // 互換性のための一時的なメソッド
      if (!this.scale) return null;
      let [scale, unit] = this.scale.split('.')
      if (scale == 'time' && !unit) unit = 'day'
      if (scale == 'time' && unit in TIME_INTERVALS) {
        return unit
      }
    },
    isTimeChart: function() {
      const [scale, unit] = this.scale ? this.scale.split('.') : []
      if(scale == 'time' || this.dateKey || this.timeScale) return true
      return false
    },
    hideLegend: function() {
      if (this.isMounted && !this.layoutSettings.legend) return true
      return false
    }
  },

  methods: {
    generateScales: function(scaleCode) {
      if (!scaleCode) return {};

      let [scale, unit] = scaleCode.split('.');
      if (!unit) {
        if (scale == 'time') unit = 'day'
        else if (scale == 'ordinal') unit = 'ordinal'
      }

      let _scale, _interval, _unit, _format, _domain;

      // scale
      if (scale == 'time') _scale = d3.time.scale;
      else _scale = d3.scale[scale];

      // interval
      if (scale == 'time' && TIME_INTERVALS[unit]) {
        _interval = TIME_INTERVALS[unit]
      }

      // unit
      if (scale == 'time' && TIME_INTERVALS[unit]) {
        _unit = TIME_INTERVALS[unit].range
      }
      if (scale == 'ordinal' && dc.units[unit]) {
        _unit = dc.units[unit]
      }

      // format
      if (scale == 'time') {
        if (unit == 'month') _format = TIME_FORMATS.ym
        else if (unit == 'day') _format = TIME_FORMATS.ymd
        else if (unit == 'hour') _format = TIME_FORMATS.ymdh
        else if (unit == 'minute') _format = TIME_FORMATS.ymdhm
        else if (unit == 'second') _format = TIME_FORMATS.ymdhms
        else _format = TIME_FORMATS[unit]
      }

      if (_scale) {
        if (unit !== 'ordinal') _domain = _scale().domain
        else _domain = _scale
      }
      else _domain = null

      if (unit === 'ordinal') {
        _format = (k) => this.getLabel(k)
      }

      return {
        domain: _domain,
        interval: _interval,
        unit: _unit,
        format: _format
      }
    },
    updateContainerInnerSize: function({isFullscreen}) {
      this.isFullscreen = isFullscreen
      // not mounted
      if (!this.isMounted) return;
      if (typeof this.parent === 'string' || this.parent instanceof String) {
        const el = this.$el.querySelector(`#${this.id}`)
        this.containerInnerSize = {
          width: el.offsetWidth,
          height: el.offsetHeight
        }
      }
      else {
        // this.parent is compositeChart instance
        this.containerInnerSize = {
          width: this.parent.width(),
          height: this.parent.height()
        }
      }
    },
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
    applyStyles: function() {
      if (!this.containerInnerSize || !this.layoutSettings || !this.chart) return
      const chart = this.chart;
      const legend = this.legend;

      const {width: defaultWidth, height: defaultHeight} = this.containerInnerSize
      const {
        width = defaultWidth,
        height = defaultHeight,
        margins,
        legend: legendOptions,
      } = this.layoutSettings;

      chart
        .width(width)
        .height(height)

      if (margins && chart.margins) {
        chart.margins(margins)
      }

      if (this.useDataPoints && chart.renderDataPoints) {
        chart.renderDataPoints({fillOpacity: 0.6, strokeOpacity: 0.6, radius: 5})
      }

      this.applyLegend();

      if (chart.ordinalColors && this.colorSettings.ordinal) {
        chart.ordinalColors(this.colorSettings.ordinal)
      }
      else if (chart.colors && this.colors) {
        chart.colors(this.colors)
      }

      this.render()
    },
    showTooltip: function(d, i) {
      const fill = d3.event.target.getAttribute('fill');
      const stroke = d3.event.target.getAttribute('stroke');
      const color = fill || stroke;
      const data = this.tooltipAccessor(d, i)
      this.$refs.tooltip.show(data, color)
    },
    moveTooltip: function() {
      this.$refs.tooltip.move(d3.event.clientX, d3.event.clientY);
    },
    removeTooltip: function() {
      this.$refs.tooltip.remove();
    },
    showChartLink: function(chart, filterValue) {
      let link;
      if (!this.chart.filters().includes(filterValue)) {
        this.$refs.chartLink.remove()
        return
      }
      if(this.linkFormatter) {
        const formatter = Store.getLinkFormatter(this.linkFormatter)
        link = formatter === undefined ? filterValue : formatter(filterValue)
      }
      else {
        link = filterValue
      }
      this.$refs.chartLink.show(chart, link)
    },
    render: function() {
      if (this._rendering) return
      this._rendering = true
      this.$nextTick(() => {
        this._rendering = false
        this.chart.render()
      })
    }
  },

  watch: {
    layoutSettings: function() {
      this.applyStyles()
    }
  },

  mounted: function() {
    // layoutが確定する
    this.isMounted = true

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
    if (this.valueAccessor) chart.valueAccessor(this.valueAccessor);
    if (chart.x) {
      if (this.dimensionScale.domain) chart.x(this.dimensionScale.domain(this.dimensionRange));
      if (this.dimensionScale.unit) chart.xUnits(this.dimensionScale.unit);
    }
    if (this.extraDimensionExtractor) {
      chart.keyAccessor((d) => {
        return d.key[0]
      })
    }

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
            if (typeof filter == 'array' || filter instanceof Array) {
              return filter.map((f,i) => {
                return this.getLabel(dc.printers.filter(f))
              }).join('-')
            }
            return this.getLabel(dc.printers.filter(filter))
          })
          .join(', ')
      })

    if(this.renderTooltip) {
      chart.on('renderlet', () => {
        chart.selectAll(this.tooltipSelector)
          .on("mouseover", this.showTooltip)
          .on("mousemove", this.moveTooltip)
          .on("mouseout", this.removeTooltip)
        })
    }
    if(this.linkFormatter) {
      // .on("click") だと一部のチャートでfilterのclickとぶつかる
      chart.on('filtered', this.showChartLink)
    }

    // deisgn hack
    if (this.chartType === 'barChart') {
      let [scale, unit] = this.scale.split('.');
      if (scale === 'time') {
        if (!unit) unit = 'day'
        chart
          .centerBar(true)
          .xAxisPadding(1)
          .xAxisPaddingUnit(unit)
      }
    }

    chart.on('pretransition', () => {
      if(!this.dateKey && !this.timeScale) {
        chart.selectAll(this.textSelector)
          .text(_d => {
            let d = _d.key || _d;
            return d.length > 15 ? d.substr(0,15)+'...' : d
        })
      }
    })

    this.render()

    this.chart = chart;

    return chart;
  },

  destroyed: function() {
    Store.unregisterChart(this.id);
    Store.unregisterDimension(this.dimensionName, {dataset: this.dataset})
  }
}
