<template>
  <div class="filter-common-dimensions">

    <ul v-for="(key, k_index) in keys" :keys="k_index">
      {{key}}
      <li v-for="(val, v_index) in values[key]" :keys="v_index">
        <input type="checkbox" @change="selectedKey(key, val)"/>
        {{val}}
      </li>
    </ul>

</template>

<script lang="js">
import dc from 'dc';
import Store from '../store';

function _flatten(nestedArray) {
  return Array.prototype.concat.apply([], nestedArray);
}

function _union(array) {
  return Array.from(new Set(array));
}

export default {
  props: {},
  data() {
    return {
      selected: null
    };
  },
  watch: {
    selected(v) {
      // console.log('selected', v);
      this.charts.forEach(chart => {
        chart.filter(v.value);
      });
      dc.redrawAll();
    }
  },
  computed: {
    keys() {
      // FIXME
      return Object.keys(Store.manager._commonDimensions);
    },
    datasets() {
      const datasets = {};
      this.keys.forEach(key => {
        datasets[key] = Object.keys(Store.manager._commonDimensions[key]);
      });
      // console.log('datasets', datasets);
      return datasets;
    },
    dimensions() {
      const dimensions = {};
      this.keys.forEach(key => {
        dimensions[key] = this.datasets[key].map(dataset => {
          return Store.getDimension('$' + key, { dataset });
        });
      });
      // console.log('dimensions', dimensions);
      return dimensions;
    },
    values() {
      const values = {};
      this.keys.forEach(key => {
        values[key] = this.dimensions[key].map(dim =>
          dim
            .group()
            .all()
            .map(d => d.key)
        );
        values[key] = _union(_flatten(values[key]));
      });
      // console.log('values', values);
      return values;
    },
    charts() {
      return Object.keys(Store._charts).map(chart => Store._charts[chart]);
    }
  },
  methods: {
    selectedKey(key, value) {
      this.selected = { key, value };
    }
  }
};
</script>

<style scoped>

.filter-common-dimensions {
  width: 100%;
  padding-bottom: 100px;
}

</style>