<template>
  <div class="download-csv-button">
    <a class="btn btn-outline-primary" @click="downloadCSV()">
      <i class="fa fa-cloud-download" aria-hidden="true">
        {{buttonText}}
      </i>
    </a>
  </div>
</template>

<script lang="js">
import Store from '../store';

export default {
  props: {
    buttonText: {
      type: String,
      default: 'CSV ダウンロード'
    },
    fileName: {
      type: String,
      default: 'data',
    },
    dataset: {
      type: String,
      default: 'default',
    },
    dimensionName: {
      type: String,
    },
    labels: {
      type: Object,
    },
    encoding: {
      type: String,
      default: null // utf-8, CP932, ...
    },
    columns: {
      type: String,
      default: null
    }
  },
  methods: {
    downloadCSV: function() {
      const options = {
        dataset: this.dataset,
        labels: this.labels,
        encoding: this.encoding,
        columns: this.columns ? this.columns.split(',') : []
      };
      Store.downloadCSV(this.fileName, this.dimensionName, options);
    },
  },
};
</script>

<style scoped>
.download-csv-button .fa.fa-cloud-download {
  vertical-align: inherit;
  padding-right: 4px;
}
.download-csv-button a:not([href]):not([tabindex]) {
  color: #FFF;
  cursor: pointer;
}
.download-csv-button .btn {
  padding: 0.75rem 2rem;
  font-size: 1.25rem;
  border-radius: 0.2rem;
  box-shadow: 0 1px 2px rgba(0,0,0,.25);
}
.download-csv-button .btn.btn-outline-primary {
  border-color: #2AAB9F;
  background: #2AAB9F;
}
.download-csv-button .btn.btn-outline-primary:hover {
  color: #2AAB9F;
  border-color: #2AAB9F;
  background-color: #fff;
  opacity: .8;
}
</style>