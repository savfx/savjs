import test from 'ava'
import schema, { Schema, registerCheck, registerType } from '../lib'
import { isFunction, isObject, isArray } from 'sav-util'

test('schema#api', (ava) => {
  ava.true(isFunction(registerCheck))
  ava.true(isFunction(registerType))
  ava.true(isFunction(Schema))
  ava.true(isFunction(schema.declare))
  // type
  const Type = schema.declare({
    create (s) {
      return 'Hello ' + s
    },
    default: 'Hello World',
    check: String
  })
  ava.true(isFunction(Type.check))
  ava.true(isFunction(Type.create))
  // enum
  const Sex = schema.declare({
    default: 1,
    enums: { // no order
      male: 1,
      female: {
        value: 2,
        other: 'unused'
      }
    }
  })
  ava.true(isFunction(Sex.check))
  ava.true(isFunction(Sex.create))
  ava.true(isArray(Sex.keys))
  ava.true(isArray(Sex.values))
  ava.true(isObject(Sex.keyMaps))
  ava.true(isObject(Sex.valueMaps))
  // struct
  const User = schema.declare({
    props: {
      name: {
        type: 'String'
      },
      age: 'Number',
      sex: 'Sex'
    },
    refs: {
      Sex: {
        default: 1,
        enums: { // no order
          male: 1,
          female: {
            value: 2,
            other: 'unused'
          }
        }
      }
    }
  })
  ava.true(isFunction(User.check))
  ava.true(isFunction(User.create))
  ava.true(isFunction(User.checkThen))
  ava.true(isFunction(User.extract))
  ava.true(isFunction(User.extractThen))
})
