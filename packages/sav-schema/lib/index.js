import {registerCheck, registerType} from './register.js'
import {Schema} from './Schema.js'
import types from './types.js'
import checks from './checks.js'
import {setErrors} from './SchemaError.js'

registerType(types)
registerCheck(checks)

export {Schema, registerCheck, registerType, setErrors}
export default new Schema()
