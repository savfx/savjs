import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import json from 'rollup-plugin-json'
import re from 'rollup-plugin-re'
import fse from 'fs-extra'
const pkg = require('../package.json')

export default {
  input: 'src/Contract.js',
  output: [
    { file: 'dist/sav-contract.cjs.js', format: 'cjs' },
    { file: 'dist/sav-contract.es.js', format: 'es' },
  ],
  external: [
    'sav-router',
    'sav-schema',
    'sav-util',
  ],
  plugins: [
    babel({
      babelrc: false,
      externalHelpers: false,
      exclude: ['node_modules/**'],
      plugins: [
      ]
    }),
    resolve({
      main: true
    }),
    commonjs({
      include: [
        'node_modules/**',
        'src/**',
        process.env.ENTRYMODULE + '/**',
      ]
    })
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
