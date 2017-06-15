<template>
  <div class="reset-all-button">
    <a class="btn btn-primary btn-lg" @click="resetAll">Reset All</a>
  </div>
</template>

<script lang="js">
import dc from 'dc'

export default {
  methods: {
    resetAll: function() {
      dc.filterAll();
      dc.renderAll();
    }
  }
}
</script>

<style scoped>
  /* bootstrap を参照しているのでscopedを使う */
  .reset-all-button a {
    cursor: pointer;
    font-weight: bold;
  }
  .reset-all-button a:not([href]):not([tabindex]) {
    color: #fff;
  }
  .reset-all-button a:not([href]):not([tabindex]):hover {
    color: #fff;
  }
  .reset-all-button .btn-primary {
    border-color: #2AAB9F;
    background-color: #2AAB9F;
  }
  .reset-all-button .btn-primary:hover {
    opacity: .6;
    color: #fff;
    border-color: #2AAB9F;
    background-color: #2AAB9F;
  }
</style>