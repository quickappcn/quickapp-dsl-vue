/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { APP_KEYS } from 'src/shared/events'

import { initApp } from './app/interface'

import { initPage, invokePageEvent, handleMenuPressEvent } from './page/interface'

import { fireEvent, destroyPage, updatePageActions } from './page/misc'

import context from './context'

import { VM_KEYS } from './vm/bridge'

export default {
  init
}

function init(quickapp) {
  context.quickapp = quickapp

  // Vue Polyfill: isServerRendering标志位需要process.env
  global.process = global.process || {}
  global.process.env = {}

  quickapp.subscribe(APP_KEYS.initApp, args => {
    return initApp(...args)
  })

  quickapp.subscribe(APP_KEYS.initPage, args => {
    return initPage(...args)
  })
  quickapp.subscribe(APP_KEYS.destroyPage, args => {
    destroyPage(...args)
  })

  quickapp.subscribe(APP_KEYS.fireEvent, args => {
    const result = fireEvent(...args)
    updatePageActions(args[0])
    return result
  })

  quickapp.subscribe(APP_KEYS.callbackDone, args => {
    updatePageActions(args[0])
  })

  quickapp.subscribe(APP_KEYS.onShow, args => {
    return invokePageEvent(VM_KEYS.onShow, ...args)
  })

  quickapp.subscribe(APP_KEYS.onHide, args => {
    return invokePageEvent(VM_KEYS.onHide, ...args)
  })

  quickapp.subscribe(APP_KEYS.onBackPress, args => {
    return invokePageEvent(VM_KEYS.onBackPress, ...args)
  })

  quickapp.subscribe(APP_KEYS.onMenuPress, args => {
    invokePageEvent(VM_KEYS.onMenuPress, ...args)
    return handleMenuPressEvent(...args)
  })

  quickapp.subscribe(APP_KEYS.onConfigurationChanged, args => {
    return invokePageEvent(VM_KEYS.onConfigurationChanged, ...args)
  })

  quickapp.subscribe(APP_KEYS.onOrientationChange, args => {
    return invokePageEvent(VM_KEYS.onOrientationChange, ...args)
  })

  quickapp.subscribe(APP_KEYS.onRefresh, args => {
    return invokePageEvent(VM_KEYS.onRefresh, ...args)
  })
}
