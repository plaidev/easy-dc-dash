<template>
  <a class="btn btn-primary btn-lg" @click="resetAll">Reset All</a>
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
  a.btn {
    cursor: pointer;
  }
  a.btn.btn-primary {
    font-weight: bold;
    background-color: #2AAB9F !important;
    border-color: #2AAB9F !important;
    color: #fff !important;
  }
  a.btn.btn-danger {
    color: #fff !important;
    background-color: #AB312A !important;
    font-weight: bold;
  }
  a.btn.btn-danger:hover {
    opacity: .6;
  }
</style>