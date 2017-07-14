<template>
  <div class="outer-container" :style="outerSizeStyle" :class="screenModeClass">
    <div class="backdrop" @click="toggleFullscreen"></div>
    <div class="card-container">
      <div class="inner-container" :style="sizeStyle">
        <div class="container-header">
          <div class="title">
            <span v-text="title"></span>
          </div>
          <div class="icon-box">
            <i class="fa" :class="fullscreenIconClass" @click="toggleFullscreen"></i>
          </div>
        </div>
        <div class="render-area" :style="renderAreaStyle">
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
    },
    captionHeight: {
      default: 0
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    hideLegend: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {isFullscreen: false}
  },
  computed: {
    renderAreaStyle: function() {
      if (this.captionHeight) {
        return {
          'margin-top': this.captionHeight + 'px',
          height: 'calc(100% - ' + this.captionHeight + 'px)'
        }
      }
      return {}
    },
    outerSizeStyle: function() {
      const style = {};
      if (this.width) style.width = this.width+'px';
      if (this.height) style.height = this.height+'px';
      return style
    },
    sizeStyle: function() {
      const style = {};
      if (this.isFullscreen) {
        style.width = 90+'vw';
        style.height = 90+'vh';
      }
      else {
        if (this.width) style.width = this.width+'px';
        if (this.height) style.height = this.height+'px';
      }
      this.$nextTick(() => {
        this.$emit('resized', {isFullscreen: this.isFullscreen})
      })
      return style
    },
    screenModeClass: function() {
      classes = []
      if (this.isFullscreen) {
        classes.push(this.$options.cssModules['fullscreen'])
      }
      if (this.hideLegend) {
        classes.push(this.$options.cssModules['hide-legend'])
      }
      return classes.join(' ')
    },
    fullscreenIconClass: function() {
      return this.isFullscreen? 'fa-window-minimize': 'fa-window-maximize'
    }
  },
  watch: {
    fullscreen: function(v) {
      this.isFullscreen = v
    }
  },
  methods: {
    toggleFullscreen: function() {
      this.isFullscreen = !this.isFullscreen
    }
  }
}
</script>

<style module>

.backdrop {
}

.fullscreen .backdrop {
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
}

.card-container {
  width: 100%;
  height: 100%;
  background-color: white;
  top: 2px;
  bottom: 2px;
  left: 2px;
  right: 2px;
  transition: all 200ms 0s ease;
  border-radius: 2px;
  box-shadow: 1px 1px 5px 1px rgba(0,0,0,.1);
}

.fullscreen .card-container {
  top: 5vh;
  left: 5vw;
  right: 5vw;
  bottom: 5vh;
  z-index: 100;
}

.inner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.render-area {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

}

.container-header {
  top: 0;
  width: 100%;
  border-bottom: 0.5px solid #ccc;
  opacity: .6;
  display: flex;
  flex-direction: row;
  align-items: space-around;
}

.title {
  width: calc(100% - 2em);
  margin: 0 auto;
  padding: 10px 0px 10px 20px;
}
.title span {
  font-size: 24px;
}

.icon-box {
  font-size: 1.5em;
  margin: auto;
  padding-right: 10px;
  color: gray;
  opacity: 1;
}

.icon-box i {
  padding: 2px;
}

.icon-box i:hover {
  color: black;
  padding: 1px;
  border: solid 1px gray;
  border-radius: 3px;
}

.hide-legend .dc-legend {
  display: none;
}

</style>