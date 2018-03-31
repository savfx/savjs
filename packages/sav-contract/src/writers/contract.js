/**
 * 生成 contract 目录的内容
 */

import path from 'path'
import JSON5 from 'json5'
import {noticeString, ensureDir, outputFile, getBackRoutes} from '../utils/util.js'

/**
 * 写入contract
 * @param  {String} dir      目标目录
 * @param  {Contract} contract 实例
 * @param  {Object} opts     选项
 * opts: {
 *   js: true, // 输出js (会剔除掉view部分)
 *   min: true, // 压缩输出
 *   mem: true, // 不写入文件
 * }
 */
export async function writeContract (dir, contract, opts = {}) {
  let isJs = opts.js
  let isMin = opts.min
  let isMem = opts.mem
  let suffix = isJs ? 'js' : 'json'
  if (!isMem) {
    await ensureDir(dir)
  }

  let {mocks, project} = contract
  if (mocks) {
    let mockFile = path.join(dir, `mocks.${suffix}`)
    let mockData = isMin ? JSON.stringify(mocks)
      : (isJs ? JSON5.stringify(mocks, null, 2) : JSON.stringify(mocks, null, 2))
    if (isJs) {
      mockData = `${noticeString}module.exports = ${mockData}\n`
    }
    if (!isMem) {
      await outputFile(mockFile, mockData)
    }
  }

  let modals = contract.getContractModals()
  if (isJs) {
    modals = modals.map(modal => {
      let routes = getBackRoutes(modal, modal.routes)
      modal.routes = routes
      return modal
    }).filter(it => it.routes.length)
  }
  let schemas = contract.getContractSchemas()
  let contractData = {
    project,
    modals,
    schemas
  }
  let contractFile = path.join(dir, `contract.${suffix}`)
  let contractOutData = isMin ? JSON.stringify(contractData)
    : (isJs ? JSON5.stringify(contractData, null, 2) : JSON.stringify(contractData, null, 2))
  if (isJs) {
    contractOutData = `${noticeString}module.exports = ${contractOutData}\n`
  }
  if (!isMem) {
    await outputFile(contractFile, contractOutData)
  }
  if (mocks) {
    contractData.mocks = mocks
  }
  return contractData
}
