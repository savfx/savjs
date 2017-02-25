import Koa from 'koa'
import {Router} from '../../../'

import {Account} from './account'
import {Home} from './home'

let app = new Koa()

let router = new Router({
  case: 'camel'
})

router.declare([
  Home,
  Account
])

app.use(router.route())
app.listen(3000)

console.log('server: http://localhost:3000')
