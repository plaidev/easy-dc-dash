<template>
  <div class="outer-container" :style="outerSizeStyle" :class="screenModeClass">
    <div class="backdrop" @click="toggleFullscreen"></div>
    <div class="card-container" :class="selfMargined ? $style['self-margined'] : ''">
      <div class="inner-container" :style="sizeStyle">
        <div class="container-header" :class="title ? $style['has-caption'] : ''">
          <div class="icon-box">
            <i class="fa" :class="fullscreenIconClass" @click="toggleFullscreen"></i>
          </div>
          <h3 v-if="title" v-text="title" class="title"></h3>
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
      type: String,
    },
    width: {
      default: 377,
    },
    height: {
      default: 233,
    },
    captionHeight: {
      default: 0,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    hideLegend: {
      type: Boolean,
      default: false,
    },
    selfMargined: {
      type: Boolean,
      default: true,
    },
  },
  data: function() {
    return {
      isFullscreen: false,
      updating: false,
      mounted: false,
    };
  },
  computed: {
    $style: function() {
      return this.$options.cssModules;
    },
    renderAreaStyle: function() {
      if (this.captionHeight && this.title) {
        return {
          'margin-top': this.captionHeight + 'px',
          height: 'calc(100% - ' + this.captionHeight + 'px)',
        };
      }
      return {};
    },
    computedWidth: function() {
      let width = this.width;
      if (this.mounted && this.$el) {
        const style = window.getComputedStyle(this.$el);
        // 設定値と計測した値が異なる時、autoで再計算（flexの場合など）
        if (style.width !== this.width + 'px') {
          width = 'auto';
        }
      }
      return width;
    },
    outerSizeStyle: function() {
      const style = {};
      if (this.computedWidth === 'auto') {
        style.width = '100%';
      } else if (this.computedWidth) {
        style.width = this.computedWidth + 'px';
      }
      if (this.height) style.height = this.height + 'px';
      return style;
    },
    sizeStyle: function() {
      const style = {};
      if (this.isFullscreen) {
        style.width = 90 + 'vw';
        style.height = 90 + 'vh';
      } else {
        if (this.computedWidth === 'auto') {
          style.width = '100%';
        } else if (this.computedWidth) style.width = this.computedWidth + 'px';
        if (this.height) style.height = this.height + 'px';
      }
      return style;
    },
    screenModeClass: function() {
      const classes = [];
      if (this.isFullscreen) {
        classes.push(this.$options.cssModules['fullscreen']);
      }
      if (this.hideLegend) {
        classes.push(this.$options.cssModules['hide-legend']);
      }
      return classes.join(' ');
    },
    fullscreenIconClass: function() {
      return this.isFullscreen ? 'fa-window-minimize' : 'fa-window-maximize';
    },
  },
  watch: {
    fullscreen: function(v) {
      this.isFullscreen = v;
    },
    sizeStyle: function() {
      this.updateRenderAreaSize();
    },
    captionHeight: function() {
      this.updateRenderAreaSize();
    },
  },
  methods: {
    toggleFullscreen: function() {
      if (this.updating) return;
      this.isFullscreen = !this.isFullscreen;
    },
    updateRenderAreaSize: function() {
      if (this.updating) return;
      this.updating = true;
      // 設定変更後、レンダリングの完了を待つ
      this.$nextTick(() => {
        this.updating = false;
        this.$emit('resized', { isFullscreen: this.isFullscreen });
      });
    },
  },
  mounted: function() {
    this.mounted = true;
  },
};
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
  position: absolute;
  background-color: #FFF;
  width: 100%;
  height: 100%;
}

.fullscreen .card-container {
  position: fixed;
  top: 5vh;
  left: 5vw;
  right: 5vw;
  bottom: 5vh;
  width: auto;
  height: auto;
  z-index: 100;
}

.inner-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.self-margined {
  left: 2px;
  right: 2px;
  top: 2px;
  bottom: 2px;
  width: auto;
  height: auto;
}

.self-margined .inner-container {
  margin: -2px;
}

.fullscreen .self-margined .inner-container {
  margin: 0;
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
  z-index: 2;
}

.container-header.has-caption {
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
  top: 8px;
  color: rgba(0,0,0,.16);
}

.icon-box i {
  padding: 2px;
}

.icon-box i:hover {
  color: rgba(0,0,0,1);
}

.hide-legend .dc-legend {
  display: none;
}

</style>