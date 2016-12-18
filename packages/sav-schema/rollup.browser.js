import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

import config from './rollup.config'

export default Object.assign({}, config, {
  targets: [
    { dest: 'dist/sav-schema.js', format: 'iife', moduleName: 'SavSchema' }
  ],
  plugins: [
    buble(),
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs()
  ]
})
