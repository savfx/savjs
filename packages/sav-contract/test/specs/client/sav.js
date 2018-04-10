import test from 'ava'
import {expect} from 'chai'

import {Sav} from '../../../client/Sav.js'
import {Contract} from '../../../client/Contract.js'
import {Flux} from 'sav-flux'
import JSON5 from 'json5'

const contractData = `{
  project: {
    name: 'test'
  },
  schemas: [
    {
      name: 'AccountLogin',
      props: {
        username: {
          type: 'String',
          title: '用户名'
        },
        password: {
          type: 'String',
          title: '密码'
        }
      }
    },
    {
      name: 'Sex',
      enums: [
        {key: 'male', value: 1, title: '男'},
        {key: 'female', value: 2, title: '女'},
      ]
    }
  ]
}`

test('Sav', async (t) => {
  expect(Sav).to.be.a('function')
  let contract = new Contract({
    contract: JSON5.parse(contractData)
  })
  let flux = new Flux()
  let sav = new Sav({
    contract,
    flux
  })

  expect(sav.getFieldTitle('AccountLogin.username')).to.eql('用户名')

  expect(sav.getEnumTitle('Sex.male')).to.eql('男')
  expect(sav.getEnumTitle('Sex', 'male')).to.eql('男')
  expect(sav.getEnumTitle('Sex', 'unknown')).to.eql('Sex.unknown')

  expect(sav.getEnumTitle('Sex.male', null, 'test')).to.eql('男')
  expect(sav.getEnumTitle('Sex', 'male', 'test')).to.eql('男')
  expect(sav.getEnumTitle('Sex', 'unknown', 'test')).to.eql('test.Sex.unknown')

  expect(sav.getEnumItems('Sex').length).to.eql(2)
  expect(sav.getEnumItems('Sex', 'male').length).to.eql(1)
  expect(sav.getEnumItems('Sex', 'male,female').length).to.eql(0)

  expect(sav.getEnumItems('Sex').length, [], 'test').to.eql(2)
  expect(sav.getEnumItems('Sex', 'male', 'test').length).to.eql(1)
  expect(sav.getEnumItems('Sex', 'male,female', 'test').length).to.eql(0)

  t.pass()
})
