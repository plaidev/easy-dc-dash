import Base from './_base'
import coordinateGridBase from './_coordinateGridBase'
import {compose} from './_composite'
import NumberDisplay from './number-display.vue'
import DateVolumeChart from './date-volume-chart.vue'
import SegmentPie from './segment-pie.vue'
import MultiDimensionPie from './multi-dimension-pie.vue'
import WeekRow from './week-row.vue'
import WeeklySeries from './weekly-series.vue'
import ListRow from './list-row.vue'
import RateLine from './rate-line.vue'
import StackedLines from './stacked-lines.vue'
import OrdinalBar from './ordinal-bar.vue'
import FilterStackedBar from './filter-stacked-bar.vue'
import GeoJP from './geo-jp.vue'
import DataTable from './data-table.vue'
import HeatMap from './heat-map.vue'
import Series from './series.vue'
import Bubble from './bubble.vue'
import AreaLine from './area-line.vue'
import MultiLines from './multi-lines.vue'
import resetAllButton from './reset-all-button.vue'
import csvDownloadButton from './csv-download-button.vue'

const components = {
  'number-display': NumberDisplay,
  'date-volume-chart': DateVolumeChart,
  'segment-pie': SegmentPie,
  'multidim-pie': MultiDimensionPie,
  'week-row': WeekRow,
  'weekly-series': WeeklySeries,
  'list-row': ListRow,
  'rate-line': RateLine,
  'stacked-lines': StackedLines,
  'ordinal-bar': OrdinalBar,
  'filter-stacked-bar': FilterStackedBar,
  'geo-jp': GeoJP,
  'data-table': DataTable,
  'heat-map': HeatMap,
  'series': Series,
  'bubble': Bubble,
  'area-line': AreaLine,
  'multi-lines': MultiLines,
  'stack-and-rate': compose(StackedLines, RateLine),
  'reset-all-button': resetAllButton,
  'csv-download-button': csvDownloadButton
}

function install(Vue, options) {
  Vue.mixin({
    components: components
  })
}

export default {
  Base: Base,
  coordinateGridBase: coordinateGridBase,
  RateLine: RateLine,
  StackedLines: StackedLines,
  WeekRow: WeekRow,
  WeeklySeries: WeeklySeries,
  ListRow: ListRow,
  NumberDisplay: NumberDisplay,
  DateVolumeChart: DateVolumeChart,
  SegmentPie: SegmentPie,
  OrdinalBar: OrdinalBar,
  FilterStackedBar: FilterStackedBar,
  GeoJP: GeoJP,
  DataTable: DataTable,
  HeatMap: HeatMap,
  Series: Series,
  Bubble: Bubble,
  AreaLine: AreaLine,
  MultiLines: MultiLines,
  compose: compose,
  resetAllButton: resetAllButton,
  csvDownloadButton: csvDownloadButton,
  install: install,
  installedComponents: components
}
