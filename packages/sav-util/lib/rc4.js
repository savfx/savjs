// arcfour aka RC4 enc/decrypt function
// see: http://en.wikipedia.org/wiki/RC4
// https://gist.github.com/jetiny/14262af4fa42ad68f99415b4d975092f

function swap (a, i, j) {
  let tmp = a[i]
  a[i] = a[j]
  a[j] = tmp
}

function ksa (key) {
  let buf = []
  for (let i = 0; i < 256; i++) {
    buf[i] = i
  }
  let j = 0
  for (let i = 0; i < 256; i++) {
    j = (j + buf[i] + key[i % key.length]) % 256
    swap(buf, i, j)
  }
  return buf
}

function prga (buf) {
  let i = 0
  let j = 0
  return function () {
    i = (i + 1) % 256
    j = (j + buf[i]) % 256
    swap(buf, i, j)
    return buf[(buf[i] + buf[j]) % 256]
  }
}

function rc4 (data, key) {
  let keybuf = ksa(key)
  let keygen = prga(keybuf)
  let result = []
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ keygen()
  }
  return result
}

function fromCharCode (code) {
  if (code <= 0x7F) return [code]
  let tail = []
  let hmask = 0x02
  while (code > 0x3F) {
    tail.unshift(0x80 | (0x3F & code))
    code = code >> 6
    hmask = (hmask | 0x01) << 1
  }
  return [hmask << (6 - tail.length) | code].concat(tail)
}

function toCharCode (buf) {
  let h = buf.shift()
  if ((0x80 & h) === 0) return h
  let code = 0
  let shift = 0
  let mask = 0x3F
  while ((0x80 & (h << (shift + 1))) !== 0) {
    code = (code << 6) | (0x3F & buf.shift())
    shift += 1
    mask = mask >> 1
  }
  return ((h & mask) << (6 * shift)) | code
}

function toBytes (text) {
  let result = []
  for (let i = 0; i < text.length; i++) {
    result = result.concat(fromCharCode(text.charCodeAt(i)))
  }
  return result
}

function toText (bytes) {
  bytes = bytes.slice()
  let result = ''
  while (bytes.length > 0) {
    result += String.fromCharCode(toCharCode(bytes))
  }
  return result
}

function toHex (arr) {
  let result = []
  for (let i = 0; i < arr.length; i++) {
    let it = arr[i].toString(16)
    if (it.length === 1) {
      it = '0' + it
    }
    result.push(it)
  }
  return result.join('').toLowerCase()
}

function fromHex (hex) {
  let result = []
  for (let i = 0; i < hex.length / 2; i++) {
    result.push(parseInt(hex[i * 2] + hex[1 + i * 2], 16))
  }
  return result
}

export function encode (data, key) {
  return toHex(rc4(toBytes(data), toBytes(key)))
}

export function decode (data, key) {
  return toText(rc4(fromHex(data), toBytes(key)))
}

// console.log(toBytes('YZ'), toHex(toBytes('YZ')), fromHex(toHex(toBytes('YZ'))));
// console.log(toBytes('你好mme密码'),
//     toHex(toBytes('你好mme密码')),
//     fromHex(toHex(toBytes('你好mme密码'))),
//     toText(fromHex(toHex(toBytes('你好mme密码'))))
//     );

// let key = '123456789';
// let str = exports.encode(`你好mme密码@@#￥%……&*（）——+
//     得瑟我问问我的ζζοχωρπ
//     `, key);
// console.log(str, exports.decode(str, key));
