/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import path from 'path'
import fs from 'fs'

import { allFeatureMethList, allFeatureInstHash } from './features/fn'

import { requireByRepo } from '../common'

const proxyCallNative = requireByRepo(
  'dist/release/output/styling',
  'proxyCallNative',
  'src/infras/styling/index',
  'proxyCallNative'
)

const Base64 = requireByRepo(
  'dist/release/output/infras-ext',
  'Base64',
  'src/infras/bundles/canvas/base64',
  'default'
)

// 消息收集
const callActionJsonList = []
const commandsList = []

// 对操作指令的解释
// 0x20000001 31位 1是webgl，0是2d 30位1 0是异步，1位同步 1-13位是操作，其他为保留位
const OPERATION = {
  RENDER_2D_SYNC: 0x20000001,
  BUFFER_2D_SYNC: 0x20000000
}

// DSL对应的打包地址别称，之后拓展内容在此添加
const ALIAS = {
  xvm: 'xvm',
  vue: 'vue/project'
}

let unique = 1
let defaultAppId

function getAppDir(dslName) {
  return path.join(__dirname, `../../../build/dsls/${ALIAS[dslName]}/app`)
}

/**
 * 加载系统locale与RPK中的locale资源
 * @param dirApp
 */
function loadLocaleConfig(dirApp) {
  const localeObject = {
    language: 'zh',
    countryOrRegion: 'CN'
  }

  const localeResHash = {}

  const i18nDir = path.join(dirApp, 'i18n')
  if (fs.existsSync(i18nDir)) {
    fs.readdirSync(i18nDir).forEach(function(filename) {
      const basename = path.parse(filename).name
      const filepath = path.join(i18nDir, filename)
      const filejson = JSON.parse(getFileContent(filepath))
      localeResHash[basename] = filejson
    })
  }

  const resources = ['zh-CN', 'zh', 'en', 'defaults']
    .map(name => {
      return localeResHash[name]
    })
    .filter(obj => !!obj)

  return [localeObject, resources]
}

function uniqueId() {
  return unique++
}

function initMainPlatform(dslName) {
  // 组件列表
  const componentList = [
    { name: 'element1', methods: ['method1'] },
    { name: 'element1', methods: ['method2'] },
    { name: 'a', methods: [] },
    { name: 'div', methods: [] },
    { name: 'list', methods: ['scrollTo'] },
    { name: 'list-item', methods: [] },
    { name: 'tabs', methods: [] },
    { name: 'tab-bar', methods: [] },
    { name: 'tab-content', methods: [] },
    { name: 'swiper', methods: ['swipeTo'] },
    { name: 'stack', methods: ['requestFullscreen'] },
    { name: 'video', methods: ['requestFullscreen'] },
    { name: 'input', methods: ['focus'] },
    { name: 'textarea', methods: ['focus'] },
    { name: 'picker', methods: ['show'] },
    {
      name: 'canvas',
      types: ['canvas'],
      methods: ['toTempFilePath', 'getContext']
    },
    {
      name: 'web',
      methods: ['reload', 'forward', 'back', 'canForward', 'canBack']
    }
  ]

  // 引入框架
  requireByRepo('dist/release/output/infras', null, 'src/infras/entry/main/index.js')

  // 初始化框架
  global.initInfras()

  // 注入环境
  global.Env = {
    platform: 'na',
    osVersion: null,
    osVersionInt: null,
    appVersionName: null,
    appVersionCode: null,
    appName: null,
    logLevel: 'trace',
    density: null,
    densityDpi: null,
    deviceWidth: 1080,
    deviceHeight: 1280,
    engine: 'page'
  }

  // 加载Bundle代码
  global.readResource = function(bundlePath) {
    const temp = bundlePath.match(/.+\/(.+)\.js$/)
    const dir = temp && temp[1]
    if (!dir) {
      return null
    }
    if (dir && dir.indexOf('dsl') > -1) {
      // 资源加载使用，加载对应的dsl文件
      return require(`src/dsls/${dir.slice(4)}/index`).default
    }
    // 模块加载，返回对应module的模块
    return requireByRepo(
      'dist/release/output/infras-ext',
      `bundles.${dir}`,
      `src/infras/bundles/${dir}/index`,
      'default'
    )
  }

  // 获取manifest
  global.loadManifestJSON = function() {
    const dirApp = getAppDir(dslName)
    const fileManifest = path.join(dirApp, 'manifest.json')
    return require(fileManifest)
  }

  // 收集消息
  global.callNative = new Function()
  // 接口定义
  global.JsBridge = global.ModuleManager = {
    invoke(moduleName, methodName, args, callbackId, moduleInstId) {
      if (typeof args === 'string') {
        args = JSON.parse(args)
      }
      if (allFeatureInstHash[moduleName] && allFeatureInstHash[moduleName][methodName]) {
        global.moduleInstId = moduleInstId
        const result = allFeatureInstHash[moduleName][methodName](args, callbackId, moduleInstId)
        return result
      } else {
        throw new Error(`ERROR: Unknown moduleName:${moduleName}, methodName:${methodName}`)
      }
    }
  }
  // 为canvas服务
  global.extendCallNative = function(componentId, SYNC_2D, commands) {
    commandsList.push(commands)

    // 模拟返回Uint8ClampedArray类型数据
    if (SYNC_2D === OPERATION.BUFFER_2D_SYNC && commands.indexOf('R') !== -1) {
      return Base64.arrayBufferToBase64(new Uint8ClampedArray())
    }
  }
  // 全局ViewId函数
  global.getPageElementViewId = function(ref) {
    return 1e3 + ref
  }

  // 注册模块
  global.registerModules([], 'modules')
  // 注册组件
  global.registerComponents(componentList)
  // 注册Feature
  global.registerModules(allFeatureMethList, 'feature')
  // 注册manifest
  global.registerManifest(JSON.stringify(global.loadManifestJSON()))
  // 定位相应的Dsl
  global.locateDsl()
}

