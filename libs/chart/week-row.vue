
<script lang='js'>

import d3 from "d3"

import Base from './_base'
import Store from '../store'
import {ymdFormat, weekFormat} from '../utils/time-format'

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'rowChart'
    },
    labels: {
      default: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'
    },
    useLegend: {
      default: false
    },
    color: {
      default: 'week'
    }
  },

  computed: {
    dimensionName: function() {
      return `week(${this.dimension})`
    },
    grouping: function() {
      const getter = this.dimensionExtractor;
      const grouping = (d) => {
        return Number(weekFormat(getter(d)))
      }
      return Store.registerDimension(this.dimensionName, grouping, {dataset: this.dataset})
    },
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const getter = this.dimensionExtractor;
      const reducer = this.reducerExtractor;
      const date_cnt = {};

      return dim.group().reduce(
        (p, v) => {
          const key = ymdFormat(getter(v));
          const value = reducer(v);
          p.value += value;
          if (!p.date_cnt[key]) p.date_cnt[key] = 0;
          p.date_cnt[key]++;
          return p;
        },
        (p, v) => {
          const key = ymdFormat(getter(v));
          const value = reducer(v);
          p.value -= value;
          p.date_cnt[key]--;
          if (p.date_cnt[key] == 0) delete p.date_cnt[key];
          return p
        },
        () => {
          return {
            value: 0,
            date_cnt: date_cnt // 複数のpでshared
          }
        }
      );
    },
    valueAccessor: function() {
      const methodNames = [
        'sundays', 'mondays', 'tuesdays', 'wednesdays', 'thursdays', 'fridays', 'saturdays'
      ];
      return (p) => {
        const dates = Object.keys(p.value.date_cnt).sort();
        if (dates.length === 0) return 0
        const min = ymdFormat.parse(dates[0]);
        const max = d3.time.day.offset(ymdFormat.parse(dates[dates.length-1]), 1);
        const cnt = d3.time[methodNames[p.key]](min, max).length;
        return cnt > 0 ? p.value.value / cnt: 0;
      }
    },
    // dimensionScale: function() {
    //   return {
    //     domain: d3.scale.linear().domain
    //   }
    // },
    dimensionRange: function() {
      return [0, 6]
    }
  },

  mounted: function() {
    const chart = this.chart;

    chart
      .elasticX(true)
    return chart
  }
}

</script>

<style lang="less" module>
.chart-root :global {
  g.row text {
    pointer-events: none;
  }
}
</style>
