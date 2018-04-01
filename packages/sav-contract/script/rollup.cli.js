import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import json from 'rollup-plugin-json'
import re from 'rollup-plugin-re'
import fs from 'fs-extra'
const pkg = require('../package.json')

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/contract.js', format: 'cjs' }
  ],
  external: [
    'babel-standalone',
    'acorn',
    'path'
  ],
  plugins: [
    re({
      patterns: [
        {
          test: `require('spawn-sync')`,
          replace: 'null'
        }
      ]
    }),
    includePaths({
      paths: ['src']
    }),
    json({
      preferConst: false // Default: false
    }),
    babel({
      babelrc: false,
      externalHelpers: false,
      exclude: ['node_modules/**'],
      plugins: [
      ]
    }),
    resolve({
      main: true,
      module: false
    }),
    commonjs({
      include: [
        'node_modules/**',
        'src/**',
        process.env.ENTRYMODULE + '/**',
      ]
    }),
    {
      name: 'copy-files',
      ongenerate(bundle, res){
        res.code = res.code.replace('babel-standalone', './babel-standalone')
          .replace('\'acorn\'', '\'./acorn\'')
          .replace(/path__default/g, 'path')
          .replace(/path\$1__default/g, `require('path')`)
          .replace('$$VERSION$$', pkg.version)
        fs.copy(require.resolve('babel-standalone'), 'dist/babel-standalone.js', err => {
          if (err) return console.error(err)
          console.log('copy babel-standalone')
        })
        fs.copy(require.resolve('acorn'), 'dist/acorn.js', err => {
          if (err) return console.error(err)
          console.log('copy acorn')
        })
      }
    }
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