function initWorkerPlatform(dslName = 'xvm') {
  // 注入环境
  global.Env = {
    platform: 'na',
    osVersion: null,
    osVersionInt: null,
    appVersionName: null,
    appVersionCode: null,
    appName: null,
    logLevel: 'trace',
    density: null,
    densityDpi: null,
    deviceWidth: 1080,
    deviceHeight: 1280,
    engine: 'page'
  }

  // 引入框架
  require('src/infras/entry/worker')

  // 接口定义
  global.JsBridge = global.ModuleManager = {
    invoke(moduleName, methodName, args, callbackId, moduleInstId) {
      if (args === undefined) {
        throw new Error(
          `ERROR: moduleName:${moduleName}, methodName:${methodName} 的参数为undefined`
        )
      }
      if (typeof args === 'string') {
        args = JSON.parse(args)
      }
      if (allFeatureInstHash[moduleName] && allFeatureInstHash[moduleName][methodName]) {
        const result = allFeatureInstHash[moduleName][methodName](args, callbackId, moduleInstId)
        return result
      } else {
        throw new Error(`ERROR: Unknown moduleName:${moduleName}, methodName:${methodName}`)
      }
    }
  }

  // worker消息
  global.postMessageInternal = function(message) {
    setTimeout(function() {
      global.onMessageInternal(JSON.parse(message))
    }, 10)
  }

  // 加载manifest
  global.loadManifestJSON = function() {
    const dirApp = getAppDir(dslName)
    const fileManifest = path.join(dirApp, 'manifest.json')
    return require(fileManifest)
  }

  // 注册模块
  global.registerModules([], 'modules')
  // 注册Feature
  global.registerModules(allFeatureMethList, 'feature')
  // 注册manifest
  global.registerManifest(JSON.stringify(global.loadManifestJSON()))
}

function initAOP() {
  global.callNative = function(instId, actionList) {
    if (typeof actionList === 'string') {
      actionList = JSON.parse(actionList)
    }

    for (let i = 0, len = actionList.length; i < len; i++) {
      const actionItem = actionList[i]
      // 忽略统计数据
      if (actionItem.method !== 'statistics') {
        const msg = `${JSON.stringify(actionItem)}`
        callActionJsonList.push(msg)
      }
    }
  }

  // TODO 通过开关控制
  proxyCallNative()
}

function initApp(dslName) {
  if (global.bInited) {
    return
  }

  const dirApp = getAppDir(dslName)
  const fileApp = path.join(dirApp, 'app.js')

  const appId = (defaultAppId = uniqueId())
  const appJs = getFileContent(fileApp)

  const retI18n = loadLocaleConfig(dirApp)
  // 更新locale
  global.changeAppLocale(...retI18n)
  // 创建APP
  global.createApplication(appId, appJs)

  global.bInited = true
}

function initPage(pageId, appId, srcPath, query = {}, intent = {}, meta = {}) {
  let srcFilePath = srcPath

  if (fs.statSync(srcPath).isDirectory()) {
    srcFilePath = path.resolve(srcFilePath, 'index.ux')
  }
  if (!appId) {
    appId = defaultAppId
  }
  const dstFilePath = getCompiledPath(srcFilePath)
  const dstFileCont = getFileContent(dstFilePath)
  const css = getPageCss(dstFilePath)
  global.createPage(
    pageId,
    appId,
    dstFileCont,
    query,
    intent || { currentPageName: 'undefined' },
    meta,
    css
  )
}

function initWorker(instId, srcPath, ...args) {
  let srcFilePath = srcPath

  if (fs.statSync(srcPath).isDirectory()) {
    srcFilePath = path.resolve(srcFilePath, 'index.worker.js')
  }

  const dstFilePath = getCompiledPath(srcFilePath)
  const dstFileCont = getFileContent(dstFilePath)
  global.createWorker(instId, dstFileCont, ...args)
}

function getFileContent(filePath) {
  return fs.readFileSync(filePath, {
    encoding: 'UTF-8'
  })
}

function getPageCss(dstFilePath) {
  const cssJSONPath = dstFilePath.replace(`.js`, `.css.json`)
  try {
    return fs.readFileSync(cssJSONPath, 'utf8')
  } catch (e) {
    return null
  }
}

function getCompiledPath(srcPath) {
  const dirPath = srcPath.replace(`suite`, 'build')
  const dstPath = dirPath.replace('.ux', '.js')
  return dstPath
}

async function boot(dslName) {
  // 准备环境
  await initMainPlatform(dslName)

  // 函数拦截
  await initAOP()

  // 创建App
  await initApp(dslName)
}

export {
  commandsList,
  callActionJsonList,
  uniqueId,
  initMainPlatform,
  initWorkerPlatform,
  initAOP,
  initApp,
  initPage,
  initWorker,
  boot
}
