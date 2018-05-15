/**
 * 更新 actions 实现的内容
 */
import PhpParser from 'php-parser'
import path from 'path'
import {noticeString, ensureDir, outputFile,
  inputFile, pathExists, getBackRoutes} from '../utils/util.js'

let parser = new PhpParser({
  ast: {
    withPositions: true
  }
})

export async function updatePhpActions (dir, modals, opts = {}) {
  modals = modals.filter(it => !it.view)
  await ensureDir(dir)
  await Promise.all(modals.map((modal) =>
    syncPhpAction(dir, modal.name, modal, opts)))
}

function syncPhpAction (dir, className, modal, opts) {
  let routes = getBackRoutes(modal, modal.routes)
  if (!routes.length) {
    return
  }
  let file = path.resolve(dir, className + (opts.fileSuffix || '') + '.php')
  return pathExists(file).then(async (exists) => {
    let methods = routes.map(it => it.name)
    if (exists) {
      let data = (await inputFile(file)).toString()
      let parsed = parseClassModule(data, className, opts)
      if (parsed) {
        methods = methods.filter((method) => parsed.methods.indexOf(method) === -1)
        if (methods.length) {
          let attach = createMethods(methods, opts)
          data = data.substr(0, parsed.end - 1) + attach + data.substr(parsed.end - 1)
          await outputFile(file, data)
        }
      }
    } else {
      let data = createClassModule(className, methods, opts)
      data = `<?php\n${noticeString}${data}`
      await outputFile(file, data)
    }
  })
}

function createClassModule (className, methods, opts) {
  let {body, args, parentClass, classSuffix} = opts
  methods = methods.map((method) => {
    return `
    public function ${method}(${args || ''}) {
        ${body || ''}
    }`
  }).join('').trim()
  return `${opts.namespace || ''}

class ${className + (classSuffix || '')}${parentClass ? (' extends ' + parentClass) : ''}
{
    ${methods}
}
`
}

function createMethods (methods, opts) {
  return methods.map((method) => `    public function ${method} (${opts.args || ''}) {
        ${opts.body || ''}
    }`).join('\n') + '\n'
}

function parseClassModule (str, method, opts) {
  let className = method + (opts.classSuffix || '')
  let ast = parser.parseCode(str, `${className + (opts.fileSuffix || '')}.php`)
  let target
  for (let item of ast.children) {
    if (item.kind === 'namespace') {
      for (let cls of item.children) {
        if (cls.kind === 'class' && cls.name === className) {
          target = cls
          break
        }
      }
    } else if (item.kind === 'class' && item.name === className) {
      target = item
    }
    if (!target) {
      continue
    }
    let methods = target.body
      .filter((it) => it.kind === 'method' && it.visibility === 'public' && it.isStatic === false)
      .map((it) => it.name)
    let start = target.loc.start.offset
    let end = target.loc.end.offset - 1
    return {
      methods,
      start,
      end
    }
  }
}
