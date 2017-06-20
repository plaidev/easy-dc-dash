<template>
  <div class="reset-button">
    <span class='reset' style="display: none;">
      <span class='filter badge'></span>
    </span>
    <a class="reset" style="display: none;" @click="reset">
      <i class="fa fa-ban">&nbsp;</i>
    </a>
  </div>
</template>

<script lang="js">

export default {
  methods: {
    reset: function() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.reset-button {
  position: absolute;
  right: 0;
  top: 0;
  padding-right: 5px;
  padding-bottom: 5px;
}
.reset {
  vertical-align: middle;
  margin-left: 2px;
  cursor: pointer;
}
.reset i {
  vertical-align: middle;
}
.filter {
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: nowrap;
}
.badge {
  max-width: 200px;
  background-color: #2FAB9F;
  font-size: 12px;
  font-weight: 200;
  vertical-align: 8%;
  white-space: normal;
  word-wrap: break-all;
}
</style>