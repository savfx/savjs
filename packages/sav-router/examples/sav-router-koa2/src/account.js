import {get, post} from '../../../'
import {gen, impl} from 'sav-decorator'

class AccountInterface {
  @get
  profile () {}

  @post
  login() {}

  @post
  logout() {}
}

@gen
@impl(AccountInterface)
export class Account {
  async profile (ctx) {
    ctx.body = {
      name: 'jetiny'
    }
  }
  async login (ctx) {
    ctx.body = {
      message: 'login success!'
    }
  }
  async logout (ctx) {
    ctx.body = {
      message: 'logout success!'
    }
  }
}
