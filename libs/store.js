import crossfilter from 'crossfilter'
import dc from 'dc'
import {downloadCSV} from './utils/blob-csv'
import {TIME_FORMATS} from './utils/time-format'

import DefaultTheme from './themes/default'

//-------------------------------------

function _defaultRepresentation(v, d, key) {
  if (v instanceof Array || typeof v == 'array') {
    return v.map((item) => {
    if (item instanceof Date) return TIME_FORMATS.ymd(item)
      return item
    }).join(', ')
  }
  if (v.per != undefined) return v.per
  return v
}


class DashboardStore {
  constructor() {
    this.state = {
      binds: {}
    };

    this._cf = {};
    this._charts = {};
    this._volumeBind = {};
    this._dimensions = {
      default: {}
    };

    this._labels = {
      default: {
        '': {} // チャート固有でない辞書
      }
    };

    this._representations = {
    };

    this._linkFormatters = {
    };
  }

  setBindData(name, data) {
    this.state.binds[name] = data;
  }

  registerData(data=[], options={}) {
    const {
      dataset = 'default',
      labels = {}
    } = options;

    // crossfilterのインスタンス作成
    this._cf[dataset] = crossfilter(data);

    this.setLabels(labels, {dataset})
  }

  registerDimension(name, method, options={}) {
    if(!name) return

    const {
      dataset = 'default'
    } = options;

    if (!(dataset in this._dimensions)) {
      this._dimensions[dataset] = {};
    }

    // TODO: dimension作成数のlimit管理
    if (!(name in this._dimensions[dataset])) {
      this._dimensions[dataset][name] = this._cf[dataset].dimension(method)
    }
    return this._dimensions[dataset][name];
  }

  unregisterDimension(name, {dataset='default'}) {
    // TODO: implement
  }

  getCf(options={}) {
    const {
      dataset = 'default'
    } = options;
    return this._cf[dataset]
  }

  getDimension(name, options={}) {
    if(!name) return

    const {
      dataset = 'default'
    } = options;
    return this._dimensions[dataset][name];
  }

  getCfSize(options={}) {
    const {
      dataset = 'default'
    } = options;
    return this._cf[dataset].size();
  }

  registerChart(parent, name, chartType, binds={}) {
    const chart = new dc[chartType](parent);

    // volumeとして参照するchartがあれば登録
    if (binds.volume) {
      if (!this._volumeBind[binds.volume])
        this._volumeBind[binds.volume] = []
      this._volumeBind[binds.volume].push(name)

      if (this._charts[binds.volume]) {
        chart.rangeChart(this._charts[binds.volume])
      }
    }

    // このchartをvolumeとして参照するchartがあれば、bind
    if (this._volumeBind[name]) {
      this._volumeBind[name].forEach((refChart) => {
        this._charts[refChart].rangeChart(chart)
      })
    }

    this._charts[name] = chart;

    return chart;
  }

  unregisterChart(name, chart) {
    // TODO: implement
    // this._charts[name] = chart;
  }

  setLabels(labels, options={}) {
    const {
      dataset = 'default',
      chartName = ''
    } = options;
    if (!this._labels[dataset]) this._labels[dataset] = {};
    if (!this._labels[dataset][chartName]) this._labels[dataset][chartName] = {};
    Object.assign(this._labels[dataset][chartName], labels);
  }

  getLabel(k, options={}) {
    const {
      dataset = 'default',
      chartName = ''
    } = options;
    const labels = this._labels[dataset];
    if (!labels) return k;
    // チャート固有の辞書からの探索
    if (labels[chartName] && labels[chartName][k] !== undefined)
      return labels[chartName][k];
    // チャート固有でないの辞書からの探索
    else if (labels[''] && labels[''][k] !== undefined)
      return labels[''][k];
    return k
  }

  getKeyByLabel(label, options={}) {
    const {
      dataset = 'default',
      chartName = ''
    } = options;
    // chart固有辞書からの探索
    if (this._labels[dataset] && this._labels[dataset][chartName]) {
      for (let k in this._labels[dataset][chartName]) {
        if (this._labels[dataset][chartName][k] === label) return k
      }
    }
    // chart固有でない辞書からの探索
    if (this._labels[dataset] && this._labels[dataset]['']) {
      for (let k in this._labels[dataset]['']) {
        if (this._labels[dataset][''][k] === label) return k
      }
    }
    return null
  }

  registerRepresentation(name, rep) {
    this._representations[name] = rep
  }

  getRepresentation(name) {
    if (!name) return _defaultRepresentation
    if (!(name in this._representations)) {
      console.log('warn: representation name "'+name+'" is not registererd')
      return _defaultRepresentation
    }
    return this._representations[name]
  }

  registerLinkFormatter(name, format) {
    this._linkFormatters[name] = format
  }

  getLinkFormatter(name) {
    if (!name) return
    if (!(name in this._linkFormatters)) {
      return console.log('warn: linkFormatter name "'+name+'" is not registererd')
    }
    return this._linkFormatters[name]
  }

  getTheme() {
    return DefaultTheme
  }

  downloadCSV(filename, dimensionName='_all', options={}) {
    const {
      dataset = 'default',
      labels = this._labels[dataset] || {},
    } = options;

    if (dimensionName === '_all' && !this._dimensions[dataset][dimensionName]) {
      let idx = 0;
      this.registerDimension('_all', (d) => idx++, {dataset})
    }
    else if (!this._dimensions[dataset][dimensionName]) {
      console.log('dimension not registered')
      return;
    }

    downloadCSV(
      this._dimensions[dataset][dimensionName].top(Infinity),
      filename,
      labels
    )
  }

}




export default new DashboardStore()
