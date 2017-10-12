import test from 'ava'
import {expect} from 'chai'
import {SchemaEnum} from '../lib/SchemaEnum.js'

test('schema#enum', ava => {
  const Sex = new SchemaEnum(null, {
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  })

  expect(Sex.keys).to.eql(['male', 'female'])
  expect(Sex.values).to.eql([1, 2])

  expect(Sex.value('male')).to.eql(1)
  expect(Sex.key(1)).to.eql('male')
  expect(Sex.key('1')).to.eql('male')

  expect(Sex.hasKey('male')).to.eql(true)
  expect(Sex.hasValue(2)).to.eql(true)
  expect(Sex.hasValue('2')).to.eql(true)
  expect(Sex.check('2')).to.eql(true)
  expect(Sex.parse('2')).to.eql(2)
  expect(Sex.parse(2)).to.eql(2)
})

test('schema#object', ava => {
  const Sex = new SchemaEnum({
    export (obj) {
      expect(obj.name).to.eql('SexEnum')
    }
  }, {
    name: 'SexEnum',
    enums: {
      male: 1,
      female: {key: 'female', value: 2}
    }
  })
  expect(Sex.keys).to.eql(['male', 'female'])
  expect(Sex.values).to.eql([1, 2])
})

test('schema#create', ava => {
  const Sex = new SchemaEnum(null, {
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ],
    default: 1
  })

  expect(Sex.create()).to.eql(1)
  expect(Sex.create(2)).to.eql(2)
})

test('schema#strict', ava => {
  const Sex = new SchemaEnum({
    export (obj) {
      expect(obj.name).to.eql('SexEnum')
    }
  }, {
    strict: true,
    enums: [
      {key: 'male', value: 1},
      {key: 2, value: 'female'}
    ]
  })
  expect(Sex.hasKey('2')).to.eql(false)
  expect(Sex.hasKey(2)).to.eql(true)

  expect(Sex.key('1')).to.eql(undefined)
  expect(Sex.key(1)).to.eql('male')

  expect(Sex.hasValue(1)).to.eql(true)
  expect(Sex.hasValue('1')).to.eql(false)

  expect(Sex.value(2)).to.eql('female')
  expect(Sex.value('2')).to.eql(undefined)
})
