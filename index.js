import Store from './libs/store'
import Chart from './libs/chart'
import {init, run} from './libs/autorun'
import Vue from 'vue'

import './libs/styles/default.scss'
import './libs/styles/font-awesome-variables.scss'
import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/scss/font-awesome.scss'

init()

// auto install in dist mode
if (typeof window !== 'undefined' && window.Vue) {
  Chart.install(window.Vue)
}

export default {
  Vue: Vue,
  Chart: Chart,
  Store: Store,
  install: Chart.install,
  run: run,
}