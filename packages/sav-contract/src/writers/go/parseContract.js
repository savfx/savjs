import {Context} from './context.js'
import {convertCase} from 'sav-util'
import {getBackRoutes} from '../../utils/util.js'

export function parseContract (contract, opts) {
  // 剔除掉view
  let modals = contract.getContractModals().map(modal => {
    let routes = getBackRoutes(modal, modal.routes)
    modal.routes = routes
    return modal
  }).filter(it => it.routes.length)

  let schemas = contract.getContractSchemas({reference: true})
  let remains = []
  let schemaMap = schemas.reduce((ret, it) => {
    let item = {
      name: it.name,
      schema: it,
      pass: false,
      ref: 0
    }
    remains.push(item)
    ret[it.name] = item
    return ret
  }, {})

  let ctx = new Context()
  schemas.forEach(ref => {
    ctx.addRef(ref)
    ref.refs.forEach(it => {
      if (schemaMap[it]) {
        schemaMap[it].ref++
      }
    })
  })

  schemas.sort(function (a, b) {
    return schemaMap[b.name].ref - schemaMap[a.name].ref
  })

  let actionMap = {}

  let getStructType = (name) => {
    let schemaItem = schemaMap[name]
    if (schemaItem && schemaItem.schema) {
      if (schemaItem.schema.refer) {
        return getStructType(schemaItem.schema.refer)
      } else if (schemaItem.schema.list) {
        return 'Array'
      } else if (schemaItem.schema.props) {
        return 'Object'
      }
    }
    return ''
  }

  let getRealName = (name) => {
    let schemaItem = schemaMap[name]
    if (schemaItem && schemaItem.schema) {
      if (schemaItem.schema.refer) {
        return getRealName(schemaItem.schema.refer)
      }
      return schemaItem.schema.name
    }
    return ''
  }

  let schemaList = modals.reduce((ref, modal) => {
    let actions = actionMap[modal.name] = []
    return modal.routes.reduce((ref, route) => {
      let name = convertCase('pascal', `${modal.name}_${route.name}`)
      let ret = []
      let action = {
        name,
        modalName: modal.name,
        actionName: route.name,
        route: route
      }
      actions.push(action)
      if (route.request) {
        action.request = route.request
        action.requestSchema = getRealName(route.request)
        action.requestType = getStructType(route.request)
        action.requestName = 'Req' + name
        getSchemas(route.request, schemaMap, ret)
      }
      if (route.response) {
        action.response = route.response
        action.responseSchema = getRealName(route.response)
        action.responseType = getStructType(route.response)
        action.responseName = 'Res' + name
        getSchemas(route.response, schemaMap, ret)
      }
      if (ret.length) {
        ref.push({
          name,
          schemas: ret
        })
      }
      return ref
    }, ref)
  }, [])

  return {
    ctx,
    schemaList,
    actionMap,
    schemas,
    schemaMap,
    remains,
    modals
  }
}

function getSchemas (name, maps, ret) {
  let ref = maps[name]
  if (!ref) {
    return
  }
  if (ret.indexOf(ref) !== -1) {
    return
  }
  if (ref.pass) {
    return
  }
  ref.pass = true
  ret.push(ref)
  ref.schema.refs.forEach(it => {
    getSchemas(it, maps, ret)
  })
}
