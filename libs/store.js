import d3 from 'd3'
import crossfilter from 'crossfilter'
import dc from 'dc'

//-------------------------------------


class DashboardStore {
  constructor() {
    //this.state = {
    //};

    this._cf = {};
    this._charts = {};

    this._dimensions = {
      default: {}
    };
  }

  registerData(data=[], options={}) {
    const {
      name = 'default',
      dateFields = [],
      dateFormat = "%Y-%m-%d"
    } = options;

    const ymdFormat = d3.time.format(dateFormat);

    dateFields.forEach((field) => {
      data.forEach((d) => { d[field] = ymdFormat.parse(d[field]) });
    })

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
    // TODO: implement
    // if (this._charts[binds.volume]) chart.rangeChart(this._charts[binds.volume])
    this._charts[name] = chart;
    return chart;
  }

  unregisterChart(name, chart) {
    // TODO: implement
    // this._charts[name] = chart;
  }

}




export default new DashboardStore()
