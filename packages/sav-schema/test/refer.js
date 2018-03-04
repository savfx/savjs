import test from 'ava'
import {expect} from 'chai'
import {Schema} from '../src/Schema.js'

test('SchemaRefer', async ava => {
  let schema = new Schema()
  schema.declare({
    name: 'StringList',
    list: 'String'
  })
  let StringList = schema.declare({
    refer: 'StringList'
  })
  expect(StringList.create()).to.eql([])
  expect(StringList.create('["a", "b"]')).to.eql(['a', 'b'])
  StringList.check('["a", "b"]')
  await StringList.checkThen('["a", "b"]')
  expect(StringList.extract('["a", "b"]')).to.eql(['a', 'b'])
  expect(await StringList.extractThen('["a", "b"]')).to.eql(['a', 'b'])
})
