import babel from 'rollup-plugin-babel'
import vue from 'rollup-plugin-vue'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import re from 'rollup-plugin-re'
import json from 'rollup-plugin-json'
import uglify from 'rollup-plugin-uglify'
import fs from 'fs'
import path from 'path'

const IS_DEV = process.env.NODE_ENV !== 'production'

export default {
  input: 'views/client-entry.js',
  output: {
    format: 'umd',
    name: 'HelloWorld',
    file: `static/js/client-entry.js`,
    globals: {
      'vue': 'Vue',
      'vue-router': 'VueRouter',
    }
  },
  external: [
    'vue',
    'vue-router',
  ],
  plugins: createPlugins().concat(IS_DEV ? [] : uglify())
}

let min = IS_DEV ? '' : '.min'

function copyFile (src, dist) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, (err ,buf) => {
      fs.writeFile(dist, buf, (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  })
}

copyFile(require.resolve(`vue/dist/vue${min}.js`), 'static/js/vue.js')
copyFile(require.resolve(`vue-router/dist/vue-router${min}.js`), 'static/js/vue-router.js')

const resolves = ['vue']

function createPlugins () {
  return [
    re({
      defines: {
        IS_DEV
      }
    }),
    {
      name: 'stdx-resolve',
      resolveId (id, origin) {
        for (let i = 0; i < resolves.length; ++i) {
          if (id.startsWith(resolves[i])) {
            return require.resolve(id)
          }
        }
      }
    },
    json(),
    vue({
      css: true
    }),
    babel({
      babelrc: false
    }),
    resolve({
      browser: true,
      main: true
    }),
    commonjs({
      include: [
        'node_modules/**',
        'contract/**',
        process.env.ENTRYMODULE + '/**'
      ]
    })
  ]
}
