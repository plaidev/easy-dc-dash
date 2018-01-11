import Vue from 'vue';
import { mount, createLocalVue } from 'vue-test-utils';
import CssModuleTestHelperMixin from './helpers/css-modules-test-helper-mixin';

import Store from '../libs/store';
import DataTable from '@/data-table.vue';

const localVue = createLocalVue();
localVue.use(CssModuleTestHelperMixin);

describe('data-table', () => {
  Store.registerData([
    { date: '2017-01-01T15:00:00.000Z', d1: 'a', d2: true, v1: 1, v2: 10 },
    { date: '2017-01-02T15:00:00.000Z', d1: 'a', d2: false, v1: 2, v2: 20 },
    { date: '2017-01-03T15:00:00.000Z', d1: 'b', d2: false, v1: 3, v2: 30 },
    { date: '2017-01-04T15:00:00.000Z', d1: 'b', d2: true, v1: 5, v2: 50 }
  ]);

  const wrapper = mount(localVue.extend(DataTable), {
    localVue,
    propsData: {
      id: 'test-data-table',
      dimension: 'd1',
      columns: '{date: d.date, d1: d.d1, cnt: d.v1, v: d.v2, rate: {count: d.v1, value: d.v2}}',
      'sort-by': 'date',
      order: 'ascending'
    },
    attachToDocument: true
  });

  it('to match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
