
module.exports = function () {
  require('child_process').spawn(require('path').resolve(__dirname, ({
    win32: 'contract.exe',
    darwin: 'contract',
  })[process.platform] || 'contract'), 
    process.argv.slice(2), { stdio: 'inherit' }
  ).on('close', function (code) {
    process.exit(code)
  })
}
