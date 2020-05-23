const { terser } = require('rollup-plugin-terser')
const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const { builtinModules } = require('module')
const copy = require('rollup-plugin-copy')

const plugins = [resolve(), commonjs()]
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    terser({
      output: {
        comments: false
      }
    })
  )
}

module.exports = function (moduleName) {
  return {
    input: `src/entry/${moduleName}/index.js`,
    output: {
      file: `dist/${moduleName}/index.js`,
      format: 'commonjs'
    },
    plugins: [
      ...plugins,
      copy({
        targets: [
          {
            src: `src/entry/${moduleName}/package.json`,
            dest: `dist/${moduleName}`
          },
          {
            src: `src/entry/${moduleName}/README.md`,
            dest: `dist/${moduleName}`
          }
        ]
      })],
    external: [
      ...builtinModules
    ]
  }
}
