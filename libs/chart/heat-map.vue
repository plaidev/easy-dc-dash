
<script lang='js'>

import d3 from "d3"
import dc from 'dc'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'

function _splitkey(k) {
  return k.split(',')
}
function _extractName(dimension) {
  // FIXME: Replace if there is a better way
  return dimension.replace(/(\[)|(\s)|(d.)|(\])/g, '')
}

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'heatMap'
    },
    yBorderRadius: {
      type: Number,
      defaulat: 6.75
    },
    xAxisFormat: {
      type: String,
      default: ''
    },
    yAxisFormat: {
      type: String,
      default: ''
    },
    valueLabel: {
      type: String
    },
    valueFormat: {
      type: String,
      default: ''
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
      const xAxisLabel = this.xAxisLabel || this.dimensionKeys[0]
      const yAxisLabel = this.yAxisLabel || this.dimensionKeys[1]
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
    const xAxisLabel = this.xAxisLabel || this.xKey
    const yAxisLabel = this.xAxisLabel || this.yKey
    const valueLabel = this.valueLabel || _extractName(this.reduce)

    chart
      .keyAccessor((d) => d.key[0])
      .valueAccessor((d) => d.key[1])
      .colorAccessor((d) => +d.value)
      .colors(d3.scale.category20b())
      .yBorderRadius(this.yBorderRadius)
      .colsLabel((d) => d + `${this.xAxisFormat}`)
      .rowsLabel((d) => d + `${this.yAxisFormat}`)
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
