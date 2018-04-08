import {isObject} from './type'

const _encode = encodeURIComponent
const r20 = /%20/g
const rbracket = /\[]$/

function buildParams (prefix, obj, add) {
  if (Array.isArray(obj)) {
    // Serialize array item.
    obj.forEach(function (v, i) {
      if (rbracket.test(prefix)) {
        // Treat each array item as a scalar.
        add(prefix, v)
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, add)
      }
    })
  } else if (isObject(obj)) {
    // Serialize object item.
    for (let name in obj) {
      buildParams(prefix + '[' + name + ']', obj[name], add)
    }
  } else {
    // Serialize scalar item.
    add(prefix, obj)
  }
}

// # http://stackoverflow.com/questions/1131630/the-param-inverse-function-in-javascript-jquery
// a[b]=1&a[c]=2&d[]=3&d[]=4&d[2][e]=5 <=> { a: { b: 1, c: 2 }, d: [ 3, 4, { e: 5 } ] }
export function parseQuery (str, opts = {}) {
  let _querys = {}
  decodeURIComponent(str || '')
    .replace(/\+/g, ' ')
  // (optional no-capturing & )(key)=(value)
    .replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, _name, _value) {
      if (_name) {
        let _path, _acc, _tmp, _ref;
        (_path = []).unshift(_name = _name.replace(/\[([^\]]*)]/g, function ($0, _k) {
          _path.push(_k)
          return ''
        }))
        _ref = _querys
        for (let j = 0; j < _path.length - 1; j++) {
          _acc = _path[j]
          _tmp = _path[j + 1]
          if (!_ref[_acc]) {
            _ref[_acc] = ((_tmp === '') || (/^[0-9]+$/.test(_tmp))) ? [] : {}
          }
          _ref = _ref[_acc]
        }
        if (opts.boolval) { // first
          if (_value === 'true') {
            _value = true
          } else if (_value === 'false') {
            _value = false
          }
        } else if (opts.intval) { // skip "true" & "false"
          if ((_tmp = parseInt(_value) === _value)) {
            _value = _tmp
          }
        }
        if ((_acc = _path[_path.length - 1]) === '') {
          _ref.push(_value)
        } else {
          _ref[_acc] = _value
        }
      }
    })
  return _querys
}

export function stringifyQuery (query) {
  // # http://api.jquery.com/jQuery.param
  let _add = (key, value) => {
    /* jshint eqnull:true */
    _str.push(_encode(key) + '=' + ((value === null || value === undefined) ? '' : _encode(value)))
    // _str.push(( key ) + "=" +  (value == null ? "" : ( value )));
  }
  let _str = []
  query || (query = {})
  for (let x in query) {
    buildParams(x, query[x], _add)
  }
  return _str.join('&').replace(r20, '+')
}

export const Query = {
  parse: parseQuery,
  stringify: stringifyQuery
}
