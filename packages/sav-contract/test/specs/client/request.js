import test from 'ava'
import {expect} from 'chai'

import {Request} from '../../../client/Request.js'
import {RESPONSE} from '../../../client/events.js'

test('Request', async (t) => {
  expect(Request).to.be.a('function')
  let opts = {
    ajax (req, callback) {
      setTimeout(callback(null, {id: 'a'}))
    }
  }
  let request = new Request(opts)
  request.insert((ctx, next) => {
    return next()
  })
  request.append((ctx, next) => {
    return next()
  })
  let res = await request.request()
  expect(res).to.eql({id: 'a'})

  res = await request.request({
    stripHeaders: true
  })
  expect(res).to.eql({id: 'a'})

  request.on(RESPONSE, function (ctx) {
    throw new Error('xxx')
  })
  await request.request().then(t.fail.bind(t), t.pass.bind(t))

  opts.ajax = (req, callback) => {
    setTimeout(callback(new Error('xxx')))
  }

  await request.request({
    stripHeaders: true,
    url: 'https://xxx.xxx'
  }).then(t.fail.bind(t), t.pass.bind(t))

  t.pass()
})
