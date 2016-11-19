import {isString, isNumber, isObject, isArray, prop, isNull, clone } from 'sav-util'
import * as assert from 'sav-assert'

const TYPE_TYPE   = 0
const TYPE_ENUM   = 1
const TYPE_STRUCT = 2
const defaultTypes = []

export class Schema {
	constructor() {
		this.declare(defaultTypes)
	}
	declare(opts) {
		if (isArray(opts)) {
			return opts.map(it=>this.declare(it))
		}
		assert.isObject(opts)
		let ret = createSchemaType(this, opts)
		if (opts.name) {
			this[opts.name] = ret
		}
		return ret
	}
	static register(opts) {
		if (isArray(opts)) {
			defaultTypes.push.call(defaultTypes, opts)
		}
		else {
			defaultTypes.push(opts)
		}
	}
}

function createType(schema, opts) {
	const {create, check} = opts
	assert.isFunction(create)
	let ret = {}
	prop(ret, 'check', check)
	prop(ret, 'create', create || (()=>opts.default) )
	return ret
}

function createEnum(schema, opts) {
	const {enums, create, check} = opts
    let valueMaps = {}
    let keyMaps = {}
	let ret = {}
	let enumList = []
	if (isObject(enums)) {
		for (let key in enums) {
			let it = enums[key]
			if (isObject(it)) {
	    		assert.inObject(it, 'value')
				valueMaps[keyMaps[key] = it.value] = key
			}
			else {
				valueMaps[keyMaps[key] = it] = key
			}
		}
	}
	else if (isArray(enums)) {
	    enums.forEach((it) => {
	    	assert.inObject(it, 'key')
	    	assert.inObject(it, 'value')
			valueMaps[keyMaps[it.key] = it.value] = it.key
	    })
	}
	prop(ret, 'values', valueMaps) // value=>key
	prop(ret, 'keys', keyMaps)     // key=>value
	prop(ret, 'check', check || ((val) => assert.inObject(valueMaps, val)))
	prop(ret, 'create', create || (()=>opts.default))
	return ret
}

function createSturct(schema, opts) {
	const {props, refs, create, check} = opts
	assert.isObject(props)

	let childs = {}
	if (refs) {
		for (let key in refs) {
			let val = refs[key]
			if (val.schema) {
				childs[key] = val
			}
			else {
				childs[key] = schema.declare(val)
			}
		}
	}

	let fields = []
	for (let key in props) {
		let field = isObject(props[key]) ? clone(props[key]) : parseProp(props[key])
		// override [type, subType, ref, subRef, required, key]
		const { type } = field
	    if (type.indexOf('<') > 0) { // ["Array<User>", "Array", "User"]
	        const mat = type.match(/^(\w+)(?:<(\w+)>)?$/);
	        field.type    = mat[1];
	        field.subType = mat[2];
	        field.subRef  = childs[field.subType] || schema[field.subType]
	    }
	    else {
	    	field.type = type
	    }
	    field.required = ('required' in field) ? field.required : !field.optional
	    field.ref = childs[field.type] || schema[field.type]
	    field.key = key
		fields.push(field)
	}

	let ret = {}
	prop(ret, 'create', create || (()=>{
		let struct = {}
	    fields.forEach((it) => {
	        struct[it.key] = it.ref.create()
	    })
	    return struct
	}))
	prop(ret, 'check', check || ((value)=>{
		try {
		    fields.forEach((it) => {
		        try {
					checkStructField(ret, value, it)
		        } catch (err) {
		        	(err.keys || (err.keys = [])).unshift(it.key);
            		throw err
		        }
		    })
		} catch (err) {
			if (err.keys) {
				err.path = err.keys.join('.');
			}
			throw err
		}
	}))
	return ret
}

/**
parseField('Number|@comment:text|@optional|len,4,10')
=>
{
    "type": "Number",
    "optional": true, 
    "checkes": [
        [ "len", "4", "10" ]
    ],
    "comment": "text"
}
 */

const propCache = {}

function parseProp(str) {
	if (propCache[str]) {
		return clone(propCache[str])
	}
	assert.isString(str)
    let strs = str.split('|')
    let ret = {}
    ret.type = strs.shift() // type first
    ret.checkes = []
    strs = strs.filter(function(it) {
        if (it.length) {
            if (it[0] == '@') {
                let map = it.substr(1, it.length).split(':'),
                    key = map.shift();
                ret[lcword(key)] = map.length ? parseValue(map.shift()) : true
                return false
            }
            return true
        }
    }).forEach(function(it) {
        let map = it.split(':')
        if (map.length == 1) {
            ret.checkes.push(it.split(',')); // 或者直接使用这种模式
            // ret.checkes.push([map.shift()])
        } else if (map.length == 2) {
            let key = map.shift()
            let val = map.shift().split(',')
            val.unshift(key)
            ret.checkes.push(val)
        }
    })
    return clone(propCache[str] = ret)
}

function lcword(s) {
	return s.length ? s.substr(0,1).toLowerCase() + s.substr(1,s.length) : s
}

function parseValue(val) {
    if (val == 'true')
        return true;
    else if (val == 'false')
        return false;
    let ret
    if ((ret = parseInt(val)) == val)
        return ret
    else if ((ret = parseFloat(val)) == val)
        return ret
    return val
}

function checkStructField (struct, obj, {key, type, subType, required, nullAble, ref, checkes, subRef}) {
	if (!required && !(key in obj)) {
		return
	}
	if (nullAble && isNull(obj[key])) {
		return
	}
	assert.inObject(obj, key)
	const val = obj[key]
	ref.check(val)
	if (subType) {
		assert.equal(type, 'Array') // allow Array<Struct> only
        for (let i = 0, l = val.length; i < l; ++i) {
            try {
                subRef.check(val[i]);
            } catch (err) {
                (err.keys || (err.keys = [])).unshift(i);
                throw err;
            }
        }
	}
}

function createSchemaType(schema, opts) {
	let dataType = TYPE_TYPE
	let ret
	if (opts.enums) {
		dataType = TYPE_ENUM
		ret = createEnum(schema, opts)
	}
	else if (opts.props) {
		dataType = TYPE_STRUCT
		ret = createSturct(schema, opts)
	}
	else {
		ret = createType(schema, opts)
	}
	prop(ret, 'dataType', dataType)
	prop(ret, 'schema', schema)
	prop(ret, 'checkThen', (val) => new Promise((resolve, reject)=>{
		try {
			ret.check(val)
		} catch (err) {
			return reject(err)
		}
		resolve()
	}))
	return ret
}

Schema.register([
	{ name: 'String',  	create: String, 	check: assert.isString },
	{ name: 'Number',  	create: Number, 	check: assert.isNumber },
	{ name: 'Array',   	create: Array, 		check: assert.isArray },
	{ name: 'Object',  	create: Object, 	check: assert.isObject },
	{ name: 'Boolean', 	create: Boolean, 	check: assert.isBoolean },
	{ name: 'Int',		create: Number, 	check: assert.isInt },
	{ name: 'Uint',		create: Number, 	check: assert.isUint },
])