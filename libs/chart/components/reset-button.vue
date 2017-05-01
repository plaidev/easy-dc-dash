<template>
  <div class="reset-button">
    <a class="reset btn btn-secondary" style="display: none;" @click="reset">reset</a>
    <span class='reset' style="display: none;">
      Selected: <span class='filter badge'></span>
    </span>
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
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  padding-bottom: 5px;
}
.reset-button.reset {
  font-weight: bold;
}
a.reset.btn {
  color: #fff !important;
  background-color: #969E9C;
  font-size: 10px;
}
span.reset {
  padding-left: 5px;
  font-size: 12px;
}
span.reset .badge {
  background-color: #2FAB9F;
  font-size: 12px;
  font-weight: 200;
  vertical-align: 8%;
}
</style>