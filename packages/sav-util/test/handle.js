import test from 'ava'
import {expect} from 'chai'
import {HandlePromise} from '../src/handle.js'

test('HandlePromise.constructor', async (t) => {
  await new HandlePromise((resolve, reject) => {
    resolve(1)
  }).then((a) => {
    expect(a).to.eql(1)
  })
  await new HandlePromise(Promise.resolve(1)).then((a) => {
    expect(a).to.eql(1)
  })
  await new HandlePromise(1).then((a) => {
    expect(a).to.eql(1)
  })
  t.pass()
})

test('HandlePromise', async (t) => {
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
  }).then(async (a) => {
    expect(a).to.eql(5)
    await Promise.resolve().then(() => {
      expect(p.error).to.eql(a)
    })
    throw a
  })
  expect(p1).to.eql(p)
  t.pass()
})
