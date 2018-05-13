/**
 * 加载interface目录
 */

import path from 'path'
import {transform} from 'babel-standalone'
import Module from 'module'
import {isObject, isFunction} from 'sav-util'
import * as decorators from '../utils/decorator.js'
import {inputFile, readDir, pathExists} from '../utils/util.js'
const req = require

export async function loadInterface (dir) {
  let res = {}
  let projectFile = path.join(dir, 'project.js')
  if (await pathExists(projectFile)) {
    res.project = req(projectFile)
  }

  let modalsDir = path.join(dir, 'modals')
  if (await pathExists(modalsDir)) {
    res.modals = await loadModule('modals', modalsDir)
  }

  let schemasDir = path.join(dir, 'schemas')
  if (await pathExists(schemasDir)) {
    let schemaData = await loadModule('schemas', schemasDir, {merge: true})
    res.schemas = Object.keys(schemaData).map(name => {
      let item = schemaData[name]
      item.name = name
      return item
    })
  }

  let mocksDir = path.join(dir, 'mocks')
  if (await pathExists(mocksDir)) {
    let mockData = await loadModule('mocks', mocksDir)
    let mocks = []
    for (let modalName in mockData) {
      let mockGroup = mockData[modalName]
      Object.keys(mockGroup).forEach(actionName => {
        let item = mockGroup[actionName]
        if (isObject(item.req)) {
          item.req = [item.req]
        }
        if (isObject(item.res)) {
          item.res = [item.res]
        }
        if (item.req) {
          item.req.forEach(it => {
            mocks.push(Object.assign(it, {
              modalName,
              req: true,
              actionName
            }))
          })
        }
        if (item.res) {
          item.res.forEach(it => {
            mocks.push(Object.assign(it, {
              modalName,
              res: true,
              actionName
            }))
          })
        }
      })
    }
    res.mocks = mocks
  }
  return res
}

let excludeFiles = ['index.js']

async function loadModule (name, dir, opts = {}) {
  let {merge} = opts
  let ret = await readDir(dir).then((dirs) => {
    let files = dirs.filter((it) => excludeFiles.indexOf(it) === -1 && path.extname(it) === '.js')
    return Promise.all(files.map((fileName) => {
      return decoratorFileAsync(path.resolve(dir, fileName)).then((data) => {
        if (name === 'schemas') {
          data = convertFunctionToName(data)
        }
        return [path.basename(fileName, '.js'), data]
      })
    })).then((args) => args.reduce((ret, [name, data]) => {
      if (merge) {
        return Object.assign(ret, data)
      }
      ret[name] = data
      return ret
    }, {}))
  })
  return ret
}

function interopDefault (ex) {
  return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex
}

function decoratorFileAsync (file) {
  return inputFile(file).then(data => {
    let code = transform(data, {
      plugins: [
        'transform-decorators-legacy',
        ['transform-object-rest-spread', { 'useBuiltIns': true }],
        'transform-es2015-modules-commonjs'
      ]}).code
    return interopDefault(requireFromString(code, file))
  })
}

function requireFromString (code, filename, opts) {
  if (typeof filename === 'object') {
    opts = filename
    filename = undefined
  }
  opts = opts || {}
  filename = filename || ''
  opts.appendPaths = opts.appendPaths || []
  opts.prependPaths = opts.prependPaths || []
  if (typeof code !== 'string') {
    throw new Error('code must be a string, not ' + typeof code)
  }
  let paths = Module._nodeModulePaths(path.dirname(filename))
  let m = new Module(filename, module)
  m.filename = filename
  m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths)
  m._compile(code, filename)
  return m.exports
}

let {_load} = Module
let memoryModules = {}

Module._load = function (request, parent, isMain) {
  if (memoryModules[request]) {
    return memoryModules[request].exports
  }
  return _load(request, parent, isMain)
}

function exportModule (name, data) {
  memoryModules[name] = {
    exports: data
  }
}

const defaultFunction = [String, Number, Boolean, Array]

function convertFunctionToName (obj) {
  if (isObject(obj)) {
    for (let name in obj) {
      let value = obj[name]
      if (isFunction(value) && (defaultFunction.indexOf(value) !== -1)) {
        obj[name] = value.name
      } else if (isObject(value)) {
        convertFunctionToName(value)
      }
    }
  }
  return obj
}

exportModule('sav', decorators)
