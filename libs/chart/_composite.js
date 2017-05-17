import Vue from 'vue/dist/vue.js'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'

function _getReduceKeysSuper(Component) {
  if (!Component) return;
  if (Component.computed && Component.computed.reduceKeys)
    return Component.computed.reduceKeys
  return _getReduceKeysSuper(Component.extends)
}


export function compose(Left, Right) {

  const ComponentObject = {
    extends: Base,

    template: `<div class="krt-dc-composite" :id="id"></div>`,

    props: {
      chartType: {
        type: String,
        default: 'compositeChart'
      },
      width: {
        type: Number,
        default: 240*4
      },
      height: {
        type: Number,
        default: 240
      },
      legend: {
        type: Object,
        default: () => {return {x:0, y:0, gap: 5, width: 800, itemWidth: 70, itemHeight: 12, horizontal: true}}
      },
      elasticY: {
        type: Boolean,
        default: true
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
          },
          reduceKeys: function(idx) {
            const s = _getReduceKeysSuper(Left);
            if (!s) return 'l'
            return s.apply(this).map((k) => 'l:'+k);
          }
        },
        propsData: {
          dimension: this.dimension,
          scale: this.scale,
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
          reduceKeys: function(idx) {
            const s = _getReduceKeysSuper(Right);
            if (!s) return 'r'
            return s.apply(this).map((k) => 'r:'+k);
          }
        },
        propsData: {
          dimension: this.dimension,
          scale: this.scale,
          legend: false
        }
      })

      Base.mounted.apply(leftInstance)
      Base.mounted.apply(rightInstance)

      const dim = this.grouping;
      const composite = this.chart;

      composite
        .dimension(dim)
        .compose([
          Left.mounted.apply(leftInstance),
          Right.mounted.apply(rightInstance).useRightYAxis(true),
        ])
        .renderHorizontalGridLines(true)
        .brushOn(false)
        //.rightY(scale.linear().domain([0, 1]))
        .elasticY(this.elasticY)
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

