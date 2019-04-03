/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { fireEventWrap, getNodeByRef } from '../vm/dom'

// 一个Tick内只存在一个promise
let nextTick = null

/**
 * 触发DOM事件
 * @param page 页面对象
 * @param ref
 * @param type
 * @param e
 * @param domChanges 当前仅有attr的更新
 * @returns {*}
 */
function fireEvent(page, ref, type, e, domChanges) {
  // 根据ref找到对应的element
  const el = getNodeByRef(page.doc, ref)
  if (el) {
    const result = fireEventWrap(el, type, e, { attr: domChanges })
    return result
  }
  return new Error(`fireEvent: 无效element索引 "${ref}"`)
}

/**
 * 销毁Page
 * @param page 页面对象
 */
function destroyPage(page) {
  page.vm.$emit(`xlc:onDestroy`)
  page.vm && page.vm.$destroy()
}

/**
 * 更新页面
 * @param page
 */
function updatePageActions(page) {
  // 异步发送更新动作队列
  if (nextTick) {
    return
  }
  nextTick = Promise.resolve().then(() => {
    page.doc.listener.updateFinish()
    nextTick = null
  })
}

export { fireEvent, destroyPage, updatePageActions }
