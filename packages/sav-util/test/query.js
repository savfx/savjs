import test from 'ava'
import expect from 'expect.js'
import { Query } from '../src'

test('Query.stringify & Query.parse', () => {
  let item, val

  item = {'foo': 'bar', 'baz': 42, 'quux': 'All your base are belong to us'}
  expect(val = Query.stringify(item)).to.be('foo=bar&baz=42&quux=All+your+base+are+belong+to+us')
  expect(Query.parse(val)).to.eql(item)

  item = {'string': 'foo', 'null': null, 'undefined': undefined}
  expect(val = Query.stringify(item)).to.be('string=foo&null=&undefined=')

  item = {'string': 'foo', 'null': '', 'undefined': ''}
  expect(Query.parse(val)).to.eql(item)

  item = { 'someName': [4, 2, 3], 'regularThing': 'blah' }
  expect(val = Query.stringify(item)).to.be('someName%5B%5D=4&someName%5B%5D=2&someName%5B%5D=3&regularThing=blah')
  expect(Query.parse(val)).to.eql(item)

  item = {'foo': ['a', 'b', 'c']}
  expect(val = Query.stringify(item)).to.be('foo%5B%5D=a&foo%5B%5D=b&foo%5B%5D=c')
  expect(Query.parse(val)).to.eql(item)

  item = { 'foo': ['baz', 42, 'All your base are belong to us'] }
  expect(val = Query.stringify(item)).to.be('foo%5B%5D=baz&foo%5B%5D=42&foo%5B%5D=All+your+base+are+belong+to+us')
  expect(Query.parse(val)).to.eql(item)

  item = { 'foo': { 'bar': 'baz', 'beep': 42, 'quux': 'All your base are belong to us' } }
  expect(val = Query.stringify(item)).to.be('foo%5Bbar%5D=baz&foo%5Bbeep%5D=42&foo%5Bquux%5D=All+your+base+are+belong+to+us')
  expect(Query.parse(val)).to.eql(item)

  item = { 'a': [ 0, [ 1, 2 ], [ 3, [ 4, 5 ], [ 6 ] ], { 'b': [ 7, [ 8, 9 ], [ { 'c': 10, 'd': 11 } ], [ [ 12 ] ], [ [ [ 13 ] ] ], { 'e': { 'f': { 'g': [ 14, [ 15 ] ] } } }, 16 ] }, 17 ] }
  expect(decodeURIComponent(val = Query.stringify(item))).to.be('a[]=0&a[1][]=1&a[1][]=2&a[2][]=3&a[2][1][]=4&a[2][1][]=5&a[2][2][]=6&a[3][b][]=7&a[3][b][1][]=8&a[3][b][1][]=9&a[3][b][2][0][c]=10&a[3][b][2][0][d]=11&a[3][b][3][0][]=12&a[3][b][4][0][0][]=13&a[3][b][5][e][f][g][]=14&a[3][b][5][e][f][g][1][]=15&a[3][b][]=16&a[]=17')
  expect(Query.parse(val)).to.eql(item)

  item = { a: [1, 2], b: { c: 3, d: [4, 5], e: { x: [6], y: 7, z: [8, 9] }, f: true, g: false, h: undefined }, i: [10, 11], j: true, k: false, l: [undefined, 0], m: 'cowboy hat?' }
  expect(decodeURIComponent(val = Query.stringify(item))).to.be('a[]=1&a[]=2&b[c]=3&b[d][]=4&b[d][]=5&b[e][x][]=6&b[e][y]=7&b[e][z][]=8&b[e][z][]=9&b[f]=true&b[g]=false&b[h]=&i[]=10&i[]=11&j=true&k=false&l[]=&l[]=0&m=cowboy+hat?')
  item = { a: [1, 2], b: { c: 3, d: [4, 5], e: { x: [6], y: 7, z: [8, 9] }, f: 'true', g: 'false', h: '' }, i: [10, 11], j: 'true', k: 'false', l: ['', 0], m: 'cowboy hat?' }
  expect(Query.parse(val)).to.eql(item)

  item = { 'a': [1, 2, 3], 'b[]': [4, 5, 6], 'c[d]': [7, 8, 9], 'e': { 'f': [10], 'g': [11, 12], 'h': 13 } }
  expect(decodeURIComponent(val = Query.stringify(item))).to.be('a[]=1&a[]=2&a[]=3&b[]=4&b[]=5&b[]=6&c[d][]=7&c[d][]=8&c[d][]=9&e[f][]=10&e[g][]=11&e[g][]=12&e[h]=13')
  item = { 'a': [1, 2, 3], 'b': [4, 5, 6], 'c': {'d': [7, 8, 9]}, 'e': { 'f': [10], 'g': [11, 12], 'h': 13 } }
  expect(Query.parse(val)).to.eql(item)
})

test('Query.parse spec', () => {
  let item, val
  item = { 'bool': [true, false, 0, 1, -2] }
  expect(decodeURIComponent(val = Query.stringify(item))).to.be('bool[]=true&bool[]=false&bool[]=0&bool[]=1&bool[]=-2')
  expect(Query.parse(val, {boolval: true, intval: true})).to.eql(item)
})
