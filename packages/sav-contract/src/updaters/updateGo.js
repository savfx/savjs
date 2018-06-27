// controller.go
/*
type Controller struct {

}
 */

import path from 'path'
import {noticeString, ensureDir, outputFile,
  inputFile, pathExists, getBackRoutes} from '../utils/util.js'

export async function updateGoActions (contract, dir, modals, opts = {}) {
  modals = modals.filter(it => !it.view)
  await ensureDir(dir)
  await Promise.all(modals.map((modal) => {
    return syncGinAction(dir, modal.name, modal, opts)
  }))
}

function syncGinAction (dir, className, modal, opts) {
  let routes = getBackRoutes(modal, modal.routes)
  if (!routes.length) {
    return
  }
  let file = path.resolve(dir, className + (opts.fileSuffix || '') + '.go')
  return pathExists(file).then(async (exists) => {
    let methods = routes.map(it => it.name)
    if (exists) {
    } else {
    }
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

// routes.go
/*
func registerRoutes(app sgin.GinApplication)  {
  app.Handle("Account","Login", func (ctx interface{}, ctrl sav.Controller, handler sav.DataHandler ) {
    res := ctrl.(*Controller).AccountLogin(ctx.(*gin.Context),
      handler.GetParams(),
      handler.GetInputValue().(*lmsf.LoginData))
    if res != nil {
      handler.SetOutputValue(res)
    }
  })
}
 */
