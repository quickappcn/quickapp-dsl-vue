/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

/**
 * 使用Function构造函数创建函数并执行
 * @param  {object} globalObjects - 参数组成的对象
 * @param  {string} body - 函数体
 * @return {any}
 */
function callFunction(globalObjects, body) {
  const globalKeys = []
  const globalValues = []
  for (const key in globalObjects) {
    globalKeys.push(key)
    globalValues.push(globalObjects[key])
  }
  globalKeys.push(body)

  const fn = new Function(...globalKeys)
  return fn(...globalValues)
}

/**
 * 使用V8原生方法创建函数并执行
 * @param  {object} globalObjects - 参数组成的对象
 * @param  {string} body - 函数体
 * @param  {string} bundleUrl - 关联文件来源
 * @return {any}
 */
function callFunctionNative(globalObjects, body, bundleUrl) {
  let script = '(function ('
  const globalKeys = []
  const globalValues = []
  for (const key in globalObjects) {
    globalKeys.push(key)
    globalValues.push(globalObjects[key])
  }
  for (let i = 0; i < globalKeys.length - 1; ++i) {
    script += globalKeys[i]
    script += ','
  }
  script += globalKeys[globalKeys.length - 1]
  script += ') {'
  script += body
  script += '} )'

  const ret = global.compileAndRunScript(script, bundleUrl)

  if (ret && typeof ret === 'function') {
    return ret(...globalValues)
  }
  return ret
}

/**
 * 使用脚本创建函数并执行
 * @param  {object} globalObjects - 参数组成的对象
 * @param  {string} body - 函数体
 * @param  {string} bundleUrl - 关联文件来源
 * @return {any}
 */
function invokeScript(globalObjects, body, bundleUrl) {
  if (typeof global.compileAndRunScript === 'function') {
    return callFunctionNative(globalObjects, body, bundleUrl)
  }
  return callFunction(globalObjects, body)
}

export { invokeScript }
