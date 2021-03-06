<template>
  <div :class="$style['chart-root']">
    <div class="krt-dc-number-display nd-box" :id="id" :style="boxStyles">
      <span class="title" v-text="this.title || this.reduce" :style="{fontSize: (fontSize/2.5)+'px'}"></span>
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
      default: 'auto'
    },
    height: {
      type: Number,
      default: 120
    },
    themeColor: {
      type: String,
      default:'#FFFFFF'
    },
    fillBoxColor: {
      type: Boolean,
      default: true
    },
    fontSize: {
      type: Number,
      default: 40
    },
    title: {
      type: String
    },
    numberFormat: {
      type: String,
      default: ',.0f'
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
      if (this.width === 'auto') {
        styles.width = '100%'
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

    // layoutSettingsが使われていないので明示的に呼ぶ
    this.render()

    return chart
  }
}
</script>

<style lang="less" module>
.chart-root :global {
  .card__render-area {
    justify-content: flex-start;
  }
  .krt-dc-number-display {
    color: #354341;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .title, .number-display {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .title {
    border-bottom: 1px solid rgba(0,0,0,.08);
    padding: 12px 24px;
    width: 100%;
    line-height: 1.1;
  }
  .number-display {
    display: block;
    padding: 12px 24px;
    width: 100%;
  }
  .number-threshold,
  .number-unit {
    font-weight: normal;
  }
  .nd-box .number-unit {
    font-size: 24px;
    margin-left: 8px;
  }
}
</style>