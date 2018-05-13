import test from 'ava'
import {expect} from 'chai'

import {parse, match, compile} from '../src/Route.js'

const trustOpts = {
  sensitive: true,
  end: true,
  strict: true
}

const noStrictOpts = {
  sensitive: true,
  end: true,
  strict: false
}

test('regexp.match', t => {
  let route
  route = parse('a', trustOpts)
  expect(match(route, 'a')).to.eql(true)
  expect(match(route, '/a')).to.not.eql(true)
  expect(match(route, 'a/')).to.not.eql(true)

  route = parse('a', noStrictOpts)
  expect(match(route, 'a')).to.eql(true)
  expect(match(route, 'a/')).to.eql(true)
  expect(match(route, '/a')).to.not.eql(true)

  route = parse('/a', trustOpts)
  expect(match(route, '/a')).to.eql(true)
  expect(match(route, 'a')).to.not.eql(true)
  expect(match(route, 'a/')).to.not.eql(true)

  route = parse('a/', trustOpts)
  expect(match(route, 'a/')).to.eql(true)
  expect(match(route, 'a')).to.not.eql(true)
  expect(match(route, '/a')).to.not.eql(true)

  route = parse(':a', trustOpts)
  expect(match(route, 'a')).to.eql(true)
  expect(match(route, '/a')).to.not.eql(true)
  expect(match(route, 'a/')).to.not.eql(true)

  route = parse('/:a', trustOpts)
  expect(match(route, '/a')).to.eql(true)
  expect(match(route, 'a')).to.not.eql(true)
  expect(match(route, 'a/')).to.not.eql(true)

  route = parse(':a?', trustOpts)
  expect(match(route, 'a')).to.eql(true)
  expect(match(route, '')).to.eql(true)
  expect(match(route, '/a')).to.not.eql(true)
  expect(match(route, 'a/')).to.not.eql(true)

  route = parse(':a/:b?', trustOpts)
  expect(match(route, 'a')).to.eql(true)
  expect(match(route, 'a/b')).to.eql(true)
  expect(match(route, 'a/b/')).to.not.eql(true)
  expect(match(route, '/a/b/')).to.not.eql(true)

  route = parse(':a/:b', trustOpts)
  expect(match(route, 'a/b')).to.eql(true)
  expect(match(route, 'a/b/')).to.not.eql(true)
  expect(match(route, '/a/b/')).to.not.eql(true)

  route = parse(':a-:b', trustOpts)
  expect(match(route, 'a-b')).to.eql(true)
  expect(match(route, 'a-b/')).to.not.eql(true)
  expect(match(route, '/a-b')).to.not.eql(true)
  expect(match(route, '/a-b/')).to.not.eql(true)

  route = parse(':a-:b?', trustOpts)
  expect(match(route, 'a-b')).to.eql(true)
  expect(match(route, 'a-')).to.eql(true)
  expect(match(route, 'a')).to.not.eql(true)
  expect(match(route, 'a-b/')).to.not.eql(true)
  expect(match(route, '/a-')).to.not.eql(true)
  expect(match(route, '/a-b')).to.not.eql(true)
  expect(match(route, '/a-b/')).to.not.eql(true)

  route = parse(':a', {sensitive: true, end: false, strict: true})
  expect(match(route, 'a')).to.eql(true)
  expect(match(route, 'a/')).to.eql(true)
  expect(match(route, 'a/b')).to.eql(true)
  expect(match(route, '/a')).to.not.eql(true)

  route = parse('/home/:path?', {sensitive: true, end: true, strict: true})
  expect(match(route, '/home')).to.eql(true)
  expect(match(route, '/home/a')).to.eql(true)
  expect(match(route, '/HOME')).to.not.eql(true)
  expect(match(route, '/HOME/a')).to.not.eql(true)

  route = parse('/home/:path?', {sensitive: false, end: true, strict: true})
  expect(match(route, '/home')).to.eql(true)
  expect(match(route, '/home/a')).to.eql(true)
  expect(match(route, '/HOME')).to.eql(true)
  expect(match(route, '/HOME/a')).to.eql(true)

  {
    let params = {}
    expect(match(route, '/home', params)).to.eql(true)
    expect('path' in params).to.eql(false)
  }

  {
    let params = {}
    expect(match(route, '/home/path', params)).to.eql(true)
    expect(params.path).to.eql('path')
  }

  {
    let route = parse('/home/:path?')
    route.keys = []
    let params = {}
    expect(match(route, '/home/path', params)).to.eql(true)
    expect('path' in params).to.eql(false)
  }

  t.pass()
})

test('regexp.compile', t => {
  let make = compile('test')
  expect(make()).to.eql('test')

  make = compile('/test')
  expect(make()).to.eql('/test')

  make = compile(':a')
  expect(make({a: 1})).to.eql('1')
  expect(make({a: 's'})).to.eql('s')
  expect(make({a: 's b'})).to.eql('s%20b')
  expect(make({a: 's:b'})).to.eql('s%3Ab')
  expect(make({a: 's/b'})).to.eql('s%2Fb')
  expect(make({a: 's;b'})).to.eql('s%3Bb')
  expect(make({a: 's?b'})).to.eql('s%3Fb')
  expect(make({a: true})).to.eql('true')

  make = compile('/:a')
  expect(make({a: 1})).to.eql('/1')
  expect(make({a: 's'})).to.eql('/s')
  expect(make({a: 's b'})).to.eql('/s%20b')
  expect(make({a: true})).to.eql('/true')

  make = compile('/:a/:b')
  expect(make({a: 1, b: 2})).to.eql('/1/2')
  expect(make({a: 's', b: 'b'})).to.eql('/s/b')
  expect(make({a: 's b', b: 'c'})).to.eql('/s%20b/c')
  expect(make({a: true, b: false})).to.eql('/true/false')

  make = compile('/:a?')
  expect(make()).to.eql('')
  expect(make({a: 1})).to.eql('/1')
  expect(make({a: 's'})).to.eql('/s')
  expect(make({a: 's b'})).to.eql('/s%20b')
  expect(make({a: true})).to.eql('/true')

  make = compile('/:a/:b?')
  expect(make({a: 1})).to.eql('/1')
  expect(make({a: 1, b: 2})).to.eql('/1/2')
  expect(make({a: 's', b: 'b'})).to.eql('/s/b')
  expect(make({a: 's b', b: 'c'})).to.eql('/s%20b/c')
  expect(make({a: true, b: false})).to.eql('/true/false')

  expect(() => make()).to.throw()

  let route = parse('/home/:path?', trustOpts)
  make = compile(route.tokens)
  expect(make()).to.eql('/home')
  expect(make({path: 1})).to.eql('/home/1')

  t.pass()
})
