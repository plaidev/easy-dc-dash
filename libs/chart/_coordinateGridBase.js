import d3 from 'd3'
import Base from './_base.js'
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
    showXAxisLabel: {
      type: Boolean,
      default: null
    },
    showYAxisLabel: {
      type: Boolean,
      default: true
    },
    rotateXAxisLabel: {
      type: Boolean,
      default: true
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
    isShowXAxisLabels: function() {
      const {axis} = this.layoutSettings

      if(this.showXAxisLabel != null) return this.showXAxisLabel
      let [scale, unit] = this.scale.split('.')
      if(scale !== 'ordinal') return true
      return this.reducerAll && this.reducerAll.length < axis.xLabel.limit
    },
    colors: function() {
      return this.colorSettings.ordinal
    }
  },
  methods: {
    applyAxisStyles: function() {
      if (!this.containerInnerSize || !this.layoutSettings || !this.chart) return

      const chart = this.chart
      const {axis} = this.layoutSettings

      if (chart.xAxisLabel && this.xAxisLabel) chart.xAxisLabel(this.xAxisLabel, axis.xLabel.padding)
      if (chart.yAxisLabel && this.yAxisLabel) chart.yAxisLabel(this.yAxisLabel, axis.yLabel.padding)

      // FIXME: formatではなくunitになっている
      if (this.xAxisFormat)
        chart.xAxis().tickFormat((d) => d + `${this.xAxisFormat}`)
      if (this.yAxisFormat)
        chart.yAxis().tickFormat((d) => d + `${this.yAxisFormat}`)

      if(!this.isShowXAxisLabels && chart.xAxis instanceof Function) {
        chart.xAxis().tickValues([])
      }
      else if(chart.xAxis instanceof Function){
        chart.xAxis().tickValues(null)
      }

      if(!this.showYAxisLabel && chart.yAxis instanceof Function) {
        chart.yAxis().tickValues([])
      }
      else if(chart.yAxis instanceof Function){
        chart.yAxis().tickValues(null)
      }
    }
  },
  watch: {
    layoutSettings: function() {
      this.applyStyles()
      this.applyAxisStyles()
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .brushOn(this.brushOn)
      .renderVerticalGridLines(this.renderVerticalGridLines)
      .renderHorizontalGridLines(this.renderHorizontalGridLines)
      .elasticY(this.elasticY)
      .mouseZoomable(false)
      // .clipPadding(10) // ??

    chart.on('pretransition', () => {
      // TODO: layout system
      if(!this.hideXAxisLabel && this.rotateXAxisLabel) {
        chart.selectAll(`#${this.id} g.x text`)
          .attr('transform', 'translate(-10,5) rotate(330)')
      }
    })

    return chart;
  }
}