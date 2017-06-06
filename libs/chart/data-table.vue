<template>
  <card :width="width" :height="height" :title="title">
    <div class="data-table-container">
      <div class="table-paging" v-if="this.useTablePaging">
        <!--
          {{this.filteredDataSize}} selected out of {{this.cfSize}} records
        -->
        Showing <span>{{this.beginRow}}</span>-<span>{{this.endRow}}</span>
        <span> / total {{this.filteredSize}} rows</span>
        <button class="btn btn-secondary" :disabled="isFirstPage" @click="prevPage()">Prev</button>
        <button class="btn btn-secondary" :disabled="isLastPage" @click="nextPage()">Next</button>
      </div>
      <div class="table-container">
        <table v-on:click="onclick($event)" class="krt-dc-data-table table table-hover" :id="id"></table>
      </div>
    </div>
  </card>
</template>

<script lang='js'>
import d3 from 'd3'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'
import {TIME_FORMATS} from '../utils/time-format'

import 'bootstrap/dist/css/bootstrap.css'
import '../styles/font-awesome-variables.scss'
import 'font-awesome/scss/font-awesome.scss'

function _valueAccessor(d, k) {
  if(!d.value[k]) return
  return d.value[k].per !== undefined ? d.value[k].per : d.value[k]
}

function _isDescendantOf(el, klass) {
  if (!el) return false;
  if (el.classList.contains(klass)) return el;
  return _isDescendantOf(el.parentElement, klass)
}

