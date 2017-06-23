
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
  methods: {
    showTooltip(d) {
      const fill = d3.event.target.getAttribute('fill')
      const _key = ('0'+d.properties.id).slice(-2)
      const data = {
        key: d.properties.nam_ja,
        val: this.extractValue(_key)
      }
      this.$refs.tooltip.show(data, fill)
    },
    extractValue(_key) {
      return this.reducerAll.filter(x => x.key === _key)[0].value
    }
  },
  mounted: function() {
    const chart = this.chart;
    const max = this.reducer.top(1)[0].value;
    const path = '../../../libs/json/'
    const json = this.removePrefSuffix ? 'japan_without_suffix.topojson' : 'japan.topojson'
    const json_path = path.concat(json)
    d3.json(json_path, (error, japan) => {
      const geo_features = feature(japan, japan.objects.japan).features;
      chart
        .overlayGeoJson(geo_features, "pref", (d) => ('0'+d.properties.id).slice(-2))
        .render()
    })

    chart
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
