/**
 * 生成 vue 目录的内容
 */

import path from 'path'
import JSON5 from 'json5'
import {noticeString, ensureDir, outputFile, 
  inputFile, pathExists, getFrontRoutes} from '../utils/util.js'
import {pascalCase, hyphenCase, camelCase, prop, isString} from 'sav-util'

export async function updateFront (dir, modals) {
  await ensureDir(dir)
  let args = await Promise.all(modals.map((modal) => {
    return writeVueFile(dir, modal.name, modal, modal.routes)
  }))
  args = args.filter(it => !!it)
  await writeVueRouter(dir, args)
}

async function writeVueRouter (dir, components) {
  let routes = JSON5.stringify(components, null, 2)
  let imports = components.reduce((a, b) => {
    b.files.forEach(([name, file]) => {
      a.push(`import ${name} from './${file}'`)
    })
    return a
  }, [])
  routes = routes.replace(/component:\s+"(\w+)"/g, (_, name) => {
    return `component: ${name}`
  })
  let content = unique(imports).concat([''])
    .concat(`export default ${routes}`).join('\n')
  content = `${noticeString}${content}\n`
  let routePath = path.resolve(dir, 'routes.js')
  if (await pathExists(routePath)) {
    let oldText = await inputFile(routePath)
    if (oldText.toString() !== content) {
      await outputFile(routePath, content)
    }
  } else {
    await outputFile(routePath, content)
  }
}

function unique (arr) {
  return arr.filter((it, index) => arr.indexOf(it) === index)
}

const vueTemplate = `<template>
  <div className>
    <h2>RouteName</h2>
    <router-view class="view-container"></router-view>
  </div>
</template>
<script>
  export default {
    name: 'componentName',
    getters: [
    ],
    actions: [
    ]
  }
</script>
`

async function writeVueFile (dir, modalName, modal, routes) {
  routes = getFrontRoutes(modal, routes)
  if (!routes.length) {
    return
  }
  modalName = pascalCase(modalName)
  let modalPath = path.resolve(dir, modalName)
  await ensureDir(modalPath)
  let modalFile = path.resolve(modalPath, modalName + '.vue')
  let modalData = vueTemplate.replace('className', `class="page-${hyphenCase(modalName)}"`)
    .replace('RouteName', modalName)
    .replace('componentName', modalName)
  if (!await pathExists(modalFile)) {
    await outputFile(modalFile, modalData)
  }
  let modalComponent = {
    component: modalName,
    path: isString(modal.path) ? modal.path : camelCase(modalName),
    children: []
  }
  if (modalComponent.path) {
    if (modalComponent.path[0] !== '/') {
      modalComponent.path = '/' + modalComponent.path
    }
  }
  let files = [
    [modalName, `${modalName}/${modalName}.vue`]
  ]
  for (let route of routes) {
    let routeName = pascalCase(route.name)
    // eg: Article/ArticleViews
    let component = route.component ? route.component : (`${modalName}/${modalName}${routeName}`)
    let routeFile = path.resolve(dir, component + '.vue')
    // eg: ArticleViews
    let componentName = component.split('/')[1]
    let routeData = vueTemplate.replace('className', `class="${hyphenCase(componentName)}"`)
      .replace('    <router-view class="view-container"></router-view>\n', '')
      .replace('RouteName', `${modalName}${routeName}`)
      .replace('componentName', componentName)
    if (!await pathExists(routeFile)) {
      await outputFile(routeFile, routeData)
    }
    let routeComponent = {
      component: componentName,
      name: `${modalName}${routeName}`,
      path: isString(route.path) ? route.path : camelCase(routeName),
      meta: {
        title: route.title,
        auth: route.auth
      }
    }
    files.push([componentName, `${component}.vue`])
    modalComponent.children.push(routeComponent)
  }
  prop(modalComponent, 'files', files)
  return modalComponent
}
