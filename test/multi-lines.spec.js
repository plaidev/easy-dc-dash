import Vue from 'vue';
import { mount, createLocalVue } from 'vue-test-utils';
import CssModuleTestHelperMixin from './helpers/css-modules-test-helper-mixin';

import Store from '../libs/store';
import MultiLines from '@/multi-lines.vue';

const localVue = createLocalVue();
localVue.use(CssModuleTestHelperMixin);

describe('multi-lines', () => {
  Store.registerData([
    { date: new Date('2017-05-18 10:00'), d1: 'a', d2: true, v1: 1, v2: 10 },
    { date: new Date('2017-05-19 10:00'), d1: 'a', d2: false, v1: 2, v2: 20 },
    { date: new Date('2017-05-20 10:00'), d1: 'b', d2: false, v1: 3, v2: 30 },
    { date: new Date('2017-05-21 10:00'), d1: 'b', d2: true, v1: 5, v2: 50 }
  ]);

  const wrapper = mount(localVue.extend(MultiLines), {
    localVue,
    propsData: {
      id: 'test-multi-lines',
      scale: 'time.hour',
      dimension: 'd.date',
      reduce: '[d.v1, d.v2]'
    },
    attachToDocument: true
  });

  it('to match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
