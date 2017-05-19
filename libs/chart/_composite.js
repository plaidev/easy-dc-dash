import Vue from 'vue/dist/vue.js'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'
import {TIME_FORMATS} from '../utils/time-format'

function _getReduceKeySuper(Component) {
  if (!Component) return;
  if (Component.methods && Component.methods.getReduceKey)
    return Component.methods.getReduceKey
  return _getReduceKeySuper(Component.extends)
}


export function compose(Left, Right) {

  const ComponentObject = {
    extends: Base,

    template: `<div class="krt-dc-composite" :id="id">
                      <krt-dc-tooltip ref='tooltip'></krt-dc-tooltip>
                      <reset-button v-on:reset="removeFilterAndRedrawChart()"></reset-button>
                      <div v-text="title" style="font-size:24px; text-align:center;">{{title}}</div>
                    </div>`,

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
    methods: {
      showTooltip: function(d, i) {
        const format = this.timeFormat ? this.timeFormat : d3.time.format('%Y-%m-%d');
        const fill = d3.event.target.getAttribute('fill');
        const stroke = d3.event.target.getAttribute('stroke');
        const color = fill || stroke;
        let key = null;
        let val = null;
        if (d.x && d.y) {
          key = this.scale ? format(d.x) : x;
          val = d.y;
        }
        else {
          key = this.getLabel(i);
        }
        const data = {
          key: key,
          val: val
        }
        this.$refs.tooltip.show(data, color)
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
            if (!s) return 'l'
            return 'l:' + s.apply(this, [idx])
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
        },
        methods: {
          getReduceKey: function(idx) {
            const s = _getReduceKeySuper(Right);
            if (!s) return 'r'
            return 'r:' + s.apply(this, [idx])
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

