import test from 'ava'
import {expect} from 'chai'
import path from 'path'

import {Contract} from '../../../client/Contract.js'
import {loadInterface} from '../../../src/loaders/interface.js'

const data = {
  project: {
    name: 'test'
  },
  modals: {
    Account: {
      view: false,
      routes: {
        login: {
        },
      }
    }
  },
  schemas: [
    {
      name: 'ReqAccountLogin',
      props: {
        username: 'String',
        password: 'String'
      },
      state: {
        confirmPassword: ''
      }
    },
    {
      name: 'ResAccountLogin',
      props: {
        id: 'String'
      }
    }
  ],
  mocks: [
    {
      modalName: 'Account',
      actionName: 'login',
      data: {id: 'a'}
    }
  ]
}

test('Contract', async (ava) => {
  expect(Contract).to.be.a('function')
  let contract = new Contract({
    enableMock: true
  })
  contract.load(data)
  expect(contract.resolvePayload({})).to.eql(undefined)

  // 解析Action
  let payload = {
    name: 'AccountLogin',
    data: {
      username: 's',
      password: 'b'
    }
  }
  contract.resolvePayload(payload)
  expect(payload.route).to.be.a('object')
  expect(payload.contract).to.be.a('object')
  
  let ret = await contract.invokePayload(payload)
  expect(ret).to.eql({id: 'a'})

  // 解析Schema
  payload = {
    name: 'ReqAccountLogin'
  }
  contract.resolvePayload(payload)
  expect(payload.state).to.eql({
    ReqAccountLogin: {
      username: '',
      password: '',
      confirmPassword: ''
    }
  })


  // console.log(contract)
  ava.pass()
})
