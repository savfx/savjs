import {Contract} from './Contract.js'

import {loadInterface} from './loaders/interface.js'
import {loadContract} from './loaders/contract.js'
import {writeContract} from './writers/contract.js'
import {writeGoContract} from './writers/contractGo.js'
import {writePhpContract} from './writers/contractPhp.js'
import {updatePhpActions} from './updaters/updatePhp.js'
import {updateGoActions} from './updaters/updateGo.js'
import {updateNodeActions} from './updaters/updateNode.js'
import {updateFront} from './updaters/updateFront.js'

import {Schema} from 'sav-schema'
import {prop, isArray, isNumber, isString} from 'sav-util'
import path from 'path'

export class CommandContract extends Contract {
  /**
   * 执行命令
   * @param  {Object} params 参数
   * {
   *   interface: './interface', // 输入的interface目录
   *   contract: './contract', // 输入的contract目录
   *   destContract: './contract-out', // 输出的contract目录
   *   destAction: './modals', // 输出的modals目录
   *   langs: 'js,php,node,go', // 支持的语言
   * }
   */
  async execute (params) {
    let data
    if (params.interface) {
      data = await loadInterface(path.resolve(params.interface))
    } else if (params.contract) {
      data = await loadContract(params.interface)
    } else {
      throw new Error('interface or contract required')
    }
    this.load(data)

    let langs = params.langs.split(',')
    let {destContract, destModals, destFront} = params
    if (destContract) {
      destContract = path.resolve(destContract)
      if (langs.indexOf('node') !== -1) { // node后端
        await writeContract(path.join(destContract, 'node'), this)
      }
      if (langs.indexOf('js') !== -1) { // js 前端
        await writeContract(path.join(destContract, 'js'), this, {js: true})
      }
      if (langs.indexOf('php') !== -1) { // php后端
        await writePhpContract(path.join(destContract, 'php'), this)
      }
      if (langs.indexOf('go') !== -1) { // go后端
        await writeGoContract(path.join(destContract, 'go'), this)
      }
    }
    let modals = this.getContractModals()
    if (destModals) {
      destModals = path.resolve(destModals)
      if (langs.indexOf('node') !== -1) { // node后端
        await updateNodeActions(destModals, modals)
      }
      if (langs.indexOf('php') !== -1) { // php后端
        let opts = {}
        if (params.lumen) {
          opts.args = '$ctx, $input'
          opts.parentClass = 'Controller'
          opts.classSuffix = 'Controller'
          opts.fileSuffix = 'Controller'
          opts.namespace = 'namespace App\\Http\\Controllers;'
        }
        await updatePhpActions(destModals, modals, opts)
      }
      if (langs.indexOf('go') !== -1) { // go 后端
        let opts = {
          project: this.project
        }
        if (params.gin) {
          opts.gin = true
        }
        await updateGoActions(this, destModals, modals, opts)
      }
    }
    if (destFront) {
      destFront = path.resolve(destFront)
      await updateFront(destFront, modals, params)
    }
  }

  getContractModals () {
    let modals = this.router.getModals()
    let ret = []
    for (let modalName in modals) {
      let modal = modals[modalName]
      let modalRef = Object.assign({}, modal.opts, {
        routes: [],
        regexp: modal.regexp.toString()
      })
      if (modal.keys && modal.keys.length) {
        modalRef.keys = modal.keys
      }
      ret.push(modalRef)
      delete modalRef.id
      modal.routes.forEach((route) => {
        let routeRef = Object.assign({}, route.opts, {
          regexp: route.regexp.toString()
        })
        if (route.keys && route.keys.length) {
          routeRef.keys = route.keys
        }
        delete routeRef.modal
        delete routeRef.id
        modalRef.routes.push(routeRef)
      })
    }
    return ret
  }

  getContractSchemas (opts = {}) {
    let reference = opts.reference
    let ret = []
    let schema = this.schema
    Object.keys(schema.nameMap).forEach(schemaName => {
      let struct = schema.nameMap[schemaName]
      if (struct.schemaType === Schema.SCHEMA_TYPE) {
        return
      }
      let structRef = Object.assign({}, struct.opts)
      delete structRef.refs
      delete structRef.id
      if (reference) {
        // structRef.refs = []
        prop(structRef, 'refs', [])
      }
      if (struct.schemaType === Schema.SCHEMA_STURCT) {
        if (isArray(structRef.props)) {
          structRef.props = structRef.props.map((it, id) => {
            if (isNumber(it) || isString(it)) {
              let field = struct.fields[id]
              let fieldRef = Object.assign({}, field.opts, {
                type: field.ref.name
              })
              delete fieldRef.id
              return fieldRef
            }
            return it
          })
        }
        if (reference) {
          for (let field of struct.fields) {
            if (field.ref.schemaType !== Schema.SCHEMA_TYPE) {
              structRef.refs.push(field.ref.name)
            }
          }
        }
      } else if (struct.schemaType === Schema.SCHEMA_LIST) {
        structRef.list = struct.ref.name
        if (reference) {
          structRef.refs.push(struct.ref.name)
        }
      } else if (struct.schemaType === Schema.SCHEMA_REFER) {
        structRef.refer = struct.ref.name
        if (reference) {
          structRef.refs.push(struct.ref.name)
        }
      }
      ret.push(structRef)
    })
    return ret
  }
}
