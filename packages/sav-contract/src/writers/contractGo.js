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

  // let contractData = {
  //   project,
  //   modals
  // }
  // let contractFile = path.join(dir, `contract.php`)
  // let contractOutData = `<?php\n${noticeString}return ${jsonar.arrify(contractData, ifyOpts)}\n`
  // if (!isMem) {
  //   await outputFile(contractFile, contractOutData)
  // }
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

  let schemaList = modals.reduce((ref, modal) => {
    return modal.routes.reduce((ref, route) => {
      let name = convertCase('pascal', `${modal.name}_${route.name}`)
      let ret = []
      if (route.request) {
        getSchemas(route.request, schemaMap, ret)
      }
      if (route.response) {
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

  let schemaPath = path.join(dir, `schemas`)
  let schemaData = await schemaList.reduce((ref, item) => {
    return ref.then(async (arr) => {
      let data = item.schemas.map(it => ctx.createBody(it.schema)).join('\n')
      if (!isMem) {
        await outputFile(path.join(schemaPath, `${item.name}.go`), makePackage(data, opts))
      }
      arr.push(data)
      return arr
    })
  }, Promise.resolve([]))

  remains = remains.filter(it => !it.pass)
  if (remains.length) {
    let data = remains.map(it => ctx.createBody(it.schema)).join('\n')
    if (!isMem) {
      await outputFile(path.join(schemaPath, 'Unknown.go'), makePackage(data, opts))
    }
  }
  return {
    schemas,
    schemaData
  }
}

function makePackage (text, opts) {
  let pakcages = []
  if (text.indexOf('ObjectAccess') !== -1 ||
    text.indexOf('FormObject') !== -1 ||
    text.indexOf('ObjectArray') !== -1 ||
    text.indexOf('FormArray') !== -1 ||
    text.indexOf('ValueAccess') !== -1) {
    pakcages.push('\t"github.com/savfx/savgo/util/convert"')
  }
  return `package schemas

import(
${pakcages.join('\n')}
)
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
