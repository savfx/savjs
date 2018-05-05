
export function parse (path, opts = {}) {
  let {sensitive, end, strict} = opts
  let tokens = parseToken(path)
  let route = ''
  let keys = []
  tokens.forEach((token, index) => {
    if (token.text) {
      route += escapeString(token.text)
    } else {
      if (token.prefix) {
        if (token.optional) {
          route += '(?:/)?(?:([^/]+?))?'
        } else {
          route += '(?:/)(?:([^/]+?))'
        }
      } else {
        route += '(?:([^/]+?))'
        if (token.optional) {
          route += '?'
        }
      }
      keys.push(token.name)
    }
  })
  if (!strict) {
    route += '\\/?'
  }
  route += end ? '$' : '(?=/|$)'
  return {
    tokens,
    keys,
    regexp: new RegExp('^' + route, sensitive ? '' : 'i')
  }
}

export function match (route, path, params) {
  let mat = path.match(route.regexp)
  if (mat) {
    if (params) {
      for (let i = 1, len = mat.length; i < len; ++i) {
        const key = route.keys[i - 1]
        if (key && mat[i]) {
          params[key] = decodeURIComponent(mat[i])
        }
      }
    }
    return true
  }
}

export function complie (path) {
  let tokens = Array.isArray(path) ? path : parseToken(path)
  return (params = {}) => {
    let path = ''
    tokens.forEach(token => {
      if (token.text) {
        path += token.text
        return
      }
      let exists = (token.name in params)
      if (!exists) {
        if (token.optional) {
          return
        }
        throw new TypeError('Expected "' + token.name + '" to not be empty')
      }
      let val = String(params[token.name])
      val = encodeURIComponent(val)
      val = ((token.prefix && '/') || '') + val
      path += val
    })
    return path
  }
}

function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}

const RE_TOKEN = /((\/)?:(\w+)(\?)?)/g

function parseToken (path) {
  let mat = RE_TOKEN.exec(path)
  let pos = 0
  let parts = []
  while (mat) {
    // /:id?
    // [ '/:id', ':id', '/', 'id', '?', index: 5, input: 'user/:id' ]
    let len = mat[0].length // :id
    let prefix = !!mat[2]
    let name = mat[3] // id
    let optional = !!mat[4] // ?
    let offset = mat.index // 5
    if (pos < offset) {
      parts.push({text: path.substring(pos, offset)})
    }
    parts.push({
      // text
      name,
      optional,
      prefix
    })
    pos = offset + len
    mat = RE_TOKEN.exec(path)
  }
  if (pos < path.length) {
    parts.push({text: path.substring(pos, path.length)})
  }
  return parts
}
