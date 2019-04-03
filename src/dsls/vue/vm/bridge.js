/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */
import VueFactory from './factory'
import context from '../context'

// 底层传递的事件
const VM_KEYS = {
  onShow: 'onShow',
  onHide: 'onHide',
  onBackPress: 'onBackPress',
  onMenuPress: 'onMenuPress',
  onDestroy: 'onDestroy',
  onOrientationChange: 'onOrientationChange'
}

const instances = {}

let pageModule = null

function createVueModuleInstance(instanceId, options, data) {
  const page = options.page
  const appRequireModule = options.appRequireModule

  // 用于向VueFactory注入快应用接口
  const quickappHelper = {
    /**
     * 设置dom元素的attr属性
     * @param {*} element dom对象
     * @param {*} key 属性键名
     * @param {*} value 属性值
     */
    setElementAttr(element, key, value) {
      context.quickapp.runtime.helper.setElementAttr(element, key, value)
    },
    /**
     * 设置dom元素的style样式
     * @param {*} element dom对象
     * @param {*} name 样式键名
     * @param {*} value 样式值
     */
    setElementStyle(element, name, value) {
      // 转换数字为字符串
      typeof value === 'number' && (value += '')
      context.quickapp.runtime.helper.setElementStyle(element, name, value)
    },
    /**
     * 为dom元素添加方法
     * @param {*} element dom对象
     */
    bindElementMethods(element) {
      context.quickapp.dock.bindComponentMethods(page, element)
    }
  }

  const exports = {}
  VueFactory(exports, page.doc, quickappHelper)
  const Vue = exports.Vue

  // 放到全局
  global.Vue = true

  const instance = instances[instanceId]

  // patch reserved tag detection to account for dynamically registered components
  const quickappRegex = /^quickapp:/i
  const isReservedTag =
    Vue.config.isReservedTag ||
    function() {
      return false
    }
  const isRuntimeComponent =
    Vue.config.isRuntimeComponent ||
    function() {
      return false
    }
  Vue.config.externalData = data
  Vue.config.isReservedTag = function(name) {
    return (!isRuntimeComponent(name) && false) || isReservedTag(name) || quickappRegex.test(name)
  }
  Vue.config.parsePlatformTagName = function(name) {
    return name.replace(quickappRegex, '')
  }

  // expose quickapp-specific info
  Vue.prototype.$instanceId = instanceId
  Vue.prototype.$document = instance.document

  Vue.prototype._connectVm2Page = function() {
    page.vm = this
  }

  /**
   * 当前App对象
   */
  Object.defineProperty(Vue.prototype, '$app', {
    get() {
      if (this._isDestroyed) {
        return
      }
      return page.app
    }
  })

  /**
   * 当前page对象
   */
  Object.defineProperty(Vue.prototype, '$page', {
    get() {
      if (this._isDestroyed) {
        return
      }
      const app = page.app
      return Object.assign(
        {
          setTitleBar: function(attr) {
            // 如果是页面对象
            if (page && page.doc) {
              console.log(`### App Framework ### 页面 ${page.id} 调用 setTitleBar ----`)
              context.quickapp.runtime.helper.updatePageTitleBar(page.doc, attr)
            }
          },
          exitFullscreen: function() {
            // 如果是页面对象
            if (page && page.doc) {
              console.log(`### App Framework ### 页面 ${page.id} 调用 exitFullscreen ----`)
              context.quickapp.runtime.helper.exitFullscreen(page.doc)
            }
          },
          finish: function() {
            // 调用native侧提供的接口，销毁页面对象
            if (page && page.doc) {
              if (pageModule === null) {
                pageModule = context.quickapp.platform.requireModule(app, 'system.page')
              }
              pageModule.finishPage(page.id)
            }
          }
        },
        page && page._meta
      )
    }
  })

  // Vue实例的部分属性
  Object.defineProperties(Vue.prototype, {
    // vm对应的页面是否有效
    $valid: {
      get: () => !!page && page._valid,
      configurable: false
    },
    // vm对应的页面是否正在展示中
    $visible: {
      get: () => !!page && page._valid && page._visible,
      configurable: false
    },
    // vm本身是否已销毁
    $destroyed: {
      get: () => !!page && page.vm && page.vm._isDestroyed,
      configurable: false
    }
  })

  /**
   * 注册页面生命周期
   */
  Vue.prototype._registerPageLifecycle = function() {
    Object.keys(VM_KEYS).forEach(item => {
      this.$on(`xlc:${item}`, args => {
        let result = false
        const hook = this.$options[item]
        if (!hook || typeof hook !== 'function') return
        const handlers = Array.isArray(hook) ? hook : [hook]
        if (handlers && handlers.length) {
          for (let i = 0; i < handlers.length; i++) {
            try {
              const r = handlers[i].call(this, args)
              if (r) {
                result = true
              }
            } catch (e) {
              console.error(e)
            }
          }
        }
        this._events[`xlc:${item}`].result = result
        this._events[`xlc:${item}`].handlers = handlers
      })
    })
  }

  // expose quickapp native module getter on subVue prototype so that
  // vdom runtime modules can access native modules via vnode.context
  Vue.prototype.$requireQuickappModule = appRequireModule

  // Hack `Vue` behavior to handle instance information and data
  // before root component created.
  Vue.mixin({
    beforeCreate: function beforeCreate() {
      const options = this.$options
      // root component (vm)
      if (options.el) {
        // set external data of instance
        const dataOption = options.data
        const internalData = (typeof dataOption === 'function' ? dataOption() : dataOption) || {}
        options.data = Object.assign(internalData, instance.data)
        // record instance by id
        instance.app = this
      }
      // connect page 用于this._page.intent
      this._page = page
    }
  })

  /**
   * @deprecated Just instance variable `quickapp.config`
   * Get instance config.
   * @return {object}
   */
  Vue.prototype.$getConfig = function() {
    if (instance.app instanceof Vue) {
      return instance.config
    }
  }

  return Vue
}

export { createVueModuleInstance, instances, VM_KEYS }
