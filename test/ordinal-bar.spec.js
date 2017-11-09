import Vue from 'vue'
import Store from '../libs/store'
import Chart from '../libs/chart'
import {init, run} from '../libs/autorun'
import { mount, createLocalVue } from 'vue-test-utils'


import Base from '@/_coordinateGridBase.js'
import OrdinalBar from '@/ordinal-bar.vue'

const localVue = createLocalVue()
localVue.use(Base)

beforeAll(() => {
  init()
  Chart.install(Vue)

  Store.registerData([
    {d1: 'a', d2: true, v: 1},
    {d1: 'a', d2: false, v: 2},
    {d1: 'b', d2: false, v: 3},
    {d1: 'b', d2: true, v: 5},
  ])
  run()
})

describe('ordinal-bar', () => {
  const wrapper = mount(OrdinalBar, {
    localVue,
    attachToDocument: true,
    propsData: {
      dimension: 'd1',
      reduce: 'v'
    }
  })

  // console.log(wrapper.vm)
  const div = wrapper.findAll('div')
  console.log(div);
  const svg = wrapper.findAll('svg')
  console.log(svg);
  const g = wrapper.findAll('g')
  console.log(g);

  it('renders the correct bar', () => {
    expect(wrapper.hasProp('chartType', 'barChart')).toBe(true)
    expect(wrapper.hasProp('dimension', 'd1')).toBe(true)
    expect(wrapper.hasProp('reduce', 'v')).toBe(true)
  })
})