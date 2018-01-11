import Vue from 'vue';
import { mount, createLocalVue } from 'vue-test-utils';
import CssModuleTestHelperMixin from './helpers/css-modules-test-helper-mixin';

import Store from '../libs/store';
import SegmentPie from '@/segment-pie.vue';

const localVue = createLocalVue();
localVue.use(CssModuleTestHelperMixin);

describe('segment-pie', () => {
  const segments = {
    all: 'all'
  };
  Store.registerData([
    { segments: 'all', d1: 'a', d2: true, v: 1 },
    { segments: 'all', d1: 'a', d2: false, v: 2 },
    { segments: 'all', d1: 'b', d2: false, v: 3 },
    { segments: 'all', d1: 'b', d2: true, v: 5 }
  ]);

  const wrapper = mount(localVue.extend(SegmentPie), {
    localVue,
    propsData: {
      id: 'test-segment-pie',
      dimension: 'd1',
      reduce: 'v',
      segments
    },
    attachToDocument: true
  });

  it('to match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
