// controller.go
/*
type Controller struct {

}
 */

import path from 'path'
import {ensureDir, outputFile, inputFile, pathExists} from '../utils/util.js'
import {parseContract} from '../writers/go/parseContract.js'

export async function updateGoActions (contract, dir, opts = {}) {
  let {modals, actionMap} = parseContract(contract, opts)
  await ensureDir(dir)
  await syncController(dir, opts)
  await Promise.all(modals.map((modal) => {
    return syncGinAction(dir, modal.name, actionMap[modal.name], contract, opts)
  }))
}

function syncController (dir, opts) {
  let file = path.resolve(dir, 'controller.go')
  return pathExists(file).then(async (exists) => {
    if (!exists) {
      let data = `package controllers

type Controller struct {

}

`
      data = `${data}`
      await outputFile(file, data)
    }
  })
}

function syncGinAction (dir, modalName, actions, contract, opts) {
  let file = path.resolve(dir, modalName + (opts.fileSuffix || '') + '.go')
  let ns = contract.project.goName || contract.project.name
  return pathExists(file).then(async (exists) => {
    let fileText = ''
    if (exists) {
      fileText = inputFile(file).toString()
    }
    actions.forEach(action => {
      // console.log(action)
      let arr = ['func (c * Controller)', action.name]
      let hasParams = (action.route.keys && action.route.keys.length)
      let args = ['ctx *gin.Context']
      let funcName = arr.join(' ')
      let bodys = []
      // ctrl.(*Controller).AccountLogin(ctx.(*gin.Context), handler.GetParams(), handler.GetInputValue().(*lmsf.LoginData))
      // `ctrl.(*Controller).${action.name}`
      let routeArgs = ['ctx.(*gin.Context)']
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
      }

      console.log(routeBody)

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
    console.log(fileText)
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
