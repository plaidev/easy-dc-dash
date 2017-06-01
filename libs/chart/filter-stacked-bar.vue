
<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'
import {generateExtractor} from '../utils'
import {splitKey, joinKey, multiKey} from '../utils'
import {ymdFormat} from '../utils/time-format'

export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'barChart'
    },
    removeEmptyRows: {
      type: Boolean,
      default: true
    },
    elasticX: {
      type: Boolean,
      default: true
    },
    scale: {
      default: "ordinal.ordinal"
    }
  },
  computed: {
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.reducerExtractor;
      const group = dim.group().reduceSum(reducer)
      return this.stackSecond(group);
    },
    stackKeys: function() {
      const stackKeys = [];
      this.dimAll.forEach((obj) => {
        const stackKey = obj.key[1];
        if (stackKeys.indexOf(stackKey) === -1) stackKeys.push(stackKey)
      })
      return stackKeys
    }
  },
  methods: {
    stackSecond: function (group) {
      // See: https://github.com/dc-js/dc.js/blob/master/web/examples/filter-stacks.html#L59-L76
      const _format = this.dimensionScale.format
      return {
        all: () => {
          let all = group.all();
          const m = {};
          if(this.removeEmptyRows) {
            all = all.filter((kv) => {
              return kv.value != 0
            })
          }
          // build matrix from multikey/value pairs
          all.forEach((kv) => {
              const ks = kv.key;
              let k = ks[0]
              if (_format) k = _format(k)
              m[k] = m[k] || {};
              m[k][ks[1]] = kv.value;
          });
          // then produce multivalue key/value pairs
          return Object.keys(m).map((k) => {
            let key = k
            if (_format) key = _format.parse(k)
              // if (this.scale === 'time')
                // key = ymdFormat.parse(k)
            return {key: [key], value: m[k]};
          });
        }
      };
    },
    selStacks: function(k) {
      return (d) => {
        return d.value[k] || 0
      }
    },
    showTooltip: function(d) {
      const fill = d3.event.target.getAttribute('fill')
      const k = this.getLabel(d.data.key)
      const data = {
        key: `${k}[${d.layer}]`,
        val: d.data.value[d.layer]
      }
      this.$refs.tooltip.show(data, fill)
    }
  },
  mounted: function() {
    const chart = this.chart;
    const stackKeys = this.stackKeys
    const barNum = stackKeys.length;

    chart
      .group(this.reducer, String(stackKeys[0]), this.selStacks(stackKeys[0]))
      .clipPadding(10)
      .elasticX(this.elasticX)

    // stack
    for (let i=1; i<barNum; i++) {
      chart
        .stack(this.reducer, String(stackKeys[i]), this.selStacks(stackKeys[i]))
        .hidableStacks(true)
    }
    chart
      .on('pretransition', (chart) => {
        if(!this.scale) {
          chart.selectAll('g.x text')
            .text(d => d.length > 10 ? d.substr(0,10)+'...' : d)
        }
        if(this.rotateXAxisLabel) {
          chart.selectAll('g.x text')
            .attr('transform', 'translate(-10,5) rotate(330)')
      }

    // select <-> deselect && redraw
    chart.selectAll('rect.bar')
      .classed('deselected', false)
      .classed('stack-deselected', (d) => {
        return chart.filter() && chart.filters().findIndex((f) =>
          f[0] === d.x && f[1] === d.layer
        ) === -1;
      })
      .on('click', (d) => {
        let f = [d.x, d.layer]
        chart.filter(dc.filters.TwoDimensionalFilter(f))
        dc.redrawAll();
      })
    });
    this.applyLegend({reverseOrder:true})
    return chart.render();
  }
}
</script>

<style scoped>
rect.bar.stack-deselected {
  opacity: .8;
  fill-opacity: .5;
}
</style>