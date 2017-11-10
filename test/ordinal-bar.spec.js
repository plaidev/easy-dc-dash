import Vue from 'vue'
import { mount, createLocalVue } from 'vue-test-utils'

import Store from '../libs/store'
import OrdinalBar from '@/ordinal-bar.vue'

import DataTable from '@/data-table.vue'

import CssModuleTestHelperMixin from './helpers/css-modules-test-hepler-mixin'

const localVue = createLocalVue()
localVue.use(CssModuleTestHelperMixin)

describe('ordinal-bar.vue', () => {
  Store.registerData([
    {d1: 'a', d2: true, v: 1},
    {d1: 'a', d2: false, v: 2},
    {d1: 'b', d2: false, v: 3},
    {d1: 'b', d2: true, v: 5},
  ])

  const wrapper = mount(localVue.extend(OrdinalBar), {
    localVue,
    propsData: {
      dimension: 'd1',
      reduce: 'v'
    },
    attachToDocument: true
  })

  console.log(wrapper.html());

  it('render ordinal-bar', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })
})

describe('data-table.vue', () => {
  Store.registerData([
    {d1: 'a', d2: true, v: 1},
    {d1: 'a', d2: false, v: 2},
    {d1: 'b', d2: false, v: 3},
    {d1: 'b', d2: true, v: 5},
  ])

  const wrapper = mount(localVue.extend(DataTable), {
    localVue,
    propsData: {
      // dimension: 'd1',
      // reduce: 'v'
    },
    attachToDocument: true
  })

  console.log(wrapper.html());

  it('render ordinal-bar', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

})