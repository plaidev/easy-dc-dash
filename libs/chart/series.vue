<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'
import {TIME_FORMATS, TIME_INTERVALS} from '../utils/time-format'

function _splitkey(k) {
  return k.split(',')
}
function _extractName(dimension) {
  // FIXME: Replace if there is a better way
  return dimension.replace(/(\[)|(\s)|(d.)|(\])/g, '')
}

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'seriesChart'
    },
    width: {
      type: Number,
      default: 768
    },
    height: {
      type: Number,
      default: 480
    },
    brushOn: {
      type: Boolean,
      default: false
    },
    elasticY: {
      type: Boolean,
      default: true
    },
    // label
    renderLabel: {
      type: Boolean,
      default: true
    },
    seriesLabel: {
      type: String,
      default: ''
    },
    seriesFormat: {
      type: String,
      default: ''
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
    useLegend: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    dimensionName: function() {
      if(this.dateKey != undefined) return `${this.seriesKey}(${this.dateKey})`
      return this.dimension
    },
    dimensionKeys: function() {
      return _splitkey(_extractName(this.dimension))
    },
    seriesKey: function() {
      return this.dimensionKeys[0]
    },
    xKey: function() {
      return this.dimensionKeys[1]
    },
    yKey: function() {
      return _extractName(this.reduce)
    },
    dimensionExtractor: function() {
      if (this.dateKey != undefined) return generateExtractor(this.dateKey)
      return generateExtractor(this.dimensionName)
    },
    grouping: function() {
      const getter = this.dimensionExtractor;
      const yInterval = this.getTimeInterval(this.seriesKey)
      const xInterval = this.getTimeInterval(this.xKey)
      if((xInterval && yInterval) === null) {
        return Store.registerDimension(this.dimensionName, getter, {dataset: this.dataset})
      }
      else {
        const grouping = (d) => [yInterval(getter(d)), xInterval(getter(d))]
        return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
      }
    }
  },
  methods: {
    formatKey: function(axis, key) {
      const seriesTimeFormat = this.getTimeFormat(this.seriesKey)
      const xTimeFormat = this.getTimeFormat(this.xKey)
      const FORMATS = {
        series: seriesTimeFormat,
        x: xTimeFormat
      }
      if(FORMATS[axis] === null) return +key
      return Number(FORMATS[axis](key))
    },
    showTooltip: function(d) {
      const format = this.timeFormat ? this.timeFormat : d3.time.format('%Y-%m-%d');
      const fill = d3.event.target.getAttribute('fill');
      const stroke = d3.event.target.getAttribute('stroke');
      const color = fill || stroke;

      if (d.x && d.y) {
        const key = d.layer
        const vals = {
          x: d.x,
          y: d.y
        }
        const data = {
          key: key,
          vals: vals
        }
        this.$refs.tooltip.show(data, color)
      }
      else {
        const key = d.name
        const vals = d.values.reduce((a,b) => a.y+b.y);
        const data = {
          key: key,
          val: val
        }
        this.$refs.tooltip.show(data, color)
      }
    }
  },
  mounted: function() {
    const chart = this.chart;
    const all = this.reducer.all()

    chart
      .chart((c) => dc.lineChart(c).interpolate('basis'))
      .brushOn(this.brushOn)
      .renderLabel(this.renderLabel)
      .renderVerticalGridLines(true)
      .renderHorizontalGridLines(true)
      .xAxisLabel(this.xAxisLabel)
      .yAxisLabel(this.yAxisLabel)
      .clipPadding(10)
      .elasticY(this.elasticY)
      .mouseZoomable(false)
      .x(d3.scale.linear().domain(d3.extent(all, (d) => this.formatKey('x', d.key[1]))))
      .seriesAccessor((d) => this.formatKey('series', d.key[0]))
      .keyAccessor((d) => this.formatKey('x', d.key[1]))
      .valueAccessor((d) => +d.value)
    chart.xAxis().tickFormat((d) => d + `${this.xAxisFormat}`)
    chart.yAxis().tickFormat((d) => d + `${this.yAxisFormat}`)
    return chart.render();
  }
}

</script>