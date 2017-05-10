import test from 'ava'
import {expect} from 'chai'

import {Schema} from '../src/Schema.js'

test('Schema.api', ava => {
  expect(Schema.register).to.be.a('function')
  Schema.register({
    name: 'Age',
    default: Number
  })

  let schema = new Schema()

  expect(schema.String).to.be.a('object')
  expect(schema.Number).to.be.a('object')
  expect(schema.Boolean).to.be.a('object')
  expect(schema.Int).to.be.a('object')
  expect(schema.Uint).to.be.a('object')
  expect(schema.Array).to.be.a('object')
  expect(schema.Object).to.be.a('object')

  expect(schema.Age).to.be.a('object')
  schema.declare({
    name: 'Sex',
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  })
  expect(schema.Sex).to.be.a('object')

  let UserInfo = schema.declare({
    props: {
      userName: 'String|minLength,2|maxLength,5',
      test: 'Number|isBaby,true,0.21,1,on,off,false,hehe',
      profile: 'UserProfile|@optional|@comment:用户信息',
      parent: {
        type: {
          name: 'UserParent',
          props: {
            uid: Number,
            uname: String
          }
        },
        optional: true
      }
    },
    refs: {
      UserProfile: {
        export: true,
        props: {
          sex: 'Sex',
          age: 'Age'
        }
      }
    }
  })
  expect(UserInfo).to.be.a('object')
  expect(schema.UserInfo).to.be.not.a('object')
  expect(schema.UserProfile).to.be.a('object')
  expect(schema.UserParent).to.be.a('object')
  // console.log(UserInfo.fields)
})

test('Schema.structFields', ava => {
  let schema = new Schema()
  let UserTest = schema.declare({
    props: {
      userName: 'String|minLength,2|maxLength,5'
    }
  })
  expect(UserTest).to.be.a('object')
  let UserTest2 = schema.declare({
    props: {
      userName: 'String|minLength,2|maxLength,5',
      userTest: UserTest,
      test: {
        type: UserTest
      },
      testNumber: {
        type: 'Number|@comment:测试数字'
      },
      testString: {
        type: String
      }
    }
  })
  expect(UserTest2).to.be.a('object')
})

test('Schema.subRef', ava => {
  let schema = new Schema()
  let UserTest2 = schema.declare({
    props: {
      userTest: 'UserTest',
      test: {
        type: 'UserTest'
      }
    },
    refs: {
      UserTest: {
        props: {
          userName: 'String|minLength,2|maxLength,5'
        }
      }
    }
  })
  expect(UserTest2).to.be.a('object')
})

test('Schema.create', ava => {
  let schema = new Schema()
  let User = schema.declare({
    props: {
      name: String,
      profile: {
        type: {
          props: {
            age: Number
          }
        }
      }
    }
  })
  expect(User.create()).to.eql({
    name: '',
    profile: {
      age: 0
    }
  })

  expect(User.create({
    name: 'helo',
    sex: 'male'
  })).to.eql({
    name: 'helo',
    profile: {
      age: 0
    }
  })

  const UserSchema = schema.declare({
    props: {
      profile: 'Profile',
      students: 'Array<Profile>',
      articleIds: 'Array<Number>'
    },
    refs: {
      Profile: {
        props: {
          name: String,
          age: Number,
          male: Boolean,
          addr: {
            type: String,
            optional: true
          },
          meta: {
            type: {
              props: {
                m1: 'Something',
                m2: 'Array<Number>'
              },
              refs: {
                Something: {
                  props: {
                    s1: String
                  }
                }
              }
            },
            optional: true
          }
        },
        strict: false
      }
    }
  })

  let data = UserSchema.create({
    profile: {name: 1001, age: '40', male: 'true', meta: {m1: {s1: 'meta1'}, m2: [1, 2, 3]}},
    students: [
      {name: 1002, age: '15', male: 'true', addr: 'ShangHai1'},
      {name: 1002, age: '15', male: 'false'},
      {name: 1002, age: '16', male: 'off'},
      {name: 1002, age: '16', male: 'on'}
    ],
    articleIds: ['2001', '2003']
  })

  expect(data).to.be.a('object')
  expect(UserSchema.create()).to.eql({
    profile: { name: '', age: 0, male: false, addr: '', meta: { m1: {s1: ''}, m2: [] } },
    students: [],
    articleIds: []
  })
})
