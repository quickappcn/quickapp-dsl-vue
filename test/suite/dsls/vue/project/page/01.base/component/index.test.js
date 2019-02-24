/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../utils/imports'

describe('框架：01.加载自定义组件', () => {
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

  it('数据初始化正确', () => {
    expect(pageVm.$refs.vm1Id).to.not.equal(undefined)
    expect(pageVm.$refs.vm1Id.d1Str).to.equal('v1Str')

    const d1Comp = pageVm.$refs.vm1Id.$refs.d1Id
    expect(d1Comp.attr.value).to.equal('v1Str')
  })

  it('ViewModel销毁时清理引用', async () => {
    // 销毁 VM
    pageVm.renderPart2 = false
    // 执行异步方法，在异步回调中访问已销毁 VM
    pageVm.$refs.vm2Id.accessVmAsync()
    await waitForOK()
  })
})
