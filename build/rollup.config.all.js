const { terser } = require('rollup-plugin-terser')

const plugins = []
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    terser({
      output: {
        comments: false
      }
    })
  )
}
module.exports = [{
  input: 'src/entry/uni-account.js',
  output: {
    file: 'dist/uni-account/index.js',
    format: 'commonjs'
  },
  plugins
}, {
  input: 'src/entry/uni-pay.js',
  output: {
    file: 'dist/uni-pay/index.js',
    format: 'commonjs'
  },
  plugins
}]
