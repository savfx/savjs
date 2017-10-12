import test from 'ava'
import {Schema} from '../lib'

test('schema#extract', (ava) => {
  let schema = new Schema()
  const UserProfile = schema.declare({
    props: {
      name: 'String',
      age: 'Number',
      sex: 'Sex'
    },
    refs: {
      Sex: {
        default: 1,
        enums: { // no order
          male: 1,
          female: 2
        }
      }
    }
  })

  UserProfile.extract({
    name: 'my',
    age: 10,
    sex: 1,
    something: 'xxx'
  })

  UserProfile.extractThen({name: 'my'}).then(() => {
    throw new Error('no')
  }).catch(err => {
    ava.true(err instanceof Error)
  })

  const UserInfo = schema.declare({
    props: {
      profile: {
        type: 'UserProfile',
        optional: true
      },
      account: 'String'
    },
    refs: {
      UserProfile: {
        props: {
          name: 'String',
          age: 'Number',
          sex: 'Sex'
        },
        refs: {
          Sex: {
            default: 1,
            enums: { // no order
              male: 1,
              female: 2
            }
          }
        }
      }
    }
  })

  UserInfo.extract({account: 'jetiny'})
  UserInfo.extractThen({
    account: 'jetiny',
    profile: {
      name: 'my',
      age: 10,
      sex: 1,
      something: 'xxx'
    }
  }).then((ret) => {
    ava.true(ret.account)
    ava.false(ret.profile.something)
  })
})

test('schema extract deep', (ava) => {
  const schema = new Schema()
  schema.strict = true
  const UserSchema = schema.declare({
    props: {
      profile: 'Profile',
      students: {
        array: 'Profile'
      },
      articleIds: {
        array: Number
      }
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
            props: {
              m1: {
                props: {
                  s1: String
                }
              }
            },
            optional: true
          }
        }
      }
    }
  })
  UserSchema.extractThen({
    profile: {name: 1001, age: '40', male: 'true', meta: {m1: {s1: 'meta1'}}},
    students: [
      {name: 1002, age: '15', male: 'true', addr: 'ShangHai1'},
      {name: 1002, age: '15', male: 'false'},
      {name: 1002, age: '16', male: 'off'},
      {name: 1002, age: '16', male: 'on'}
    ],
    articleIds: ['2001', '2003']
  }).catch((err) => {
    ava.true(!!err)
    throw err
  }).then((ret) => {
    ava.true(!!ret)
  })
})
