/**
 * 加载contract目录
 *
 * sav-suite 导出结构(全量和node可用)
 * contract.json
 * contract-min.json
 * mock.json
 *
 */
import path from 'path'
import {pathExists} from '../utils/util.js'
const req = require

/**
 * 加载 contract 支持json和js
 * @param  {String} dir 目录
 */
export async function loadContract (dir) {
  let contractFile = path.join(dir, `contract.json`)
  let contractFileJs = path.join(dir, `contract.js`)
  let contract = {}
  if (await pathExists(contractFile)) {
    contract = req(contractFile)
  } else if (await pathExists(contractFileJs)) {
    contract = req(contractFileJs)
  }
  let mockFile = path.join(dir, `mocks.json`)
  let mockFileJs = path.join(dir, `mocks.js`)
  if (await pathExists(mockFile)) {
    contract.mocks = req(mockFile)
  } else if (await pathExists(mockFileJs)) {
    contract.mocks = req(mockFileJs)
  }
  return contract
}
