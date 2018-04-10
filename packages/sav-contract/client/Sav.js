import { bindEvent, isString, isArray, testAssign } from 'sav-util'

const defaultProject = 'default'

export class Sav {
  constructor (opts = {}) {
    this.opts = testAssign(opts, {
      fallback: null, // 请求失败后处理回调
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
      enumKey = arr[1]
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
}
