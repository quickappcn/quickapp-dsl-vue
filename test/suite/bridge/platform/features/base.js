/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

const waitTime = 5

const base = {
  mockResult(data, code) {
    return {
      code: code || 0,
      content: data || {
        flag: Math.random()
      }
    }
  },

  mockSync(data, code) {
    return this.mockResult(data, code)
  },

  mockOnce(callbackId, data, code) {
    global.setTimeout(() => {
      global.execInvokeCallback({
        callback: callbackId,
        data: this.mockResult(data, code)
      })
    }, waitTime)
  },

  mockSubscribe(callbackId, data, code) {
    return global.setInterval(() => {
      global.execInvokeCallback({
        callback: callbackId,
        data: this.mockResult(data, code)
      })
    }, waitTime)
  },

  mockUnsubscribe(handler) {
    handler && global.clearInterval(handler)
  },

  setTimeout(callbackId, data, code) {
    return global.setTimeout(() => {
      global.execInvokeCallback({
        callback: callbackId,
        data: this.mockResult(data, code)
      })
    }, waitTime)
  },

  clearTimeout(handler) {
    handler && global.clearTimeout(handler)
  }
}

export default base
