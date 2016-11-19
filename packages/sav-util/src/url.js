/*
 * @Description      URL解析
 * @File             url.js
 * @Auth             jetiny@hfjy.com
 */

// jsuri https://code.google.com/r/jonhwendell-jsuri/
// https://username:password@www.test.com:8080/path/index.html?this=that&some=thing#content
const REKeys = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor']
const URL_RE = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/

export function parseUrl (str) {
  let _uri = {}
  let _m = URL_RE.exec(str || '')
  let _i = REKeys.length
  while (_i--) {
    _uri[REKeys[_i]] = _m[_i] || ''
  }
  return _uri
}

export function stringifyUrl (uri) {
  let str = ''
  if (uri) {
    if (uri.host) {
      if (uri.protocol) str += uri.protocol + ':'
      str += '//'
      if (uri.user) str += uri.user + ':'
      if (uri.password)(str += uri.password + '@')
      str += uri.host
      if (uri.port) str += ':' + uri.port
    }
    str += uri.path || ''
    if (uri.query) str += '?' + uri.query
    if (uri.anchor) str += '#' + uri.anchor
  }
  return str
}

export const Url = {
  parse: parseUrl,
  stringify: stringifyUrl
}
