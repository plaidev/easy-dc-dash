import Base from './_base'
import {compose} from './_composite'
import SegmentPie from './segment-pie.vue'
import WeekRow from './week-row.vue'
import ListRow from './list-row.vue'
import RateLine from './rate-line.vue'
import StackedLines from './stacked-lines.vue'
import GeoJP from './geo-jp.vue'
import DataTable from './data-table.vue'

const components = {
  'segment-pie': SegmentPie,
  'week-row': WeekRow,
  'list-row': ListRow,
  'rate-line': RateLine,
  'stacked-lines': StackedLines,
  'geo-jp': GeoJP,
  'data-table': DataTable,
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
  ListRow: ListRow,
  SegmentPie: SegmentPie,
  GeoJP: GeoJP,
  DataTable: DataTable,
  compose: compose,
  install: install,
  installedComponents: components
}
