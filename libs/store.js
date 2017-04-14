import d3 from 'd3'
import crossfilter from 'crossfilter'
import dc from 'dc'

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
  }

  setBindData(name, data) {
    this.state.binds[name] = data;
  }

  registerData(data=[], options={}) {
    const {
      name = 'default'
    } = options;


    // crossfilterのインスタンス作成
    this._cf[name] = crossfilter(data);
  }

  registerDimension(name, method, cf_name='default') {
    if (!(cf_name in this._dimensions)) {
      this._dimensions[cf_name] = {};
    }

    // TODO: dimension作成数のlimit管理
    if (!(name in this._dimensions[cf_name])) {
      this._dimensions[cf_name][name] = this._cf[cf_name].dimension(method)
    }
    return this._dimensions[cf_name][name];
  }

  unregisterDimension(name, cf_name='default') {
    // TODO: implement
  }

  getDimension(name, cf_name='default') {
    return this._dimensions[cf_name][name];
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

}




export default new DashboardStore()
