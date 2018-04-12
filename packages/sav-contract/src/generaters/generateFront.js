import path from 'path'
import {ensureDir, outputFile, inputFile, pathExists} from '../utils/util.js'

export async function generateFront (dir, params) {
  let srcPath = path.join(PROJECT_ROOT, 'templates/front-template')
  dir = path.resolve(dir)
  await ensureDir(dir)
  await copyFile(path.join(srcPath, 'package.json'), path.join(dir, 'package.json'), params.appName)
  await copyFile(path.join(srcPath, 'contract.rc.js'), path.join(dir, 'contract.rc.js'), params.appName)
  await copyFile(path.join(srcPath, 'README.md'), path.join(dir, 'README.md'), params.appName)

  let sassPath = path.join(dir, 'sass')
  await ensureDir(sassPath)
  await copyFile(path.join(srcPath, 'sass/app.sass'), path.join(sassPath, 'app.sass'))

  let scriptPath = path.join(dir, 'script')
  await ensureDir(scriptPath)
  await copyFile(path.join(srcPath, 'script/build-client.js'), path.join(scriptPath, 'build-client.js'), params.appName)

  let staticPath = path.join(dir, 'static')
  let jsPath = path.join(staticPath, 'js')
  let cssPath = path.join(staticPath, 'css')
  await ensureDir(staticPath)
  await copyFile(path.join(srcPath, 'static/index.html'), path.join(staticPath, 'index.html'), params.appName)
  await copyFile(path.join(srcPath, 'static/.gitignore'), path.join(staticPath, '.gitignore'))
  await ensureDir(jsPath)
  await copyFile(path.join(srcPath, 'static/js/.gitkeep'), path.join(jsPath, '.gitkeep'))
  await ensureDir(cssPath)
  await copyFile(path.join(srcPath, 'static/css/.gitkeep'), path.join(cssPath, '.gitkeep'))

  let viewPath = path.join(dir, 'views')
  await ensureDir(viewPath)
  await copyFile(path.join(srcPath, 'views/App.vue'), path.join(viewPath, 'App.vue'))
  await copyFile(path.join(srcPath, 'views/client-entry.js'), path.join(viewPath, 'client-entry.js'))
  await copyFile(path.join(srcPath, 'views/client-plugin.js'), path.join(viewPath, 'client-plugin.js'))
  await copyFile(path.join(srcPath, 'views/routes.js'), path.join(viewPath, 'routes.js'))
  await copyFile(path.join(srcPath, 'views/index.html'), path.join(viewPath, 'index.html'), params.appName)

  let interfacePath = path.join(dir, 'interface')
  await ensureDir(interfacePath)
  await copyFile(path.join(srcPath, 'interface/project.js'), path.join(interfacePath, 'project.js'), params.appName)

  let modalsPath = path.join(interfacePath, 'modals')
  await ensureDir(modalsPath)
  await copyFile(path.join(srcPath, 'interface/modals/Home.js'), path.join(modalsPath, 'Home.js'), params.appName)
}

async function copyFile (src, dist, appName) {
  if (!await pathExists(dist)) {
    let text = await inputFile(src)
    if (appName) {
      text = text.toString().replace(/ProjectName/g, appName)
    }
    outputFile(dist, text)
  }
}
