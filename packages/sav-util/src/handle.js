import {isFunction, isPromise} from './type.js'

export class HandlePromise {
  constructor (p) {
    this.nexts = []
    if (isFunction(p)) {
      p = new Promise(p)
    } else if (!isPromise(p)) {
      p = Promise.resolve(p)
    }
    this.next = p.then(handleResolve.bind(this), handleReject.bind(this))
  }
  then (resolve, reject) {
    this.nexts.push({resolve, reject})
    return this
  }
  catch (reject) {
    this.nexts.push({reject})
    return this
  }
  finally (fn) {
    this.onFinally = fn
  }
}

function handleResolve (ret) {
  let it = this.nexts.shift()
  if (it) {
    let {resolve, reject} = it
    if (resolve) {
      this.next = this.next.then(resolve, reject)
        .catch(handleReject.bind(this))
        .then(handleResolve.bind(this))
    }
  } else {
    if (this.onFinally) {
      this.nexts = []
      this.onFinally()
    }
  }
}

function handleReject (err) {
  this.error = err
  if (this.onFinally) {
    this.nexts = []
    this.onFinally(this.error)
  }
}
