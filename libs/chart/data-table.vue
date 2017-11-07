<template>
  <card :width="width" :height="height" :title="title" :class="$style['chart-root']" @update:fullscreen="v => isFullscreen = v" :self-margined="cardSettings.selfMargined">
    <div class="data-table-container">
      <div class="table-paging" v-if="this.useTablePaging">
        <!--
          {{this.filteredDataSize}} selected out of {{this.cfSize}} records
        -->
        <div class="table-btns">
          <button class="btn btn-secondary" :disabled="isFirstPage" @click="prevPage()">Prev</button>
          <button class="btn btn-secondary" :disabled="isLastPage" @click="nextPage()">Next</button>
        </div>
        <div class="table-record-row">
          <span>{{this.beginRow}}</span>-<span>{{this.endRow}}</span>
          <span> / total {{this.filteredSize}} rows</span>
        </div>
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

function _detectSchema(dim, keys, extractor, limit=1, offset=0) {
  const schema = {}
  const rows = dim.top(limit, offset)

  for (let row of rows) {
    let vals = extractor(row);

     for (let key of keys) {
      let val = vals[key]

      if (val === undefined || val === null) {
        continue;
      }
      else if (typeof val === 'number' || val instanceof Number) {
        schema[key] = 'number';
      }
      else if (typeof val === 'string' || val instanceof String) {
        schema[key] = 'string';
      }
      else if (val instanceof Date) {
        schema[key] = 'date';
      }
      else if (typeof val === 'boolean' || val instanceof Boolean) {
        schema[key] = 'boolean';
      }
      else if ('count' in val && 'value' in val) {
        schema[key] = 'rate';
      }
    }
  }

  if (Object.keys(schema).length === keys.length) return schema;

  // 全ての値が undefined or null の時は 'string' にする
  if (rows.length === 0) {
    keys.filter(key => !schema[key])
      .forEach(key => schema[key] = 'string')
  }
  // schemaが未確定のものだけさらに探す
  const _keys = keys.map(key => (key in schema) ? null : key).filter(v => v)
  if (_keys.length > 0) {
    const _schema = _detectSchema(dim, _keys, extractor, limit+100, offset+limit)
    Object.assign(schema, _schema)
  }
  return schema;
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
    // chart style
    width: {
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
    },
    representations: {
      type: Object
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
      sortOrder: this.order,
      selectedColumnName: ''
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
    schema: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const keys =  Object.keys(this.getColsExtractor({}));
      const schema = _detectSchema(dim, keys, this.getColsExtractor)
      return schema
    },
    colsKeys: function() {
      return Object.keys(this.schema)
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
            const schema = this.schema[k];
            const val = vals[k];

            if (schema === 'number') {
              if (val === null || val === undefined) return;
              p[k] += val
            }
            else if (schema === 'rate') {
              p[k].count += val.count || 0
              p[k].value += val.value || 0
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else if (schema === 'string') {
              if (val === null || val === undefined) return;
              const words = p[k].split(', ').filter((w) => w && w != vals[k])
              words.push(vals[k])
              p[k] = words.join(', ')
            }
            else if (schema === 'boolean') {
              if (val === null || val === undefined) return;
              if (val) p[k]['t'] += 1
              else p[k]['f'] += 1
            }
            else if (schema === 'date') {
              if (!(p[k] instanceof Array || typeof p[k] == 'array')) p[k] = []
              p[k] = p[k].filter((d) => d && d.getTime() != val.getTime())
              p[k].push(val)
            }
          })
          p._count++;
          return p;
        },
        (p, v) => {
          const vals = this.getColsExtractor(v);
          if(vals[this.dimension] === '') return p;

          this.colsKeys.forEach((k) => {
            const schema = this.schema[k];
            const val = vals[k];

            if (schema === 'number') {
              if (val === null || val === undefined) return;
              p[k] -= val
            }
            else if (schema === 'rate') {
              p[k].count -= val.count
              p[k].value -= val.value
              p[k].per = p[k].count === 0 ? 0 : p[k].value / p[k].count;
            }
            else if (schema === 'string') {
              const words = p[k].split(', ').filter((w) => w && w != vals[k])
              p[k] = words.join(', ')
            }
            else if (schema === 'boolean') {
              if (val === null || val === undefined) return;
              if (val) p[k]['t'] -= 1
              else p[k]['f'] -= 1
            }
            else if (schema === 'date') {
              if (!(p[k] instanceof Array || typeof p[k] == 'array')) p[k] = []
              p[k] = p[k].filter((d) => d && d != vals[k])
              p[k].push(vals[k])
            }
          })
          p._count--;
          return p;
        },
        () => {
          const p = this.getInitialValues();
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
      this.selectedColumnName = el.textContent
    },
    reorder: function() {
      this.chart
        .group((d) => null)
        .size(Infinity)
        .sortBy((d) => this._valueAccessor(d, this.sortKey))
        .order(d3[this.sortOrder])
      this.render()
    },
    _valueAccessor: function(d, k) {
      const schema = this.schema[k]
      const val = d.value[k]

      if(!val) return '';

      if (schema === 'rate') {
        return val.per
      }
      else if (schema === 'string') {
        // val: {key1: 0, key2: 1, key3: 2} => 'key2, key3'
        return Object.keys(val).map(v => val[v] === 0 ? null : v)
          .filter(v => v)
          .join(', ')
      }
      else if (schema === 'boolean') {
        // val: {t: 1, f: 0} => 'true'
        // val: {t: 1, f: 1} => 'true, false'
        return Object.keys(val).map(v => val[v] === 0 ? null : v)
          .filter(v => v)
          .map(v => ({t: 'true', f: 'false'})[v])
          .join(', ')
      }
    },
    getInitialValues: function() {
      const vals = {}

      this.colsKeys.forEach(k => {
        let schema = this.schema[k];

        if (schema === 'string') {
          vals[k] = '';
        } else if (schema === 'number') {
          vals[k] = 0;
        } else if (schema === 'date') {
          vals[k] = [];
        } else if (schema === 'rate') {
          vals[k] = {count: 0, value:0, per:0};
        } else if (schema === 'boolean') {
          vals[k] = {t: 0, f: 0}
        }
      })
      return vals
    },
    buildFormatter: function(key) {
      let repName = null
      if (this.representations && key in this.representations){
        repName = this.representations[key]
        // 明示的にnullであるとき、非表示
        if (!repName) return
      }
      const repFunc = Store.getRepresentation(repName)
      return (d) => repFunc(d.value[key], d.value, d.key)
    },
    applyColumnSettings: function() {
      this.colsKeys.forEach((k) => {
        const formatter = this.buildFormatter(k)
        if (!formatter) return
        this.columnSettings.push({
          label: this.getLabel(k),
          format: formatter
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
      .sortBy((d) => this._valueAccessor(d, sortKey))
      .order(d3[this.order])
      .on('renderlet', () => {
        const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset})
        this.filteredDataSize = dim.groupAll().value()
        this.filteredSize = this.grouping.size()
        const ths = d3.selectAll(`#${this.id} th.dc-table-head`)
        const sortOrder = this.sortOrder
        const selectedColumnName = this.selectedColumnName
        ths
          .append('i')
            .attr('class', 'fa fa-sort')
            .style('margin-left', '8px')
          .each(function() {
            if (this.parentElement.textContent === selectedColumnName)
            {
              if (sortOrder === 'descending')
              {
                this.parentElement.classList.add('desc');
              }
              if (sortOrder === 'ascending')
              {
                this.parentElement.classList.add('asc');
              }
            }
          });
      })
    // layoutSettingsが使われていないので明示的に呼ぶ
    this.render()

    this.updateTable()
    return chart
  }
}
</script>

<style lang="less" module>

.chart-root :global {

  .data-table-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 94%;
    padding-top: 42px;
    font-size: 14px;
  }

  .table-container {
    overflow-y: auto;
    white-space: nowrap;
    width: 100%;
  }

  .table-paging {
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    margin: 32px auto;
    width: 100%;
  }
  .table-record-row {
    position: absolute;
  }
  .table-btns {
    margin: 0 auto;
  }

  .table-paging .btn-secondary {
    border-color: #45AB9F;
    color: #45AB9F;
    font-size: 12px;
    font-weight: bold;
    margin-left: 8px;
  }
  .table-paging .btn-secondary.disabled, .table-paging .btn-secondary:disabled {
    border-color: #ccc;
    color: #ccc;
  }
  .table-paging .btn-secondary:hover {
    background-color: #45AB9F;
    color: #FFF;
  }

  th.dc-table-head {
    cursor: pointer;
  }
  th.dc-table-head.asc,
  th.dc-table-head.desc {
    color: #2AAB9F;
  }
  th.dc-table-head.asc .fa-sort:before {
    content: '\f0dd';
  }
  th.dc-table-head.desc .fa-sort:before {
    content: '\f0de';
  }
}
</style>