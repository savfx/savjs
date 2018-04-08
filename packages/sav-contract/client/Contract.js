import {Router} from 'sav-router'
import {Schema} from 'sav-schema'
import {Request} from './Request.js'
import {Cache} from './Cache.js'
import {crc32, testAssign, bindEvent, prop, isArray, isObject, isFunction, pascalCase} from 'sav-util'

export class Contract {
  constructor (opts = {}) {
    this.opts = testAssign(opts, {
      mockState: false,
      mockFlow: false,
      strict: true
    })
    let router = this.router = new Router(this.opts)
    router.on('declareAction', (route) => {
      let name = route.name
      this.routes[name] = route
    })
    this.schema = new Schema(this.opts)
    this.routes = {}
    this.mocks = {}
    this.request = new Request(this.opts)
    this.cache = new Cache()
    bindEvent(this)
    if (this.opts.contract) {
      this.load(this.opts.contract)
    }
  }
  get projectName () {
    return this.project.name
  }
  /**
   * 加载contract
   * @param  {Object} data contract内容
   */
  load (data) {
    let {project, mocks} = data
    this.schema.load(data)
    this.router.load(data)
    if (mocks) {
      mocks.forEach(mock => {
        let modal = this.mocks[mock.modalName] || (this.mocks[mock.modalName] = {})
        let datas = modal[mock.actionName] || (modal[mock.actionName] = [])
        datas.push(mock)
      })
    }
    if (project) {
      this.project = project
    }
  }
  /**
   * 处理payload
   * @param  {Object} payload  预加载配置
   * payload: {
   *   name: 'HomeSession', // Action路径 或 Schema名称
   *   merge: true, // 是否合并 vueRoute的query和params
   *   params: {}, // 自定义params
   *   query: {}, // 自定义query (payload只支持GET方法)
   *
   *   // 处理
   *   route, // 添加sav-route
   *   contract, // 添加Contract
   *   state, // 添加state
   * }
   * @param  {Object} vueRoute 当前vue路由
   */
  resolvePayload (payload, vueRoute) {
    let savRoute = this.routes[payload.name]
    let schema = this.schema.getSchema(payload.name)
    if (savRoute) {
      if (payload.merge) {
        payload.params = Object.assign({}, vueRoute.params, payload.params)
        payload.query = Object.assign({}, vueRoute.query, payload.query)
      }
      prop(payload, 'route', savRoute)
      prop(payload, 'contract', this)
      return payload
    } else if (schema) {
      let stateName = schema.opts.stateName || payload.name
      let stateData
      if (schema.schemaType === Schema.SCHEMA_ENUM) {
        stateData = JSON.parse(JSON.stringify(schema.opts.enums))
      } else {
        stateData = schema.create(Object.assign({}, schema.opts.state))
        if (payload.merge) {
          Object.assign(stateData, vueRoute.params, vueRoute.query)
        }
      }
      payload.state = {
        [`${stateName}`]: stateData
      }
      return payload
    }
  }
  injectFlux (flux, isDefault) {
    let {schema} = this
    let actions = Object.keys(this.routes).reduce((ret, routeName) => {
      let route = this.routes[routeName]
      let actionName = pascalCase(route.method.toLowerCase() + '_' + (isDefault ? '' : this.projectName) + route.name)
      ret[actionName] = (flux, data, fetch) => {
        let argv = Object.assign({}, data)
        return this.invoke(flux, argv, route, fetch)
      }
      if (route.keys.length === 0) {
        ret[`${actionName}Data`] = (flux, data, fetch) => {
          let argv = {data}
          return this.invoke(flux, argv, route, fetch)
        }
      }
      let reqStruct = schema.getSchema(route.request)
      if (reqStruct) {
        let reqName = (isDefault ? '' : this.projectName) + route.request
        ret[`Check${reqName}`] = (flux, data) => {
          return reqStruct.check(data)
        }
        ret[`Extract${reqName}`] = (flux, data) => {
          return reqStruct.extractThen(data)
        }
      }
      let resStruct = schema.getSchema(route.response)
      if (resStruct) {
        let resName = (isDefault ? '' : this.projectName) + route.response
        ret[`Check${resName}`] = (flux, data) => {
          return resStruct.check(data)
        }
        ret[`Extract${resName}`] = (flux, data) => {
          return resStruct.extractThen(data)
        }
      }
      return ret
    }, {})
    flux.declare({
      actions
    })
  }
  invoke (flux, argv, route, fetch) {
    prop(argv, 'route', route)
    return this.invokePayload(argv).then(async data => {
      if (fetch) {
        return data || argv.output
      }
      if (data) {
        await flux.updateState(data)
      }
    })
  }
  /**
   * 处理请求
   * @param  {Object} payload 请求上下文
   * payload: {
   *   params,
   *   query,
   *   ttl, // 缓存时效
   *   data, // 数据
   *   route: ... resolvePayload生成的路由
   *   // 生成内容
   *   url,    // 生成的请求地址 (缓存根据url和query生成)
   *   method, // 生成请求方法
   *   input,  // 生成输入参数 (用以校验)
   *   output, // 请求结果 (用以校验)
   * }
   * @step
   * 根据payload.route 和
   */
  async invokePayload (payload) {
    let {schema} = this
    let {route} = payload
    payload.url = route.compile(payload.params)
    payload.input = Object.assign({}, payload.params, payload.query, payload.data)
    let ttl = this.opts.noCache ? null : payload.ttl || (route.action.ttl)
    let cacheKey = ttl ? getCacheKey(payload) : null
    let cacheVal = cacheKey ? this.cache.get(cacheKey, ttl) : null
    if (!cacheVal) {
      let reqStruct = schema.getSchema(route.request)
      if (reqStruct) {
        try {
          payload.input = reqStruct.extract(payload.input)
        } catch (err) {
          err.status = 400
          throw err
        }
      }
      payload.method = route.method
      let output = await this.fetch(payload)
      let resStruct = schema.getSchema(route.response)
      let cache
      if (resStruct) {
        resStruct.check(output)
        cache = resStruct.opts.cache
        if (cache) {
          this.cache.removeByName(cache)
        }
      }
      payload.output = output
      if (cacheKey) {
        this.cache.set(cacheKey, ttl, cache || route.response, output)
      }
    } else {
      payload.output = cacheVal
    }
    return mapPayloadState(payload)
  }
  fetch (payload) {
    if (this.opts.mockState) {
      let mocks = this.mocks[payload.route.response]
      if (mocks && mocks.length) {
        if (this.opts.mockFlow) {
          return new Promise((resolve, reject) => {
            this.emit('mockFlow', {resolve, reject, payload, mocks})
          })
        } else {
          return mocks[0].data
        }
      } else {
        throw new Error(`mock data no found: ${payload.route.response}`)
      }
    }
    return this.request.request(payload)
  }
}

function getCacheKey (argv) {
  // 只支持query
  let uri = argv.url + JSON.stringify(argv.query)
  return crc32(uri)
}

function mapping (target, output) {
  let {mapState} = target
  if (isArray(mapState)) {
    return mapState.reduce((ret, name) => {
      ret[name] = getStatePath(output, name)
    }, {})
  } else if (isObject(mapState)) {
    let ret = {}
    for (let name in mapState) {
      ret[name] = getStatePath(output, mapState[name])
    }
    return ret
  } else if (isFunction(mapState)) {
    return mapState(output)
  }
  return output
}

function getStatePath (output, stateName) {
  let pos = stateName.indexOf('.')
  while (pos !== -1) {
    output = output[stateName.substring(0, pos)]
    if (!isObject(output)) {
      return
    }
    stateName = stateName.substr(pos + 1)
    pos = stateName.indexOf('.')
  }
  return output[stateName]
}

function mapPayloadState (payload) {
  let {route, output} = payload
  let ret
  if (isObject(output)) {
    ret = mapping(payload, output) || mapping(route.action, output) || output
    let {resState} = route.action
    let name = resState || route.response
    if ((resState !== false) && name) {
      return {[`${name}`]: ret}
    }
  }
  return ret
}
