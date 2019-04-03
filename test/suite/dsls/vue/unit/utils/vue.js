/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import vueFactory from 'src/dsls/vue/vm/factory-with-compiler'

import { requireByRepo } from '../../../../bridge/common'

const DOM = requireByRepo(
  'dist/release/output/infras-ext',
  'Runtime',
  'src/infras/runtime/index',
  'default'
)

DOM.init()

export const document = DOM.helper.createDocument((Math.random() * 100) >> 0)

const receive = {}

vueFactory(receive, document, {
  bindElementMethods: new Function(),
  setElementAttr(element, key, value) {
    DOM.helper.setElementAttr(element, key, value)
  },
  setElementStyle(element, name, value) {
    typeof value === 'number' && (value += '')
    DOM.helper.setElementStyle(element, name, value)
  }
})

const Vue = receive.Vue

// 重构waitForUpdate
global.waitForUpdate = initialCb => {
  const queue = initialCb ? [initialCb] : []

  function shift() {
    const job = queue.shift()
    if (queue.length) {
      let hasError = false
      try {
        job.wait ? job(shift) : job()
      } catch (e) {
        hasError = true
      }
      if (!hasError && !job.wait) {
        if (queue.length) {
          Vue.nextTick(shift)
        }
      }
    } else if (job) {
      job()
    }
  }

  Vue.nextTick(() => {
    shift()
  })

  const chainer = {
    then: nextCb => {
      queue.push(nextCb)
      return chainer
    },
    thenWaitFor: wait => {
      if (typeof wait === 'number') {
        wait = timeout(wait)
      }
      wait.wait = true
      queue.push(wait)
      return chainer
    }
  }

  return chainer
}

function timeout(n) {
  return next => setTimeout(next, n)
}

export default Vue
