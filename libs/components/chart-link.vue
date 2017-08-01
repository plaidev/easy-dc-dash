<template>
  <div class="krt-dc-chart-link" v-if="link" :style="{left:left + 'px', top:top + 'px'}">
    <span><a class='link-text' :href='link' target='_blank' v-text='link'></a></span>
    <span>
      <a :href='link' target='_blank'>
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
      link: null,
      top: 0,
      left: 0
    }
  },
  methods: {
    show: function(c, link) {
      if(c.filters().length === 0) return this.remove()
      const el = this.$el
      const viewOffset = el.parentElement.getBoundingClientRect()
      this.left = d3.event.clientX - viewOffset.left
      this.top = d3.event.clientY - viewOffset.top - 40
      this.link = link;
    },
    remove: function() {
      this.link = null;
    }
  }
}
</script>

<style module>
  .krt-dc-chart-link {
    color: #000;
    font-size: 14px;
    background: #FFF;
    box-shadow: 2px 4px 8px rgba(0,0,0,.24);
    position: absolute;
    padding: 6px 8px;
    z-index: 2;
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