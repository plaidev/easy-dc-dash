<template>
  <a class="btn btn-danger btn-lg" @click="resetAll">Reset All</a>
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
  a.btn.btn-danger {
    color: #fff !important;
    border-color: #AB312A;
    font-weight: bold;
  }
  a.btn.btn-danger:hover {
    opacity: .6;
  }
</style>