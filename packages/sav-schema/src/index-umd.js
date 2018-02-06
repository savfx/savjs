import {Schema} from './Schema.js'
import {setErrors} from './SchemaError.js'
import {prop} from 'sav-util'

let ret = new Schema()

prop(ret, consts)
prop(ret, {
  Schema,
  setErrors
})

export default ret
