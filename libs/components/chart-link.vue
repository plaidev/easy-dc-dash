<template>
  <div class="krt-dc-chart-link" v-if="value">
    <span><a class='link-text' :href='label' target='_blank' v-text='value'></a></span>
    <span>
      <a :href='label' target='_blank'>
        <i class='fa fa-external-link link-icon' aria-hidden='true'></i>
      </a>
    </span>
  </div>
</template>

<script lang='js'>

export default {
  name: 'KrtDcChartLink',
  data () {
    return {
      value: null,
      label: null
    }
  },
  methods: {
    show: function(c, value, label) {
      if(c.filters().length === 0) return this.remove()
      this.value = value;
      this.label = label;
    },
    remove: function() {
      this.value = null;
      this.label = null;
    }
  }
}
</script>

<style module>
  .krt-dc-chart-link {
    color: #000;
    font-size: 12px;
    border: 1px solid #aaa;
    background: rgba(255,255,255,.8);
    box-shadow: 0 2px 4px rgba(0,0,0,.1);
    position: absolute;
    padding: 4px 6px;
    z-index: 2;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
  }
  .krt-dc-chart-link .link-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .krt-dc-chart-link .link-icon {
    padding-left: 5px;
    font-size: 14px;
    vertical-align: text-bottom;
  }
</style>