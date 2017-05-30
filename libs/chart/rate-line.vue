
<script lang='js'>

import Base from './_base'
import Store from '../store'


export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'lineChart'
    }
  },
  methods: {
    showTooltip: function(d, i) {
      const format = this.timeFormat ? this.timeFormat : d3.time.format('%Y-%m-%d');
      const fill = d3.event.target.getAttribute('fill');
      const stroke = d3.event.target.getAttribute('stroke');
      const color = fill || stroke;
      let key = null;
      let val = null;
      if ((d.x && d.y) != undefined) {
        key = (this.scale === 'time') ? format(d.x) : d.x;
        val = d.y;
      }
      else {
        key = d.name
      }
      const data = {
        key: key,
        val: val
      }
      this.$refs.tooltip.show(data, color)
    }
  },

  computed: {
    reducer: function() {
      const dim = Store.getDimension(this.dimensionName, {dataset: this.dataset});
      const reducer = this.reducerExtractor;

      return dim.group().reduce(
        (p, v) => {
          const {count, value} = reducer(v);
          p.count += count;
          p.total += value;
          return p;
        },
        (p, v) => {
          const {count, value} = reducer(v);
          p.count -= count;
          p.total -= value;
          return p;
        },
        () => {
          return {
            count: 0,
            total: 0
          }
        }
      );
    },
    accessor: function() {
      return function(p) {
        return p.value.count > 0 ? p.value.total / p.value.count : 0;
      }
    }
  },

  mounted: function() {
    return this.chart
      .renderDataPoints({fillOpacity: 0.6, strokeOpacity: 0.6, radius: 6})
      .hidableStacks(true)
      .brushOn(false)
      .render()
  }
}

</script>