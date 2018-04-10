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
  modals: {
    Account: {
      view: false,
      routes: {
        login: {

        },
        test: {

        }
      }
    }
  },
  schemas: [
    {
      name: 'ReqAccountLogin',
      props: {
        username: {
          type: 'String',
          title: '用户名'
        },
        password: {
          type: 'String',
          title: '密码'
        }
      },
      state: {
        confirmPassword: ''
      }
    },
    {
      name: 'Sex',
      enums: [
        {key: 'male', value: 1, title: '男'},
        {key: 'female', value: 2, title: '女'},
      ]
    },
    {
      name: 'ResAccountTest',
      props: {
        id: 'String'
      }
    }
  ],
  mocks: [
    {
      modalName: 'Account',
      actionName: 'test',
      data: {id: 'a'}
    }
  ]
}`

test('Sav', async (t) => {
  expect(Sav).to.be.a('function')
  let contract = new Contract({
    enableMock: true,
    contract: JSON5.parse(contractData)
  })
  let flux = new Flux()
  let opts = {
    contract,
    flux
  }
  let sav = new Sav(opts)

  expect(sav.getFieldTitle('ReqAccountLogin.username')).to.eql('用户名')
  expect(sav.getFieldTitle('ReqAccountLogin.username')).to.eql('用户名')
  expect(sav.getFieldTitle('NoFound')).to.eql('NoFound')

  expect(sav.getEnumTitle('Sex.male')).to.eql('男')
  expect(sav.getEnumTitle('Sex', 'male')).to.eql('男')
  expect(sav.getEnumTitle('Sex', 'unknown')).to.eql('Sex.unknown')
  expect(sav.getEnumTitle('NoFound')).to.eql('NoFound')

  expect(sav.getEnumTitle('Sex.male', null, 'test')).to.eql('男')
  expect(sav.getEnumTitle('Sex', 'male', 'test')).to.eql('男')
  expect(sav.getEnumTitle('Sex', 'unknown', 'test')).to.eql('test.Sex.unknown')

  expect(sav.getEnumItems('Sex').length).to.eql(2)
  expect(sav.getEnumItems('Sex', 'male').length).to.eql(1)
  expect(sav.getEnumItems('Sex', 'male,female').length).to.eql(0)
  expect(sav.getEnumItems('NoFound').length).to.eql(0)

  expect(sav.getEnumItems('Sex').length, [], 'test').to.eql(2)
  expect(sav.getEnumItems('Sex', 'male', 'test').length).to.eql(1)
  expect(sav.getEnumItems('Sex', 'male,female', 'test').length).to.eql(0)

  await sav.invokePayloads([{name: 'Sex'}])
  expect(flux.state.Sex).to.be.a('array')

  await sav.invokePayloads([{name: 'ReqAccountLogin'}])
  expect(flux.state.ReqAccountLogin).to.be.a('object')

  await sav.invokePayloads([{name: 'AccountTest'}])
  expect(flux.state.ResAccountTest).to.be.a('object')

  await sav.invokePayloads([{name: 'AccountNoFound'}])
    .then(t.fail.bind(t), t.pass.bind(t))

  await sav.invokePayloads([{name: 'AccountLogin'}])
    .then(t.fail.bind(t), t.pass.bind(t))

  await sav.invokePayloads([{project: 'NoFound'}])
    .then(t.fail.bind(t), t.pass.bind(t))

  t.pass()
})
