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
import {generateExtractor} from '../utils'

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
    removeEmptyRows: {
      type: Boolean,
      default: true
    },
    legend: {
      type: Object,
      default: () => {return {x:0, y:0, gap: 5, width: 300, itemWidth: 70, itemHeight: 12, horizontal: false}}
    },
  },
  computed: {
    dimensionName: function() {
      return this.dimension
    },
    getDimensionExtractor: function() {
      const extractor = generateExtractor(this.dimension)
      // TODO: dateに限ってしまっているのを修正、unitを作るか...
      return (d) => {
        const v = extractor(d)
        if (this.scale === 'time') {
          v[0] = d3.time.format('%Y-%m-%d')(v[0])
        }
        return _joinkey(v)
      }
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
                let key = k
                if (this.scale === 'time')
                  key = d3.time.format('%Y-%m-%d').parse(k)
                return {key, value: m[k]};
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

    if (!this.scale)
      chart
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
    else
      chart
        .xUnits(d3.time.days) // FIXME

    chart
      .group(this.reducer, this.extractKey(stackKeys[0]), this.selStacks(stackKeys[0]))
      .brushOn(false)
      .clipPadding(10)
      .elasticX(true)
      .elasticY(true)
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
          let x = d.x;
          if (this.scale === 'time') x = d3.time.format('%Y-%m-%d')(x)
          const key = _multikey(x, d.layer);
          return chart.filter() && chart.filters().indexOf(key) ===-1;
        })
        .on('click', (d) => {
          let x = d.x;
          if (this.scale === 'time') x = d3.time.format('%Y-%m-%d')(x)
          chart.filter(_multikey(x, d.layer));
          dc.redrawAll();
        })
    });
    this.applyLegend({reverseOrder:true})
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