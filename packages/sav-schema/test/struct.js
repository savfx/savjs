import test from 'ava'
import {expect} from 'chai'
import {Schema} from '../src/Schema.js'

test('SchemaStruct', ava => {
  let schema = new Schema()
  let User = schema.declare({
    props: {
      name: String,
      age: {
        type: Number
      }
    }
  })
  expect(User.create()).to.eql({name: '', age: 0})
  expect(User.extract({name: 'a', age: 10, sex: 1})).to.eql({name: 'a', age: 10})
})

test('SchemaStruct.Ref', ava => {
  let schema = new Schema()
  schema.declare({
    name: 'Sex',
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  })
  let User = schema.declare({
    props: [
      {name: 'name', type: 'String'},
      {name: 'age', type: Number},
      {name: 'sex', type: 'Sex'}
    ]
  })
  expect(User.create()).to.eql({name: '', age: 0, sex: 1})
  expect(User.extract({name: 'a', age: 10, sex: 1})).to.eql({name: 'a', age: 10, sex: 1})
})
