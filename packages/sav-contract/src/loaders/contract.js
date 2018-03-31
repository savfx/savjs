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

/**
 * 加载 contract 支持json和js
 * @param  {String} dir 目录
 */
export async function loadContract (dir) {
  let contractFile = path.join(dir, `contract.json`)
  let contractFileJs = path.join(dir, `contract.js`)
  let contract = {}
  if (await pathExists(contractFile)) {
    contract = (1, require)(contractFile)
  } else if (await pathExists(contractFileJs)) {
    contract = (1, require)(contractFileJs)
  }
  let mockFile = path.join(dir, `mocks.json`)
  let mockFileJs = path.join(dir, `mocks.js`)
  if (await pathExists(mockFile)) {
    contract.mocks = (1, require)(mockFile)
  } else if (await pathExists(mockFileJs)) {
    contract.mocks = (1, require)(mockFileJs)
  }
  return contract
}
