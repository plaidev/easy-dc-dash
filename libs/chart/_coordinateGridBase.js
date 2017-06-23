import d3 from 'd3'
import Base from './_base.js'
import 'dc/dc.css'
import Store from '../store'
import {generateExtractor} from '../utils'
import {TIME_FORMATS, TIME_INTERVALS} from '../utils/time-format'

export default {
  extends: Base,
  props: {
    xAxisLabel: {
      type: String,
      default: ''
    },
    yAxisLabel: {
      type: String,
      default: ''
    },
    xAxisFormat: {
      type: String,
      default: ''
    },
    yAxisFormat: {
      type: String,
      default: ''
    },
    renderHorizontalGridLines: {
      type: Boolean,
      default: true
    },
    renderVerticalGridLines: {
      type: Boolean,
      default: true
    },
    brushOn: {
      type: Boolean,
      default: false
    },
    elasticY: {
      type: Boolean,
      default: true
    },
  },
  computed: {
    colors: function() {
      return this.colorSettings.ordinal
    }
  },
  methods: {
    applyAxisStyles: function() {
      if (chart.xAxisLabel && this.xAxisLabel) chart.xAxisLabel(this.xAxisLabel, axis.xLabel.padding)
      if (chart.yAxisLabel && this.yAxisLabel) chart.yAxisLabel(this.yAxisLabel, axis.yLabel.padding)
    }
  },
  mounted: function() {
    const chart = this.chart;

    this.applyStyles();

    chart
      .brushOn(this.brushOn)
      .renderVerticalGridLines(this.renderVerticalGridLines)
      .renderHorizontalGridLines(this.renderHorizontalGridLines)
      .elasticY(this.elasticY)
      .mouseZoomable(false)
      // .clipPadding(10) // ??

    // FIXME: formatではなくunitになっている
    if (this.xAxisFormat)
      chart.xAxis().tickFormat((d) => d + `${this.xAxisFormat}`)
    if (this.yAxisFormat)
      chart.yAxis().tickFormat((d) => d + `${this.yAxisFormat}`)


    return chart;
  }
}