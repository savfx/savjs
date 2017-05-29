import test from 'ava'
import {expect} from 'chai'
import schema from '../src'

test('struct.createState', ava => {
  let UserInfo = schema.declare({
    req: {
      userName: 'Hello'
    },
    props: {
      userName: 'String'
    }
  })
  expect(UserInfo.createRequest()).to.eql({userName: 'Hello'})
  expect(UserInfo.createResponse({userName: 'World'})).to.eql({userName: 'World'})
})

test('struct.Error', async ava => {
  let UserInfo = schema.declare({
    props: {
      userName: {
        type: 'String',
        nullable: true
      },
      followerIds: 'Array<Number>',
      users: {
        type: 'Array',
        subType: {
          props: {
            uid: 'Number'
          }
        }
      },
      sex: {
        type: 'Sex',
        ref: {
          enums: [
            {key: 'male', value: 1},
            {key: 'female', value: 2}
          ]
        }
      },
      users2: {
        type: 'Array',
        message: 'Invalid User2',
        subRef: {
          props: {
            uid: {
              type: 'Number',
              message: 'Invalid Number'
            }
          }
        }
      },
      userx: {
        type: 'Array',
        subType: 'UserX',
        subRef: {
          props: {
            uid: 'Number'
          }
        }
      }
    }
  })
  try {
    await UserInfo.extractThen({})
  } catch (err) {
    expect(err).to.be.a('error')
    expect(err.field).to.eql('userName')
    expect(err.keys).to.eql(['userName'])
    expect(err.path).to.eql('userName')
  }
  try {
    await UserInfo.extractThen({userName: 's', followerIds: ['x']})
  } catch (err) {
    expect(err).to.be.a('error')
    expect(err.keys).to.eql(['followerIds', 0])
    expect(err.path).to.eql('followerIds.0')
  }
  try {
    await UserInfo.extractThen({userName: 's', followerIds: [1], users: [{uid: 'x'}]})
  } catch (err) {
    expect(err).to.be.a('error')
    expect(err.keys).to.eql(['users', 0, 'uid'])
    expect(err.path).to.eql('users.0.uid')
  }
  try {
    await UserInfo.extractThen({userName: null, followerIds: [1], users: 'x'})
  } catch (err) {
    expect(err).to.be.a('error')
    expect(err.keys).to.eql(['users'])
    expect(err.path).to.eql('users')
  }
  try {
    await UserInfo.extractThen({userName: 's', followerIds: [1], users: [{uid: 1}], sex: 0})
  } catch (err) {
    expect(err).to.be.a('error')
    expect(err.keys).to.eql(['sex'])
    expect(err.path).to.eql('sex')
  }
  try {
    await UserInfo.checkThen({userName: 's', followerIds: [1], users: [{uid: 1}], sex: 1, users2: ['x']})
  } catch (err) {
    expect(err).to.be.a('error')
    expect(err.message).to.eql('Invalid Number')
    expect(err.keys).to.eql(['users2', 0, 'uid'])
    expect(err.path).to.eql('users2.0.uid')
  }
  try {
    await UserInfo.checkThen({userName: 's', followerIds: [1], users: [{uid: 1}], sex: 1, users2: [], userx: false})
  } catch (err) {
    // console.log(err)
    expect(err).to.be.a('error')
    expect(err.keys).to.eql(['userx'])
    expect(err.path).to.eql('userx')
  }
})

test('struct.delay', async ava => {
  await schema.ready()
  let UserProfile = schema.declare({
    props: {
      userInfo: 'UserInfoX',
      users: 'Array<UserInfoX>'
    }
  })
  schema.declare({
    name: 'UserInfoX',
    props: {
      uid: Number
    }
  })
  await schema.ready()
  expect(UserProfile.create()).to.eql({userInfo: {uid: 0}, users: []})
})
