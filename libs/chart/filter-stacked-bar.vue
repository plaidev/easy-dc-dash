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

function _generateReducer(idx=0) {
  return function() {
    const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
    const _reducer = this.getReducerExtractor;
    const group = dim.group().reduceSum((d) => _reducer(d));
    return this.stackSecond(group);
  }
}

function _getDimensionsExtractor(dimensions) {
  return new Function('d', `const vals = Object.values(${dimensions}); return vals[0] + ',' + vals[1]`)
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
    renderLabel: {
      type: Boolean,
      default: true
    },
    brushOn: {
      type: Boolean,
      default: false
    },
    clipPadding: {
      type: Number,
      default: 10
    }
  },
  computed: {
    dimensionName: function() {
      return this.multikey(this.dimensions[0], this.dimensions[1])
    },
    grouping: function() {
      const grouping = _getDimensionsExtractor(this.dimensions)
      return Store.registerDimension(this.dimensionName, grouping, {dataest: this.dataset});
    },
    reducer: _generateReducer(0),
    getStackKeys: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const all = dim.group().all()
      const stackKeys = [];
      all.forEach((obj) => {
        const stackKey = obj.key.split(',')[1]
        if (stackKeys.indexOf(stackKey) === -1) stackKeys.push(stackKey)
      })
      return stackKeys
    }
  },
  methods: {
    multikey: function (x, y) {
      return x + ',' + y;
    },
    splitkey: function (k) {
        return k.split(',');
    },
    stackSecond: function (group) {
      // See: https://github.com/dc-js/dc.js/blob/master/web/examples/filter-stacks.html#L59-L76
      return {
          all: () => {
            const all = group.all();
            const m = {};
            // build matrix from multikey/value pairs
            all.forEach((kv) => {
                const ks = kv.key.split(',');
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
    }
  },
  mounted: function() {
    const chart = this.chart;
    const stackKeys = this.getStackKeys
    const barNum = stackKeys.length;

    chart
      .group(this.reducer, this.selStacks(stackKeys[0]))
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .controlsUseVisibility(true)
      .brushOn(false)
      .clipPadding(10)
      .renderLabel(true)
      .mouseZoomable(false)
      .title(function(d) {
        return d.key + '[' + stackKeys[+this.layer] + ']: ' + d.value[stackKeys[+this.layer]]
      })
    // stack
    for (let i=1; i<barNum; i++) {
      chart.stack(_generateReducer(i).apply(this), this.selStacks(stackKeys[i]));
    }
    // select <-> deselect && redraw
    chart.on('pretransition', (chart) => {
      chart.selectAll('rect.bar')
        .classed('stack-deselected', (d) => {
          const key = this.multikey(d.x, stackKeys[+d.layer]);
          return chart.filter() && chart.filters().indexOf(key) ===-1;
        })
        .on('click', (d) => {
          chart.filter(this.multikey(d.x, stackKeys[+d.layer]));
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