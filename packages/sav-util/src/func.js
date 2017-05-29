export function unique (arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.')
  }
  let len = arr.length
  let i = -1
  while (i++ < len) {
    let j = i + 1
    for (; j < arr.length; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1)
      }
    }
  }
  return arr
}

export function isPromiseLike (obj) {
  return !!(obj && obj.then)
}

export function uuid () {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

export function guid () {
  return new Date().getTime().toString(32) + Math.floor(Math.random() * 10000000000).toString(32) + s4()
}

export function shortId () {
  let a = Math.random() + new Date().getTime()
  return a.toString(16).replace('.', '')
}

function s4 () {
  return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
}

export function inherits (ctor, SuperCtor, useSuper) {
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ctor.prototype, SuperCtor.prototype)
  } else {
    ctor.prototype = new SuperCtor()
    ctor.prototype.constructor = SuperCtor
  }
  if (useSuper) {
    ctor.super_ = SuperCtor
  }
  return ctor
}

export function strRepeat (s, n) {
  return new Array(Math.max(n || 0, 0) + 1).join(s)
}

export function noop () {

}

export function splitEach (str, callback, chr, context) {
  return str.split(chr || ' ').forEach(callback, context)
}

export function proxy (fn, context) {
  return function () {
    fn.apply(context, arguments)
  }
}

export function formatDate (fmt, date) {
  if (!fmt) fmt = 'yyyy-MM-dd'
  if (!date) {
    date = new Date()
  } else {
    date = new Date(date)
  }
  let o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}
