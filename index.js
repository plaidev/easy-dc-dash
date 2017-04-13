import Chart from './libs/chart'
import Store from './libs/store'

function install(Vue, options) {
  Vue.mixin({
    components: {
      'segment-pie': Chart.SegmentPie,
      'week-row': Chart.WeekRow,
      'rate-line': Chart.RateLine,
      'stacked-lines': Chart.StackedLines,
      'geo-jp': Chart.GeoJP,
      'stack-and-rate': Chart.compose(Chart.StackedLines, Chart.RateLine)
    }
  })
}

// auto install in dist mode
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  Chart: Chart,
  Store: Store,
  install: install
}