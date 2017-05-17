<template>
  <div class="download-csv-button">
    <a class="btn btn-outline-primary btn-lg" @click="downloadCSV('data')">csv download</a>
  </div>
</template>

<script lang="js">
import Store from '../store'

export default {
  methods: {
    downloadCSV: function(data) {
      return EasyDC.Store.downloadCSV(data)
    }
  }
}

</script>

<style scoped>
.download-csv-button a:not([href]):not([tabindex]) {
  color: #2AAB9F;
  cursor: pointer;
  font-weight: bold;
}
.download-csv-button .btn.btn-outline-primary {
  border-color: #2AAB9F;
}
.download-csv-button .btn.btn-outline-primary:hover {
  color: #2AAB9F;
  border-color: #2AAB9F;
  background-color: #fff;
  opacity: .8;
}
</style>