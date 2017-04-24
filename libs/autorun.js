import Vue from 'vue/dist/vue.js'
import {loadMode, loadCSV} from './utils/load-dataset'
import Store from './store'
import Chart from './chart'


let initPromise;

function autoLoad() {

  const elms = document.querySelectorAll('easy-dc-dataset');

  if (elms.length <= 0) return Promise.resolve();

  const promises = Array.prototype.map.call(elms, (el) => {
    const name = el.getAttribute('dataset') || undefined;
    const mode = el.getAttribute('mode');
    const csv = el.getAttribute('csv');

    const labels = el.getAttribute('labels')
    const intFields = el.getAttribute('int-fields')
    const floatFields = el.getAttribute('float-fields')
    const dateFields = el.getAttribute('date-fields')
    const dateFormat = el.getAttribute('date-format')
    let isUTC = el.getAttribute('date-is-utc')
    if (isUTC === undefined || isUTC === null) isUTC = true;
    else isUTC = (isUTC == 'true');

    const options = {
      labels,
      intFields: intFields ? intFields.split(','): undefined,
      floatFields: floatFields ? floatFields.split(','): undefined,
      dateFields: dateFields ? dateFields.split(','): undefined,
      intFields: intFields ? intFields.split(','): undefined,
      floateFields: floatFields ? floatFields.split(','): undefined,
      dateFormat,
      isUTC
    }

    let p;

    if (mode) {
      p = loadMode(mode, options)
        .then(({content, labels}) => Store.registerData(content, {name, labels}))
    }
    else if (csv) {
      p = loadCSV(csv, options)
        .then(({content, labels}) => Store.registerData(content, {name, labels}))
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

export function init() {

  initPromise = new Promise((resolve) => {
    if (['complete', 'interactive'].includes(document.readyState)) {
      resolve(autoLoad())
    }
    else {
      document.addEventListener("DOMContentLoaded",function(){
        resolve(autoLoad());
      }, false);
    }
  })

}

export function run(auto=true, cb=null) {
  Chart.install(Vue)
  let p = initPromise;
  if (auto) p = p.then(start);
  if (cb) p = p.then(cb);
}

