<template>
  <div class="krt-dc-date-volume-chart" :id="id">
    <!-- <krt-dc-tooltip ref='tooltip'></krt-dc-tooltip> -->
    <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
    <div v-text="title" style="font-size:24px; text-align:center;"></div>
  </div>
</template>

<script lang="js">
import Base from './_base'
import Store from '../store'
import {ymdFormat} from '../utils/time-format'

export default {
  extends: Base,
  props: {
    chartType: {
      type: String,
      default: 'barChart'
    },
    id: {
      type: String,
      default: 'krt-dc-date-volume-chart'
    },
    width: {
      type: Number,
      default: 240 * 4
    },
    height: {
      type: Number,
      default: 60
    }
  },
  data () {
    return Store.state.binds
  },
  methods: {
    showTooltip: function(d) {
      const data = {
        key: d.data.key,
        val: d.data.value
      }
      this.$refs.tooltip.show(data)
    }
  },
  mounted: function() {
    const chart = this.chart
    chart
      .centerBar(true)
      .gap(1)
      .elasticY(true)
      .round(d3.time.day.round)
      //.round(time.week.round)
      .alwaysUseRounding(true)
      .xUnits(d3.time.days)
      // .on('renderlet', () => {
      //   d3.selectAll('#krt-dc-date-volume-chart rect.bar')
      //     .on("mouseover", this.showTooltip)
      //     .on("mousemove", this.moveTooltip)
      //     .on("mouseout", this.removeTooltip);
      // })
      .yAxis().ticks(0)

    return chart.render()
  }
}
</script>