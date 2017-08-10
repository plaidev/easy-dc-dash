<template>
  <div class="reset-button" @click="reset">
    <span class='reset' style="display: none;">
      <span class='filter badge'></span>
    </span>
    <a class="reset" style="display: none;">
      <i class="fa fa-ban">&nbsp;</i>
      <span>フィルター解除</span>
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
  right: 8px;
  top: 8px;
  color: rgba(0,0,0,.16);
  font-size: 12px;
  display: flex;
  display: -webkit-flex;
}
.reset-button:hover {
  color: rgba(0,0,0,1);
}
a.reset {
  cursor: pointer;
  border: 1px solid;
  padding: 2px 4px;
  border-radius: 2px;
  display: flex;
  display: -webkit-flex;
  -webkit-align-items: center;
          align-items: center;
}
a.reset span {
  font-size: 10px;
}
span.reset {
  visibility: hidden;
}
.filter {
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: nowrap;
}
.reset i:hover {
  color: black;
}
.badge {
  max-width: 200px;
  background-color: #2FAB9F;
  font-size: 12px;
  font-weight: 200;
  white-space: normal;
  word-wrap: break-all;
  vertical-align: middle;
}
</style>