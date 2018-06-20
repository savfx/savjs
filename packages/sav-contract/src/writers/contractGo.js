/**
 * 生成 contract 目录的内容
 */
import path from 'path'
import {
  // noticeString,
  outputFile,
  getBackRoutes,
  ensureDir
} from '../utils/util.js'
// import jsonar from 'jsonar'
import {
  convertCase
  // pascalCase,
  // camelCase
  // isString, isArray, isObject
} from 'sav-util'

import {Context} from './go/context.js'
import {
  createActionBody,
  createContractBody
} from './go/actionFactory.js'

/**
 * 写入contract
 * @param  {String} dir      目标目录
 * @param  {Contract} contract 实例
 * @param  {Object} opts     选项
 * opts: {
 *   min: true, // 压缩输出
 *   mem: true, // 不写入文件
 * }
 */
export async function writeGoContract (dir, contract, opts = {}) {
  let isMem = opts.mem
  if (!isMem) {
    await ensureDir(dir)
  }
  let name = contract.project.name
  let contractPath = dir
  // let {mocks, project} = contract
  // let mockData
  // if (mocks) {
  //   let mockFile = path.join(dir, `mocks.php`)
  //   mockData = `<?php\n${noticeString}return ${jsonar.arrify({mocks}, ifyOpts)}\n`
  //   if (!isMem) {
  //     await outputFile(mockFile, mockData)
  //   }
  // }
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

  let dataList = []

  let schemaList = modals.reduce((ref, modal) => {
    let actions = actionMap[modal.name] = []
    return modal.routes.reduce((ref, route) => {
      let name = convertCase('pascal', `${modal.name}_${route.name}`)
      let ret = []
      let action = {
        name,
        modalName: modal.name,
        actionName: route.name,
        route: route,
      }
      console.log(route)
      actions.push(action)
      if (route.request) {
        action.request = route.request
        action.requestSchema = getRealName(route.request)
        action.requestType = getStructType(route.request)
        action.requestName = 'Req' + name
        dataList.push({
          fieldName: action.requestName,
          fieldType: action.requestSchema
        })
        getSchemas(route.request, schemaMap, ret)
      }
      if (route.response) {
        action.response = route.response
        action.responseSchema = getRealName(route.response)
        action.responseType = getStructType(route.response)
        action.responseName = 'Res' + name
        dataList.push({
          fieldName: action.responseName,
          fieldType: action.responseSchema
        })
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

  let schemaData = await schemaList.reduce((ref, item) => {
    return ref.then(async (arr) => {
      let data = item.schemas.map(it => ctx.createBody(it.schema)).join('\n')
      if (!isMem) {
        await outputFile(path.join(contractPath, `${item.name}.go`), makePackage(name, data, opts))
      }
      arr.push(data)
      return arr
    })
  }, Promise.resolve([]))

  remains = remains.filter(it => !it.pass)
  if (remains.length) {
    let data = remains.map(it => ctx.createBody(it.schema)).join('\n')
    if (!isMem) {
      await outputFile(path.join(contractPath, 'Unknown.go'), makePackage(name, data, opts))
    }
  }

  let actionData = await Object.keys(actionMap).reduce((ref, actionName) => {
    return ref.then(async (arr) => {
      if (!actionMap[actionName].length) { // 跳过空的
        delete actionMap[actionName]
        return arr
      }
      let data = await Promise.all(actionMap[actionName].map(it => {
        return (async () => {
          var data = makePackage(name, createActionBody(it), opts)
          if (!isMem) {
            await outputFile(path.join(contractPath, `${it.name}Action.go`), data)
          }
          return data
        })()
      }))
      arr.push(data)
      return arr
    })
  }, Promise.resolve([]))

  let contractData = createContractBody({
    name,
    modals: actionMap
  })

  let contractOutData = makePackage(name, contractData)
  if (!isMem) {
    await outputFile(path.join(contractPath, `contract.go`), contractOutData)
  }
  let routes = makePackage(name, 'var routes = `' + JSON.stringify({modals}, null, 2) + '`')
  if (!isMem) {
    await outputFile(path.join(contractPath, `routes.go`), routes)
  }
  return {
    schemas,
    schemaData,
    actionData
  }
}

function makePackage (name, text, opts) {
  let pakcages = []
  if (text.indexOf('errors.New') !== -1) {
    pakcages.push('\t"errors"')
  }
  if (text.indexOf('.ObjectAccess') !== -1 ||
    text.indexOf('.FormObject') !== -1 ||
    text.indexOf('.ObjectArray') !== -1 ||
    text.indexOf('.FormArray') !== -1 ||
    text.indexOf('.ValueAccess') !== -1) {
    pakcages.push('\t"github.com/savfx/savgo/util/convert"')
  }
  if (text.indexOf('sav.DataSource') !== -1 ||
    text.indexOf('sav.Application') !== -1 ||
    text.indexOf('sav.ActionHandler') !== -1) {
    pakcages.push('\t"github.com/savfx/savgo/sav"')
  }
  if (text.indexOf('.Checker') !== -1) {
    pakcages.push('\t"github.com/savfx/savgo/util/checker"')
  }
  let imports = pakcages.length ? `
import(
${pakcages.join('\n')}
)` : ''
  return `package ${name}
${imports}

${text}
`
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
