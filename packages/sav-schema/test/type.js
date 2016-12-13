import test from 'ava'
import schema from '../'
import * as assert from 'sav-assert'

test('schema#type', ava => {
  const {String, Number} = schema
  const UserInfo = schema.declare({
    props: {
      name: String,
      name1: 'String',
      age: {
        type: Number
      },
      age1: 'Number',
      sex: 'Sex',
      sex1: {
        type: 'Sex',
        optional: true
      }
    },
    refs: {
      Sex: {
        enums: [
          {key: 'male', value: 1},
          {key: 'female', value: 2}
        ]
      }
    }
  })
  assert.isObject(UserInfo)
  assert.isNotObject(schema.Sex)
})

test('schema with raw type', ava => {
  const struct = schema.declare({
    props: {
      name: String,
      age: {
        type: Number
      }
    }
  })
  assert.isObject(struct)
})
