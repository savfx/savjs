import {Command} from 'commander'
import osLocale from 'os-locale'
import {resolve} from 'path'
import {CommandContract} from './CommandContract.js'
import {generateFront} from './generaters/generateFront.js'

function getProgram (locale) {
  let program = (new Command()).version('$$VERSION$$')
  if (locale === 'zh_CN') {
    program
      .option('-t, --type <type>', '命令类型 sync 同步(默认)|create 创建')
      .option('-a, --app-name [appName]', '创建应用名称')
      .option('-i, --interface [interface]', 'interface 输入目录')
      .option('-c, --contract [contract]', 'contract 输入目录')
      .option('-l, --langs [langs]', '目标语言, js,node,php')
      .option('-C, --dest-contract [destContract]', 'contract 输出目录')
      .option('-M, --dest-modals [destModals]', 'modals 输出目录')
      .option('-F, --dest-front [destFront]', '前端项目输出目录')
      .option('-S, --sassMode [sassMode]', 'sass 组织方式 app(单个)|modal(模块)', /^(app|modal)$/i, 'app')
  } else {
    program
      .option('-t, --type <type>', 'command type sync(default)|create')
      .option('-a, --app-name [appName]', 'input app name for create')
      .option('-i, --interface [interface]', 'input interface directory')
      .option('-c, --contract [contract]', 'input contract directory')
      .option('-l, --langs [langs]', 'dest languages, js,node,php')
      .option('-C, --dest-contract [destContract]', 'output contract directory')
      .option('-M, --dest-modals [destModals]', 'output modals directory')
      .option('-F, --dest-front [destFront]', 'output font-end projects directory')
      .option('-S, --sassMode [sassMode]', 'sass mode with app|modal', /^(app|modal)$/i, 'app')
  }
  program.on('--help', function(){
    console.log('  Examples:');
    console.log();
    if (locale === 'zh_CN') {
      console.log('  载入interface目录合约, 输出js和node标准合约到contract, 同步node方法, 同步前端路由,组件及样式');
    }
    console.log('  contract -i ./interface -l js,node -C ./contract -M modals -F ./front');
    if (locale === 'zh_CN') {
      console.log('  创建前端示例项目');
    }
    console.log('  contract -t create -a MyProject -F ./front');
    console.log();
  });
  // .option('-e, --example [example]', 'output simple example name')
  return program.parse(process.argv)
}

osLocale().then(locale => {
  let program = getProgram(locale)
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
    default:
      ensure(['langs'])
      any('contract', 'interface')
      any('destContract', 'destModals', 'destFront')
      let cmd = new CommandContract()
      cmd.execute(program).then(() => {
        console.log('success')
      })
      break
  }
});
