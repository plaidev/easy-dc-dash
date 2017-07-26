<template>
  <div :class="$style['chart-root']">
    <div class="krt-dc-number-display nd-box" :id="id" :style="boxStyles">
      <span v-text="this.title || this.reduce" :style="{fontSize: (fontSize/4)+'px'}"></span>
    </div>
  </div>
</template>

<script lang='js'>

import d3 from 'd3'
import Base from './_base'
import Store from '../store'

export default {
  extends: Base,
  props: {
    dimension: {
      require: false
    },
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
    title: {
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
    unitPrefix: {
      type: String,
      default: ''
    },
    unitPostfix: {
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
          return this._unitPostFix == '%' ? r * 100 : r;
        }
      }
      // 明示的なaccessorが必要なことは若干奇妙ではある
      return (d) => d
    },
    _unitPostFix: function() {
      if (this.unitPostfix) return this.unitPostfix
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
    },
    templates: function() {
      const templates = {none: '', one: '', some: ''};
      if (this.unitPrefix) {
        templates.one += `<span class="number-unit">${this.unitPrefix}</span>`
        templates.some += `<span class="number-unit">${this.unitPrefix}</span>`
      }
      templates.none += `<span class="number-threshold">0</span>`,
      templates.one += `<span class="number-threshold">%number</span>`,
      templates.some += `<span class="number-threshold">%number</span>`

      const unitPostfixes = this._unitPostFix.split(',');
      if (unitPostfixes.length === 1) {
        if (unitPostfixes[0]) {
          templates.one += `<span class="number-unit">${unitPostfixes[0]}</span>`
          templates.some += `<span class="number-unit">${unitPostfixes[0]}</span>`
        }
      }
      else if (unitPostfixes.length >= 2) {
        if (unitPostfixes[0])
          templates.one += `<span class="number-unit">${unitPostfixes[0]}</span>`
        if (unitPostfixes[1])
          templates.some += `<span class="number-unit">${unitPostfixes[1]}</span>`
      }
      return templates
    }
  },
  mounted: function() {
    const chart = this.chart;
    chart
      .formatNumber(d3.format(this.numberFormat))
      .html(this.templates)
    return chart
  }
}
</script>

<style lang="less" module>
.chart-root :global {
  .card__render-area {
    justify-content: flex-start;
  }
  .number-display {
    display: block;
    margin: 12px 24px;
  }
  .number-threshold,
  .number-unit {
    font-size: 40px;
    font-weight: bold;
  }
  .nd-box .number-unit {
    font-size: 0.4em;
  }
}
</style>