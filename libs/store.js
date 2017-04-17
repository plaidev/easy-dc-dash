import d3 from 'd3'
import crossfilter from 'crossfilter'
import dc from 'dc'
import {downloadCSV} from './utils/blob-csv'

//-------------------------------------


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
    this._labels = {};
  }

  setBindData(name, data) {
    this.state.binds[name] = data;
  }

  registerData(data=[], options={}) {
    const {
      name = 'default',
      labels = {}
    } = options;

    // crossfilterのインスタンス作成
    this._cf[name] = crossfilter(data);
    this._labels[name] = labels;
  }

  registerDimension(name, method, options={}) {
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

  getDimension(name, options={}) {
    const {
      dataset = 'default'
    } = options;
    return this._dimensions[dataset][name];
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
      dataset = 'default'
    } = options;
    if (!this._labels[dataset]) this._labels[dataset] = {};
    Object.assign(this._labels[dataset], labels);
  }

}




export default new DashboardStore()
