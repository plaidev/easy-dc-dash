import Store from './libs/store'
import Chart from './libs/chart'
import {init, run} from './libs/autorun'


init()

// auto install in dist mode
if (typeof window !== 'undefined' && window.Vue) {
  Chart.install(window.Vue)
}

export default {
  Chart: Chart,
  Store: Store,
  install: Chart.install,
  run: run,
}