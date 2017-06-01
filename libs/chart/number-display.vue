<template>
  <div class="krt-dc-number-display nd-box" :id="id" :style="boxStyles">
    <span class="nd-box-label" v-text="this._boxLabel" :style="{fontSize: (fontSize/4)+'px'}"></span>
  </div>
</template>

<script lang='js'>

import d3 from 'd3'
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
    },
    useLegend: {
      type: Boolean,
      default: false
    },
    renderTooltip: {
      type: Boolean,
      default: false
    },
    unitLabel: {
      type: String,
      default: ''
    }
  },
  computed: {
    grouping: function() {
      return null;
    },
    reducer: function() {
      const cf = Store.getCf({dataset: this.dataset});
      const reducer = this.reducerExtractor;
      if (this.isRateReducer) {
        return cf.groupAll().reduce(
          (p, v) => {
            const val = reducer(v);
            p.count += val.count;
            p.value += val.value;
            return p;
          },
          (p, v) => {
            const val = reducer(v)
            p.count -= val.count;
            p.value -= val.value;
            return p;
          },
          () => {
            return {count: 0, value: 0}
          }
        );
      }
      return cf.groupAll().reduceSum(reducer);
    },
    valueAccessor: function() {
      if (this.isRateReducer) {
        return (d) => {
          const r = (d.count === 0 ? 0 : d.value / d.count);
          return this._unitLabel == '%' ? r * 100 : r;
        }
      }
      // 明示的なaccessorが必要なことは若干奇妙ではある
      return (d) => d
    },
    _boxLabel: function() {
      return this.boxLabel || this.reduce.replace(/d\./, '')
    },
    _unitLabel: function() {
      if (this.unitLabel) return this.unitLabel
      if (this.isRateReducer) return '%'
      return ''
    },
    boxStyles: function() {
      const styles = {
        width: this.width+'px',
        height: this.height+'px',
        background: this.themeColor,
        fontSize: this.fontSize+'px'
      }
      if (!this.fillBoxColor) {
        styles.color = this.themeColor
        styles.borderColor = this.themeColor
        styles.background = undefined
      }
      return styles
    }
  },
  mounted: function() {
    const chart = this.chart;

    const templates = {
      none: `<span class="number-display">0</span>`,
      one: `<span class="number-display">%number</span>`,
      some: `<span class="number-display">%number</span>`
    }

    const units = this._unitLabel.split(',');
    if (units.length === 1) {
      if (units[0]) {
        templates.one += `<span class="number-unit">${units[0]}</span>`
        templates.some += `<span class="number-unit">${units[0]}</span>`
      }
    }
    else if (units.length >= 2) {
      if (units[0])
        templates.one += `<span class="number-unit">${units[0]}</span>`
      if (units[1])
        templates.some += `<span class="number-unit">${units[1]}</span>`
    }

    chart
      .formatNumber(d3.format(this.numberFormat))
      .html(templates)
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
.nd-box .number-display {
  font-weight: bold;
}
.nd-box .number-unit {
  font-size: 0.4em;
}
</style>