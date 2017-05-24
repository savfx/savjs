import {registerCheck, registerType} from './SchemaRegister.js'
import {Schema} from './Schema.js'
import defaultSchema from './defaultSchema.js'
import defaultCheck from './defaultCheck.js'

registerType(defaultSchema)
registerCheck(defaultCheck)

export {Schema, registerCheck, registerType}
export default new Schema()
