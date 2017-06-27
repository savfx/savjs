import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const pack = require('./package.json')
const YEAR = new Date().getFullYear()

export default {
  entry: 'src/index.js',
  dest: 'dist/sav.umd.js',
  format: 'umd',
  moduleName: 'savjs',
  plugins: [
    buble(),
    resolve({
      main: true
    }),
    commonjs()
  ],
  banner   () {
    return `/*!
 * ${pack.name} v${pack.version}
 * (c) ${YEAR} ${pack.author.name} ${pack.author.email}
 * Release under the ${pack.license} License.
 */`
  },
  // Cleaner console
  onwarn (msg) {
    if (msg && msg.startsWith('Treating')) {
      return
    }
  }
}
