/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../../utils/imports'

describe(`框架：05.测试常用指令show指令`, () => {
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

  it(`测试元素的可见`, async () => {
    const ref = pageVm.$refs.ref1
    expect(ref.layoutChildren[0].style.display).to.equal('')
    pageVm.foo1 = false
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('none')
    pageVm.foo1 = {}
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('')
    pageVm.foo1 = 0
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('none')
    pageVm.foo1 = []
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('')
    pageVm.foo1 = null
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('none')
    pageVm.foo1 = '0'
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('')
    pageVm.foo1 = undefined
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('none')
    pageVm.foo1 = 1
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('')
  })

  it(`测试内联元素display样式`, async () => {
    const ref = pageVm.$refs.ref2
    expect(ref.layoutChildren[0].style.display).to.equal('block')
    pageVm.foo2 = false
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('none')
    pageVm.foo2 = true
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('block')
  })

  it(`支持重用时解除绑定`, async () => {
    const ref = pageVm.$refs.ref3.layoutChildren[0]
    expect(ref.layoutChildren[0].style.display).to.equal('none')
    pageVm.tester = false
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('')
    pageVm.tester = true
    await waitForOK()
    expect(ref.layoutChildren[0].style.display).to.equal('none')
  })
})
