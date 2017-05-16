import Vue from 'vue/dist/vue.js'
import d3 from 'd3'
import Base from './_base'
import Store from '../store'
import {generateExtractor} from '../utils'

function _extractReduceKey(reduce) {
  // FIXME: Replace if there is a better way
  return reduce.match(/d.\w*/g)
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
      labels: {
        type: Array
      },
      elasticY: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      _labels: function() {
        return this.labels || this.reduceKeys
      },
      reduceKeys: function() {
        return _extractReduceKey(this.reduce)
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
          labels: () => {
            const dim = Store.getDimension(this.dimensionName, this.dimensionExtractor, {dataset: this.dataset});
            const _reducer = generateExtractor(this.reduce);
            const lines = _reducer(dim.top(1)[0])[0]
            const lineNum = Array.isArray(lines) ? lines.length : 1
            return this._labels.slice(0, lineNum)
          }
        },
        propsData: {
          dimension: this.dimension,
          scale: this.scale
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
          labels: () => {
            const dim = Store.getDimension(this.dimensionName, this.dimensionExtractor, {dataset: this.dataset});
            const _reducer = generateExtractor(this.reduce);
            const lines = _reducer(dim.top(1)[0])[1]
            const lineNum = Array.isArray(lines) ? lines.length : 1
            return this._labels.slice(-lineNum)
          }
        },
        propsData: {
          dimension: this.dimension,
          scale: this.scale
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

      this.applyLegend()
      return composite.render();
    },

    destroyed: function() {
      // TODO: implement
      // Base.destroyed
    }
  }

  return ComponentObject;
}

