import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

import config from './rollup.config'

export default Object.assign({}, config, {
  targets: [
    { dest: 'dist/sav-schema.js', format: 'iife', moduleName: 'SavSchema' }
  ],
  plugins: [
    babel({
      babelrc: false,
      externalHelpers: false,
      exclude: 'node_modules/**',
      'plugins': [
        ['transform-object-rest-spread', { 'useBuiltIns': true }]
      ]
    }),
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs()
  ]
})
