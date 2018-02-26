import test from 'ava'
import {expect} from 'chai'
import {Schema} from '../src/Schema.js'

test('Schema.refs', async ava => {
  let schema = new Schema()
  let User = schema.declare({
    props: {
      name: String,
      age: {
        type: Number
      },
      sex: 'Sex'
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
  expect(User.create()).to.eql({name: '', age: 0, sex: 1})
})
