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
  background-color: #FFF;
  position: absolute;
  transition: all 200ms 0s ease;
}

.card-container.self-margned {
  margin: 2px;
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

  display: flex;
  align-items: center;
  justify-content: center;
}

.card-container.self-margined .inner-container {
  margin: -2px;
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
  left: 0;
  right: 0;
  border-bottom: 1px solid rgba(0,0,0,.08);
}

.title {
  color: #475A57;
  font-size: 1em;
  margin-top: 12px;
  margin-bottom: 12px;
  padding-left: 24px;
  width: calc(100% - 2em);
}

.icon-box {
  position: absolute;
  right: 8px;
  top: 12px;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  color: rgba(0,0,0,.16);
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