/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { removeAppPrefix } from 'src/shared/util'

import context from '../context'

import { invokeScript } from 'src/shared/function'

/**
 * 初始化App
 * @param inst
 * @param code
 * @returns {*}
 */
export function initApp(inst, code) {
  console.trace(`### App Framework ### 开始初始化App(${inst.id})`)

  // 准备App全局方法
  const instRequireModule = name => {
    return context.quickapp.platform.requireModule(inst, removeAppPrefix(name))
  }

  const instDefine = def => {
    inst.$def = def
  }

  const instBootstrap = () => {
    console.trace(`### App Framework ### 调用App(${inst.name})生命周期---- onCreate`)
    inst.$emit('applc:onCreate')
  }

  // 处理代码
  let functionBody
  functionBody = code.toString()
  // 重新封装代码
  functionBody = `(function(global){"use strict"; \n var options = ${functionBody}; \n $app_define$(options.default); \n $app_bootstrap$(); \n })(Object.create(this))`
  console.trace(`### App Framework ### 开始编译代码----`)

  if (ENV_PLATFORM === 'na') {
    // 如果是原生渲染
    const globalObjects = {
      $app_define$: instDefine,
      $app_require$: instRequireModule,
      $app_bootstrap$: instBootstrap
    }

    invokeScript(globalObjects, functionBody, '/app.js')
  }
}
