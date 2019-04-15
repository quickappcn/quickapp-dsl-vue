/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const path = require('path')
const fs = require('fs')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HandlerPlugin = require('hap-toolkit/packager/lib/dsl/common/plugin/handler-plugin')
const Css2jsonPlugin = require('hap-toolkit/packager/lib/dsl/vue/plugin/css2json-plugin')
const InstVuePlugin = require('hap-toolkit/packager/lib/dsl/vue/plugin/instvue-plugin')

/**
 * 配置关联
 * @param webpackConf
 * @param defaults
 * @param options
 */
function postHook(webpackConf, defaults, options) {
  // 环境信息
  const {
    //   // 配置环境
    //   nodeConf,
    //   appPackageName,
    //   versionCode,
    //   pathDist,
    //   pathBuild,
    pathSrc
  } = defaults

  // 默认值
  webpackConf.module.rules = webpackConf.module.rules || []
  webpackConf.plugins = webpackConf.plugins || []
  webpackConf.plugins.push(
    new VueLoaderPlugin(),
    new Css2jsonPlugin(),
    new HandlerPlugin({
      pathSrc: pathSrc
    }),
    new InstVuePlugin()
  )
  webpackConf.externals = webpackConf.externals || {}

  const vueSrc = path.resolve(process.cwd(), `test/suite/dsls/vue/project`)
  traverseVueSuite(vueSrc)

  function traverseVueSuite(baseDir, type) {
    fs.readdirSync(baseDir).forEach(item => {
      // 此正则下文相同
      const jsReg = /\b(app|index)\b\.vue$/
      const subFile = path.resolve(baseDir, item)
      const stats = fs.statSync(subFile)
      if (stats.isFile() && jsReg.test(subFile)) {
        // 正则紧接上文
        const key = `test/build/dsls/${subFile.replace(
          /(.*)(test(\/|\\)suite(\/|\\)dsls(\/|\\))(.*)(\b(app|index)\b\.vue$)/,
          (...args) => args[6]
        )}${type}`
        webpackConf.entry[key] = `${subFile}?vueType=${type === 'app' ? 'app' : 'page'}`
        console.log('### App Loader ### 添加 entry: ', key)
        if (type === 'app') {
          const manifestFrom = subFile.replace('app.vue', 'manifest.json')
          const manifestDest = key.replace(/app$/, 'manifest.json')
          mkdirp(path.dirname(manifestDest))
          fs.writeFileSync(manifestDest, fs.readFileSync(manifestFrom))
        }
        if (type === 'index') {
          webpackConf.plugins.push(
            new MiniCssExtractPlugin({
              filename: '[name].css.json'
            })
          )
        }
        return
      }
      if (stats.isDirectory()) {
        traverseVueSuite(subFile, type || (item === 'app' ? 'app' : 'index'))
      }
    })
  }

  webpackConf.module.rules.push(
    {
      test: /\.vue$/,
      loader: 'vue-loader'
    },
    {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader']
    }
  )

  webpackConf.resolve.extensions.push('.vue')
  webpackConf.externals.vue = 'Vue'

  console.log(`项目配置：webpack.config.js`, webpackConf.entry)
}

function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    mkdirp(path.dirname(dir))
    fs.mkdirSync(dir)
  }
}

module.exports = {
  postHook
}
