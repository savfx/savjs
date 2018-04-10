import {testAssign} from 'sav-util'
import {getPayloads} from './payload.js'
import {Sav} from './Sav.js'

export class SavVue extends Sav {

  constructor (opts = {}) {
    super(testAssign(opts, {
      fallback: null, // 请求失败后处理回调
      Vue: null,
      router: null
    }))
    let {router, Vue} = this.opts

    router.beforeEach((to, from, next) => {
      this.invokePayloads(to, getPayloads(this.opts, to))
        .then(() => {
          if (to.meta.title) {
            document.title = to.meta.title
          }
          next()
        }, (err) => {
          let {fallback} = this.opts
          if (fallback) {
            return fallback(to, from, next, err)
          }
          next(err)
        })
    })

    Vue.filter('fieldTitle', this.getFieldTitle.bind(this))
    Vue.filter('enumTitle', this.getEnumTitle.bind(this))
    Vue.filter('enumList', this.getEnumItems.bind(this))
  }
}
