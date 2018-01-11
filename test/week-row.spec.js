import Vue from 'vue';
import { mount, createLocalVue } from 'vue-test-utils';
import CssModuleTestHelperMixin from './helpers/css-modules-test-helper-mixin';

import Store from '../libs/store';
import WeekRow from '@/week-row.vue';

const localVue = createLocalVue();
localVue.use(CssModuleTestHelperMixin);

describe('week-row', () => {
  it('あとでやる');

  // Store.registerData([
  //   { date: '2017-01-01T15:00:00.000Z', d1: 'a', d2: true, v: 1 },
  //   { date: '2017-01-02T15:00:00.000Z', d1: 'a', d2: false, v: 2 },
  //   { date: '2017-01-03T15:00:00.000Z', d1: 'b', d2: false, v: 3 },
  //   { date: '2017-01-04T15:00:00.000Z', d1: 'b', d2: true, v: 5 }
  // ]);
  //
  // const wrapper = mount(localVue.extend(WeekRow), {
  //   localVue,
  //   propsData: {
  //     id: 'test-week-row',
  //     dimension: 'date',
  //     reduce: 'v'
  //   },
  //   attachToDocument: true
  // });
  //
  // it('to match snapshot', () => {
  //   expect(wrapper.html()).toMatchSnapshot();
  // });
});
