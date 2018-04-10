import { bindEvent, isString, isArray, testAssign } from 'sav-util'
import {
  PAYLOAD_START,
  PAYLOAD_PROGRESS,
  PAYLOAD_RESOLVE,
  PAYLOAD_REJECT
} from './events.js'

const defaultProject = 'default'

export class Sav {
  constructor (opts = {}) {
    this.opts = testAssign(opts, {
      flux: null,
      contract: null,
      cacheField: true,
      cacheEnum: true
    })
    bindEvent(this)
    this.contracts = {}
    this.caches = {}
    if (this.opts.contract) {
      this.setContract(this.opts.contract, defaultProject)
    }
  }
  /**
   * 添加新的Contract
   * @param {Contract} contract 合同
   * @param {String} name     别名
   */
  setContract (contract, name) {
    let isDefault = name === defaultProject
    contract.injectFlux(this.opts.flux, isDefault)
    if (name) {
      this.contracts[name] = contract
    }
    this.contracts[contract.projectName] = contract
  }
  /**
   * 获取Schema字段文本描述
   * @param  {String} path    字段路径
   * @param  {String} project 项目名称
   * @return {String}         字段文本
   * @example
   *   getFieldTitle('ResAccountLogin.username')
   */
  getFieldTitle (path, project = defaultProject) {
    let caches = this.caches
    if (this.opts.cacheField) {
      if (caches[path]) {
        return caches[path]
      }
    }
    let proj = this.contracts[project]
    let [structName, fieldName] = path.split('.')
    let ret
    try {
      let struct = proj.schema.getSchema(structName)
      let field = struct.fieldByName(fieldName)
      ret = field.opts.title || `${project}.${path}`
    } catch (err) {
      ret = project === defaultProject ? `${path}` : `${project}.${path}`
    } finally {
      if (this.opts.cacheField) {
        caches[path] = ret
      }
    }
    return ret
  }
  /**
   * 获取Schema枚举文本
   * @param  {String} path     字符串
   * @param  {String} enumKey  枚举项键
   * @param  {String} project  项目名称
   * @return {String}          枚举项文本
   * @example
   *   getEnumTitle('Sex.male')
   *   getEnumTitle('Sex', 'male')
   */
  getEnumTitle (path, enumKey, project = defaultProject) {
    if (!enumKey) {
      let arr = path.split('.')
      path = arr[0]
      enumKey = arr[1] || ''
    }
    let uri = `${project}.${path}.${enumKey}`
    let caches = this.caches
    if (this.opts.cacheEnum) {
      if (caches[uri]) {
        return caches[uri]
      }
    }
    let sav = this.contracts[project]
    let ret
    try {
      let schemaEnum = sav.schema.getSchema(path)
      ret = schemaEnum.getEnum('key', enumKey).title
    } catch (err) {
      ret = project === defaultProject ? `${path}.${enumKey}` : uri
      if (enumKey === '') {
        ret = ret.substr(0, ret.length -1)
      }
    } finally {
      if (this.opts.cacheEnum) {
        caches[uri] = ret
      }
    }
    return ret
  }
  /**
   * 获取枚举项列表
   * @param  {String} enumName 枚举名称
   * @param  {String|Array} excludes 枚举项key过滤
   * @param  {String} project  项目名称
   * @return {Array}           枚举列表
   * @example
   *   getEnumItems('Sex')
   *   getEnumItems('Sex', 'male,unknown')
   *   getEnumItems('Sex', ['male'])
   */
  getEnumItems (enumName, excludes, project = defaultProject) {
    let proj = this.contracts[project]
    let ret
    try {
      let schemaEnum = proj.schema.getSchema(enumName)
      ret = schemaEnum.opts.enums
      if (isString(excludes)) {
        excludes = excludes.split(',')
      }
      if (isArray(excludes)) {
        return ret.filter(it => excludes.indexOf(it.key) === -1)
      }
    } catch (err) {
      ret = []
    }
    return ret
  }
  /**
   * 预加载处理
   * @param  {Array} payloads 预加载
   * @param  {Object} route vue跳转路由
   * @return {Promise}
   */
  resolvePayloads (payloads, route) {
    let states = []
    return new Promise((resolve, reject) => {
      try {
        payloads = payloads.filter((payload) => {
          let projectName = payload.project || defaultProject
          let project = this.contracts[projectName]
          if (project) {
            if (project.resolvePayload(payload, route)) {
              if (payload.state) {
                states.push(payload.state)
              } else {
                return true
              }
            }
          } else {
            throw new Error('project no found: ', projectName)
          }
        })
      } catch (err) {
        return reject(err)
      }
      resolve({payloads, states})
    })
  }
  /**
   * 执行预加载
   * @param  {Array} payloads 预加载
   * @param  {Object} route    vue路由
   * @return {Promise}
   */
  invokePayloads (payloads, route) {
    return this.resolvePayloads(payloads, route)
      .then(({payloads, states}) => {
        if (payloads.length) {
          let status = {
            route,
            total: payloads.length,
            remains: payloads.length
          }
          this.emit(PAYLOAD_START, status)
          const progress = () => {
            status.remains--
            this.emit(PAYLOAD_PROGRESS, status)
          }
          return Promise.all(payloads.map(async (payload) => {
            const p = payload.contract.invokePayload(payload)
            p.then(progress, progress)
            return p
          })).then((args) => {
            this.emit(PAYLOAD_RESOLVE, status)
            args = states.concat(args)
            if (args.length) {
              args = Object.assign.apply({}, args)
              return this.opts.flux.updateState(args)
            }
          }).catch((err) => {
            status.error = err
            this.emit(PAYLOAD_REJECT, status)
            throw err
          })
        } else if (states.length) {
          return this.opts.flux.updateState(Object.assign.apply({}, states))
        }
      })
  }
}
