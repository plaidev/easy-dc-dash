
//import Layout from 'libs/layout'
//import Chart from './libs/chart'
// import Dashboard from './libs/index'

//import Dashboard from './libs/dashboard.vue'
import SegmentPie from './libs/chart/segment-pie.vue'
import WeekRow from './libs/chart/week-row.vue'
import RateLine from './libs/chart/rate-line.vue'
import StackedLines from './libs/chart/stacked-lines.vue'
import {compose} from './libs/chart/_composite'

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
      'segment-pie': SegmentPie,
      'week-row': WeekRow,
      'rate-line': RateLine,
      'stacked-lines': StackedLines,
      'stack-and-rate': compose(StackedLines, RateLine)
    }
  });

  /*

  const DashboardApp = Vue.extend(Dashboard);

  const app = new DashboardApp({
    el: '#krt-dc-dashboard',
    data: {
      elName: '#krt-dc-dashboard',
      data: datasets[0].content,
      dateFormat: "%Y-%m-%d",
      dateFields: ['session_end_date']
    }
  })


  app
    .addChart('PV-Bounce-session', new Chart.DateVolumedComposite({
      getter: (d) => d.session_end_date,
      reducer: (d) => d.pv,
      left: new Chart.StackedLines({
        groups: [
          {
            label: 'PV', // not bounce PV
            reducer: (d) => d.pv - d.bounce_cnt
          },
          {
            label: 'bounce PV',
            reducer: (d) => d.bounce_cnt
          }
        ]
      }),
      right: new Chart.RateLine({
        reducer: (d) => Object.create({count: d.session_cnt, value: d.bounce_cnt})
      })
    }))
    .addChart('Week-PV', new Chart.WeekRow({
      getter: (d) => d.session_end_date,
      reducer: (d) => d.pv
    }))


  segmentSets.forEach((segmentSet) => {
    app
      .addChart(segmentSet.title, new Chart.SegmentPie({
        name: segmentSet.title,
        segments: segmentSet.segments,
        labels: segmentSet.labels,
        getter: (d) => d.segments.split(','),
        reducer: (d) => d.session_cnt
      }))
  })

  setTimeout(app.render, 10*1000);
  */
}

