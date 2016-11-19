import test from 'ava'
import { Schema } from '../'
import { isFunction, isObject } from 'sav-util'

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

  let schema = new Schema()
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
  ava.true(isObject(Sex.keys))
  ava.true(isObject(Sex.values))
  ava.true(isFunction(Type.checkThen))
  // struct
  const User = schema.declare(UserProp)
  ava.true(isFunction(User.check))
  ava.true(isFunction(User.create))
  ava.true(isFunction(User.checkThen))
})
