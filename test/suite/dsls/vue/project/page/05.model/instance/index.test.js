/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../utils/imports'

describe('框架：05.生命周期的实例方法测试', () => {
  const pageId = uniqueId()
  let page, pageVm

  before(() => {
    callActionJsonList.splice(0)

    initPage(pageId, null, __dirname)
    page = global.getPage(pageId)
    pageVm = page.vm
  })

  after(() => {
    callActionJsonList.splice(0)

    global.destroyPage(pageId)
  })

  beforeEach(() => {})

  afterEach(() => {})

  it('测试pageVm-$mount', () => {
    // 获取页面的VM的list
    // 快应用启动的时候，会自动调用一次$mount
    expect(pageVm.mountCount).to.equal(1)
  })

  it('测试pageVm-$nextTick', done => {
    const textNode = pageVm.$refs.text
    expect(textNode.attr.value).to.equal('0')
    pageVm.start()
    expect(pageVm.count).to.equal(1)
    expect(textNode.attr.value).to.equal('0')
    pageVm.$nextTick(() => {
      expect(textNode.attr.value).to.equal('1')
      done()
    })

    it('测试pageVm-$destroy', () => {
      pageVm.$destroy()
      expect(pageVm.destoryCount).to.equal(1)
      expect(pageVm.mountCount).to.equal(0)
    })
  })
})
