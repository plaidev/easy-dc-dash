<template>
  <div class="outer-container" :style="{ width: width+'px', height: height+'px' }">
    <div class="inner-container">
      <div class="card-container" :style="{ width: width+'px', height: height+'px' }">
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
  padding: 2px;
}

.inner-container {
  background-color: white;
  width: 100%;
  height: 100%;
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



/* h0系列 */
.fb-lv-h0 {
  display: flex;
  flex-direction: row;
  width: 987px;
  height: 610px;
}

.fb-lv-h0 .fb-lv,
.fb-lv-v1 {
  display: flex;
  flex-direction: column;
  width: 377px;
  height: 610px;
}

.fb-lv-h0 .fb-lv .fb-lv,
.fb-lv-v1 .fb-lv,
.fb-lv-h2 {
  display: flex;
  flex-direction: row;
  width: 377px;
  height: 233px;
}

.fb-lv-h0 .fb-lv .fb-lv .fb-lv,
.fb-lv-v1 .fb-lv .fb-lv,
.fb-lv-h2 .fb-lv,
.fb-lv-v3 {
  display: flex;
  flex-direction: column;
  width: 144px;
  height: 233px;
}

.fb-lv-h0 .fb-lv .fb-lv .fb-lv .fb-lv,
.fb-lv-v1 .fb-lv .fb-lv .fb-lv,
.fb-lv-h2 .fb-lv .fb-lv,
.fb-lv-v3 .fb-lv,
.fb-lv-h4 {
  display: flex;
  flex-direction: row;
  width: 144px;
  height: 88.9px;
}

/* h1系列 */
.fb-lv-h0 .fb-sq .fb-lv,
.fb-lv-h1 {
  display: flex;
  flex-direction: row;
  width: 610px;
  height: 377px;
}

.fb-lv-h1 .fb-lv,
.fb-lv-v2 {
  display: flex;
  flex-direction: column;
  width: 233px;
  height: 377px;
}

.fb-lv-h1 .fb-lv .fb-lv,
.fb-lv-v2 .fb-lv,
.fb-lv-h3 {
  display: flex;
  flex-direction: row;
  width: 233px;
  height: 144px;
}

.fb-lv-h1 .fb-lv .fb-lv .fb-lv,
.fb-lv-v2 .fb-lv .fb-lv,
.fb-lv-h3 .fb-lv,
.fb-lv-v4 {
  display: flex;
  flex-direction: column;
  width: 88.9px;
  height: 144px;
}


/* sq系、.fb-sq > .fb-lvは考慮していない */
.fb-lv-h0 .fb-sq {
  width: 610px;
  height: 610px;
}

.fb-lv-h0 .fb-lv .fb-sq,
.fb-lv-v1 .fb-sq,
.fb-lv-h1 .fb-sq {
  width: 377px;
  height: 377px;
}

.fb-lv-h0 .fb-lv .fb-lv .fb-sq,
.fb-lv-v1 .fb-lv .fb-sq,
.fb-lv-h2 .fb-sq,
.fb-lv-h1 .fb-lv .fb-sq,
.fb-lv-v2 .fb-sq {
  width: 233px;
  height: 233px;
}

.fb-lv-h0 .fb-lv .fb-lv .fb-lv .fb-sq,
.fb-lv-v1 .fb-lv .fb-lv .fb-sq,
.fb-lv-h2 .fb-lv .fb-sq,
.fb-lv-v3 .fb-sq,
.fb-lv-h1 .fb-lv .fb-lv .fb-sq,
.fb-lv-v2 .fb-lv .fb-sq,
.fb-lv-h3 .fb-sq {
  width: 144px;
  height: 144px;
}


</style>