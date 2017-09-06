let {executeRollup, errorExit} = require('rollup-standalone')

const pack = require('./package.json')
const banner = `/*!
 * ${pack.name} v${pack.version}
 * (c) ${new Date().getFullYear()} ${pack.author.name} ${pack.author.email}
 * Release under the ${pack.license} License.
 */
`

Promise.all([
  executeRollup({
    entry: 'src/index.js',
    dest: 'dist/sav-schema.cjs.js',
    external: [
      'sav-util'
    ],
    format: 'cjs'
  }),
  executeRollup({
    entry: 'src/index-umd.js',
    dest: 'dist/sav-schema.min.js',
    format: 'umd',
    exports: 'named',
    moduleName: 'schema',
    babelOptions: {
      include: [
        'node_modules/**'
      ]
    },
    resolveOptions: {
      jsnext: true
    },
    uglifyOptions: true
  }, (bundle, res) => {
    res.code = banner + res.code
  })
]).catch(errorExit('build fail'))
