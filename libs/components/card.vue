<template>
  <div class="outer-container" :style="outerSizeStyle" :class="screenModeClass">
    <div class="backdrop" @click="toggleFullscreen"></div>
    <div class="card-container">
      <div class="inner-container" :style="sizeStyle">
        <div class="container-header">
          <div class="icon-box">
            <i class="fa" :class="fullscreenIconClass" @click="toggleFullscreen"></i>
          </div>
          <h3 v-text="title" class="title"></h3>
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
    reset: function() {
      this.$emit('reset')
    },
    toggleFullscreen: function() {
      this.isFullscreen = !this.isFullscreen
      setTimeout(() => {
        this.$emit('update:fullscreen', this.isFullscreen)
      }, 0)
    }
  }
}
</script>

<style module>

.outer-container {
  position: relative;
}

.backdrop {
}

.fullscreen .backdrop {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
}

.card-container {
  background-color: white;
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  right: 2px;
  transition: all 200ms 0s ease;
}

.fullscreen .card-container {
  position: fixed;
  top: 5vh;
  left: 5vw;
  right: 5vw;
  bottom: 5vh;
  z-index: 100;
}

.inner-container {
  position: relative;
  margin: -2px;

  display: flex;
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
  position: absolute;
  top: 0;
  left: 10px;
  right: 10px;
}

.title {
  width: calc(100% - 2em);
  opacity: 0.6;
  font-size: 24px;
}

.icon-box {
  position: absolute;
  right: 0px;
  top: 3px;
  height: 1.5em;
  width: 2em;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  color: gray;
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