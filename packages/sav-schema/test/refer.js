import test from 'ava'
import {expect} from 'chai'

import {Schema} from '../lib'

test('schema.extend', async ava => {
  const schema = new Schema()
  schema.declare({
    props: {
      id: Number
    },
    name: 'User'
  })
  let s = schema.declare({
    refer: 'User',
    name: 'Refer'
  })
  expect(s).to.be.a('object')
  expect(s.create()).to.eql({id: 0})

  let val = await s.extract({id: 10, name: 's'})
  expect(val).to.eql({id: 10})
})

test('schema.extend.delay', async ava => {
  const schema = new Schema()
  let s = schema.declare({
    refer: 'Users'
  })
  expect(s).to.be.a('object')
  schema.declare({
    array: Number,
    name: 'Users'
  })

  await schema.ready()
  expect(s.create()).to.eql([])

  let val = await s.extract([10])
  expect(val).to.eql([10])
})
