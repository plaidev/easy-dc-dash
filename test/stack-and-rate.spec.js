import Vue from 'vue';
import { mount, createLocalVue } from 'vue-test-utils';
import CssModuleTestHelperMixin from './helpers/css-modules-test-helper-mixin';

import { compose } from '../libs/chart/_composite';
import Store from '../libs/store';

import StackedLines from '@/stacked-lines.vue';
import RateLine from '@/rate-line.vue';

const StackAndRate = compose(StackedLines, RateLine);

const localVue = createLocalVue();
localVue.use(CssModuleTestHelperMixin);

describe('stack-and-rate', () => {
  Store.registerData([
    { d1: 'a', d2: true, v: 1 },
    { d1: 'a', d2: false, v: 2 },
    { d1: 'b', d2: false, v: 3 },
    { d1: 'b', d2: true, v: 5 }
  ]);

  const wrapper = mount(localVue.extend(StackAndRate), {
    localVue,
    propsData: {
      id: 'test-stack-and-rate',
      dimension: 'd1',
      reduce: 'v'
    },
    attachToDocument: true
  });

  it('to match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
