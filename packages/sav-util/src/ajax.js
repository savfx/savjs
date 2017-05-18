import {parseUrl, stringifyUrl} from './url'
import {parseQuery, stringifyQuery} from './query'
import {probe} from './probe'
import {camelCase} from './convert'

/**
 * ajax 方法
 * @param  {Object}   opts 请求对象
 * {
 *     method:"GET",
 *     dataType:"JSON",
 *     headers:{},
 *     url:"",
 *     data:{},
 * }
 * @param  {Function} next 回调
 * @return {XMLHttpRequest}        xhr对象
 */
export function ajax (opts, next) {
  let method = (opts.method || 'GET').toUpperCase()
  let dataType = (opts.dataType || 'JSON').toUpperCase()
  let timeout = opts.timeout
  /* global XMLHttpRequest */
  let req = new XMLHttpRequest()
  let data = null
  let isPost = method === 'POST'
  let isGet = method === 'GET'
  let isFormData = false
  let emit = function (err, data, headers) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    req.onload = req.onreadystatechange = req.onerror = null
    if (next) {
      let tmp = next
      next = null
      tmp(err, data, headers)
    }
  }
  if (isGet) {
    if (opts.data) {
      let u = parseUrl(opts.url)
      let q = parseQuery(u.query)
      for (let x in opts.data) {
        q[x] = opts.data[x]
      }
      u.query = stringifyQuery(q)
      opts.url = stringifyUrl(u)
      opts.data = null
    }
  } else if (isPost) {
    data = opts.data
    /* global FormData */
    if (probe.FormData) {
      isFormData = data instanceof FormData
      if (!isFormData) {
        data = stringifyQuery(data)
      }
    }
  }
  if (timeout) {
    timeout = setTimeout(function () {
      req.abort()
      emit(new Error('error_timeout'))
    }, timeout)
  }
  try {
    opts.xhr && opts.xhr(req)
    if (dataType === 'BINARY') {
      req.responseType = 'arraybuffer'
    }
    req.open(method, opts.url, true)
    if (opts.headers) {
      for (let x in opts.headers) {
        req.setRequestHeader(x, opts.headers[x])
      }
    }
    if (isPost && !isFormData) {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }
    if (opts.headerOnly) {
      req.onreadystatechange = function () {
                // console.log('state', req.readyState, req);
        if (req.readyState === 2) { // HEADERS_RECEIVED
          let headers = parseHeaders(req.getAllResponseHeaders(), opts.camelHeaders)
          req.abort()
          emit(null, undefined, headers)
        }
      }
    }
    req.onload = function () {
            // if(req.readyState != 4) return;
      if ([
        200,
        304,
        206,
        0
      ].indexOf(req.status) === -1) { // error
        emit(new Error('error_status_' + req.status))
      } else {
        let data = req.response
        try {
          if (dataType === 'JSON') {
            data = JSON.parse(req.responseText)
          } else if (dataType === 'XML') {
            data = req.responseXML
          } else if (dataType === 'TEXT') {
            data = req.responseText
          } else if (dataType === 'BINARY') {
            let arrayBuffer = new Uint8Array(data)
            let str = ''
            for (let i = 0; i < arrayBuffer.length; i++) {
              str += String.fromCharCode(arrayBuffer[i])
            }
            data = str
          }
        } catch (err) {
          return emit(err)
        }
        emit(null, data, parseHeaders(req.getAllResponseHeaders(), opts.camelHeaders))
      }
    }
    req.onerror = function (e) {
      emit(new Error('error_network'))
    }
        // 进度
    if (opts.onprogress && !opts.headerOnly) {
      req.onloadend = req.onprogress = function (e) {
        let info = {
          total: e.total,
          loaded: e.loaded,
          percent: e.total ? Math.trunc(100 * e.loaded / e.total) : 0
        }
        if (e.type === 'loadend') {
          info.percent = 100
        } else if (e.total === e.loaded) {
          return
        }
        if (e.total < e.loaded) {
          info.total = info.loaded
        }
        if (info.percent === 0) {
          return
        }
        opts.onprogress(info)
      }
    }
    req.send(data)
  } catch (e) {
    emit(e)
  }
  return req
}

function parseHeaders (str, camelHeaders) {
  let ret = {}
  str.trim().split('\n').forEach(function (key) {
    key = key.replace(/\r/g, '')
    let arr = key.split(': ')
    let name = arr.shift().toLowerCase()
    ret[camelHeaders ? camelCase(name) : name] = arr.shift()
  })
  return ret
}
