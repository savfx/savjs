import {Command} from 'commander'
import osLocale from 'os-locale'
import {resolve} from 'path'
import {CommandContract} from './CommandContract.js'

function getProgram (locale) {
  let program = (new Command()).version('$$VERSION$$')
  if (locale === 'zh_CN') {
    program
      .option('-t, --type <type>', '命令类型 sync 同步(默认)|create 创建')
      .option('-i, --interface [interface]', 'interface 输入目录')
      .option('-c, --contract [contract]', 'contract 输入目录')
      .option('-l, --langs [langs]', '目标语言, js,node,php')
      .option('-C, --dest-contract [destContract]', 'contract 输出目录')
      .option('-M, --dest-modals [destModals]', 'modals 输出目录')
      .option('-F, --dest-front [destFront]', '前端项目输出目录')
  } else {
    program
      .option('-t, --type <type>', 'command type sync(default)|create')
      .option('-i, --interface [interface]', 'input interface directory')
      .option('-c, --contract [contract]', 'input contract directory')
      .option('-l, --langs [langs]', 'dest languages, js,node,php')
      .option('-C, --dest-contract [destContract]', 'output contract directory')
      .option('-M, --dest-modals [destModals]', 'output modals directory')
      .option('-F, --dest-front [destFront]', 'output font-end projects directory')
  }
  program.on('--help', function(){
    console.log('  Examples:');
    console.log();
    console.log('  sav-cli -t sync -i ./interface -l js,node -C ./contract -M node-modals -P ./font-end-project');
    console.log();
  });
  // .option('-a, --app [app]', 'input app name')
  // .option('-e, --example [example]', 'output simple example name')

  // .option('-m, --modal [modal]', 'output modals, -m contract,action,sass,vue,rollup,package, default all')
  // .option('-S, --sassPage [sassPage]', 'sass page by modal|action|app', /^(modal|action|app)$/i, 'app')
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
      break
    default:
      ensure(['langs'])
      any('contract', 'interface')
      any('destContract', 'destModals', 'destFront')
      let cmd = new CommandContract()
      cmd.execute(program)
      break
  }
}); 
