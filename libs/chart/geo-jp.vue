
<script lang='js'>
import d3 from 'd3'
import {feature} from 'topojson'
import Base from './_base'

import japan from '../json/japan.topojson.json';
import japan_without_suffix from '../json/japan_without_suffix.topojson.json';

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
    geoScale: {
      type: Number,
      default: 2000
    },
    removePrefSuffix: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    colors: function() {
      const [m, z, p] = this.colorSettings.linear
      return d3.scale.linear()
        .domain([0, 10])
        .interpolate(d3.interpolateHcl)
        .range([z, p])
    }
  },
  mounted: function() {
    const chart = this.chart;
    const max = this.reducer.top(1)[0].value;
    const json = this.removePrefSuffix ? japan_without_suffix : japan
    const geo_features = feature(json, json.objects.japan).features;

    chart
      .overlayGeoJson(geo_features, "pref", (d) => ('0'+d.properties.id).slice(-2))
      .projection(d3.geo.mercator()
        .center([136, 35.5])
        .scale(this.geoScale)
        .translate([this.width / 2, this.height / 2])
      )
      .colorAccessor(d3.scale.log()
        .domain([1, max])
        .range([0, 10])
        .clamp(true)
      )
    this.render()
    return chart
  }
}

</script>


<style lang="less" module>
.chart-root :global {
  .pref {
    fill: #fff;
    stroke: #aaa;
  }
}
</style>