// 'TypeError: n.dimension(...).bottom is not a function' occured when set d3.ascending in .order (e.g.: chart.order(d3.ascending))
// There is workaround for this -> https://github.com/dc-js/dc.js/issues/1115
// reversibleGroup: function(group) {
//   return {
//     top: function(N) {
//       return group.top(N);
//     },
//     bottom: function(N) {
//       return group.top(Infinity).slice(-N).reverse();
//     }
//   }
// }
// ...
// inspired by that code. And add _count filter.
// FIXME: easy but low performance.
function _filteredGroup(group) {
  return {
    top: function(N) {
      return group
        .order((p) => (p._count===0)? 1: 0)
        .top(N)
        .filter((d) => d.value._count > 0)
    },
    bottom: function(N) {
      return group
        .order((p) => (p._count===0)? 0: 1)
        .top(Infinity)
        .slice(-N)
        .filter((d) => d.value._count > 0)
    },
    size: function() {
      return group
        .top(Infinity)
        .filter((d) => d.value._count > 0)
        .length
    }
  }
}

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
    linkColumn: {
      type: String
    },
    // chart style
    width: {
      type: Number,
      default: 1000
    },
    height: {
      type: Number,
      default: 400
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
    },
    useLegend: {
      default: false
    },
    renderTooltip: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      ofs: this.offset,
      pag: this.rowsPerPage,
      cfSize: Store.getCfSize({dataset: this.dataset}),
      columnSettings: [],
      filteredDataSize: 0,
      filteredSize: 0,
      sortKey: this.sortBy,
      sortOrder: this.order
    }
  },
  watch: {
    sortKey: function(newVal) {
      this.reorder()
    },
    sortOrder: function(newVal) {
      this.reorder()
    }
  },
  computed: {
    getColsExtractor: function() {
      return generateExtractor(this.columns)
    },
    reducer: function() {
      return null
    },
    isRateReducer: function() {
      return null
    },
    firstRow: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      return dim.top(1)[0]
    },
    cols: function() {
      return (this.getColsExtractor)(this.firstRow)
    },
    colsKeys: function() {
      return Object.keys(this.cols)
    },
    beginRow: function() {
      return this.ofs
    },
    endRow: function() {
      let end = this.ofs + this.pag - 1
      return Math.min(end, this.filteredSize)
    },
    isFirstPage: function() {
      return ((this.ofs - this.pag) < 0) ? 'true' : null
    },
    isLastPage: function() {
      return ((this.ofs + this.pag) >= this.filteredSize) ? 'true' : null
    },
    linkCol: function() {
      if(!this.linkColumn) return null
      return this.linkColumn.replace(/\s/g, '').split(',')
    },
    reducer: function() {
      return null
    },
    grouping: function() {
      const extractor = this.dimensionExtractor
      const dim = Store.registerDimension(this.dimensionName, extractor, {dataset: this.dataset});
      const grouping = dim.group().reduce(
        (p, v) => {
          const vals = this.getColsExtractor(v);
          if(vals[this.dimensionName] === '') return p;
          this.colsKeys.forEach((k) => {
            if (vals[k].count != undefined && typeof vals[k].count === 'number' || vals[k].count instanceof Number) {
              p[k].count += vals[k].count;
              p[k].value += vals[k].value;
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else if (typeof vals[k] === 'string' || vals[k] instanceof String) {
              const words = p[k].split(', ').filter((w) => w && w != vals[k])
              words.push(vals[k])
              p[k] = words.join(', ')
            }
            else if (vals[k] instanceof Date) {
              if (!(p[k] instanceof Array || typeof p[k] == 'array')) p[k] = []
              p[k] = p[k].filter((d) => d && d.getTime() != vals[k].getTime())
              p[k].push(vals[k])
            }
            else
              p[k] += vals[k]
          })
          p._count++;
          return p;
        },
        (p, v) => {
          const vals = this.getColsExtractor(v);
          if(vals[this.dimension] === '') return p;
          this.colsKeys.forEach((k) => {
            if (vals[k].count != undefined && typeof vals[k].count === 'number' || vals[k].count instanceof Number) {
              p[k].count -= vals[k].count;
              p[k].value -= vals[k].value;
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else if (typeof vals[k] === 'string' || vals[k] instanceof String) {
              const words = p[k].split(', ').filter((w) => w && w != vals[k])
              p[k] = words.join(', ')
            }
            else if (vals[k] instanceof Date) {
              if (!(p[k] instanceof Array || typeof p[k] == 'array')) p[k] = []
              p[k] = p[k].filter((d) => d && d != vals[k])
              p[k].push(vals[k])
            }
            else
              p[k] -= vals[k]
          })
          p._count--;
          return p;
        },
        () => {
          const p = this.getSchema()
          p._count = 0;
          return p
        }
      )
      return _filteredGroup(grouping)
    }
  },
  methods: {
    onclick: function(ev) {
      if (!ev) return;
      const el = _isDescendantOf(ev.target, 'dc-table-head')
      if (el) {
        let sortKey = this.getKeyByLabel(el.textContent) || el.textContent
        if (this.colsKeys.indexOf(sortKey) >= 0 ) {
          if (sortKey === this.sortKey) {
            this.sortOrder = (this.sortOrder === 'descending')? 'ascending': 'descending'
          }
          else {
            this.sortKey = sortKey;
          }
        }
      }
    },
    reorder: function() {
      this.chart
        .group((d) => null)
        .size(Infinity)
        .sortBy((d) => _valueAccessor(d, this.sortKey))
        .order(d3[this.sortOrder])
        .render()
    },
    getSchema: function() {
      const schema = {}
      this.colsKeys.forEach((k) => {
        let val = this.cols[k]
        if(val instanceof String || typeof val === 'string') val = '';
        else if(val instanceof Number || typeof val === 'number') val = 0;
        else if(val instanceof Date) val = []
        else if(val instanceof Object || typeof val === 'object') {
          val = {count: 0, value:0, per:0}
        }
        Object.assign(schema, {[k]: val})
      })
      return schema
    },
    buildFormatter: function(key) {
      if(this.linkCol && this.linkCol.includes(key)) {
        return (d) => this.insertLink(d.value[key])
      }
      return (d) => {
        if (d.value[key] instanceof Array || typeof d.value[key] == 'array') {
          return d.value[key].map((item) => {
            if (item instanceof Date) return TIME_FORMATS.ymd(item)
            return item
          }).join(', ')
        }
        if (d.value[key].per != undefined) return d.value[key].per
        return d.value[key]
      }
    },
    insertLink: function(v) {
      return `<a href=${v}>${v}</a>`
    },
    applyColumnSettings: function() {
      this.colsKeys.forEach((k) => {
        this.columnSettings.push({
          label: this.getLabel(k),
          format: this.buildFormatter(k)
        })
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
    this.applyColumnSettings()

    const chart = this.chart;
    const sortKey = this.sortKey || this.colsKeys[0]

    chart
      .group((d) => null)
      .size(Infinity)
      .showGroups(false)
      .columns(this.columnSettings)
      .sortBy((d) => _valueAccessor(d, sortKey))
      .order(d3[this.order])
      .on('renderlet', () => {
        const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset})
        this.filteredDataSize = dim.groupAll().value()
        this.filteredSize = this.grouping.size()
        const ths = d3.selectAll(`#${this.id} th.dc-table-head`)
        ths
          .append('i')
            .attr('class', 'fa fa-sort')
            .style('margin-left', '3px')
      })
    this.updateTable()
    return chart.render();
  }
}
</script>

<style scoped>
.data-table-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: calc(100% - 25px);
  width: 94%;
  padding-top: 25px;
  font-size: 14px;
}
.table-container {
  overflow-y: auto;
  width: 100%;
}
table {
}
th.dc-table-head {
  cursor: pointer
}
</style>