/*
 * @Description     Schema第二版
 * @File 			Schema2.js
 * @Auth 			jetiny@hfjy.com
 */

import {isString, isNumber, isObject, isArray } from '../util/type.js'
import assert from '../assert'
import {prop} from '../util/func.js'

export const TYPE_TYPE   = 0
export const TYPE_ENUM   = 1
export const TYPE_STRUCT = 2

const defaultTypes = []

class Schema {
	constructor() {
		this.declare(defaultTypes)
	}
	declare(opts) {
		if (isArray(opts)) {
			return opts.map(it=>this.declare(it))
		}
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

function createBasic(schema, opts) {
	let ret = {
		check: opts.check,
		create: opts.create || (()=>opts.default)()
	}
	return ret
}

function createEnum(schema, opts) {
	const {enums, create, check} = opts
    let values = []
	let ret = {
		enums,
		values,
        check: check || ((val) => {
            if (values.indexOf(val) === -1) {
                throw new Error("enum value no found:"+ JSON.stringify(val))
            }
        })(),
		create: create || (()=>opts.default)()
	}
    enums.forEach((it) => {
    	values.push(ret[it.key] = it.value)
    })
	return ret
}

function createSturct(schema, opts) {
	let ret = {

	}
	return ret
}

function createSchemaType(schema, opts) {
	let {enums, props, refs, create, check} = opts
	let dataType = TYPE_TYPE
	let ret = {}
	let fields = []
	prop(ret, '__schema', true)
	prop(ret, 'create', function () {
		if (create) {
			return create()
		}
		if (dataType !== TYPE_STRUCT) {
			return opts.default
		}
		let ret = {};
	    fields.forEach((it) => {
	        ret[it.key] = it.ref.create()
	    })
	    return ret
	})
	prop(ret, 'check', function (val) {
		if (check) {
			return check(val)
		}
		if (dataType === TYPE_ENUM) {
			if (ret.values.indexOf(val) === -1) {
				throw new Error("enum value no found:"+ JSON.stringify(val))
			}
		}
	})
	// 引用子对象
	if (refs) {
		for (let key in refs) {
			let val = refs[key]
			if (val.__schema) {
				refs[key] = val
			}
			else {
				refs[key] = schema.declare(val)
			}
		}
	}
    if (enums) { // 枚举类型
        dataType = TYPE_ENUM
        let values = []
        enums.forEach((it) => {
        	values.push(ret[it.key] = it.value)
        })
        prop(ret, 'enums', enums)
        prop(ret, 'values', values)
    } else if (props) { // 解析属性表
        dataType = TYPE_STRUCT
		for (let key in props) {
			let prop = props[key]
			const { type } = prop
			let field = {
				key,
			}
		    if (type.indexOf('<') > 0) { // ["Array<User>", "Array", "User"]
		        const mat = type.match(/^(\w+)(?:<(\w+)>)?$/);
		        field.type    = mat[1];
		        field.subType = mat[2];
		    }
		    else {
		    	field.type = type
		    }
		    field.required = prop.required || !prop.optinal
		    field.ref = refs[field.type] || schema[field.type]
			fields.push(field)
		}
	}
	switch (dataType) {
		case TYPE_ENUM:
			createEnum(schema, opts)
			break;
		case TYPE_TYPE:
			createBasic(schema, opts)
			break;
	}
	return ret
}

Schema.register([
	{ name: 'String',  create: String, 	check: assert.isString },
	{ name: 'Number',  create: Number, 	check: assert.isNumber },
	{ name: 'Array',   create: Array, 	check: assert.isArray },
	{ name: 'Object',  create: Object, 	check: assert.isObject },
	{ name: 'Boolean', create: Boolean, check: assert.isBoolean },
])

let schema = new Schema()

const Sex = schema.declare({
	default: 1,
    enums: [
        { key: 'male',   value: 1 },
        { key: 'female', value: 2 }
    ]
})
console.log(Sex.create(), Sex.check(2));

const User = schema.declare({
	props: {
		name: {
			type: 'String',
		},
		age: {
			type: 'Number',
		},
		sex: {
			type: 'Sex'
		}
	},
	refs: {
		Sex
	}
})
console.log(User.create());

const UserInfo = schema.declare({
	props: {
		followers: {
			type: 'Array<User>'
		},
		profile: {
			type: 'User'
		},
		multi: {
			type: 'Number',
			optional: true, // required
			isNull: true,
			checks: [
				['gt', 1],
				['lt', 10],
			]
		}
	},
	refs: {
		User
	}
})
console.log(UserInfo.create());

/*

{
	Users: 'Array<User>',
	User: {
		name:'String',
		age:'Number'
	},
}

=> 

{
	name: 'Users',
	type: 'Array',
	subType:'User',
}


 */

