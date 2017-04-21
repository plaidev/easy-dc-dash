<template>
  <div class="container">
    <div class="table-paging" v-if="this.useTablePaging">
      <span>{{this.filteredSize}} selected out of {{this.cfSize}} records</span>
      <br>
      Showing <span>{{this.beginRow}}</span>-<span>{{this.endRow}}</span>
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
import {generateExtractor} from '../utils'

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
      filteredSize: 0
    }
  },
  computed: {
    getColsExtractor: function() {
      return generateExtractor(this.columns)
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
      return ((this.ofs + this.pag) >= this.filteredSize) ? 'true' : null
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
        this.columnSettings.push({label: k, format: (d) => d.value[k].per !== undefined ? d.value[k].per : d.value[k]})
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
    },
    // 'TypeError: n.dimension(...).bottom is not a function' occured when set d3.ascending in .order (e.g.: chart.order(d3.ascending))
    // There is workaround for this -> https://github.com/dc-js/dc.js/issues/1115
    reversibleGroup(group) {
      return {
        top: function(N) {
          return group.top(N);
        },
        bottom: function(N) {
          return group.top(Infinity).slice(-N).reverse();
        }
      }
    }
  },
  mounted: function() {
    const chart = this.chart;
    const dim = Store.getDimension(this.dimension);
    const dimensionName = this.extractDimensionName(this.dimension);
    this._registerDimension()
    this.setColumnSettings()

    const sortBy = this.sortBy || this.colsKeys[0]

    chart
      .dimension(this.reversibleGroup(dim.group().reduce(
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
      )))
      .group((d) => d.value[sortBy])
      .size(Infinity)
      .showGroups(false)
      .columns(this.columnSettings)
      .sortBy((d) => d.value[sortBy])
      .order(d3[this.order])
      .on('renderlet', () => this.filteredSize = dim.groupAll().value())
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