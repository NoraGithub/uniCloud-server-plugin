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
module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'commonjs'
  },
  plugins
}
