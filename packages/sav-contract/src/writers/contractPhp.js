/**
 * 生成 contract 目录的内容
 */
import path from 'path'
import {noticeString, ensureDir, outputFile,
  getBackRoutes} from '../utils/util.js'
import jsonar from 'jsonar'
import {convertCase} from 'sav-util'

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
export async function writePhpContract (dir, contract, opts = {}) {
  let isMem = opts.mem
  let isMin = opts.min
  let ifyOpts = isMin ? {prettify: false, indent: 0, space: false}
    : {prettify: true, indent: 2, space: true}

  if (!isMem) {
    await ensureDir(dir)
  }

  let {mocks, project} = contract
  let mockData
  if (mocks) {
    let mockFile = path.join(dir, `mocks.php`)
    mockData = `<?php\n${noticeString}return ${jsonar.arrify({mocks}, ifyOpts)}\n`
    if (!isMem) {
      await outputFile(mockFile, mockData)
    }
  }
  // php 剔除掉view
  let modals = contract.getContractModals().map(modal => {
    let routes = getBackRoutes(modal, modal.routes)
    modal.routes = routes
    return modal
  }).filter(it => it.routes.length)

  let contractData = {
    project,
    modals
  }
  let contractFile = path.join(dir, `contract.php`)
  let contractOutData = `<?php\n${noticeString}return ${jsonar.arrify(contractData, ifyOpts)}\n`
  if (!isMem) {
    await outputFile(contractFile, contractOutData)
  }
  let schemas = contract.getContractSchemas({reference: true})
  let schemaMap = schemas.reduce((ret, it) => {
    ret[it.name] = it
    return ret
  }, {})
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
  if (!isMem) {
    await ensureDir(schemaPath)
  }
  let schemaData = await schemaList.reduce((ref, it) => {
    return ref.then(async (arr) => {
      let data = `<?php\n${noticeString}return ${
        jsonar.arrify({schemas: it.schemas}, ifyOpts)}\n`
      if (!isMem) {
        await outputFile(path.join(schemaPath, it.name + '.php'), data)
      }
      arr.push(data)
      return arr
    })
  }, Promise.resolve([]))

  return {
    mockData,
    contractOutData,
    schemaData
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
  ret.push(maps[name])
  ref.refs.forEach(it => {
    getSchemas(it, maps, ret)
  })
}
