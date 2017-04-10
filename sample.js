import Chart from './libs/chart'
import Store from './libs/store'

// http://stackoverflow.com/questions/39488660/vue-js-2-0-not-rendering-anything
import Vue from 'vue/dist/vue.js'

// ---------------------------------------


const segmentSets = [
  {
    title: 'device',
    segments: ["5890222d3601a6183b69f151", "5890222d3601a6183b69f14f"],
    labels: {"5890222d3601a6183b69f151": 'SP', "5890222d3601a6183b69f14f": 'PC'}
  },
  {
    title: 'referrer',
    segments: ["5890222d3601a6183b69f153", "58902caa7048639a5ba53b17", "58902d517048639a5ba53b26", "58902e8c7048639a5ba53b3a"],
    labels: {"5890222d3601a6183b69f153": 'search',
             "58902caa7048639a5ba53b17": 'newspicks',
             "58902d517048639a5ba53b26": 'facebook',
             "58902e8c7048639a5ba53b3a": 'twitter'},
  },
  {
    title: 'repeat',
    segments: ["5890222d3601a6183b69f15a", "5890222d3601a6183b69f15c", "5890222d3601a6183b69f15e", "5890222d3601a6183b69f160"],
labels: {"5890222d3601a6183b69f15a": '初回来訪',
 "5890222d3601a6183b69f15c": '来訪2回',
 "5890222d3601a6183b69f15e": '来訪3回',
 "5890222d3601a6183b69f160": '来訪4回以上'},
  }
];

//-------------------


export function run() {

  Store.registerData(
    datasets[0].content,
    {
      dateFormat: "%Y-%m-%d",
      dateFields: ['session_end_date']
    }
  );

  const DashboardApp = new Vue({
    el: '#krt-dc-dashboard',
    data: {
      deviceSegments: segmentSets[0].segments,
      referrerSegments: segmentSets[1].segments,
      repeatSegments: segmentSets[2].segments,
      deviceSegmentLabels: segmentSets[0].labels,
      referrerSegmentLabels: segmentSets[1].labels,
      repeatSegmentLabels: segmentSets[2].labels
    },
    components: {
      'segment-pie': Chart.SegmentPie,
      'week-row': Chart.WeekRow,
      'rate-line': Chart.RateLine,
      'stacked-lines': Chart.StackedLines,
      'stack-and-rate': Chart.compose(Chart.StackedLines, Chart.RateLine),
      'volume-chart': {
        extends: Chart.Base,
        mounted: function() {
          const dim = this.grouping;
          const dimExtractor = this.getDimensionExtractor;
          const min = dimExtractor(dim.bottom(1)[0]);
          const max = dimExtractor(dim.top(1)[0]);
          this.chart
            .width(240*4)
            .height(60)
            .margins({
              top: 0,
              right: 50,
              bottom: 20,
              left: 40
            })
            .centerBar(true)
            .gap(1)
            .x(d3.time.scale().domain([min, max]))
            .elasticY(true)
            .round(d3.time.day.round)
            //.round(time.week.round)
            .alwaysUseRounding(true)
            .xUnits(d3.time.days)
            .yAxis().ticks(0)

          this.chart.render()
        }
      }
    }
  });

}