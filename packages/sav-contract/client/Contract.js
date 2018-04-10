import {Router} from 'sav-router'
import {Schema} from 'sav-schema'
import {Request} from './Request.js'
import {Cache} from './Cache.js'
import {crc32, testAssign, bindEvent, prop, isArray, isObject, isFunction, pascalCase} from 'sav-util'

export class Contract {
  constructor (opts = {}) {
    this.opts = testAssign(opts, {
      enableMock: false, // 是否开启mock
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
        if (mock.req) { // 不处理req, 只处理res
          return
        }
        let name = pascalCase(mock.modalName + '_' + mock.actionName)
        let datas = this.mocks[name] || (this.mocks[name] = [])
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
  resolvePayload (payload, {params, query} = {}) {
    let savRoute = this.routes[payload.name]
    let schema = this.schema.getSchema(payload.name)
    if (savRoute) {
      if (payload.merge) {
        payload.params = Object.assign({}, params, payload.params)
        payload.query = Object.assign({}, query, payload.query)
      }
      prop(payload, 'route', savRoute)
      prop(payload, 'contract', this)
      return payload
    }
    if (schema) {
      let stateName = payload.name
      let stateData
      if (schema.schemaType === Schema.SCHEMA_ENUM) {
        stateData = JSON.parse(JSON.stringify(schema.opts.enums))
      } else {
        stateData = schema.create(Object.assign({}, schema.opts.state))
        if (payload.merge) {
          Object.assign(stateData, params, query, payload.params, payload.query)
        }
      }
      payload.state = {
        [`${stateName}`]: stateData
      }
      return payload
    }
    let err = new Error('can not resolve payload')
    err.payload = payload
    throw err
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
      let inputSchemaName = getRequestSchemaName(route)
      let reqStruct = schema.getSchema(inputSchemaName)
      if (reqStruct) {
        let reqName = (isDefault ? '' : this.projectName) + inputSchemaName
        ret[`Check${reqName}`] = (flux, data) => {
          return reqStruct.check(data)
        }
        ret[`Extract${reqName}`] = (flux, data) => {
          return reqStruct.extractThen(data)
        }
      }
      let outputSchemaName = getResponseSchemaName(route)
      let resStruct = schema.getSchema(outputSchemaName)
      if (resStruct) {
        let resName = (isDefault ? '' : this.projectName) + outputSchemaName
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
    let ttl = this.opts.noCache ? null : payload.ttl || (route.opts.ttl)
    let cacheKey = ttl ? getCacheKey(payload) : null
    let cacheVal = cacheKey ? this.cache.get(cacheKey) : null
    if (!cacheVal) {
      payload.input = Object.assign({}, payload.params, payload.query, payload.data)
      let inputSchema = schema.getSchema(getRequestSchemaName(route))
      if (inputSchema) {
        try {
          payload.input = inputSchema.extract(payload.input)
        } catch (err) {
          err.status = 400
          throw err
        }
      }
      payload.method = route.method
      let output = await this.fetch(payload)
      let outputSchema = schema.getSchema(getResponseSchemaName(route))
      let stateName
      if (outputSchema) {
        stateName = outputSchema.name
        outputSchema.check(output)
      }
      payload.output = output
      payload.stateName = stateName
      if (cacheKey) {
        this.cache.set(cacheKey, ttl, route.name, {output, stateName})
      }
    } else {
      payload.output = cacheVal.output
      payload.stateName = cacheVal.stateName
    }
    return mapPayloadState(payload)
  }
  fetch (payload) {
    if (this.opts.enableMock) {
      let mocks = this.mocks[payload.route.name]
      if (mocks && mocks.length) {
        if (this.opts.mockFlow) {
          return new Promise((resolve, reject) => {
            this.emit('mockFlow', {resolve, reject, payload, mocks})
          })
        } else {
          return mocks[0].data
        }
      } else {
        throw new Error(`mock data no found: ${payload.route.name}`)
      }
    }
    return this.request.request(payload)
  }
}

function getResponseSchemaName (route) {
  return route.opts.response || `Res${route.name}`
}

function getRequestSchemaName (route) {
  return route.opts.request || `Req${route.name}`
}

function getCacheKey (payload) {
  // 只支持query
  let uri = payload.url + JSON.stringify(payload.query)
  return crc32(uri)
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
  let mapState = payload.mapState || route.opts.mapState
  let ret = mapping(payload, mapState, output)
  let stateName = route.opts.stateName || payload.stateName
  if (stateName) {
    return {[`${stateName}`]: ret}
  }
  return ret
}

function mapping (payload, mapState, output) {
  if (isObject(output)) {
    if (isArray(mapState)) {
      return mapState.reduce((ret, name) => {
        ret[name] = getStatePath(output, name)
        return ret
      }, {})
    } else if (isObject(mapState)) {
      let ret = {}
      for (let name in mapState) {
        ret[name] = getStatePath(output, mapState[name])
      }
      return ret
    }
  }
  if (isFunction(mapState)) {
    return mapState(output)
  }
  return output
}
