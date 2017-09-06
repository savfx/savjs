import {registerCheck, registerType} from './SchemaRegister.js'
import {Schema} from './Schema.js'
import defaultSchema from './defaultSchema.js'
import defaultCheck from './defaultCheck.js'

registerType(defaultSchema)
registerCheck(defaultCheck)

let ret = new Schema()

ret.Schema = Schema
ret.registerCheck = registerCheck
ret.registerType = registerType

export default ret
