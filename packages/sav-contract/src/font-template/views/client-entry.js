// 程序入口文件
// 宏定义采用注释的方式, 需要打包工具根据环境变量来匹配
// 区块宏 IS_DEV     是否开发环境
// 区块宏 IS_PROD    是否生产环境

import {Vue, VueRouter, Flux, FluxVue} from './client-plugin.js'
import routes from './routes.js'
import App from './App.vue'

let router = new VueRouter(Object.assign({
  mode: 'hash',
  routes,
  linkActiveClass: 'is-active'
}))

let flux = new Flux({
// #if IS_DEV
  noProxy: true, // 开发模式下不使用Proxy方便调用dispatch
  // #endif
  strict: true
})

// flux服务在这里嵌入
// flux.declare(...)

let vm = new Vue(Object.assign({
  vaf: new FluxVue({flux}),
  router
}, App))

vm.$mount('#app')

export default {
  vm,
  flux
}
