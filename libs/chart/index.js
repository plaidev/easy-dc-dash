import Base from './_base'
import {compose} from './_composite'
import SegmentPie from './segment-pie.vue'
import WeekRow from './week-row.vue'
import RateLine from './rate-line.vue'
import StackedLines from './stacked-lines.vue'
import GeoJP from './geo-jp.vue'

const components = {
  'segment-pie': SegmentPie,
  'week-row': WeekRow,
  'rate-line': RateLine,
  'stacked-lines': StackedLines,
  'geo-jp': GeoJP,
  'stack-and-rate': compose(StackedLines, RateLine)
}

function install(Vue, options) {
  Vue.mixin({
    components: components
  })
}

export default {
  Base: Base,
  RateLine: RateLine,
  StackedLines: StackedLines,
  WeekRow: WeekRow,
  SegmentPie: SegmentPie,
  GeoJP: GeoJP,
  compose: compose,
  install: install,
  installedComponents: components
}
