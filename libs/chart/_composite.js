import Vue from 'vue/dist/vue.js'
import Base from './_base.js'
import coordinateGridBase from './_coordinateGridBase.js'
import Store from '../store'
import {generateExtractor, margeCssModules} from '../utils'
import {TIME_FORMATS} from '../utils/time-format'

function _getReduceKeySuper(Component) {
  if (!Component) return;
  if (Component.methods && Component.methods.getReduceKey)
    return Component.methods.getReduceKey
  return _getReduceKeySuper(Component.extends)
}


export function compose(Left, Right) {

  const ComponentObject = {
    extends: coordinateGridBase,

    props: {
      chartType: {
        type: String,
        default: 'compositeChart'
      }
    },
    data: function() {
      return {childCssModules: []}
    },
    computed: {
      $style: function() {
        const cssModule = this.$options.cssModules || {'chart-root': 'easy-dc-chart-root'}
        this.childCssModules.forEach((childCssModule) => {
          margeCssModules(cssModule, childCssModule)
        })
        return cssModule
      }
    },
    mounted: function() {

      // TODO: refactoring.

      const leftInstance = new Vue({
        extends: Left,
        computed: {
          parent: () => {
            return this.chart;
          },
          reducerExtractor: () => {
            return (d) => {
              const _reducer = generateExtractor(this.reduce);
              return _reducer(d)[0];
            }
          }
        },
        methods: {
          getReduceKey: function(idx) {
            const s = _getReduceKeySuper(Right);
            if (!s) return 'left'
            return 'left:' + s.apply(this, [idx])
          }
        },
        propsData: {
          dimension: this.dimension,
          scale: this.scale,
          dateKey: this.dateKey,
          legend: false
        }
      })

      const rightInstance = new Vue({
        extends: Right,
        computed: {
          parent: () => {
            return this.chart;
          },
          reducerExtractor: () => {
            return (d) => {
              const _reducer = generateExtractor(this.reduce);
              return _reducer(d)[1];
            }
          },
        },
        methods: {
          getReduceKey: function(idx) {
            const s = _getReduceKeySuper(Right);
            if (!s) return 'right'
            return 'right:' + s.apply(this, [idx])
          }
        },
        propsData: {
          dimension: this.dimension,
          scale: this.scale,
          dateKey: this.dateKey,
          useLegend: false
        }
      })

      // umm.
      Base.mounted.apply(leftInstance)
      coordinateGridBase.mounted.apply(leftInstance)
      Base.mounted.apply(rightInstance)
      coordinateGridBase.mounted.apply(rightInstance)

      // ummmmmm.
      if (Right.cssModules)
        this.childCssModules.push(Right.cssModules)
      if (Left.cssModules)
        this.childCssModules.push(Left.cssModules)

      const dim = this.grouping;
      const composite = this.chart;

      composite
        .dimension(dim)
        .compose([
          Left.mounted.apply(leftInstance),
          Right.mounted.apply(rightInstance).useRightYAxis(true),
        ])
        //.rightY(scale.linear().domain([0, 1]))
        .shareColors(true)

      // Compositeでまとめてlegendをつけるので、データ名について一貫した名前付けが必要
      // legendは配列として受け取り、番号で割り当てる
      // lines系なら問題ない。
      // TODO: bubbleチャート系だとうまくいかないかもしれない。
      // legendの利用有無も含めて再検討必要
      this.applyLegend({indexLabel: true})

      return composite.render();
    },

    destroyed: function() {
      // TODO: implement
      // Base.destroyed
    }
  }

  return ComponentObject;
}

