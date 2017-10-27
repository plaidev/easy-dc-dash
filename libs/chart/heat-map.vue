
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
    },
    // labels
    // cordinationGridとして扱われていないため、軸なしの扱いになっているが、対応する
    xAxisLabel: {
      type: [String, Boolean],
      default: false
    },
    yAxisLabel: {
      type: [String, Boolean],
      default: false
    },
    colsLabel: {
      type: Boolean,
      default: false
    },
    rowsLabel: {
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
    colors: function () {
      let domain = d3.extent(this.reducer.all().map((d) => d.value))
      let range
      const [min, max] = domain
      const [m, z, p] = this.colorSettings.linear;

      if (min < 0 && max > 0) {
        domain = [min, 0, max]
        range = [m, z, p]
      }
      else if (min >= 0 && max > 0) {
        domain = [0, min, max]
        range = [z, z, p]
      }
      else if (min < 0 && max <= 0) {
        domain = [min, max, 0]
        range = [m, z, z]
      }
      else {
        range = [z, z]
      }

      return d3.scale.linear()
        .domain(domain)
        .range(range);
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
      .colsLabel((d) => this.colsLabel ? this.getLabel(d) : null)
      .rowsLabel((d) => this.rowsLabel ? this.getLabel(d) : null)

    if(this.dateKey) {
      chart.filterPrinter(filters => {
        return filters.map(filter => {
          return filter.map((f,i) => {
            return f
          }).join(',').replace(/\,/, '-')
        });
      });
    }

    chart.on('postRender', () => {
      if(this.renderText) {
        const positions = [];
        chart.selectAll(`rect.heat-box`).each(function(d) {
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
      }

      // TODO: layoutSettingsに入れる
      const {width, height} = this.containerInnerSize;

      if (this.xAxisLabel) {
        chart.select('svg')
          .append("g")
            .attr("transform", `translate(${width / 2}, ${height - 5})`)
            .classed("axis x", true)
            .append("text")
              .classed("x-axis-label", true)
              .attr("text-anchor", "middle")
              .style("font-size", "12px")
              .text(this.xAxisLabel === true ? 'x' : this.xAxisLabel)
      }
      if (this.yAxisLabel) {
        chart.select(`svg`)
          .append("g")
            .attr("transform", `translate(10, ${height / 2})`)
            .classed("axis y", true)
            .append("text")
              .classed("y-axis-label", true)
              .attr("text-anchor", "middle")
              .attr("transform", "rotate(-90)")
              .style("font-size", "12px")
              .text(this.yAxisLabel === true ? 'y' : this.yAxisLabel)
      }
    })
    return chart
  }
}

</script>

<style lang="less" module>
.chart-root :global {
  .box-group .heat-box:hover{
    fill-opacity: 0.5;
  }
}
</style>
