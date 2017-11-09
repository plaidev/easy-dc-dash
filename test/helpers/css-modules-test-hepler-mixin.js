export default {
  install (Vue, options) {
    Vue.mixin({
      created () {
        if (!this.$options) this.$options = {}
        this.$options.cssModules = {}
      }
    })
  }
}
