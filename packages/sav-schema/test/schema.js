import test from 'ava'
import {expect} from 'chai'

import {Schema, registerType} from '../lib'

test('Schema.api', ava => {
  expect(registerType).to.be.a('function')
  registerType({
    name: 'Age',
    default: Number
  })

  let schema = new Schema()

  expect(schema.String).to.be.a('object')
  expect(schema.Number).to.be.a('object')
  expect(schema.Boolean).to.be.a('object')

  expect(schema.Long).to.be.a('object')
  expect(schema.Integer).to.be.a('object')
  expect(schema.Short).to.be.a('object')
  expect(schema.Byte).to.be.a('object')

  expect(schema.UInt8).to.be.a('object')
  expect(schema.UInt16).to.be.a('object')
  expect(schema.UInt32).to.be.a('object')

  expect(schema.Int8).to.be.a('object')
  expect(schema.Int16).to.be.a('object')
  expect(schema.Int32).to.be.a('object')

  expect(schema.Array).to.be.a('object')
  expect(schema.Object).to.be.a('object')

  expect(schema.Age).to.be.a('object')
  schema.declare({
    name: 'Sex',
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  })
  expect(schema.Sex).to.be.a('object')
})

test('Schema.create', ava => {
  let schema = new Schema()
  let User = schema.declare({
    props: {
      name: String,
      profile: {
        props: {
          age: Number
        }
      }
    }
  })
  expect(User.create()).to.eql({
    name: '',
    profile: {
      age: 0
    }
  })

  expect(User.create({
    name: 'helo',
    sex: 'male'
  })).to.eql({
    name: 'helo',
    profile: {
      age: 0
    }
  })

  const UserSchema = schema.declare({
    props: {
      profile: 'Profile',
      students: {
        array: 'Profile'
      },
      articleIds: {
        array: Number
      }
    },
    refs: {
      Profile: {
        props: {
          name: String,
          age: Number,
          male: Boolean,
          addr: {
            type: String,
            optional: true
          },
          meta: {
            props: {
              m1: {
                props: {
                  s1: String
                }
              },
              m2: {
                array: Number
              }
            },
            optional: true
          }
        },
        strict: false
      }
    }
  })

  let data = UserSchema.create({
    profile: {name: 1001, age: '40', male: 'true', meta: {m1: {s1: 'meta1'}, m2: [1, 2, 3]}},
    students: [
      {name: 1002, age: '15', male: 'true', addr: 'ShangHai1'},
      {name: 1002, age: '15', male: 'false'},
      {name: 1002, age: '16', male: 'off'},
      {name: 1002, age: '16', male: 'on'}
    ],
    articleIds: ['2001', '2003']
  })

  expect(data).to.be.a('object')
  expect(UserSchema.create()).to.eql({
    profile: { name: '', age: 0, male: false, addr: '', meta: { m1: {s1: ''}, m2: [] } },
    students: [],
    articleIds: []
  })
})

test('schema#type', ava => {
  const schema = new Schema()
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
  expect(UserInfo).to.be.a('object')
  expect(schema.Sex).to.be.not.a('object')
})

test('schema.lazy', ava => {
  const schema = new Schema()
  expect(schema.isStrict).to.eql(true)
  schema.ready(() => {})
  schema.delay(() => {})
  schema.delay(() => {})
  schema.ready().then(() => {})
})
