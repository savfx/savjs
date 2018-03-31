import {Modal, post, get} from 'sav'

@Modal()
export default class Article {
  @get({
    title: '文章列表',
    response: {
      list: 'ArticleItem',
      refs: {
        ArticleItem: {
          props: {
            id: 'Number',
            title: 'String',
            content: 'String'
          }
        }
      }
    }
  })
  posts() {}

  @get({
    path: '/articles/:aid',
    response: {
      props: {
        article: 'ArticleItem'
      }
    },
    request: {
      props: {
        aid: 'String'
      }
    }
  })
  view() {}

  @post({
    path: 'modify/:aid?',
    auth: true,
  })
  modify() {}

  @post({
    path: 'update/:aid',
    auth: true,
  })
  update() {}
}
