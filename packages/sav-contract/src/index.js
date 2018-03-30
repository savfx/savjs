import program from 'commander'
import {resolve} from 'path'
import {loadInterface} from './loaders/interface.js'

program
  .version('$$VERSION$$')
  .option('-a, --app [app]', 'input app name')
  .option('-e, --example [example]', 'output simple example name')
  .option('-i, --interface [interface]', 'input interface directory')
  .option('-c, --contract [contract]', 'input contract directory')
  .option('-d, --dest [dest]', 'dest dir, default .')
  .option('-l, --lang [lang]', 'dest language, node|php, default node')

  .option('-m, --modal [modal]', 'output modals, -m contract,action,sass,vue,rollup,package, default all')
  .option('-S, --sassPage [sassPage]', 'sass page by modal|action|app', /^(modal|action|app)$/i, 'app')
  .parse(process.argv)

if (program.example) {
  program.interface = 'interface'
}

let interfaceDir = 'interface' in program ? resolve(program.interface || '.', '') : false
let contractDir = 'contract' in program ? resolve(program.contract || '.', '') : false

if (!(interfaceDir || contractDir)) {
  program.help()
  process.exit(0)
}

if (!program.app) {
  program.help()
  process.exit(0)
}

let lang = (program.lang || 'node').split(',')

const modalNames = 'contract,action,sass,vue,rollup,package'
let dest = resolve('.', program.dest || '.')
let modals = (program.modal || modalNames).split(',')

let promise = Promise.resolve()

if (interfaceDir) {
  if (program.example) {
    promise = writeExample(program.interface)
  }
  promise = promise.then(() => {
    return loadInterface(interfaceDir)
  })
} else {
  promise.then(() => {
    program.require = require
    return program.require(contractDir)
  })
}

promise.then((contract) => {
  contract = convertFunctionToName(contract)
  let mods = modalNames.split(',')
  return Promise.all(modals.filter((name) => mods.indexOf(name) !== -1).map((name) => {
    switch (name) {
      case 'contract':
        return writeContract(resolve(dest, './contract'), contract)
      case 'action':
        if (lang.indexOf('node') !== -1) {
          return writeActions(resolve(dest, './actions'), contract.modals)
        } else if (lang.indexOf('php') !== -1) {
          return writePhpActions(resolve(dest, './actions'), contract.modals)
        }
        break
      case 'sass':
        return writeSass(resolve(dest, './sass'), contract.modals, {mode: program.sassPage})
      case 'vue':
        return writeVue(resolve(dest, './views'), contract.modals)
      case 'rollup':
        return writeRollup(resolve(dest, './scripts'))
      case 'package':
        return writePackage(dest, {
          name: program.app
        })
    }
  }))
}).then(() => console.log('done')).catch(err => {
  console.error(err)
  console.error()
  process.exit(1)
})
