import test from 'ava'
import {expect} from 'chai'
import path from 'path'

import {Contract} from '../../../client/Contract.js'
import {loadInterface} from '../../../src/loaders/interface.js'
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
        register: {
          response: 'ResAccountLogin'
        },
        session: {
        },
        cache: {
          ttl: 10
        },
        nomock: {}
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
    },
  ],
  mocks: [
    {
      modalName: 'Account',
      actionName: 'login',
      data: {id: 'a'}
    },
    {
      modalName: 'Account',
      actionName: 'register',
      data: {id: 'a'}
    },
    {
      modalName: 'Account',
      actionName: 'session',
      data: {id: 'a', name: 'b', users: {jetiny: 'sex'}}
    },
    {
      modalName: 'Account',
      actionName: 'cache',
      data: {id: 'a'}
    }
  ]
}`

test('Contract.invokePayload', async (ava) => {
  expect(Contract).to.be.a('function')
  let contract = new Contract({
    enableMock: true
  })
  contract.load(JSON5.parse(contractData))
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
  expect(payload.url).to.eql('/account/login')
  expect(payload.method).to.eql('POST')
  expect(payload.input).to.eql({
    username: 's',
    password: 'b'
  })
  expect(payload.output).to.eql({id: 'a'})
  expect(payload.stateName).to.eql('ResAccountLogin')
  expect(ret).to.eql({ResAccountLogin: {id: 'a'}})

  payload = {
    name: 'AccountRegister'
  }
  contract.resolvePayload(payload)
  expect(payload.route).to.be.a('object')
  expect(payload.contract).to.be.a('object')
  ret = await contract.invokePayload(payload)
  expect(payload.stateName).to.eql('ResAccountLogin')
  expect(ret).to.eql({ResAccountLogin: {id: 'a'}})

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

test('Contract.mapState', async (ava) => {
  expect(Contract).to.be.a('function')
  let contract = new Contract({
    enableMock: true
  })
  let data = JSON5.parse(contractData)

  contract.load(data)
  expect(contract.resolvePayload({})).to.eql(undefined)
  {
    let payload = {
      name: 'AccountSession',
      mapState: {
        uid: 'id',
        sex: 'users.jetiny',
        some: 'xxx.xxx.xxx'
      }
    }
    contract.resolvePayload(payload)
    let ret = await contract.invokePayload(payload)
    expect(ret).to.eql({uid: 'a', sex: 'sex', some: undefined})
  }
  {
    let payload = {
      name: 'AccountSession',
      mapState: ['id']
    }
    contract.resolvePayload(payload)
    let ret = await contract.invokePayload(payload)
    expect(ret).to.eql({id: 'a'})
  }
  {
    let payload = {
      name: 'AccountSession',
      mapState: (ret) => JSON.stringify(ret.name)
    }
    contract.resolvePayload(payload)
    let ret = await contract.invokePayload(payload)
    expect(ret).to.eql('"b"')
  }

  ava.pass()
})

test('Contract.cache', async (ava) => {
  expect(Contract).to.be.a('function')
  let contract = new Contract({
    enableMock: true
  })
  let data = JSON5.parse(contractData)

  contract.load(data)
  expect(contract.resolvePayload({})).to.eql(undefined)
  {
    let payload = {
      name: 'AccountCache'
    }
    contract.resolvePayload(payload)
    let ret = await contract.invokePayload(payload)
    expect(ret).to.eql({id: 'a'})
  }
  {
    let payload = {
      name: 'AccountCache'
    }
    contract.resolvePayload(payload)
    let ret = await contract.invokePayload(payload)
    expect(ret).to.eql({id: 'a'})
  }
  ava.pass()
})

test('Contract.ajax', async (ava) => {
  expect(Contract).to.be.a('function')
  let contract = new Contract({
    ajax (req, callback) {
      setTimeout(callback(null, {id: 'a'}))
    }
  })
  contract.load(JSON5.parse(contractData))
  {
    let payload = {
      name: 'AccountCache'
    }
    contract.resolvePayload(payload)
    let ret = await contract.invokePayload(payload)
    expect(ret).to.eql({id: 'a'})
  }
  {
    let payload = {
      name: 'AccountCache'
    }
    contract.resolvePayload(payload)
    let ret = await contract.invokePayload(payload)
    expect(ret).to.eql({id: 'a'})
  }
  ava.pass()
})

test('Contract.mock', async (ava) => {
  expect(Contract).to.be.a('function')
  let contract = new Contract({
    enableMock: true,
    mockFlow: true
  })
  let data = JSON5.parse(contractData)
  contract.load(data)
  contract.on('mockFlow', ({resolve, reject, payload, mocks}) => {
    if (payload.name === 'AccountSession') {
      let data = mocks[0].data
      data.flow = 1
      return resolve(data)
    }
    resolve(mocks[0].data)
  })
  {
    let payload = {
      name: 'AccountNomock'
    }
    contract.resolvePayload(payload)
    await (async () => {
      try {
        await contract.invokePayload(payload)
      } catch (err) {
        expect(err).to.be.a('error')
      }
    })()
  }
  {
    let payload = {
      name: 'AccountSession'
    }
    contract.resolvePayload(payload)
    let ret = await contract.invokePayload(payload)
    expect(ret.flow).to.eql(1)
  }
  ava.pass()
})
