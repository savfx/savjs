import { bindEvent, isString, testAssign } from 'sav-util'
import { getPayloads } from './payload.js'

import {
  PAYLOAD_START,
  PAYLOAD_PROGRESS,
  PAYLOAD_RESOLVE,
  PAYLOAD_REJECT
} from './events.js'

const defaultProject = 'default'

export class SavVue {
  constructor (opts = {}) {
    this.opts = testAssign(opts, {
      fallback: null, // 请求失败后处理回调
      flux: null,
      contract: null,
      Vue: null,
      router: null,
      cacheField: true,
      cacheEnum: true
    })
    bindEvent(this)
    this.contracts = {}
    this.caches = {}
    if (this.opts.contract) {
      this.setContract(this.opts.contract, defaultProject)
    }
    this.opts.router.beforeEach(this.beforeEach.bind(this))
    this.installVue(this.opts.Vue)
  }
  setContract (contract, name) {
    let isDefault = name === defaultProject
    contract.injectFlux(this.opts.flux, isDefault)
    if (name) {
      this.contracts[name] = contract
    }
    this.contracts[contract.projectName] = contract
  }
  installVue (Vue) {
    // {{ 'ResAccountLogin.username' | field }}
    Vue.filter('field', (value, project = defaultProject) => {
      let caches = this.caches
      if (this.opts.cacheField) {
        if (caches[value]) {
          return caches[value]
        }
      }
      let sav = this.contracts[project]
      let [structName, fieldName] = value.split('.')
      let ret
      try {
        let struct = sav.schema.getSchema(structName)
        let field = struct.opts.props[fieldName]
        ret = field.text || `${project}.${value}`
      } catch (err) {
        ret = `${project}.${value}`
      } finally {
        if (this.opts.cacheField) {
          caches[value] = ret
        }
      }
      return ret
    })
    // {{'GroupRoleEnum.master' | enumText }}
    // {{ 'master' | enumText('GroupRoleEnum') }}
    Vue.filter('enumText', (value, enumName, project = defaultProject) => {
      if (!enumName) {
        let arr = value.split('.')
        value = arr[1]
        enumName = arr[0]
      }
      let uri = `${project}.${enumName}.${value}`
      let caches = this.caches
      if (this.opts.cacheEnum) {
        if (caches[uri]) {
          return caches[uri]
        }
      }
      let sav = this.contracts[project]
      let ret
      try {
        let schemaEnum = sav.schema.getSchema(enumName)
        ret = schemaEnum.key(value)
      } catch (err) {
        ret = uri
      } finally {
        if (this.opts.cacheEnum) {
          caches[uri] = ret
        }
      }
      return ret
    })
    Vue.filter('enumFilter', (value, values) => {
      if (!values) {
        return value
      }
      if (isString(values)) {
        values = values.split()
      }
      return value.filter(it => {
        return values.indexOf(it.value) !== -1
      })
    })
  }

  beforeEach (to, from, next) {
    let payloads = getPayloads(to, this.opts)

    if (payloads.length) {
      let {flux, fallback} = this.opts

      this.emit(PAYLOAD_START, {
        id: to.fullPath,
        payloads: payloads.length,
        $route: to
      })

      this.invokePayloads(to, payloads).then((newState) => {
        this.emit(PAYLOAD_RESOLVE, {
          id: to.fullPath,
          $route: to
        })
        if (newState) {
          flux.updateState(newState).then(() => {
            if (to.meta.title) {
              document.title = to.meta.title
            }
            next()
          })
          return
        }
        next()
      }).catch(err => {
        this.emit(PAYLOAD_REJECT, err)
        if (fallback) {
          return fallback(to, from, next, err)
        } else {
          next(err)
        }
      })
      return
    }
    if (to.meta.title) {
      document.title = to.meta.title
    }
    next()
  }

  invokePayloads (vueRoute, payloads) {
    let states = []
    let routes = payloads.filter((it) => {
      let projectName = it.project || defaultProject
      let project = this.contracts[projectName]
      if (project) {
        if (project.resolvePayload(it, vueRoute)) {
          if (it.state) {
            states.push(it.state)
          } else {
            return true
          }
        }
      } else {
        throw new Error('project no found: ', projectName)
      }
    })

    const e = {
      id: vueRoute.fullPath,
      remains: routes.length
    }

    const progress = () => {
      e.remains = (!e.remains || --e.remains) < 0 ? 0 : e.remains
      this.emit(PAYLOAD_PROGRESS, e)
    }

    return Promise.all(routes.map((route) => {
      const p = route.contract.invokePayload(route)
      p.then(progress, progress)
      return p
    })).then((args) => {
      args = states.concat(args)
      return args.length ? Object.assign.apply({}, args) : null
    })
  }
}
