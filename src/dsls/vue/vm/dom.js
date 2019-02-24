/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import context from '../context'

/**
 * 触发事件
 */
function fireEventWrap(el, evtName, evtHash, domChanges) {
  if (!el) {
    return
  }

  const evt = context.quickapp.runtime.helper.createEvent(evtName)
  Object.assign(evt, evtHash)
  console.trace(
    `### App Framework ### fireEventWrap():事件(${evtName})的参数：${JSON.stringify(
      evtHash
    )}, ${JSON.stringify(domChanges)}`
  )

  // 如果修改dom
  if (domChanges) {
    const attr = domChanges.attr || {}
    for (const name in attr) {
      context.quickapp.runtime.helper.setElementAttr(el, name, attr[name], true)
    }
    const style = domChanges.style || {}
    for (const name in style) {
      context.quickapp.runtime.helper.setElementStyle(el, name, style[name], true)
    }
  }

  return el.dispatchEvent(evt)
}

/**
 * 获取Element
 * @param document
 * @param ref
 */
function getNodeByRef(document, ref) {
  return context.quickapp.runtime.helper.getDocumentNodeByRef(document, ref)
}

export { fireEventWrap, getNodeByRef }
