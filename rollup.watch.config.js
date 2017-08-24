// rollup.config.js
import nodeResolve  from 'rollup-plugin-node-resolve'
import commonjs     from 'rollup-plugin-commonjs'
import babel        from 'rollup-plugin-babel'
import vue          from 'rollup-plugin-vue'
import replace      from 'rollup-plugin-replace'
//import sourcemaps   from 'rollup-plugin-sourcemaps'
import scss         from 'rollup-plugin-scss'
import css          from 'rollup-plugin-css-only'

export default {

  // iifeでは必須
  name: 'EasyDC',

  // entry
  input: 'index.js',

  sourcemap: false,

  // output
  output: [
    { file: 'dist/bundle.browser.js', format: 'iife' } // 直接実行可能な形式
  ],

  plugins: [
    // vueがprocessを求める時があるので無理やり設定
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.VUE_ENV': JSON.stringify('browser')
    }),

    // npmモジュールを`node_modules`から読み込む
    nodeResolve({ jsnext: true }),

    // CommonJSモジュールをES6に変換
    commonjs(),

    // 一応入れてみた。子のファイルのsourcemapurlを追跡する？
    //sourcemaps(),

    // .vueのrequire
    vue({
      css: true // dynamically inject
    }),

    // less
    scss(),

    css({
      output: 'dist/bundle.css'
    }),

    // ES5に変換。.babelrcは別途用意済み
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],

  // d3 v3系が動かないので。
  // http://stackoverflow.com/questions/35560305/d3-js-uncaught-typeerror-cannot-read-property-document-of-undefined
  strict: false,

}
