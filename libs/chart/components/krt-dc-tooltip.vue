<template>
  <div class="krt-dc-tooltip" v-if="data">
    <div class="chart-data">
      <div v-if="data.key"><span class="key">key: {{data.key}}</span></div>
      <div v-if="data.keys" v-for="(v, k) in data.keys"><span class="keys">{{k}} : {{v}}</span></div>
      <div v-if="data.val"><span class="val">value: {{data.val}}</span></div>
      <div v-if="data.vals" v-for="(v, k) in data.vals"><span class="vals">{{k}}: {{v}}</span></div>
      <div v-if="data.total"><span class="total">value: {{data.total}}</span></div>
    </div>
  </div>
</template>

<script lang='js'>

export default {
  name: 'KrtDcTooltip',
  data () {
   return {
      data: null
    }
  },
  methods: {
    show: function(data) {
      this.data = data;
    },
    move: function(left, top) {
      const el = this.$el;
      el.style.left = (left + 50) + "px";
      el.style.top = (top - 10) + "px";
    },
    remove: function() {
      this.data = null;
    }
  }
}
</script>

<style scoped>
  .krt-dc-tooltip {
    pointer-events: none;
    color: #000;
    font-size: 18px;
    font-weight: bold;
    border: 1px solid #000;
    background: rgba(255,255,255,.4);
    box-shadow: 0 2px 4px rgba(0,0,0,.1);
    position: fixed;
    margin: 0 0 0 -32px;
    border-radius: 5px;
    padding: 8px 10px;
    z-index: 2;
  }
  .krt-dc-tooltip .chart-data {
    display: inline-block;
  }
</style>