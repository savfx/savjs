import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'

export default {
  input: 'client/index.js',
  output: [
    { file: 'dist/sav-contract.js', format: 'cjs'},
  ],
  external: [
    'sav-util',
    'sav-router',
    'sav-schema',
  ],
  plugins: [
    json({
      preferConst: false // Default: false
    }),
    resolve({
      "jsnext:main": false,
      module: false,
      main: true
    }),
    babel({
      babelrc: false,
      externalHelpers: false,
      // exclude: ['node_modules/**'],
      exclude: [],
      include: ['node_modules/**'],
      plugins: [
        'transform-decorators-legacy',
        ['transform-object-rest-spread', { 'useBuiltIns': true }]
      ]
    }),
    commonjs({})
  ],
  onwarn (err) {
    if (err) {
      if (err.code !== 'UNRESOLVED_IMPORT') {
        console.log(err.code, err.message)
        console.dir(err)
      }
    }
  }
}
