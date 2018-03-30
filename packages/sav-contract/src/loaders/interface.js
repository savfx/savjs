/**
 * 加载interface目录
 */

import path from 'path'
import {transform} from 'babel-standalone'
import Module from 'module'
import {ucfirst, isObject, isFunction} from 'sav-util'
import * as decorators from '../utils/decorator.js'
import {inputFile, readDir} from '../utils/util.js'
import {Schema} from 'sav-schema'

export function loadInterface (dir) {
  return readDir(dir).then((dirs) => 
    Promise.all(dirs.filter((it) => acceptModules.indexOf(it) !== -1)
      .map((name) => {
    return loadModule(name, path.resolve(dir, name))
  })).then((args) => args.reduce((a, b) => {
    a[b[0]] = b[1]
    return a
  }, {}))).then(all => {
    let schema = new Schema()
    if (all.schemas) {
      loadSchemas(all.schemas, schema)
    }
    if (all.modals) {
      normalizeModals(all.modals, schema)
    }
    all.schema = schema
    return all
  })
}

let acceptModules = ['modals', 'mocks', 'schemas']
let excludeFiles = ['index.js']

async function loadModule (name, dir) {
  let ret = await readDir(dir).then((dirs) => {
    let files = dirs.filter((it) => excludeFiles.indexOf(it) === -1 && path.extname(it) === '.js')
    return Promise.all(files.map((fileName) => {
      return decoratorFileAsync(path.resolve(dir, fileName)).then((data) => {
        if (name === 'schemas') {
          data = convertFunctionToName(data)
        }
        return [path.basename(fileName, '.js'), data]
      })
    })).then((args) => args.reduce((a, b) => {
      a[b[0]] = b[1]
      return a
    }, {}))
  })
  return [name, ret]
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

function loadSchemas (files, schema) {
  for (let name in files) {
    let file = files[name]
    Object.keys(file).map(it => {
      let item = file[it]
      item.name = it
      schema.declare(item)
    })
  }
}

function normalizeModals(modals, schema) {
  for (let modalName in modals) {
    let modal = modals[modalName]
    if (modal.routes) {
      modal.routes = Object.keys(modal.routes).map(it => {
        let route = modal.routes[it]
        route.name = it
        processRouteSchema(modalName, route, 'request', schema)
        processRouteSchema(modalName, route, 'response', schema)
        return route
      })
    }
  }
}

const shortTypeMap = {
  request: 'Req',
  response: 'Res',
}

function processRouteSchema (modalName, route, type, schema) {
  let name = shortTypeMap[type] + modalName + ucfirst(route.name)
  if (route[type]) {
    let data = route[type]
    if (isObject(data)) {
      if (!data.name) {
        data.name = name
        schema.declare(data)
        route[type] = name
      }
    } else if (!schema[data]) {
      throw new Error(`schema ${data} no found with ${type} of ${modalName}.${route.name}`)
    }
  } else {
    if (schema[name]) {
      route[type] = name
    }
  }
}
