import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/sav-util.cjs.js', format: 'cjs' },
    { file: 'dist/sav-util.es.js', format: 'es' }
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
