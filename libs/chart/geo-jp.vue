
<script lang='js'>
import d3 from 'd3'
import {feature} from 'topojson'
import Base from './_base'

const TOPO_JP_URL = "https://raw.githubusercontent.com/dataofjapan/land/master/japan.topojson";

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
    }
  },

  mounted: function() {
    const chart = this.chart;

    d3.json(TOPO_JP_URL, (error, japan) => {
      const geo_features = feature(japan, japan.objects.japan).features;
      chart
        .overlayGeoJson(geo_features, "pref", (d) => ('0'+d.properties.id).slice(-2))
        .render()
    })

    const max = this.reducer.top(1)[0].value;

    this.chart
      .projection(d3.geo.mercator()
        .center([136, 35.5])
        .scale(2000)
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
      .title((d) => d.key)

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
