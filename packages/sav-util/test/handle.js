import test from 'ava'
import {expect} from 'chai'
import {HandlePromise} from '../src/handle.js'

test('api', async (ava) => {
  expect(HandlePromise).to.be.a('function')
})

test('HandlePromise.constructor', async (ava) => {
  new HandlePromise((resolve, reject) => {
    resolve(1)
  }).then((a) => {
    expect(a).to.eql(1)
  })
  new HandlePromise(Promise.resolve(1)).then((a) => {
    expect(a).to.eql(1)
  })
  new HandlePromise(1).then((a) => {
    expect(a).to.eql(1)
  })
})

test('HandlePromise', async (ava) => {
  let p = new HandlePromise(Promise.resolve(1))
  let p1 = p.then((a) => {
    expect(a).to.eql(1)
    return a++
  }).then((a) => {
    expect(a).to.eql(2)
    return a++
  }).then((a) => {
    expect(a).to.eql(2)
    throw a
  }, (a) => {
    expect(a).to.eql(2)
    return a++
  }).then((a) => {
    expect(a).to.eql(3)
  }).catch(a => {
    return a++
  }).then((a) => {
    expect(a).to.eql(4)
    return a++
  }).then((a) => {
    expect(a).to.eql(5)
    Promise.resolve().then(() => {
      expect(p.error).to.eql(a)
    })
    throw a
  })
  expect(p1).to.eql(p)
})

test('Promise.mix', async (ava) => {
  return Promise.all([
    new HandlePromise(1),
    new HandlePromise(2)
  ]).then((res) => {
    console.log(res)
  })
})
