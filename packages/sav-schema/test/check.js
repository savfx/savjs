import test from 'ava'
import {expect} from 'chai'
import schema, {registerCheck} from '../src'
import {SchemaNoRuleError, SchemaCheckedError, SchemaInvalidRegexpError} from '../src/SchemaError.js'

test('check.registerCheck', ava => {
  registerCheck('isBaby', (value) => {
    return value >= 0 && value <= 6
  })
  let UserInfo = schema.declare({
    props: {
      age: {
        type: Number,
        checkes: [
          ['isBaby']
        ]
      }
    }
  })
  {
    let exp
    try {
      UserInfo.check({age: 300})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('age')
      expect(err.rule).to.eql('isBaby')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }
})

test('check.SchemaNoRuleError', ava => {
  let UserInfo = schema.declare({
    props: {
      age: {
        type: Number,
        checkes: [
          ['noexists']
        ]
      }
    }
  })
  {
    let exp
    try {
      UserInfo.check({age: 300})
    } catch (err) {
      exp = err
      expect(err.rule).to.eql('noexists')
    } finally {
      expect(exp instanceof SchemaNoRuleError).to.eql(true)
    }
  }
})

test('check.Number', ava => {
  let UserInfo = schema.declare({
    props: {
      age: {
        type: Number,
        checkes: [
          ['gt', 0],
          ['lt', 200],
          ['gte', 2],
          ['lte', 198]
        ]
      }
    }
  })

  UserInfo.check({age: 30})

  {
    let exp
    try {
      UserInfo.check({age: -1})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('age')
      expect(err.rule).to.eql('gt')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({age: 1})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('age')
      expect(err.rule).to.eql('gte')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({age: 300})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('age')
      expect(err.rule).to.eql('lt')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({age: 199})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('age')
      expect(err.rule).to.eql('lte')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }
})

test('check.in', ava => {
  let UserInfo = schema.declare({
    props: {
      sex: {
        type: String,
        checkes: [
          ['in', 'male', 'female'],
          ['nin', 'female', 'unknown']
        ]
      }
    }
  })

  UserInfo.check({sex: 'male'})

  {
    let exp
    try {
      UserInfo.check({sex: 'no'})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('sex')
      expect(err.rule).to.eql('in')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({sex: 'female'})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('sex')
      expect(err.rule).to.eql('nin')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }
})

test('check.Length', ava => {
  let UserInfo = schema.declare({
    props: {
      userName: {
        type: String,
        checkes: [
          ['lgt', 0],
          ['llt', 10],
          ['lgte', 2],
          ['llte', 8]
        ]
      }
    }
  })

  UserInfo.check({userName: 'jetiny'})

  {
    let exp
    try {
      UserInfo.check({userName: ''})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('userName')
      expect(err.rule).to.eql('lgt')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({userName: '1'})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('userName')
      expect(err.rule).to.eql('lgte')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({userName: '1234567890'})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('userName')
      expect(err.rule).to.eql('llt')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({userName: '123456789'})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('userName')
      expect(err.rule).to.eql('llte')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }
})

test('check.regexp', ava => {
  let UserInfo = schema.declare({
    props: {
      userName: {
        type: String,
        checkes: [
          ['re', '\\w+'],
          ['re', /\w+/],
          ['re', '/^[a-z]+/i'], // a-z ignore case
          ['re', '/^[a-z]+/'],  // a-z only
          ['re', '/\\']  // invalid regexp
        ]
      }
    }
  })
  {
    let exp
    try {
      UserInfo.check({userName: ''})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('userName')
      expect(err.rule).to.eql('re')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }
  {
    let exp
    try {
      UserInfo.check({userName: '1s'})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('userName')
      expect(err.rule).to.eql('re')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }
  {
    let exp
    try {
      UserInfo.check({userName: 'Abc'})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('userName')
      expect(err.rule).to.eql('re')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }
  {
    let exp
    try {
      UserInfo.check({userName: 'abc'})
    } catch (err) {
      exp = err
      expect(err.field).to.eql(undefined)
      expect(err.regexp).to.eql('/\\')
    } finally {
      expect(exp instanceof SchemaInvalidRegexpError).to.eql(true)
    }
  }
})

test('check.math', ava => {
  let UserInfo = schema.declare({
    props: {
      age: {
        type: Number,
        checkes: [
          ['>', 0],
          ['<', 200],
          ['>=', 2],
          ['<=', 198]
        ]
      }
    }
  })

  UserInfo.check({age: 30})

  {
    let exp
    try {
      UserInfo.check({age: -1})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('age')
      expect(err.rule).to.eql('>')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({age: 1})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('age')
      expect(err.rule).to.eql('>=')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({age: 300})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('age')
      expect(err.rule).to.eql('<')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }

  {
    let exp
    try {
      UserInfo.check({age: 199})
    } catch (err) {
      exp = err
      expect(err.field).to.eql('age')
      expect(err.rule).to.eql('<=')
    } finally {
      expect(exp instanceof SchemaCheckedError).to.eql(true)
    }
  }
})
