import test from 'ava'
import {expect} from 'chai'
import {SchemaEnum} from '../src/SchemaEnum.js'

test('SchemaEnum', ava => {
  const Sex = new SchemaEnum(null, {
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  })
  expect(Sex.check(2)).to.eql(true)
  expect(Sex.check('2')).to.eql(true)

  expect(Sex.parse('2')).to.eql(2)
  expect(Sex.parse(2)).to.eql(2)
  expect(Sex.parse('male')).to.eql('male')
  expect(Sex.create()).to.eql(1)
  expect(Sex.create(2)).to.eql(2)
  expect(Sex.create('null')).to.eql('null')
})

test('SchemaEnum.strict', ava => {
  const Sex = new SchemaEnum(null, {
    strict: true,
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  })
  expect(Sex.check(2)).to.eql(true)
  expect(Sex.check('2')).to.not.eql(true)

  expect(Sex.parse('2')).to.eql(2)
  expect(Sex.parse(2)).to.eql(2)
  expect(Sex.parse('male')).to.eql('male')
  expect(Sex.create()).to.eql(1)
  expect(Sex.create(2)).to.eql(2)
  expect(Sex.create('null')).to.eql('null')
})
