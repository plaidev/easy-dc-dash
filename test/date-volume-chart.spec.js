import Vue from 'vue';
import { mount, createLocalVue } from 'vue-test-utils';
import CssModuleTestHelperMixin from './helpers/css-modules-test-helper-mixin';

import Store from '../libs/store';
import DateVolumeChart from '@/date-volume-chart.vue';

const localVue = createLocalVue();
localVue.use(CssModuleTestHelperMixin);

describe('date-volume-chart', () => {
  Store.registerData([
    { date: '2017-01-01T15:00:00.000Z', d1: 'a', d2: true, v: 1 },
    { date: '2017-01-02T15:00:00.000Z', d1: 'a', d2: false, v: 2 },
    { date: '2017-01-03T15:00:00.000Z', d1: 'b', d2: false, v: 3 },
    { date: '2017-01-04T15:00:00.000Z', d1: 'b', d2: true, v: 5 }
  ]);

  const wrapper = mount(localVue.extend(DateVolumeChart), {
    localVue,
    propsData: {
      id: 'test-date-volume-chart',
      dimension: 'd.date',
      reduce: 'd.v'
    },
    attachToDocument: true
  });

  it('to match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
