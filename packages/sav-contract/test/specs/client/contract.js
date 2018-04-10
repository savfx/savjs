import test from 'ava'
import {expect} from 'chai'
import {Flux} from 'sav-flux'

import {Contract} from '../../../client/Contract.js'
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
    {
      name: 'Sex',
      enums: [
        {key: 'male', value: 1},
        {key: 'female', value: 2},
      ]
    }
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
    },
    {
      modalName: 'Account',
      actionName: 'cache',
      data: {id: 'b'}
    },
    {
      modalName: 'Account',
      actionName: 'cache',
      req: true,
      data: {id: 'a'}
    }
  ]
}`

test('Contract.invokePayload', async (ava) => {
  let contract = new Contract({
    enableMock: true
  })
  contract.load(JSON5.parse(contractData))
  expect(contract.projectName).to.eql('test')

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

  payload = {name: 'AccountLogin', merge: true, query: {username: 's'}}
  contract.resolvePayload(payload, {query: {password: 'b'}})
  expect(payload.query).to.eql({
    username: 's',
    password: 'b'
  })
  await contract.invokePayload(payload)
  expect(payload.output).to.eql({id: 'a'})

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

  // 解析Schema, merge
  payload = {
    name: 'ReqAccountLogin',
    merge: true,
    params: {a: 1},
    query: {b: 2}
  }
  contract.resolvePayload(payload, {
    params: {c: 3},
    query: {d: 4}
  })
  expect(payload.state).to.eql({
    ReqAccountLogin: {
      username: '',
      password: '',
      confirmPassword: '',
      a: 1,
      b: 2,
      c: 3,
      d: 4
    }
  })

  // 解析枚举Schema
  payload = {
    name: 'Sex'
  }
  contract.resolvePayload(payload)
  expect(payload.state.Sex).to.be.a('array')

  // console.log(contract)
  ava.pass()
})

test('Contract.mapState', async (ava) => {
  let contract = new Contract({
    enableMock: true
  })
  let data = JSON5.parse(contractData)

  contract.load(data)
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
  let contract = new Contract({
    enableMock: true
  })
  let data = JSON5.parse(contractData)

  contract.load(data)
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

test('Contract.flux', async (ava) => {
  let contract = new Contract({
    enableMock: true,
    contract: JSON5.parse(contractData)
  })
  let flux = new Flux()
  contract.injectFlux(flux, true)
  let exists = [
    'CheckResAccountLogin',
    'ExtractResAccountLogin',
    'PostAccountLogin',
    'PostAccountLoginData'
  ]
  exists.forEach((it) => {
    expect(flux.actions[it]).to.be.a('function')
  })
  expect(await flux.dispatch.CheckResAccountLogin({id: 's'}))
    .to.eql({id: 's'})
  let req = {
    username: 'x',
    password: 'b',
    some: 'c'
  }
  expect(await flux.dispatch.CheckReqAccountLogin(req))
    .to.eql(req)
  expect(await flux.dispatch.ExtractResAccountLogin({id: 's', s: 'b'}))
    .to.eql({id: 's'})
  expect(await flux.dispatch.ExtractReqAccountLogin(req))
    .to.eql({
      username: 'x',
      password: 'b'
    })

  await flux.dispatch.PostAccountLoginData({
    username: 's',
    password: 'b'
  })
  expect(flux.state.ResAccountLogin).to.eql({id: 'a'})
  flux.updateState({ResAccountLogin: null})
  await flux.dispatch.PostAccountLogin({
    data: {
      username: 's',
      password: 'b'
    }
  })

  await (async () => {
    try {
      await flux.dispatch.PostAccountLoginData()
    } catch (err) {
      expect(err).to.be.a('error')
    }
  })()

  expect(flux.state.ResAccountLogin).to.eql({id: 'a'})
  flux.updateState({ResAccountLogin: null})
  let res = await flux.dispatch.PostAccountLoginData({
    username: 's',
    password: 'b'
  }, true)
  expect(res).to.eql({ResAccountLogin: {id: 'a'}})
  expect(flux.state.ResAccountLogin).to.eql(null)
  ava.pass()
})
