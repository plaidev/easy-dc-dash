import Store from './libs/store'
import Chart from './libs/chart'
import {run} from './libs/autorun'


// auto install in dist mode
if (typeof window !== 'undefined' && window.Vue) {
  Chart.install(window.Vue)
}
else {
  run()
}

export default {
  Chart: Chart,
  Store: Store,
  install: Chart.install
}