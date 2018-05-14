import {Command} from 'commander'
import osLocale from 'os-locale'
import {CommandContract} from './CommandContract.js'
import {generateFront} from './generaters/generateFront.js'
import path from 'path'

const locals = {
  'zh_CN': {
    type: '命令类型 sync 同步(默认)|create 创建',
    appName: '应用名称',
    interface: 'interface 输入目录',
    contract: 'contract 输入目录',
    langs: '目标语言, js,node,php,go,java',
    destContract: 'contract 输出目录',
    destModals: 'modals 输出目录',
    destFront: '前端项目输出目录',
    lumen: 'php的lumen模式',
    sassMode: 'sass 组织方式 app(单个)|modal(模块)',
    rc: '配置缓存文件 (默认 contract.rc.js)'
  },
  'en': {
    type: 'command type sync(default)|create',
    appName: 'app name',
    interface: 'input interface directory',
    contract: 'input contract directory',
    langs: 'dest languages, js,node,php,go,java',
    destContract: 'output contract directory',
    destModals: 'output modals directory',
    destFront: 'output font-end projects directory',
    sassMode: 'sass mode with app|modal',
    lumen: 'for php lumen',
    rc: 'config resourece file (default contract.rc.js)'
  }
}

function getProgram (locale) {
  let program = (new Command()).version('$$VERSION$$')
  if (!(locale in locals)) {
    locale = 'en'
  }
  let current = locals[locale]
  program
    .option('-t, --type <type>', current.type)
    .option('-a, --app-name [appName]', current.appName)
    .option('-i, --interface [interface]', current.interface)
    .option('-c, --contract [contract]', current.contract)
    .option('-l, --langs [langs]', current.langs)
    .option('-C, --dest-contract [destContract]', current.destContract)
    .option('-M, --dest-modals [destModals]', current.destModals)
    .option('-F, --dest-front [destFront]', current.destFront)
    .option('-L, --lumen [lumen]', current.lumen)
    .option('-S, --sassMode [sassMode]', current.sassMode, /^(app|modal)$/i, 'app')
    .option('-r, --rc [rc]', current.rc, String, 'contract.rc')
    .on('--help', function () {
      console.log('  Examples:')
      console.log()
      if (locale === 'zh_CN') {
        console.log('  载入interface目录合约, 输出js和node标准合约到contract, 同步node方法, 同步前端路由,组件及样式')
      }
      console.log('  contract -t sync -i ./interface -l js,node -C ./contract -M modals -F ./front')
      if (locale === 'zh_CN') {
        console.log('  创建前端示例项目')
      }
      console.log('  contract -t create -a MyProject -F ./front')
      console.log()
    })
  return program.parse(process.argv)
}

osLocale().then(locale => {
  let program = getProgram(locale)
  let load = require
  let rcFile
  try {
    rcFile = path.join(process.cwd(), program.rc)
    let config = load(rcFile)
    Object.assign(program, config)
  } catch (err) {
    // console.log('rcFile', err)
  }

  let showHelp = () => {
    program.help()
    process.exit(0)
  }
  let ensure = (fields) => {
    Array.isArray(fields) || (fields = [fields])
    fields.forEach(it => {
      if (!program[it]) {
        showHelp()
      }
    })
  }
  let any = (fieldA, fieldB) => {
    if (!(program[fieldA] || program[fieldB])) {
      showHelp()
    }
  }
  switch (program.type) {
    case 'create':
      ensure(['type', 'destFront', 'appName'])
      generateFront(program.destFront, program).then(() => {
        console.log('success')
      })
      break
    case 'sync':
      ensure(['langs'])
      any('contract', 'interface')
      any('destContract', 'destModals', 'destFront')
      let cmd = new CommandContract()
      cmd.execute(program).then(() => {
        console.log('success')
      })
      break
    default:
      showHelp()
  }
})
