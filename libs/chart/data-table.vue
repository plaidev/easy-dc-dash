<template>
  <div class="container">
    <div class="table-paging" v-if="this.useTablePaging">
      Showing <span>{{this.beginRow}}</span>-<span>{{this.endRow}}</span> of <span>{{this.cfSize}}</span>.
      <button :disabled="isFirstPage" @click="prevPage()">Prev</button>
      <button :disabled="isLastPage" @click="nextPage()">Next</button>
    </div>
    <table class="krt-dc-data-table table table-hover" :id="id"></table>
  </div>
</template>

<script lang='js'>
import d3 from 'd3'
import Base from './_base'
import Store from '../store'

export default {
  extends: Base,
  props: {
    chartType: {
      type: String,
      default: 'dataTable'
    },
    columns: {
      type: String
    },
    // row order
    sortBy: {
      type: String
    },
    order: {
      type: String,
      default: 'descending'
    },
    // chart style
    width: {
      type: Number,
      default: 1000
    },
    height: {
      type: Number,
      default: 1000
    },
    // paging
    useTablePaging: {
      type: Boolean,
      default: true
    },
    offset: {
      type: Number,
      default: 0
    },
    rowsPerPage: {
      type: Number,
      default: 10
    }
  },
  data () {
    return {
      ofs: this.offset,
      pag: this.rowsPerPage,
      cfSize: Store.getCfSize(),
      columnSettings: [],
      _sortBy: this.sortBy
    }
  },
  computed: {
    getColsExtractor: function() {
      return new Function('d', 'return ' + this.columns)
    },
    cols: function() {
      return this.getColsExtractor((this.firstRow))
    },
    colsKeys: function() {
      return this.getKeys(this.cols)
    },
    beginRow: function() {
      return this.ofs
    },
    endRow: function() {
      return this.ofs + this.pag - 1
    },
    firstRow: function() {
      return this.grouping.top(1)[0]
    },
    isFirstPage: function() {
      return ((this.ofs - this.pag) < 0) ? 'true' : null
    },
    isLastPage: function() {
      return ((this.ofs + this.pag) >= this.cfSize) ? 'true' : null
    }
  },
  methods: {
    extractDimensionName: function(name) {
      return name.replace(/d\./, '')
    },
    _registerDimension: function() {
      const getter = this.getDimensionExtractor;
      const grouping = getter(this.dimension)
      return Store.registerDimension(this.dimension, grouping)
    },
    getKeys: function(v) {
      return Object.keys(this.getColsExtractor(v))
    },
    getSchema: function() {
      const schema = {}
      this.colsKeys.forEach((k) => {
        val = this.cols[k]
        if(val instanceof String || typeof val === 'string') val = '';
        else if(val instanceof Number || typeof val === 'number') val = 0;
        else if(val instanceof Object || typeof val === 'object') {
          val = {count: 0, value:0, per:0}
        }
        Object.assign(schema, {[k]: val})
      })
      return schema
    },
    setColumnSettings: function() {
      this.colsKeys.forEach((k) => {
        this.columnSettings.push({label: k, format: (d) => d.value[k].per || d.value[k]})
      })
    },
    // paging
    updateTable: function() {
      this.chart.beginSlice(this.ofs);
      this.chart.endSlice(this.ofs + this.pag);
    },
    nextPage: function() {
      this.ofs += this.pag;
      this.updateTable();
      this.chart.redraw();
    },
    prevPage: function() {
      this.ofs -= this.pag;
      this.updateTable();
      this.chart.redraw();
    }
  },
  mounted: function() {
    const chart = this.chart;
    const dim = Store.getDimension(this.dimension);
    const dimensionName = this.extractDimensionName(this.dimension);
    this._registerDimension()
    this.setColumnSettings()
    if(!this.sortBy) this._sortBy = this.colsKeys[0]

    chart
      .group((d) => d.value[dimensionName])
      .dimension(dim.group().reduce(
        (p, v) => {
          const vals = this.getColsExtractor(v);
          this.colsKeys.forEach((k) => {
            if (k === dimensionName) {
              p[k] = vals[k]
            }
            else if (vals[k].count) {
              p[k].count += vals[k].count;
              p[k].value += vals[k].value;
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else p[k] += vals[k]
          })
          return p;
        },
        (p, v) => {
          const vals = this.getColsExtractor(v);
          this.colsKeys.forEach((k) => {
            if (k === dimensionName) {
              p[k] = vals[k]
            }
            else if (vals[k].count) {
              p[k].count -= vals[k].count;
              p[k].value -= vals[k].value;
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else p[k] -= vals[k]
          })
          return p;
        },
        () => {
          return this.getSchema()
        }
      ))
      .size(Infinity)
      .showGroups(false)
      .columns(this.columnSettings)
      .sortBy((d) => d[this._sortBy])
      .order(d3[this.order])
    this.updateTable()
    return chart.render();
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}
</style>