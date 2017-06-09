
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
    },
    renderText: {
      type: Boolean,
      default: false
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

    if(this.renderText) {
      chart.on('postRender', () => {
        const positions = [];
        d3.selectAll(`rect.heat-box`).each(function(d) {
          const rect = d3.select(this);
          positions.push({
            x:  rect.attr("x"),
            y: rect.attr("y"),
            width:  rect.attr("width"),
            height:  rect.attr("height")
          });
        });
        chart.selectAll('g .box-group')
          .append('foreignObject')
            .attr('x', (d, i) => parseInt(positions[i].x))
            .attr('y', (d, i) => parseInt(positions[i].y))
            .attr('width', (d, i) => parseInt(positions[i].width))
            .attr('height', (d, i) => parseInt(positions[i].height))
            .style({
              'line-height': (d, i) => parseInt(positions[i].height)+'px',
              'text-align': 'center',
              'pointer-events': 'none',
              'overflow': 'hidden',
              'white-space': 'nowrap'
            })
            .text(d => `${this.getLabel(d.key[0])}, ${this.getLabel(d.key[1])}`)
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
