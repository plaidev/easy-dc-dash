import Vue from 'vue/dist/vue.js'
import {loadMode, loadCSV} from './utils/load-dataset'
import Store from './store'
import Chart from './chart'


function load() {

  const elms = document.querySelectorAll('easy-dc-dataset');

  if (elms.length <= 0) return Promise.reject();

  const promises = Array.prototype.map.call(elms, (el) => {
    const name = el.getAttribute('dataset') || undefined;
    const mode = el.getAttribute('mode');
    const csv = el.getAttribute('csv');

    const dateFields = el.getAttribute('date-fields')
    const dateFormat = el.getAttribute('date-format')
    const isUTC = el.getAttribute('date-is-utc')

    const options = {
      dateFields: dateFields ? dateFields.split(','): undefined,
      dateFormat,
      isUTC
    }

    let p;

    if (mode) {
      p = loadMode(mode, options)
        .then((data) => Store.registerData(data, {name}))
    }
    else if (csv) {
      p = loadCSV(csv, options)
        .then((data) => Store.registerData(data, {name}))
    }
    else {
      p = Promise.resolve()
    }

    return p
  });

  return Promise.all(promises)
}

function start() {
  const tags = Object.keys(Chart.installedComponents);
  tags.forEach((tag) => {
    document.querySelectorAll(tag).forEach((el) => {
      new Vue({el, data: Store.state.binds})
    });
  })
}

function _run() {
  Chart.install(Vue)
  load()
    .then(start)
    .catch(() => console.log('dataset setting not found. disable autorun.'))
}

export function run() {

  if (['complete', 'interactive'].includes(document.readyState)) {
    _run();
  }
  else {
    document.addEventListener("DOMContentLoaded",function(){
      _run();
    }, false);
  }
}

