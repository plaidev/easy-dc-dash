import Vue from 'vue/dist/vue.js'
import d3 from 'd3'
import Base from './_base'


export function compose(Left, Right) {

  const ComponentObject = {
    extends: Base,

    template: `<div class="krt-dc-composite" :id="id"></div>`,

    props: {
      chartType: {
        type: String,
        default: 'compositeChart'
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
          getReducerExtractor: () => {
            return (d) => {
              const _reducer = new Function('d', 'return ' + this.reduce);
              return _reducer(d)[0];
            }
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
          getReducerExtractor: () => {
            return (d) => {
              const _reducer = new Function('d', 'return ' + this.reduce);
              return _reducer(d)[1];
            }
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
        .margins({
          top: 30,
          right: 50,
          bottom: 25,
          left: 40
        })
        .width(240*4).height(240)
        .dimension(dim)
        .compose([
          Left.mounted.apply(leftInstance),
          Right.mounted.apply(rightInstance).useRightYAxis(true),
        ])
        .renderHorizontalGridLines(true)
        .brushOn(false)
        //.rightY(scale.linear().domain([0, 1]))
        .elasticY(true)

      return composite.render();
    },

    destroyed: function() {
      // TODO: implement
      // Base.destroyed
    }
  }

  return ComponentObject;
}

