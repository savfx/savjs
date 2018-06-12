import test from 'ava'
import {expect} from 'chai'

import {createEnumBody} from '../../../src/writers/go/enumFactory.js'
import {createStructBody} from '../../../src/writers/go/structFactory.js'
import {createListBody} from '../../../src/writers/go/listFactory.js'
import {createReferBody} from '../../../src/writers/go/referFactory.js'
import {Context} from '../../../src/writers/go/Context.js'

test('contract_go', async (ava) => {
  let res = []
  let ctx = new Context()
  let opts = {
  	keyType: 'string',
  	valType: 'int',
  	defaultIntType: 'int',
  	ctx
  }
  let Sex = {
  	name: 'Sex',
  	enums: [
  	  {key: 'male', value: 1, title: '男'},
  	  {key: 'female', value: 2, title: '女'}
  	]
  }
  ctx.addRef(Sex)
  let text = createEnumBody(Sex, opts)
  res.push(text)

  let User = {
  	name: 'User',
  	props: {
  		name: 'String',
  		age: {
  			name: 'age',
  			title: '年龄',
  			type: 'Integer'
  		},
  		sex: 'Sex'
  	}
  }
  ctx.addRef(User)
  let structText = createStructBody(User, opts)
  res.push(structText)

  let UserList = {
  	name: 'UserList',
  	list: 'User'
  }
  ctx.addRef(UserList)
  let listText = createListBody(UserList, opts)
  res.push(listText)

  res.push(createListBody({
  	name: 'StringList',
  	list: 'String'
  }, opts))

  res.push(createListBody({
  	name: 'SexList',
  	list: 'Sex'
  }, opts))

  res.push(createListBody({
  	name: 'Users',
  	list: 'UserList'
  }, opts))

  res.push(createReferBody({
  	name: 'ReqUserInfo',
  	refer: 'User'
  }, opts))

  expect('text').to.be.a('string')
  ava.pass()
})
