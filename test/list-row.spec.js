import Vue from 'vue';
import { mount, createLocalVue } from 'vue-test-utils';
import CssModuleTestHelperMixin from './helpers/css-modules-test-helper-mixin';

import Store from '../libs/store';
import ListRow from '@/list-row.vue';

const localVue = createLocalVue();
localVue.use(CssModuleTestHelperMixin);

describe('list-row', () => {
  Store.registerData([
    { d1: 'a', d2: true, v: 1 },
    { d1: 'a', d2: false, v: 2 },
    { d1: 'b', d2: false, v: 3 },
    { d1: 'b', d2: true, v: 5 }
  ]);

  const wrapper = mount(localVue.extend(ListRow), {
    localVue,
    propsData: {
      id: 'test-list-row',
      dimension: 'd1',
      reduce: 'v'
    },
    attachToDocument: true
  });

  it('to match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
