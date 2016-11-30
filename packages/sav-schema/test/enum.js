import test from 'ava'
import schema from '../'
import * as assert from 'sav-assert'

test('schema#enum', ava => {
  const Sex = schema.declare({
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  })
  assert.isArray(Sex.keys)
  assert.equal(JSON.stringify(Sex.keys), JSON.stringify(['male', 'female']))

  assert.isArray(Sex.values)
  assert.equal(JSON.stringify(Sex.values), JSON.stringify([1, 2]))

  assert.isObject(Sex.fields)
  assert.equal(Sex.fieldByKey('male').value, 1)
  assert.equal(Sex.fieldByValue(1).value, 1)
})
