/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import path from 'path'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import regeneratorRuntime from '@babel/runtime/regenerator'
import { addPath } from 'app-module-path'

import './util'

// 方便src中alias模块的查找
addPath(path.resolve(__dirname, '../../../'))

chai.use(sinonChai)

// 全局使用
global.expect = chai.expect
global.sinon = sinon
global.regeneratorRuntime = regeneratorRuntime

// 等待下次轮询
global.waitForOK = function(ms = 10) {
  return new Promise(res => {
    setTimeout(() => {
      res()
    }, ms)
  })
}

// 屏蔽期间产生的日志
global.suppressConsole = function(fn) {
  // 拦截报错
  const consoleError = console.error
  console.error = new Function()
  fn()
  // 恢复报错
  console.error = consoleError
}
