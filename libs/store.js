import {Manager} from 'crossxfilters'
import dc from 'dc'
import {downloadCSV} from './utils/blob-csv'
import {TIME_FORMATS} from './utils/time-format'
import {generateExtractor} from './utils'

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

function _collectLabelsByRecords(content, labelMapper) {
  if (!labelMapper) return {}
  const labels = {}
  const mapper = generateExtractor(labelMapper)
  content.forEach((record) => {
    const item = mapper(record)
    if ((item instanceof Array) || typeof item === 'array') {
      item.forEach((i) => {
        if (!(i.key in labels)) labels[i.key] = i.label
      })
    }
    else {
      if (!(item.key in labels)) labels[item.key] = item.label
    }
  })
  return labels
}


class DashboardStore {
  constructor() {
    this.state = {
      binds: {}
    };

    this.manager = new Manager()

    this._charts = {};
    this._volumeBind = {};
    this._themes = {
      default: DefaultTheme
    }

    this._defaultTheme = 'default'

    this._labels = {
      default: {
        '': {} // チャート固有でない辞書
      }
    };

    this._representations = {
    };

    this._linkFormatters = {
      default: (v) => v
    };

  }

  setBindData(name, data) {
    this.state.binds[name] = data;
  }

  registerData(data=[], options={}) {
    const {
      dataset = 'default',
      labels = {},
      labelMapper = null
    } = options;

    this.manager.registerDataset(data, {dataset})

    if (labelMapper) {
      this.setLabels(_collectLabelsByRecords(data, labelMapper), {dataset})
    }

    this.setLabels(labels, {dataset})
  }

  registerDimension(name, method, options={}) {
    if (name[0] === '$') {
      options.common = true
      name = name.slice(1)
    }
    return this.manager.registerDimension(name, method, options)
  }

  unregisterDimension(name, {dataset='default'}) {
    // TODO: implement
  }

  getCf(options={}) {
    const {
      dataset = 'default'
    } = options;
    return this.manager.dataset(dataset)
  }

  getDimension(name, options={}) {
    if (name[0] === '$') {
      options.common = true
      name = name.slice(1)
    }
    return this.manager.dimension(name, options)
  }

  getCfSize(options={}) {
    const cf = this.getCf(options)
    return cf && cf.size();
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

  mergeLabels(to, from) {
    const {
      dataset = 'default',
      chartName = ''
    } = from

    if (!this._labels[dataset] || !this._labels[dataset][chartName]) return

    const labels = this._labels[dataset][chartName]

    this.setLabels(labels, to)
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

  registerTheme(themeName, Theme) {
    this._themes[themeName] = Theme
  }

  getTheme(themeName) {
    if (!themeName) themeName = this._defaultTheme

    const Theme = this._themes[themeName]
    const BaseTheme = Theme.extends ? this.getTheme(Theme.extends) : {}

    return {
      colors: function(...args) {
        if (!Theme.colors) return BaseTheme.colors(...args)
        return Theme.colors(BaseTheme.colors, ...args)
      },
      card: function(...args) {
        if (!Theme.card) return BaseTheme.card(...args)
        return Theme.card(BaseTheme.card, ...args)
      },
      layout: function(...args) {
        if (!Theme.layout) return BaseTheme.layout(...args)
        return Theme.layout(BaseTheme.layout, ...args)
      }
    }
  }

  setDefaultTheme(theme) {
    this._defaultTheme = theme
  }

  downloadCSV(filename, dimensionName='_all', options={}) {
    const {
      dataset = 'default',
      labels = this._labels[dataset][''] || {},
      common = false
    } = options;

    if (dimensionName === '_all' && !this._dimensions[dataset][dimensionName]) {
      let idx = 0;
      this.registerDimension('_all', (d) => idx++, {dataset, common: false})
    }
    else if (!dim) {
      console.log('dimension not registered')
      return;
    }

    downloadCSV(
      dim.top(Infinity),
      filename,
      labels
    )
  }

}




export default new DashboardStore()
