import Base from './_base'
import {compose} from './_composite'
import SegmentPie from './segment-pie.vue'
import WeekRow from './week-row.vue'
import ListRow from './list-row.vue'
import RateLine from './rate-line.vue'
import StackedLines from './stacked-lines.vue'
import OrdinalBar from './ordinal-bar.vue'
import StackedBar from './stacked-bar.vue'
import FilterStackedBar from './filter-stacked-bar.vue'
import GeoJP from './geo-jp.vue'
import DataTable from './data-table.vue'
import Bubble from './bubble.vue'

const components = {
  'segment-pie': SegmentPie,
  'week-row': WeekRow,
  'list-row': ListRow,
  'rate-line': RateLine,
  'stacked-lines': StackedLines,
  'ordinal-bar': OrdinalBar,
  'stacked-bar': StackedBar,
  'filter-stacked-bar': FilterStackedBar,
  'geo-jp': GeoJP,
  'data-table': DataTable,
  'bubble': Bubble,
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
  OrdinalBar: OrdinalBar,
  StackedBar: StackedBar,
  FilterStackedBar: FilterStackedBar,
  GeoJP: GeoJP,
  DataTable: DataTable,
  Bubble: Bubble,
  compose: compose,
  install: install,
  installedComponents: components
}
