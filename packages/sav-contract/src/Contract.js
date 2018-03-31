
/**
 * 加载项目
 */

import {Router} from 'sav-router'
import {Schema} from 'sav-schema'
import {ucfirst, isObject} from 'sav-util'

export class Contract {
  constructor (opts = {}) {
    this.opts = opts
    this.router = new Router(opts)
    this.schema = new Schema(opts)
    this.router.on('declareAction', this.declareAction.bind(this))
  }

  load (data, opts) {
    this.project = data.project
    this.mocks = data.mocks
    this.schema.load(data)
    this.router.load(data)
    if (data.pages) {
      let actions = data.pages.map(it => {
        it.view = true
        return it
      })
      this.router.load({actions})
    }
  }

  declareAction (route) {
    let {opts, modal} = route
    processRouteSchema(modal.name, opts, 'request', this.schema)
    processRouteSchema(modal.name, opts, 'response', this.schema)
  }
}

const shortTypeMap = {
  request: 'Req',
  response: 'Res'
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
    } else {
      let ref = schema.getSchema(data)
      if (!ref) {
        delete route[type]
        console.warn(`schema ${data} no found with ${type} of ${modalName}.${route.name}`)
      } else {
        route[type] = ref.name
      }
    }
  } else {
    if (schema[name]) {
      route[type] = name
    }
  }
}
