<template>
  <div v-if="fillBoxColor" class="krt-dc-number-display nd-box" :id="id" :style="{width: width+'px', height: height+'px', background: themeColor, fontSize: fontSize+'px'}">
    <span class="nd-box-label" v-text="this.boxLabel || this._boxLabel" :style="{fontSize: (fontSize/4)+'px'}"></span>
  </div>
  <div v-else class="krt-dc-number-display nd-box" :id="id" :style="{width: width+'px', height: height+'px', color: themeColor,  borderColor: themeColor, fontSize: fontSize+'px'}">
    <span class="nd-box-label" v-text="this.boxLabel || this._boxLabel" :style="{fontSize: (fontSize/4)+'px'}"></span>
  </div>
</template>

<script lang='js'>

import Base from './_base'
import Store from '../store'

export default {
  extends: Base,
  props: {
    chartType: {
      type: String,
      default: 'numberDisplay'
    },
    width: {
      type: Number,
      default: 160
    },
    height: {
      type: Number,
      default: 120
    },
    themeColor: {
      type: String,
      default:'#2AAB9F'
    },
    fillBoxColor: {
      type: Boolean,
      default: true
    },
    fontSize: {
      type: Number,
      default: 48
    },
    boxLabel: {
      type: String
    },
    numberFormat: {
      type: String,
      default: '.2s'
    }
  },
  computed: {
    reducer: function() {
      const cf = Store.getCf({dataset: this.dataset});
      const reducer = this.getReducerExtractor;
      return cf.groupAll().reduceSum(reducer)
    },
    _boxLabel: function() {
      return this.reduce.replace(/d\./, '')
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .valueAccessor((d) => d)
      .formatNumber(d3.format(this.numberFormat))
      .html({
        none:"<span class=\"number-display\">0</span>"
      })
    return chart.render();
  }
}
</script>

<style scoped>
.nd-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border: 2px solid;
  background: #FFF;
  color: #FFF;
}
.nd-box span.number-display {
  font-weight: bold;
}
</style>