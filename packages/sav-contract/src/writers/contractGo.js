/**
 * 生成 contract 目录的内容
 */
import path from 'path'
import {noticeString, ensureDir, outputFile,
  getBackRoutes} from '../utils/util.js'
import jsonar from 'jsonar'
import {isString, isArray, isObject, convertCase, pascalCase, camelCase} from 'sav-util'

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

  let {mocks, project} = contract
  // let mockData
  // if (mocks) {
  //   let mockFile = path.join(dir, `mocks.php`)
  //   mockData = `<?php\n${noticeString}return ${jsonar.arrify({mocks}, ifyOpts)}\n`
  //   if (!isMem) {
  //     await outputFile(mockFile, mockData)
  //   }
  // }
  // // php 剔除掉view
  // let modals = contract.getContractModals().map(modal => {
  //   let routes = getBackRoutes(modal, modal.routes)
  //   modal.routes = routes
  //   return modal
  // }).filter(it => it.routes.length)

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
  let schemaMap = schemas.reduce((ret, it) => {
    ret[it.name] = {
      name: it.name,
      ref: 0
    }
    return ret
  }, {})
  schemas.forEach(ref => {
    ref.refs.forEach(it => {
      schemaMap[it].ref++
    })
  })

  schemas.sort(function (a, b) {
    return schemaMap[b.name].ref - schemaMap[a.name].ref
  })

  let schemaData = schemas.map(it => {
    let ret
    if (it.list) {
      ret = convertList(it)      
    } else if (it.refer) {
      ret = convertRefer(it)
    } else if (it.props) {
      ret = convertStruct(it)
    } else if (it.enums) {
      ret = convertEnum(it)
    }
    return ret
  })

  console.log(schemas)
  console.log(schemaData)

  return {
    schemas
  }
}

function convertStruct (input) {
  let ret = []
  if (isArray(input.props)) {
    input.props.forEach(field => {
      let type = typeMaps[field.type] || field.type
      field.type = type
      ret.push(`${pascalCase(field.name)} ${type} \`schema: ${JSON.stringify(field)} \``)
    })
  } else if (isObject(input.props)) {
    for (let name in input.props) {
      let field = input.props[name]
      if (isString(field)) {
        field = {
          type: field,
          name: name
        }
      }
      let type = typeMaps[field.type] || field.type
      field.type = type
      ret.push(`${pascalCase(field.name)} ${type} \`schema: ${JSON.stringify(field)} \``)
    }
  }
  return ret
}

function convertList (input) {
  return `type ${input.name} []${input.list} // ${input.title}`
}

function convertRefer (input) {
  return `type ${input.name} ${input.refer} // ${input.title}`
}

function convertEnum (input) {
  let ret = input.enums.map(it => {
    return `var ${pascalCase(it.key)} = ${it.value} // ${it.title}`
  })
  return ret
}

const typeMaps = {
  String: 'string',
  // 大数字会走科学计数
  Number: 'float64',

  Int8: 'int8',
  UInt8: 'uint8',
  Byte: 'int16', // 只能升级

  Int16: 'int16',
  UInt16: 'uint16',
  Short: 'int32',

  Int32: 'int32',
  UInt32: 'uint32',
  Integer: 'int64',
  
  Long: 'int64',

}
