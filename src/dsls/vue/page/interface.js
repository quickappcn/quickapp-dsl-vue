/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { invokeScript } from 'src/shared/function'

import { removeAppPrefix } from 'src/shared/util'

import context from '../context'

import { createVueModuleInstance, instances } from '../vm/bridge'

import { updatePageActions } from './misc'

/**
 * 初始化页面
 * @param {object} page page实例
 * @param {string} code 页面代码字符串
 * @param {object} query app传入的数据
 * @param {object} globals 全局变量
 * @return {object}
 */
function initPage(page, code, query, globals) {
  const instanceId = page.id

  // 对原有streamer实例方法进行拦截
  const listener = page.doc.listener
  const oriAddActions = listener.addActions

  listener.addActions = (...args) => {
    updatePageActions(page)
    oriAddActions.apply(listener, args)
  }

  // 构建Document的body
  const document = page.doc
  const nodeBody = document.createElement('div')
  document.documentElement.appendChild(nodeBody)

  // 缓存instance
  const instance = (instances[instanceId] = {
    instanceId: instanceId,
    document: document
  })

  // instance实例上挂载Vue实例
  const Vue = (instance.Vue = createVueModuleInstance(instanceId, { page: page }, query))

  // 实例代码执行需要的全局参数
  const instanceVars = Object.assign(
    {
      Vue: Vue,
      $app_define$: () => {},
      $app_bootstrap$: () => {},
      $app_define_wrap$: () => {},
      $app_require$: name => {
        return context.quickapp.platform.requireModule(page, removeAppPrefix(name))
      },
      $app_evaluate$: context.quickapp.dock.makeEvaluateBuildScript(globals)
    },
    globals
  )

  // 处理代码
  let functionBody
  functionBody = code.toString()
  functionBody = '(function(global){' + functionBody + '\n })(Object.create(this))'

  if (ENV_PLATFORM === 'na') {
    const bundleUrl = page.pageName ? `${page.pageName}/${page.pageComponent}.js` : '<anonymous>'
    console.trace(`### App Framework ### bundleUrl----`, bundleUrl)
    invokeScript(instanceVars, functionBody, bundleUrl)
  }

  page.doc.listener.createFinish()

  return instance
}

/**
 * 调用页面VM的生命周期事件
 * @param {object} page 对应的页面
 * @param {string} event 传入的事件名
 * @param {any} params 事件触发时的参数
 * @param {array} args 事件除了params额外携带的参数
 */
function invokePageEvent(event, page, params, ...args) {
  let result = false
  if (page.vm && page.vm._ready) {
    page.vm.$emit(`xlc:${event}`, params, ...args)
    result = page.vm._events[`xlc:${event}`].result
    updatePageActions(page)
    console.trace(`### App Framework ### ${event} (${page.id})----`)
  } else {
    console.trace(`### App Framework ### ${event} 页面(${page.id})创建失败, 无法响应事件---- `)
  }
  return result
}

/**
 * 处理特殊事件：点击菜单
 * @param {object} page 对应的页面
 */
function handleMenuPressEvent(page) {
  let result = false
  if (page.vm && page.vm._ready) {
    const events = page.vm._events
    const handlerList = events && events['xlc:onMenuPress'] && events['xlc:onMenuPress'].handlers
    if (handlerList && handlerList.length) {
      result = true
    }
  }
  return result
}

export { initPage, invokePageEvent, handleMenuPressEvent }
