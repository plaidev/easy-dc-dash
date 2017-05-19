<template>
  <div class="krt-dc-geo-chart" :id="id">
    <krt-dc-tooltip ref='tooltip'></krt-dc-tooltip>
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
    <div v-text="title" style="font-size:24px; text-align:center;"></div>
  </div>
</template>

<script lang='js'>
import d3 from 'd3'
import {feature} from 'topojson'
import Base from './_base'

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'geoChoroplethChart'
    },
    width: {
      type: Number,
      default: 1000
    },
    height: {
      type: Number,
      default: 1000
    },
    scale: {
      type: Number,
      default: 2000
    }
  },
  methods: {
    showTooltip(d) {
      const fill = d3.event.target.getAttribute('fill')
      const data = {
        key: d.properties.nam_ja
        // val: null
      }
      this.$refs.tooltip.show(data, fill)
    }
  },
  mounted: function() {
    const chart = this.chart;

    d3.json('../../../libs/json/japan.topojson', (error, japan) => {
      const geo_features = feature(japan, japan.objects.japan).features;
      chart
        .overlayGeoJson(geo_features, "pref", (d) => ('0'+d.properties.id).slice(-2))
        .height(this.height)
        .width(this.width)
        .render()
    })

    const max = this.reducer.top(1)[0].value;

    this.chart
      .projection(d3.geo.mercator()
        .center([136, 35.5])
        .scale(this.scale)
        .translate([this.width / 2, this.height / 2])
      )
      .colorAccessor(d3.scale.log()
        .domain([1, max])
        .range([0, 10])
        .clamp(true)
      )
      .colors(d3.scale.linear()
        .domain([0, 10])
        .interpolate(d3.interpolateHcl)
        .range(['#f7fcfd', '#00441b'])
      )
    return this.chart;
  }
}

</script>


<style scoped>

.pref {
  fill: #fff;
  stroke: #aaa;
}

</style>
