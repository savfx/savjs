import test from 'ava'
import schema from '../'
import {AssertError} from 'sav-assert'

test('schema#extract', (ava) => {
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
    ava.true(err instanceof AssertError)
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
      UserProfile
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
