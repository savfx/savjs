import test from 'ava'
import {expect} from 'chai'

import {SavVue} from '../../src/SavVue.js'
import {Contract} from '../../src/Contract.js'
import {Flux, FluxVue} from 'sav-flux'
import JSON5 from 'json5'

import VueRouter from 'vue-router'
import {createLocalVue, mount} from '@vue/test-utils'

const contractData = `{
  project: {
    name: 'test'
  },
  modals: {
    Account: {
      view: false,
      routes: {
        login: {

        },
        test: {

        }
      }
    }
  },
  schemas: [
    {
      name: 'ReqAccountLogin',
      props: {
        username: {
          type: 'String',
          title: '用户名'
        },
        password: {
          type: 'String',
          title: '密码'
        }
      },
      state: {
        confirmPassword: ''
      }
    },
    {
      name: 'Sex',
      enums: [
        {key: 'male', value: 1, title: '男'},
        {key: 'female', value: 2, title: '女'},
      ]
    },
    {
      name: 'Sex2',
      enums: [
        {key: 'male', value: 1, title: '男'},
        {key: 'female', value: 2, title: '女'},
      ]
    },
    {
      name: 'Sex3',
      enums: [
        {key: 'male', value: 1, title: '男'},
        {key: 'female', value: 2, title: '女'},
      ]
    },
    {
      name: 'ResAccountTest',
      props: {
        id: 'String'
      }
    }
  ],
  mocks: [
    {
      modalName: 'Account',
      actionName: 'test',
      data: {id: 'a'}
    }
  ]
}`

test('SavVue', async (t) => {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(FluxVue)

  const App = {
    template: `<div id="app"><router-view></router-view></div>
    `
  }
  const Home = {
    template: '<div id="home"><router-view></router-view></div>'
  }

  const HomeIndex = {
    template: `<div id="home_index"></div>`,
    payload: [
      'Sex',
      {name: 'ReqAccountLogin'},
      (route) => {
        return {name: 'AccountTest'}
      }
    ]
  }

  const Sex2 = {
    template: `<span></span>`,
    payload: 'Sex2'
  }

  localVue.component('Sex2', Sex2)

  const HomeIndex2 = {
    template: `<div id="home_index2"><Sex2/></div>`
  }

  const HomeIndex3 = {
    template: `<div id="home_index3"><Sex3/></div>`,
    components: {
      Sex3: {
        template: `<span></span>`,
        payload: () => {
          return {name: 'Sex3'}
        }
      }
    }
  }

  const HomeError = {
    template: `<div id="home_error"></div>`,
    payload: {
      project: 'xxx'
    }
  }

  const router = new VueRouter({
    routes: [
      {path: '/',
        component: Home,
        children: [
          {
            component: HomeIndex,
            name: 'HomeIndex',
            path: '',
            meta: {
              title: 'HomeIndex'
            }
          },
          {
            component: HomeIndex2,
            name: 'HomeIndex2',
            path: 'home2',
            meta: {
              title: 'HomeIndex2'
            }
          },
          {
            component: HomeIndex3,
            name: 'HomeIndex3',
            path: 'home3',
            meta: {
              title: 'HomeIndex3'
            }
          },
          {
            component: HomeError,
            name: 'HomeError',
            path: 'error',
            meta: {
              title: 'HomeError'
            }
          }
        ]}
    ]
  })

  let contract = new Contract({
    enableMock: true,
    contract: JSON5.parse(contractData)
  })
  let flux = new Flux({
    noProxy: true
  })
  let opts = {
    contract,
    flux,
    Vue: localVue,
    router,
    fallback (to, from, next, err) {
      document.title = to.meta.title
      next()
    }
  }
  let sav = new SavVue(opts)
  expect(sav).to.be.a('object')

  let wrap = mount(App, {
    vaf: new FluxVue({flux}),
    localVue,
    router,
    stubs: [
      'router-link',
      'router-view'
    ]
  })

  let arr = []
  router.afterEach((to, from) => {
    arr.push(to)
    // console.log(wrap.html())
    switch (to.name) {
      case 'HomeIndex':
        expect(document.title).to.eql('HomeIndex')
        expect(flux.state.Sex).to.be.a('array')
        expect(flux.state.ResAccountTest).to.be.a('object')
        expect(flux.state.ReqAccountLogin).to.be.a('object')
        break
      case 'HomeIndex2':
        expect(document.title).to.eql('HomeIndex2')
        expect(flux.state.Sex2).to.be.a('array')
        break
      case 'HomeIndex3':
        expect(document.title).to.eql('HomeIndex3')
        expect(flux.state.Sex3).to.be.a('array')
        break
      case 'HomeError':
        expect(document.title).to.eql('HomeError')
        break
    }
  })

  expect(wrap).to.be.a('object')
  return new Promise((resolve) => {
    setTimeout(() => {
      router.push('/home2')
      setTimeout(() => {
        router.push('/home3')
        setTimeout(() => {
          router.push('/error')
          setTimeout(() => {
            expect(arr.length).to.eql(4)
            t.pass()
            resolve()
          })
        })
      })
    })
  })
})
