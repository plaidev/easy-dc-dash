<template>
  <div class="krt-dc-tooltip" v-if="data">
    <div class="circle-box" v-if="color">
      <div class="circle" :style="{backgroundColor: color}"></div>
    </div>
    <div class="chart-data">
      <div class="key">
        <div v-if="data.key">
          <span>{{data.key}}</span>
        </div>
        <div v-if="data.keys" v-for="(v,k) in data.keys">
          <span>{{k}} : {{v}}</span>
        </div>
      </div>
      <div class="val">
        <div v-if="data.val >= 0">{{data.val}}</div>
        <div v-if="data.vals" v-for="(v, k) in data.vals">
          <span>{{k}}: {{v}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='js'>

export default {
  name: 'KrtDcTooltip',
  data () {
   return {
      data: null,
      color: null
    }
  },
  methods: {
    show: function(data, color) {
      if(!data) return
      this.data = data;
      this.color = color;
    },
    move: function(left, top) {
      if(!this.data) return
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
    border: 1px solid #aaa;
    background: rgba(255,255,255,.8);
    box-shadow: 0 2px 4px rgba(0,0,0,.1);
    position: fixed;
    margin: 0 0 0 -32px;
    border-radius: 5px;
    padding: 8px 10px;
    z-index: 2;
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
  }
  .krt-dc-tooltip .circle-box {
    height: 100%;
    width: 30px;
  }
  .krt-dc-tooltip .circle-box .circle {
    border-radius: 50%;
    height: 16px;
    width: 16px;
  }
  .krt-dc-tooltip .chart-data {
    display: flex;
    flex-direction: column;
  }
  .krt-dc-tooltip .chart-data .key {
    font-weight: bold;
  }

</style>