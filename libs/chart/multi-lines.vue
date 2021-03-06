
<script lang='js'>

import Base from './_base.js'
import coordinateGridBase from './_coordinateGridBase.js'
import StackedLines from './stacked-lines.vue'
import AreaLine from './area-line.vue'
import Store from '../store'
import {mergeCssModules} from '../utils'
import Vue from 'vue/dist/vue.js'


function _getReduceKeySuper(Component) {
  if (!Component) return;
  if (Component.methods && Component.methods.getReduceKey)
    return Component.methods.getReduceKey
  return _getReduceKeySuper(Component.extends)
}

export default {
  extends: coordinateGridBase,

  props: {
    chartType: {
      type: String,
      default: 'compositeChart'
    },
    scale: {
      default: 'linear'
    }
  },
  data: function() {
    return {
      childCssModules: [],
      instances: []
    }
  },
  computed: {
    $style: function() {
      const cssModule = this.$options.cssModules || {'chart-root': 'easy-dc-chart-root'}
      this.childCssModules.forEach((childCssModule) => {
        mergeCssModules(cssModule, childCssModule)
      })
      return cssModule
    },
    reducer: function() {
      return null; // disable default reducer
    }
  },
  methods: {
    applyLegend: function(options={}) {
      const {
        reverseOrder = false
      } = options;
      Base.methods.applyLegend.apply(this, [{indexLabel: true, reverseOrder}])
    },
    updateContainerInnerSize: function(data) {
      Base.methods.updateContainerInnerSize.apply(this, [data])
      this.$nextTick(() => {
        for (let k in this.instances) {
          this.instances[k].updateContainerInnerSize(data)
          this.instances[k].$props.layout = this.layoutSettings.name
        }
        this.$nextTick(() => {
          this.render()
        })
      })
    }
  },
  mounted: function() {
    const chart = this.chart;
    const dim = this.grouping
    const _reducer = this.reducerExtractor;

    const lineNum = _reducer({}).length;
    const lines = []

    for (let i=0; i<lineNum; i++) {
      {
        const idx = i;
        const schema = _reducer({})[idx]
        let BaseChart
        if (schema instanceof Array || typeof schema === 'array') {
          BaseChart = AreaLine
        }
        else {
          BaseChart = coordinateGridBase
        }

        const chartInstance = new Vue({
          extends: BaseChart,
          computed: {
            parent: () => chart,
            reducerExtractor: () => {
              return (d) =>  {
                return _reducer(d)[idx]
              }
            }
          },
          propsData: {
            dimension: this.dimension,
            dateKey: this.dateKey,
            chartType: 'lineChart',
            scale: this.scale,
            useLegend: false
          },
          methods: {
            render: function(){},
            getReduceKey: function(i) {
              const s = _getReduceKeySuper(BaseChart);
              if (!s) return String(idx)
              return idx + ':' + s.apply(this, [i])
            }
          },
        })

        // ummmmmm.
        if (BaseChart.cssModules)
          this.childCssModules.push(BaseChart.cssModules)

        // ummmm.
        const _chart = Base.mounted.apply(chartInstance)
        coordinateGridBase.mounted.apply(chartInstance)
        if (BaseChart === AreaLine) StackedLines.mounted.apply(chartInstance)
        if (chartInstance.mounted) chartInstance.mounted()

        this.instances.push(chartInstance)
        lines.push(_chart)
      }
    }

    chart
      .dimension(dim)
      .shareColors(true)
      .compose(lines)

    // FIXME:
      // Stack Overflow causes when `dc.override(chart, 'legendables', () => {/*...*/)` executing.
      // this called from dc/line-chart.js and utils/reverseLegendOrder()
    // if(this.useLegend) this.applyLegend({reverseOrder: true})
    return chart
  }
}

</script>