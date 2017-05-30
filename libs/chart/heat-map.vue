
<script lang='js'>

import d3 from "d3"
import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'
import {generateExtractor, splitKey, extractName} from '../utils'


export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'heatMap'
    },
    yBorderRadius: {
      type: Number,
      defaulat: 6.75
    }
  },
  computed: {
    dimensionKeys: function() {
      return _splitkey(_extractName(this.dimension))
    },
    firstRow: function() {
      const dim = Store.getDimension(this.dimensionName, this.dimensionExtractor, {dataset: this.dataset});
      return dim.top(1)[0]
    },
    data: function() {
      return (this.dimensionExtractor)(this.firstRow)
    },
    dataKeys: function() {
      return Object.keys(this.data)
    }
  },
  methods: {
    showTooltip: function(d) {
      const fill = d3.event.target.getAttribute('fill')
      const xAxisLabel = this.xAxisLabel || this.firstKey
      const yAxisLabel = this.yAxisLabel || this.secondKey
      const data = {
        keys: {
          [xAxisLabel]: d.key[0],
          [yAxisLabel]: d.key[1]
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
      .yBorderRadius(this.yBorderRadius)
      .colsLabel((d) => d + `${this.xAxisFormat}`)
      .rowsLabel((d) => d + `${this.yAxisFormat}`)
      .on('postRender', () => {
          if(!this.dateKey) {
            chart.selectAll('g.cols.axis text')
              .text(d => d.length > 10 ? d.substr(0,10)+'...' : d)
          }
      })
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
