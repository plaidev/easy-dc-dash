import Vue from 'vue';
import { mount, createLocalVue } from 'vue-test-utils';
import CssModuleTestHelperMixin from './helpers/css-modules-test-helper-mixin';

import Store from '../libs/store';
import MultiLines from '@/multi-lines.vue';

const localVue = createLocalVue();
localVue.use(CssModuleTestHelperMixin);

describe('multi-line', () => {
  Store.registerData([
    { date: '2017-01-01T15:00:00.000Z', d1: 'a', d2: true, v1: 1, v2: 10 },
    { date: '2017-01-02T15:00:00.000Z', d1: 'a', d2: false, v1: 2, v2: 20 },
    { date: '2017-01-03T15:00:00.000Z', d1: 'b', d2: false, v1: 3, v2: 30 },
    { date: '2017-01-04T15:00:00.000Z', d1: 'b', d2: true, v1: 5, v2: 50 }
  ]);

  const wrapper = mount(localVue.extend(MultiLines), {
    localVue,
    propsData: {
      id: 'test-multi-line',
      dimension: 'd1',
      reduce: '[d.v1, d.v2]',
      scale: 'time.hour'
    },
    attachToDocument: true
  });

  it('to match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
