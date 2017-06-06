
<script lang='js'>

import d3 from "d3"
import Base from './_base.js'
import Store from '../store'
import {generateExtractor, splitKey, extractName} from '../utils'


export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'heatMap'
    },
    borderRadius: {
      type: Number,
      default: 6.75
    },
    layout: {
      // TODO: legendとしてcolorパターンがないと不便だが、いったん無しで
      default: 'overlay-legend'
    }
  },
  computed: {
    dimensionKeys: function() {
      return splitKey(extractName(this.dimension))
    },
    dataKeys: function() {
      return Object.keys(this.dimensionExtractor({}))
    },
    dimensionRange: function() {
      return this.all
        .map(a => a.key[1])
        .filter((x,i,self) => self.indexOf(x) === i)
    },
    valueColors: function () {
      return d3.scale.linear()
        .domain(d3.extent(this.reducer.all().map((d) => d.value)))
        .range(this.colorSettings.valueGradation);
    }
  },
  methods: {
    showTooltip: function(d) {
      const fill = d3.event.target.getAttribute('fill')
      const xAxisLabel = this.getLabel(this.xAxisLabel || this.dimensionKeys[0] || 'x')
      const yAxisLabel = this.getLabel(this.yAxisLabel || this.dimensionKeys[1] || 'y')
      const data = {
        keys: {
          [xAxisLabel]: this.getLabel(d.key[0]),
          [yAxisLabel]: this.getLabel(d.key[1]),
        },
        val: d.value
      }
      this.$refs.tooltip.show(data, fill)
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .keyAccessor((d) => d.key[0])
      .valueAccessor((d) => d.key[1])
      .colorAccessor((d) => +d.value)
      .xBorderRadius(this.borderRadius)
      .yBorderRadius(this.borderRadius)
      .colsLabel((d) => this.hideXAxisLabel ? null : this.getLabel(d))
      .rowsLabel((d) => this.hideYAxisLabel ? null : this.getLabel(d))
      .colors(this.valueColors)

    if(this.dateKey) {
      chart.filterPrinter(filters => {
        return filters.map(filter => {
          return filter.map((f,i) => {
            return f
          }).join(',').replace(/\,/, '-')
        });
      });
    }

    return chart.render();
  }
}

</script>

<style scoped>
.box-group .heat-box:hover{
  fill-opacity: 0.5;
}
</style>
