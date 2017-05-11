<template>
  <div class="krt-dc-number-display nd-box" :id="id">
    <span class="nd-box-label" v-text="this.boxLabel || this._boxLabel"></span>
  </div>
</template>

<script lang='js'>

import Base from './_base'
import Store from '../store'

function _extractName(s) {
    return s.replace(/d\./, '')
}

export default {
  extends: Base,

  props: {
    chartType: {
      type: String,
      default: 'numberDisplay'
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
    _boxLabel: function() {
      return _extractName(this.dimension) + `[${_extractName(this.reduce)}]`
    }
  },
  mounted: function() {
    const chart = this.chart;

    chart
      .valueAccessor((d) => d.value)
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
  width: 160px;
  height: 120px;
  background: #2AAB9F;
  border-radius: 5px;
}
.nd-box .nd-box-label {
  color: #FFF;
  font-size: 12px;
}
.nd-box span.number-display {
  color: #FFF;
  font-weight: bold;
  font-size: 48px;
}
</style>