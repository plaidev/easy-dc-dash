<template>
  <div class="krt-dc-filter-stacked" :id="id">
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
  </div>
</template>

<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {generateExtractor, reverseLegendOrder} from '../utils'

function _joinkey(k) {
  return k.join(',')
}
function _splitkey(k) {
  return k.split(',')
}
function _multikey(x, y) {
  return x + ',' + y;
}

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'barChart'
    },
    height: {
      type: Number,
      default: 400
    },
    width: {
      type: Number,
      default: 600
    },
    xAxisLabel: {
      type: String,
      default: ''
    },
    yAxisLabel: {
      type: String,
      default: ''
    },
    removeEmptyRows: {
      type: Boolean,
      default: true
    },
    renderLabel: {
      type: Boolean,
      default: true
    },
    useLegend: {
      type: Boolean,
      default: true
    },
    legendGap: {
      type: Number,
      default: 5
    },
    legendX: {
      type: Number,
      default: 0
    },
    legendY: {
      type: Number,
      default: 0
    },
    legendItemHeight: {
      type: Number,
      default: 12
    },
    legendItemWidth: {
      type: Number,
      default: 70
    },
    legendHorizontal: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    dimensionName: function() {
      return this.dimension
    },
    getDimensionExtractor: function() {
      return (d) => _joinkey(generateExtractor(this.dimension)(d))
    },
    grouping: function() {
      const grouping = this.getDimensionExtractor
      return Store.registerDimension(this.dimensionName, grouping, {dataest: this.dataset});
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.getReducerExtractor;
      const group = dim.group().reduceSum(reducer)
      return this.stackSecond(group);
    },
    stackKeys: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const all = dim.group().all()
      const stackKeys = [];
      all.forEach((obj) => {
        const stackKey = _splitkey(obj.key)[1];
        if (stackKeys.indexOf(stackKey) === -1) stackKeys.push(stackKey)
      })
      return stackKeys
    }
  },
  methods: {
    stackSecond: function (group) {
      // See: https://github.com/dc-js/dc.js/blob/master/web/examples/filter-stacks.html#L59-L76
      return {
          all: () => {
            let all = group.all();
            const m = {};
            // build matrix from multikey/value pairs
            if(this.removeEmptyRows) {
              all = all.filter((kv) => {
                return kv.value != 0
              })
            }
            all.forEach((kv) => {
                const ks = _splitkey(kv.key);
                m[ks[0]] = m[ks[0]] || {};
                m[ks[0]][ks[1]] = kv.value;
            });
            // then produce multivalue key/value pairs
            return Object.keys(m).map((k) => {
                return {key: k, value: m[k]};
            });
          }
      };
    },
    selStacks: function(k) {
      return (d) => {
        return d.value[k] || 0
      }
    },
    extractKey: function(k) {
      return k.replace(/\'/g, '')
    }
  },
  mounted: function() {
    const chart = this.chart;
    const stackKeys = this.stackKeys
    const barNum = stackKeys.length;

    chart
      .group(this.reducer, this.extractKey(stackKeys[0]), this.selStacks(stackKeys[0]))
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .brushOn(false)
      .clipPadding(10)
      .mouseZoomable(false)
      .elasticX(true)
      .elasticY(true)
      .renderLabel(this.renderLabel)
      .mouseZoomable(false)
      .title(function(d) {
        return d.key + '[' + this.layer + ']: ' + d.value[this.layer]
      })
    // stack
    for (let i=1; i<barNum; i++) {
      chart.stack(this.reducer, this.extractKey(stackKeys[i]), this.selStacks(stackKeys[i]));
    }
    // select <-> deselect && redraw
    chart.on('pretransition', (chart) => {
      chart.selectAll('.krt-dc-filter-stacked rect.bar')
        .classed('deselected', false)
        .classed('stack-deselected', (d) => {
          const key = _multikey(d.x, d.layer);
          return chart.filter() && chart.filters().indexOf(key) ===-1;
        })
        .on('click', (d) => {
          chart.filter(_multikey(d.x, d.layer));
          dc.redrawAll();
        })
    });
    if(this.useLegend) {
      chart.legend(dc.legend().gap(this.legendGap).x(this.legendX).y(this.legendY).legendWidth(this.width).itemWidth(this.legendItemWidth).itemHeight(this.legendItemHeight).horizontal(this.legendHorizontal))
      reverseLegendOrder(chart)
    }
    return chart.render();
  }
}
</script>

<style scoped>
.krt-dc-filter-stacked g.chart-body {
    clip-path: none;
}
.krt-dc-filter-stacked rect.bar.stack-deselected {
  opacity: .8;
  fill-opacity: .5;
}
</style>