require('babel-register')({
  "plugins": [
    "transform-decorators-legacy",
    'transform-async-to-generator',
    "transform-es2015-modules-commonjs"
  ]
})

require('./src')
