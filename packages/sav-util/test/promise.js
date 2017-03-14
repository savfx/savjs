import test from 'ava'
import { toPromise, isFunction, isObject, isPromiseLike } from '../src'

test('toPromise', (ava) => {
  ava.true(isFunction(toPromise))
  let store = {}
  let storage = {
    get (key) {
      let data = store[key]
      switch (data) {
        case 'null':
          return null
        case 'undefined':
          return undefined
        default:
          return JSON.parse(data)
      }
    },
    set (key, value) {
      store[key] = JSON.stringify(value)
    }
  }
  let asyncStorage = toPromise(storage, ['get', 'set'])
  ava.true(isObject(asyncStorage))
  ava.true(isPromiseLike(asyncStorage.set('a', 'b').then(() => {
    ava.true(isPromiseLike(asyncStorage.get('a').then((ret) => {
      ava.true(ret === 'b')
    })))
  })))
})
