<template>
  <div class="outer-container" :style="sizeStyle">
    <div class="inner-container">
      <div class="card-container" :style="sizeStyle">
        <h3 v-text="title" class="title"></h3>
        <div class="render-area">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">

export default {
  props: {
    title: {
      type: String
    },
    width: {
      default: 377
    },
    height: {
      default: 233
    }
  },
  computed: {
    sizeStyle: function() {
      const style = {};
      if (this.width) style.width = this.width+'px';
      if (this.height) style.height = this.height+'px';
      return style
    }
  },
  methods: {
    reset: function() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.outer-container {
  position: relative;
}

.inner-container {
  background-color: white;
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  right: 2px;
}

.card-container {
  margin: -2px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  position: absolute;
  top: 0;
  left: 10px;
  opacity: 0.6;
  font-size: 24px;
}

.render-area {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

</style>