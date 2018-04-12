module.exports = {
  appName: 'ProjectName',     // 应用名称
  langs:  'js,node',          // 目标语言, js,node,php,go,java

  interface: './interface',   // interface 输入目录
  contract: './contract',     // contract 输入目录

  destContract: './contract', // contract 输出目录
  destModals: './modals',     // modals输出目录
  destFront: './',            // 前端项目输出目录
  sassMode: 'app',            // app|modal
}
