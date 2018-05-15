const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')
const lernaVersion = require('../../../lerna.json').version

let packageFile = require('../package.json')
const packageJSON = strip(JSON.parse(JSON.stringify(packageFile)))
function strip (pkg) {
  ['scripts', 'devDependencies', 'dependencies', 'bin',
  'standard', 'nyc', 'ava', 'babel'].forEach(it => delete pkg[it])
  return JSON.stringify(pkg)
}

function writeFile (file, data, opts) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, opts || {}, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

function spawn (bin, args, opts) {
  return new Promise((resolve, reject) => {
    try {
      let distOpts = Object.assign({ stdio: 'inherit' }, opts)
      if (!distOpts.stdio) {
        delete distOpts.stdio
      }
      let ps = childProcess.spawn(bin, args, distOpts)
      let obuf = []
      let ebuf = []
      if (!distOpts.stdio) {
        ps.stdout.on('data', (buf) => {
          obuf = obuf.concat(buf)
        })
        ps.stderr.on('data', (buf) => {
          ebuf = ebuf.concat(buf)
        })
      }
      ps.on('close', (code) => {
        if (code) {
          return reject(code)
        }
        resolve({stdout: obuf.join(), stderr: ebuf.join()})
      })
    } catch (err) {
      reject(err)
    }
  })
}

function copyFile (src, dest, flags) {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, flags || 0, (err) => {
      if (err) {
        return reject(err)
      }
      resolve(dest)
    })
  })
}

const pkg = path.resolve(`./node_modules/.bin/pkg${process.platform === 'win32' ? '.cmd' : ''}`)
let platforms = {
  win: 'win32',
  mac: 'darwin',
}

let nodeVersion = process.env.PKG_NODE_VERSION || 8

let targets = {
  win: {
    platform: 'win32',
    cacheFile: 'sav-contract-win.exe',
    distFile: 'contract.exe',
    target: `node${nodeVersion}-win-x64`
  },
  mac: {
    platform: 'darwin',
    cacheFile: 'sav-contract-macos',
    distFile: 'contract',
    target: `node${nodeVersion}-macos-x64`
  },
  linux: {
    platform: 'linux',
    cacheFile: 'sav-contract-linux',
    distFile: 'contract',
    target: `node${nodeVersion}-linux-x64`
  }
}

function buildTmp () {
  let cache = path.resolve('./cache')
  return spawn(pkg, ['-t', 
    Object.keys(targets).map(it => targets[it].target).join(','),
    '--out-path', cache, 'script/tmp.js'])
    // 串行
    // return Object.keys(targets).reduce((ret, it) => {
    //   return ret.then(() => spawn(pkg, [
    //     '-t', targets[it].target,
    //     '--output', path.join(__dirname, '../', 'platform', it, targets[it].distFile),
    //     '--config', 'pkg.json', file], {
    //       cwd: path.join(__dirname, '../')
    //     }))
    // }, Promise.resolve())
}

function buildPkgs () {
  // 已经串行下载过了, 这里可以并行了
  let cache = path.resolve('./cache')
  let dest = path.resolve('./platform')
  let pkgType = process.env.PKG_ONLY
  let target = Object.keys(targets).map(it => targets[it].target).join(',')
  if (pkgType) {
    target = targets[pkgType].target
  }
  return new Promise((resolve, reject) => {
    let args = [
      '-t', target,
      '--out-path', cache,
      '--config', 'pkg.json', 'dist/contract.js']
    let ps = childProcess.spawn(pkg, args , { stdio: 'inherit' })
    ps.on('close', (code) => {
      if (code) {
        return reject(new Error(`pkg error: ${code}`))
      }
      resolve()
    })
  }).then(() => {
    return Promise.all(Object.keys(targets)
      .filter(it => pkgType ? (it === pkgType) : true)
      .map((it) => {
        let cacheFile = targets[it].cacheFile
        if (pkgType) {
          cacheFile = cacheFile
            .replace('-macos', '')
            .replace('-linux', '')
            .replace('-win', '')
        }
        return copyFile(path.join(cache, cacheFile),
            path.join(dest, it, targets[it].distFile))
      }))
  })
}

function createPlatformPackageJsons () {
  return Promise.all(Object.keys(targets).map(platform => {
    let dist = path.join(__dirname, '../', 'platform', platform)
    var pkgfile = JSON.parse(packageJSON)
    pkgfile.name = pkgfile.name + '-' + platform
    pkgfile.bin = {
      contract: 'bin/contract'
    }
    pkgfile.version = lernaVersion
    return Promise.all([
      writeFile(path.join(dist, 'package.json'), JSON.stringify(pkgfile, null, 2)),
      copyFile('README.md', path.join(dist, 'README.md'))
    ])
  }))
}

async function updateTemplateVersion() {
  let dist = path.join(__dirname, '../', 'templates', 'front-template', 'package.json')
  var pkgfile = require(dist)
  pkgfile.devDependencies.savjs = lernaVersion
  return writeFile(dist, JSON.stringify(pkgfile, null, 2))
}

const actions = {
  prepare,
  build,
}
const step = process.argv[2]
const startTime = new Date()

actions[step]()
.then(() => {
  console.log('!-------------DONE', step, (new Date() - startTime) / 1000)
}, (err) => {
  console.error('@-------------ERROR', step)
  console.error(err)
  console.error('!-------------ERROR')
  process.exit(-1)
  throw err
})

function prepare() { // 预先构建下节省时间
  return Promise.all([
    buildTmp(),
    updateTemplateVersion(),
    createPlatformPackageJsons(),
  ])
}

function build() {
  return buildPkgs()
}
