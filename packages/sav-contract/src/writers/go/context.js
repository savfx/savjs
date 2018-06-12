import {isNativeType} from './type'
import {createEnumBody} from './enumFactory.js'
import {createStructBody} from './structFactory.js'
import {createListBody} from './listFactory.js'
import {createReferBody} from './referFactory.js'

export class Context {
  constructor (opts) {
    this.refs = {}
    this.structs = {}
    this.enums = {}
    this.lists = {}
    this.opts = opts = Object.assign({
      keyType: 'string',
      valType: 'int',
      defaultIntType: 'int',
      ctx: this
    }, opts)
  }
  addRef (ref) {
    if (ref.props) {
      this.structs[ref.name] = ref
    } else if (ref.enums) {
      this.enums[ref.name] = ref
    } else if (ref.list) {
      this.lists[ref.name] = ref
    }
  }
  isEnum (name) {
    return !!this.enums[name]
  }
  isStruct (name) {
    return !!this.structs[name]
  }
  isList (name) {
    return !!this.lists[name]
  }
  isNative (name) {
    return isNativeType(name)
  }
  createBody (ref) {
    if (ref.props) {
      return createStructBody(ref, this.opts)
    } else if (ref.enums) {
      return createEnumBody(ref, this.opts)
    } else if (ref.list) {
      return createListBody(ref, this.opts)
    } else if (ref.refer) {
      return createReferBody(ref, this.opts)
    }
  }
}
