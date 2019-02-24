/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import '../../../../bridge/runtime/index'

function fireEvent(node, type) {
  global.isRpkMinPlatformVersionGEQ = function() {
    return true
  }
  const evt = global.config.helper.createEvent(type)
  node.dispatchEvent(evt)
}

function firstChild(node) {
  return (node.layoutChildren && node.layoutChildren[0]) || null
}

function secondChild(node) {
  return (node.layoutChildren && node.layoutChildren[1]) || null
}

function lastChild(node) {
  return (node.layoutChildren && node.layoutChildren[node.layoutChildren.length - 1]) || null
}

function toString(node) {
  if (node._nodeName === '#comment') {
    return '<!-- ' + node._data + ' -->'
  }
  const attr = node._attr
  let attrString = ``
  for (const i in attr) {
    if (attr.hasOwnProperty(i)) {
      let item = attr[i]
      if (item !== undefined || item !== null) {
        if (typeof item === 'string') {
          item = `"${item}"`
        }
        attrString += ` ${i}=${item}`
      } else {
        attrString += ` ${i}`
      }
    }
  }

  return (
    '<' +
    node._type +
    attrString +
    '>' +
    node.childNodes.map(child => toString(child)).join('') +
    '</' +
    node._type +
    '>'
  )
}

function getStyle(node, key) {
  if (!key) {
    return node._style
  }
  return node._style[key]
}

export { toString, getStyle, fireEvent, firstChild, secondChild, lastChild }
