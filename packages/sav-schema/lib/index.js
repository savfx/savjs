import {registerCheck, registerType} from './register.js'
import {Schema} from './Schema.js'
import types from './types.js'
import checks from './checks.js'
import {setErrors} from './SchemaError.js'
import {toSchema} from './convert.js'
import './Inject.js'

registerType(types)
registerCheck(checks)

export {Schema, registerCheck, registerType, setErrors, toSchema}
export default new Schema()
