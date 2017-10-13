import test from 'ava'
import {expect} from 'chai'
import schema from '../lib'
// import SchemaArray from '../lib/SchemaArray.js'

function unreached () {
  throw new Error('can not be reached')
}

function reached () {
}

test('SchemaArray.Number', ava => {
  let Users = schema.declare({
    array: Number,
    name: 'Users',
    optional: true,
    nullable: true,
    message: 'invalidate users'
  })
  expect(Users.name).to.eql('Users')
  expect(Users.create()).to.eql([])
  expect(Users.create([1, '2'])).to.eql([1, 2])
  Users.check()
  Users.check(null)
  Users.check([1])
  Users.check([1, '2'])
  Users.checkThen([{a: 1}]).then(unreached, reached)
  Users.checkThen({}).then(unreached, reached)
  Users.checkThen('x').then(unreached, reached)
  Users.checkThen([[1]]).then(unreached, reached)
  Users.extractThen([2, 3]).then(reached, unreached)
  Users.extractThen([[1]]).then(unreached, reached)
})

test('SchemaArray.Struct.Ref', ava => {
  let loop = (Users) => {
    expect(Users.create()).to.eql([])
    expect(Users.create([[1], ['2']])).to.eql([[1], [2]])
    Users.check([[1]])
    Users.check([[1], ['2']])
    Users.checkThen([1, 2]).then(unreached, reached)
    Users.checkThen([{a: 1}]).then(unreached, reached)
    Users.checkThen({}).then(unreached, reached)
    Users.checkThen('x').then(unreached, reached)
    Users.checkThen([[1]]).then(reached, unreached)
    Users.extractThen([[1]]).then(reached, unreached)
    Users.extractThen([2, 3]).then(unreached, reached)
  }
  loop(schema.declare({
    array: {
      array: Number
    }
  }))
  loop(schema.declare({
    array: 'User',
    refs: {
      User: {
        array: Number
      },
      Something: {
        export: true,
        array: String
      }
    }
  }))
})

test('SchemaArray.delay', ava => {
  let Users = schema.declare({
    array: 'Delay'
  })
  schema.declare({
    name: 'Delay',
    props: {
      id: Number
    }
  })
  schema.ready(() => {
    Users.checkThen([{id: 1}]).then(reached, (err) => console.log(err))
  })
})
