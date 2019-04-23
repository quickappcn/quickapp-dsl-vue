/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import path from 'path'
import fs from 'fs'

import json from 'rollup-plugin-json' // 通过import引入json文件
import { eslint } from 'rollup-plugin-eslint' // 代码风格检查
import nodeResolve from 'rollup-plugin-node-resolve' // 解析npm包
import commonjs from 'rollup-plugin-commonjs' // commonJS转换为ES6
import buble from 'rollup-plugin-buble' // 转化相应的v8版本的ES6语法特性
import replace from 'rollup-plugin-replace' // Likely with DefinePlugin
import { terser } from 'rollup-plugin-terser' // terser用来混淆ES6代码
import alias from 'rollup-plugin-alias'

const pkg = require('../package.json')
const version = pkg.version
const date = new Date()
  .toISOString()
  .split('T')[0]
  .replace(/-/g, '')

// 配置环境
const nodeConf = parse()
// 变量替换的工作
const rollInject = {
  // 平台：na
  ENV_PLATFORM: JSON.stringify(nodeConf.NODE_PLATFORM),
  // 阶段: dv|qa|ol
  ENV_PHASE: JSON.stringify(nodeConf.NODE_PHASE),
  // OL环境无assert
  'console.assert': `!${nodeConf.NODE_PHASE === 'ol'} && console.assert`,
  // 提前判断，函数减少入栈出栈
  'console.trace': `global.Env && global.Env.logLevel === 'trace' && console.trace`
}

// Rollup配置
const rollConf = {
  output: {
    banner: `\
    (function(s) {console.log(s)})('### QuickApp-Vue Framework ### Version: ${version} Build ${date}');
    var global = this;
    `,
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    json(),
    eslint({
      exclude: './package.json'
    }),
    alias({
      resolve: ['.js', '/index.js'],
      src: path.resolve(__dirname, './../src/')
    }),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs(),
    buble({
      target: {
        chrome: 66 // 如果需要支持更高版本的chrome，请升级buble插件
      }
    }),
    replace({
      exclude: ['node_modules/**', 'package.json'],
      values: rollInject
    })
  ]
}

if (nodeConf.NODE_PHASE === 'dv') {
} else {
  // Uglify
  rollConf.plugins.push(terser())
}

if (nodeConf.NODE_PLATFORM === 'h5') {
} else {
}

const confList = nodeConf.list.map(item => {
  const output = Object.assign({}, rollConf.output, item.output)
  return Object.assign({}, rollConf, item, { output })
})

export default confList

/**
 * 解析NODE环境的参数
 */
function parse(config) {
  config = config || {}
  // 平台：na
  config.NODE_PLATFORM = process.env.NODE_PLATFORM
  // 阶段: dv|qa|ol
  config.NODE_PHASE = process.env.NODE_PHASE

  const NODE_ENV = `${config.NODE_PLATFORM}-${config.NODE_PHASE}`

  switch (NODE_ENV) {
    // NA环境
    case 'na-dv':
      config.list = collectExportList('debug', './src/dsls')
      break
    case 'na-qa':
      config.list = collectExportList('debug', './src/dsls')
      break
    case 'na-ol':
      config.list = collectExportList('release', './src/dsls')
      break
    default:
      throw new Error(`Unknown node environment: ${NODE_ENV}`)
  }

  console.info('config: ', JSON.stringify(config, null, 4))
  return config
}

/**
 * 收集最终生成的JS文件并生成rollup配置
 * @param {string} env debug/release
 * @param {string} moduleSrc module文件夹位置
 */
function collectExportList(env, dslsSrc) {
  const list = []

  fs.readdirSync(dslsSrc).forEach(dir => {
    // 收集指定目录下的JS模块
    list.push({
      input: `${dslsSrc}/${dir}/index.js`,
      output: {
        file: `./dist/${env}/dsls/${dir}.js`,
        format: 'iife',
        name: 'dsl',
        banner: ''
      }
    })
  })
  return list
}
