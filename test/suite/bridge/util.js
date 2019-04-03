/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

// 平台的环境
global.ENV_PLATFORM = 'na'

// 日志控制
console.trace = console.debug = new Function()
// console.trace = console.info
// console.trace = (...args) => args[0].indexOf('addActions') !== -1 && console.info(...args)
console.warn = new Function()
// console.error = new Function()

// 屏蔽框架LOG日志
const oriConsoleLog = console.log
console.log = (...args) => {
  const arg0 = args[0]
  if (typeof arg0 === 'string' && arg0.indexOf('### App') !== -1) {
  } else {
    oriConsoleLog.call(console, ...args)
  }
}

// 定时任务
const _oriSetTimeout = global.setTimeout
const _oriSetInterval = global.setInterval
const _oriRequestAnimationFrame = global.requestAnimationFrame

global.setTimeoutNative = function(iid, timerId, time) {
  _oriSetTimeout(function() {
    global.setTimeoutCallback(timerId)
  }, time)
}
global.setIntervalNative = function(iid, timerId, time) {
  _oriSetInterval(function() {
    global.setIntervalCallback(timerId)
  }, time)
}
global.requestAnimationFrameNative = function(iid, timerId, time) {
  _oriRequestAnimationFrame(function() {
    global.requestAnimationFrameCallback(timerId)
  }, time)
}
