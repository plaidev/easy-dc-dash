<template>
  <div class="krt-dc-filter-stacked" :id="id">
    <a class="reset" style="display: none">reset</a>
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
    width: {
      type: Number,
      default: 600
    },
    height: {
      type: Number,
      default: 400
    },
    dimensions: {
      type: String
    },
    removeEmptyRows: {
      type: Boolean,
      default: true
    },
    renderLabel: {
      type: Boolean,
      default: false
    },
    legendX: {
      type: Number,
      default: 300
    },
    legendY: {
      type: Number,
      default: 0
    }
  },
  computed: {
    dimensionName: function() {
      return this.dimensions
    },
    getDimensionExtractor: function() {
      return (d) => _joinkey(generateExtractor(this.dimensions)(d))
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
        return d.value[k]
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
      .controlsUseVisibility(true)
      .brushOn(false)
      .clipPadding(10)
      .mouseZoomable(false)
      .title(function(d) {
        return d.key + '[' + stackKeys[+this.layer] + ']: ' + d.value[stackKeys[+this.layer]]
      })
      .elasticX(true)
      .elasticY(true)
      .renderLabel(this.renderLabel)
      .legend(dc.legend().x(this.legendX).y(this.legendY))
    // stack
    for (let i=1; i<barNum; i++) {
      chart.stack(this.reducer, this.extractKey(stackKeys[i]), this.selStacks(stackKeys[i]));
    }
    // select <-> deselect && redraw
    chart.on('pretransition', (chart) => {
      chart.selectAll('rect.bar')
        .classed('stack-deselected', (d) => {
          const key = _multikey(d.x, stackKeys[+d.layer]);
          return chart.filter() && chart.filters().indexOf(key) ===-1;
        })
        .on('click', (d) => {
          chart.filter(_multikey(d.x, stackKeys[+d.layer]));
          dc.redrawAll();
        })
    });
    return chart.render();
  }
}
</script>

<style scoped>
.dc-chart g.chart-body {
    clip-path: none;
}
.dc-chart g.stack._0 .deselected {
  fill: #1f77b4;
}
.dc-chart g.stack._1 .deselected {
  fill: #ff7f0e;
}
.dc-chart g.stack._2 .deselected {
  fill: #2ca02c;
}
.dc-chart g.stack._3 .deselected {
  fill: #d62728;
}
.dc-chart g.stack._4 .deselected {
  fill: #9467bd;
}
.dc-chart .stack-deselected {
  opacity: .5;
  fill-opacity: .5;
}
</style>