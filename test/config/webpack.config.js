/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const path = require('path')
const fs = require('fs')
const webpack = require('webpack')

const HandlerPlugin = require(resolvePlugin('handler-plugin', 'common'))

// 支持文件扩展名
const FILE_EXT_LIST = ['.ux']
// 所在目录名
const pathSource = path.resolve(__dirname, '../suite/dsls')
const pathBuild = path.resolve(__dirname, '../../')
// 页面文件
const zipPages = {}

// 提取脚本文件，资源文件
parse(pathSource, '.', false)

module.exports = {
  entry: zipPages,
  mode: 'development',
  output: {
    path: pathBuild,
    filename: '[name].js'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: new RegExp(`(${FILE_EXT_LIST.map(k => '\\' + k).join('|')})(\\?[^?]+)?$`),
        loaders: [require.resolve(resolveLoader('ux-loader.js'))]
      },
      {
        test: /\.js/,
        loaders: [require.resolve(resolveLoader('module-loader.js', 'common')), 'babel-loader']
      }
    ]
  },
  plugins: [new HandlerPlugin()],
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js', '.json'].concat(FILE_EXT_LIST),
    alias: {
      src: path.join(process.cwd(), 'src')
    }
  },
  stats: {
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    modules: false,
    version: false,
    assets: false
  },
  node: {
    global: false,
    console: false,
    process: false
  }
}
function resolveLoader(loader, type = 'ux') {
  return path.join('hap-toolkit/packager/lib', `dsl/${type}/loader`, loader)
}
function resolvePlugin(plugin, type = 'ux') {
  return path.join('hap-toolkit/packager/lib', `dsl/${type}/plugin`, plugin)
}
// 加载vue相关配置
const moduleWebpackConf = require('./config/webpack.config')
if (moduleWebpackConf.postHook) {
  moduleWebpackConf.postHook(module.exports, {})
}

module.exports

/**
 * 查找所有的ux文件
 */
function parse(baseDir, partDir, common) {
  let name
  const dir = path.join(baseDir, partDir)
  // 递归遍历目录
  fs.readdirSync(dir).forEach(function(filename) {
    const fullpath = path.join(dir, filename)
    // console.log('### App Loader ### 准备文件', fullpath)

    const stat = fs.statSync(fullpath)
    const extname = path.extname(fullpath)
    // 只处理指定类型的文件，添加到entry中( Common目录下的脚本文件不处理 )
    if (stat.isFile()) {
      const isEntryPage = FILE_EXT_LIST.indexOf(extname) >= 0
      const isEntryWorker = /.*\.worker\.js$/.test(filename)
      if (isEntryPage && !common) {
        name = path.join('test', 'build/dsls', partDir, path.basename(filename, extname))
        const relativePath = path.relative(__dirname + '/../../', fullpath)
        const uxType = filename === 'app.ux' ? 'app' : 'page'
        zipPages[name] = `./${relativePath}?uxType=${uxType}`
        console.log('### App Loader ### 添加 entry: ', name)

        // 复制一份文件供应用创建
        if (filename === 'app.ux') {
          const manifestFrom = relativePath.replace('app.ux', 'manifest.json')
          const manifestDest = name.replace(/app$/, 'manifest.json')
          mkdirp(path.dirname(manifestDest))
          fs.writeFileSync(manifestDest, fs.readFileSync(manifestFrom))
        }
      }
    } else if (stat.isDirectory()) {
      const subdir = path.join(partDir, filename)
      const isCommon = common || filename.toLowerCase() === 'common'
      parse(baseDir, subdir, isCommon)
    }
  })
}

function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    mkdirp(path.dirname(dir))
    fs.mkdirSync(dir)
  }
}
