<template>
  <div class="container">
    <div class="table-paging" v-if="this.useTablePaging">
      Showing <span>{{this.beginRow}}</span>-<span>{{this.endRow}}</span> of <span>{{this.cfSize}}</span>.
      <button v-bind="{disabled: isFirstPage}" @click="prevPage()">Prev</button>
      <button v-bind="{disabled: isLastPage}" @click="nextPage()">Next</button>
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
    dimension: {
      type: String,
      default: 'd.site_name'
    },
    chartType: {
      type: String,
      default: 'dataTable'
    },
    columns: {
      type: Object
    },
    // row order
    sortBy: {
      type: String,
      default: 'site_name'
    },
    order: {
      type: String,
      default: 'd3.descending'
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
      columnSettings: []
    }
  },
  computed: {
    beginRow: function() {
      return this.ofs
    },
    endRow: function() {
      return this.ofs + this.pag - 1
    },
    firstRow: function() {
      return this.grouping.top(1)[0]
    },
    cols: function() {
      return Object.keys(this.getRow(this.firstRow))
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
    registerDimension: function() {
      const getter = this.getDimensionExtractor;
      const grouping = getter(this.dimension)
      return Store.registerDimension(this.dimension, grouping)
    },
    getRow: function(v) {
      const columns = Object.keys(this.columns)
      const rows = {}
      columns.forEach((k) => {
        if (this.columns[k].count) {
          Object.assign(rows, {
              [k]: {
                count: v[this.columns[k].count],
                value: v[this.columns[k].value]
              }
            }
          )
        }
        else if (v[k]) {
          Object.assign(rows, {[k]: v[k]})
        }
      })
      return rows;
    },
    setColumnSettings: function() {
      this.cols.forEach((k) => {
        this.columnSettings.push({label: k, format: (d) => d.value[k]})
      })
    },
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
    const dimensionName = this.extractDimensionName(this.dimension)
    this.registerDimension()
    this.setColumnSettings()

    chart
      .group((d) => d.value[dimensionName])
      .dimension(dim.group().reduce(
        (p, v) => {
          const vals = this.getRow(v);
          this.cols.forEach((k) => {
            if (k === dimensionName) {
              p[k] = vals[k]
            }
            else if (vals[k].count) {
              p[k] = (vals[k].count === 0) ? 0 : vals[k].value / vals[k].count
            }
            else p[k] += vals[k]
          })
          return p;
        },
        (p, v) => {
          const vals = this.getRow(v)
          this.cols.forEach((k) => {
            if (k === dimensionName) {
              p[k] = vals[k]
            }
            else if (vals[k].count) {
              p[k] = (vals[k].count === 0) ? 0 : vals[k].value / vals[k].count
            }
            else p[k] -= vals[k]
          })
          return p;
        },
        () => {
          return {
            site_name: '',
            pv: 0,
            session_cnt: 0,
            bounce_cnt: 0,
            bounce_rate: {count: 0,value: 0}
          }
        }
      ))
      .size(Infinity)
      .showGroups(false)
      .columns(this.columnSettings)
      .sortBy((d) => d[this.sortBy])
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