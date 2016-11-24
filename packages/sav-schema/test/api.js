import test from 'ava'
import schema, { Schema } from '../'
import { isFunction, isObject, isArray } from 'sav-util'

const TypeProp = {
  create (s) {
    return 'Hello ' + s
  },
  default: 'Hello World',
  check: String
}

const SexProp = {
  default: 1,
  enums: { // no order
    male: 1,
    female: {
      value: 2,
      other: 'unused'
    }
  }
  // order
  // enums: [
  //     { key: 'male',   value: 1 },
  //     { key: 'female', value: 2 }
  // ]
}

const UserProp = {
  props: {
    name: {
      type: 'String'
    },
    age: 'Number',
    sex: 'Sex'
  },
  refs: {
    Sex: SexProp
  }
}

test('schema#api', (ava) => {
  ava.true(isFunction(Schema.register))

  ava.true(isFunction(schema.declare))
  // type
  const Type = schema.declare(TypeProp)
  ava.true(isFunction(Type.check))
  ava.true(isFunction(Type.create))
  ava.true(isFunction(Type.checkThen))
  // enum
  const Sex = schema.declare(SexProp)
  ava.true(isFunction(Sex.check))
  ava.true(isFunction(Sex.create))
  ava.true(isArray(Sex.keys))
  ava.true(isArray(Sex.values))
  ava.true(isObject(Sex.fields))
  ava.true(isFunction(Type.checkThen))
  // struct
  const User = schema.declare(UserProp)
  ava.true(isFunction(User.check))
  ava.true(isFunction(User.create))
  ava.true(isFunction(User.checkThen))
  ava.true(isFunction(User.extract))
})
