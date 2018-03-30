
exports.ResHomeNavMenu = {
  list: 'NavMenuItem',
  refs: {
    NavMenuItem: {
      props: {
        title: 'String',
        url: 'String'
      }
    }
  }
}

exports.ResHomeUserInfo = {
  props: {
    userInfo: 'UserInfo'
  },
  refs: {
    Role: {
      enums: [
        {key: 'user', value: 'user'},
        {key: 'guest', value: 'guest'},
        {key: 'admin', value: 'admin'}
      ]
    },
    UserInfo: {
      props: {
        name: 'String',
        id: 'Number',
        role: 'Role',
      }
    }
  }
}

exports.ReqAccountLogin = {
  props: {
    userId: String,
    password: String
  }
}

exports.Sex = {
  enums: [
    {key: 'male', value: 1},
    {key: 'female', value: 2}
  ]
}

exports.ResHomeIndex = {
  state: {
    welcome: 'Hello World'
  },
  props: {
    welcome: String
  }
}

exports.ResHomeAbout = {
  props: {
    aboutInfo: String
  }
}

exports.ResHomeProfile = {
  props: {
    userProfile: 'UserProfile'
  },
  refs: {
    UserProfile: {
      props: {
        id: Number,
        name: String
      }
    }
  }
}
