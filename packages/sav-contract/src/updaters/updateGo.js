// controller.go
/*
type Controller struct {

}
 */

import path from 'path'
import {noticeString, ensureDir, outputFile, inputFile, pathExists} from '../utils/util.js'
import {parseContract} from '../writers/go/parseContract.js'
import {pascalCase} from 'sav-util'

export async function updateGoActions (contract, dir, opts = {}) {
  let {modals, actionMap} = parseContract(contract, opts)
  opts.packageName = 'modals'
  let routes = []
  await ensureDir(dir)
  await syncController(dir, opts)
  await Promise.all(modals.map((modal) => {
    return syncGinAction(dir, modal.name, actionMap[modal.name], contract, opts, routes)
  }))
  await syncRoutes(dir, routes, opts)
}

// routes.go
/*
func registerRoutes(app sgin.GinApplication)  {
  app.Handle("Account","Login", func (ctx interface{}, ctrl sav.Controller, handler sav.DataHandler ) {
    ctrl.(*Controller).AccountLogin(ctx.(*gin.Context), handler.GetParams(), handler.GetInputValue().(*lmsf.LoginData))
    res :=
    if res != nil {
      handler.SetOutputValue(res)
    }
  })
}
 */

async function syncRoutes(dir, routes, opts) {
  let text = routes.map(it => {
    return `\tapp.Handle("${it.modalName}", "${it.actionName}", func(ctx interface{}, ctrl sav.Controller, handler sav.DataHandler, extra interface{}) {
${it.routeBody}
\t})`
  }).join('\n')
  let data = `${noticeString}package ${opts.packageName}

import (
\t"github.com/savfx/savgo/sav"
\t"github.com/savfx/savgo/server/sgin"
\t"github.com/savfx/savgo/util/convert"
)

func registerRoutes(app sgin.GinApplication) {
${text}
}
`
  let file = path.resolve(dir, 'routes.go')
  if (await pathExists(file)) {
    let src = await inputFile(file)
    if (data === src.toString()) {
      return
    }
  }
  await outputFile(file, data)
}

function syncController (dir, opts) {
  let file = path.resolve(dir, 'controller.go')
  return pathExists(file).then(async (exists) => {
    if (!exists) {
      let data = `package ${opts.packageName}

type Controller struct {
}
`
      data = `${data}`
      await outputFile(file, data)
    }
  })
}

function syncGinAction (dir, modalName, actions, contract, opts, routes) {
  let file = path.resolve(dir, modalName + (opts.fileSuffix || '') + '.go')
  let ns = contract.project.goName || contract.project.name
  return pathExists(file).then(async (exists) => {
    let fileText = `package ${opts.packageName}

import (
\t"github.com/gin-gonic/gin"
\t"github.com/savfx/savgo/server/sgin"
)

`
    if (exists) {
      fileText = (await inputFile(file)).toString()
    }
    actions.forEach(action => {
      // console.log(action)
      let arr = [`func (c * Controller)${action.name}`]
      let hasParams = (action.route.keys && action.route.keys.length)
      let args = ['ctx *gin.Context', 'sctx *sgin.GinContext']
      let funcName = arr.join(' ')
      let bodys = []
      // ctrl.(*Controller).AccountLogin(ctx.(*gin.Context), handler.GetParams(), handler.GetInputValue().(*lmsf.LoginData))
      // `ctrl.(*Controller).${action.name}`
      let routeArgs = ['ctx.(*gin.Context)', 'extra.(*sgin.GinContext)']
      if (action.requestSchema) {
        args.push(`input *${ns}.${action.requestSchema}`)
      }
      if (hasParams) {
        args.push('params map[string]interface{}')
        let keys = action.route.keys
        bodys.push('\toa := convert.NewObjectAccess(params)')
        keys.forEach((name) => {
          bodys.push(`\toa.GetString("${name}")`)
        })
      }
      arr.push(`(${args.join(', ')})`)
      if (action.responseSchema) {
        arr.push(`*${ns}.${action.responseSchema}`)
        bodys.push(`\tres := &${ns}.${action.responseSchema}{}`)
        bodys.push(`\treturn res`)
      }
      arr.push('{')

      if (hasParams) {
        routeArgs.push('handler.GetParams()')
      }
      if (action.requestSchema) {
        routeArgs.push(`handler.GetInputValue().(*${ns}.${action.requestSchema})`)
      }

      let routeBody = `ctrl.(*Controller).${action.name}(${routeArgs.join(', ')})`

      if (action.responseSchema) {
        routeBody = [
          `\t\tres := ${routeBody}`,
          `\t\tif res != nil {`,
          `\t\t\thandler.SetOutputValue(res)`,
          `\t\t}`
        ].join('\n')
      } else {
        routeBody = '\t\t' + routeBody
      }

      routes.push({
        modalName,
        actionName : pascalCase(action.actionName),
        routeBody,
      })

      let header = arr.join(' ')
      let body = bodys.join('\n')
      let footer = '}'
      let text = [header, body, footer].join('\n')
      if (exists) {
        if (fileText.indexOf(funcName) === -1) {
          fileText += `${text}\n\n`
        }
      } else {
        fileText += `${text}\n\n`
      }
    })
    if (fileText.indexOf("convert.NewObjectAccess") !== -1) {
      let injectLib = "github.com/savfx/savgo/util/convert"
      if (fileText.indexOf(injectLib) == -1) {
        let findText = "github.com/savfx/savgo/server/sgin"
        let pos = fileText.indexOf(findText)
        fileText = fileText.substr(0, pos + findText.length + 1) + `\n\t"${injectLib}"`
          + fileText.substr(pos + findText.length + 1, fileText.length)
      }
    }
    await outputFile(file, fileText)
  })
}

// Account.go
/*
func (c * Controller) AccountLogin(ctx *gin.Context, params map[string]interface{}, input * lmsf.LoginData) (* lmsf.User) {
  res := &lmsf.User{}
  oa := convert.NewObjectAccess(params)
  oa.GetString("uid")
  oa.GetString("age")
  return res
}
func (c * Controller) AccountLogin(ctx *gin.Context, input * lmsf.LoginData) (* lmsf.User) {
  res := &lmsf.User{}
  return res
}
func (c * Controller) AccountLogin(ctx *gin.Context) (* lmsf.User) {
  res := &lmsf.User{}
  return res
}
func (c * Controller) AccountLogin(ctx *gin.Context){
}
 */

/*

type Controller struct {

}

func NewController() *Controller {
  res := &Controller{}
  return res
}

 */
