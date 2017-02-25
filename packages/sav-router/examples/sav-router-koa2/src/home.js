import {get, post} from '../../../'
import {gen, impl} from 'sav-decorator'

class HomeInterface {
  @get('~')
  index () {}
}

@gen
@impl(HomeInterface)
export class Home {
  async index (ctx) {
    ctx.body = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  </head>
  <body>
    <a href="account/profile">profile</a>
    <form action="account/login" method="post">
      <button type="submit">login</button>
    </form>
    <form action="account/logout" method="post">
      <button type="submit">logout</button>
    </form>
  </body>
</html>`
  }
}
