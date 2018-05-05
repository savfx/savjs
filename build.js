const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')
const step = process.argv[2]
const {version} = require('./package.json')

const actions = {
  prepare,
  build,
  publish,
  deploy,
}

const packageCwd = path.resolve(__dirname, './packages')

const npm = 'npm' + (process.platform === 'win32' ? '.cmd' : '')
const lerna = 'lerna' + (process.platform === 'win32' ? '.cmd' : '')
const phpenv = 'phpenv' + (process.platform === 'win32' ? '.bat' : '')
const composer = 'composer' + (process.platform === 'win32' ? '.bat' : '')
const go = 'go' + (process.platform === 'win32' ? '.exe' : '')
const curl = 'curl' + (process.platform === 'win32' ? '.exe' : '')
const php = 'php' + (process.platform === 'win32' ? '.exe' : '')

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

function prepare() {
  return Promise.all([
    // process.platform !== 'win32' && spawn(phpenv, 'local 7.0'),
    // process.platform !== 'win32' && spawn(npm, 'i stdx-linux --no-save', {cwd: packageCwd}),
    spawn(lerna, 'bootstrap'),
    // spawn(npm, 'i', {cwd: packageCwd}),
    // spawn(composer, 'install --no-interaction --prefer-dist'),
    // spawn(go, 'get -v -t'),
  ])
}

function build() {

  let allPackages = (async () => {
    let dirs = await readDir(packageCwd)
    let maps = {}
    let packages = dirs.map(dir => {
      let cwd = path.join(packageCwd, dir)
      let package = require(cwd + '/package.json')
      let {name, devDependencies, dependencies} = package
      let deps = Object.keys(devDependencies || []).concat(Object.keys(dependencies || [])).
        filter(dir => dirs.indexOf(dir) !== -1)
      let it = {
        dir,
        name,
        deps,
        cwd
      }
      maps[name] = it
      return it
    })
    return {maps, packages}
  })()

  async function buildAndTest() {
    let {maps, packages} = await allPackages
    let promiseMap = new Proxy({}, {
      get: function(target, name, receiver){
        if (target[name]) {
          return target[name]
        }
        return target[name] = spawn(npm, 'run build', {
          cwd: maps[name].cwd
        })
      }  
    })
    return Promise.all(packages.map(it => {
      return Promise.all(it.deps.map(child => promiseMap[child]))
        .then(async () => {
          await promiseMap[it.name]
          await spawn(npm, 'test', {cwd: maps[it.name].cwd})
        })
    }))
  }

  async function lint() {
    let {maps, packages} = await allPackages
    return Promise.all(packages.map(it => 
      spawn(npm, 'run lint', {cwd: maps[it.name].cwd})))
  }

  return Promise.all([
    // spawn(composer, 'test'),
    lint(),
    buildAndTest(),
    // spawn(lerna, 'run lint'),
    // spawn(lerna, 'run build').then(() => spawn(lerna, 'run test')),
    // spawn(npm, 'run lint', {cwd: packageCwd}),
    // spawn(npm, 'test', {cwd: packageCwd}),
    // spawn(npm, 'run build', {cwd: packageCwd}),
    
    // copy(path.resolve(__dirname, './README.md'), path.join(packageCwd, 'README.md')),
    // spawn(go, 'test -v'),
  ])
}

function deploy() {
  return build().then(publish)
}

function publish() {
  return Promise.all([
    //  --skip-npm
    spawn(lerna, `publish --skip-git --repo-version ${version} --yes`).catch(err => {
      console.warn('!*************WARN', 'lerna publish')
      console.warn(err)
    }),
    // spawn(npm, 'publish node --force').catch(err => {
    //   console.warn('!*************WARN', 'npm publish')
    //   console.warn(err)
    // }),
    // Promise.all([
    //   spawn(curl, `-X POST -d @codeclimate.json -H 'Content-Type:application/json' https://codeclimate.com/test_reports --verbose`),
    //   spawn(curl, `-F 'json_file=@coveralls.json' https://coveralls.io/api/v1/jobs --verbose`),
    //   spawn(curl, `-L -O https://scrutinizer-ci.com/ocular.phar`).then(() => {
    //     return spawn(php, `ocular.phar code-coverage:upload --format=php-clover './clover.xml'`)
    //   }),
    // ]).catch(err => {
    //   console.warn('!*************WARN', 'php upload')
    //   console.warn(err)
    // })
  ])
}

function spawn (bin, args, opts) {
  return new Promise((resolve, reject) => {
    try {
      if (args === undefined) {
        if (-1 !== bin.indexOf(' ')) {
          args = bin.split(' ')
          bin = args.shift()
        } else {
          args = []
        }
      } else if (!Array.isArray(args) && (typeof args === 'object')) {
        opts = args
      } else if (typeof args === 'string') {
        args = args.split(' ')
      }
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
          return reject(`${bin} ${args.join(' ')} : ${code}`)
        }
        resolve({stdout: obuf.join(), stderr: ebuf.join()})
      })
    } catch (err) {
      return reject(`${bin} ${args.join(' ')} :\n ${err.stack}`)
    }
  })
}

function readDir (dir, opts) {
  return new Promise((resolve, reject) => {
    opts || (opts = {})
    fs.readdir(dir, opts, (err, dirs) => {
      if (err) {
        return reject(err)
      }
      if (opts.exclude) {
        let exclude = opts.exclude
        if (!Array.isArray(opts.exclude)) {
          exclude = exclude.split('|')
        }
        dirs = dirs.filter(it => !exclude.some(t => it.indexOf(t) !== -1))
      }
      let ret
      if (opts.join || opts.fullPath) {
        ret = dirs.map(it => opts.fullPath ? path.resolve(dir, it) : path.join(dir, it))
        if (opts.map) {
          resolve(ret.reduce((dist, path, id) => {
            dist[dirs[id]] = path
            return dist
          }, {}))
        }
      }
      resolve(dirs)
    })
  })
}

function copy (src, dest, flags) {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, flags || 0, (err) => {
      if (err) {
        return reject(err)
      }
      resolve(dest)
    })
  })
}
