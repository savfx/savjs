import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  targets: [
    { dest: 'dist/sav-router.cjs.js', format: 'cjs' },
    { dest: 'dist/sav-router.es.js', format: 'es' }
  ],
  plugins: [
    babel({
      babelrc: false,
      externalHelpers: false,
      exclude: 'node_modules/**',
      'plugins': [
        ['transform-object-rest-spread', { 'useBuiltIns': true }]
      ]
    })
  ],
  onwarn (err) {
    if (err) {
      if (err.code !== 'UNRESOLVED_IMPORT') {
        console.log(err.code, err.message)
      }
    }
  }
}
