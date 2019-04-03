/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../utils/imports'

describe('框架：01.页面以及VM的状态管理', () => {
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

    suppressConsole(() => {
      global.destroyPage(pageId)
    })
  })

  beforeEach(() => {})

  afterEach(() => {})

  it('属性$valid,$visbible', async () => {
    // 创建页面之后
    expect(page.$valid).to.equal(true)
    expect(page.$visible).to.equal(false)
    expect(pageVm.$valid).to.equal(true)
    expect(pageVm.$visible).to.equal(false)
    expect(pageVm.$refs.vm1Id.$valid).to.equal(true)
    expect(pageVm.$refs.vm1Id.$visible).to.equal(false)

    // 全局API：改变页面状态
    global.changeVisiblePage(page.id, true)

    expect(page.$valid).to.equal(true)
    expect(page.$visible).to.equal(true)
    expect(pageVm.$valid).to.equal(true)
    expect(pageVm.$visible).to.equal(true)
    expect(pageVm.$refs.vm1Id.$valid).to.equal(true)
    expect(pageVm.$refs.vm1Id.$visible).to.equal(true)

    // 新的自定义组件
    pageVm.toggleRender()
    await waitForOK()

    expect(pageVm.$refs.vm2Id.$valid).to.equal(true)
    expect(pageVm.$refs.vm2Id.$visible).to.equal(true)

    // 全局API：改变页面状态
    global.changeVisiblePage(page.id, false)

    expect(page.$valid).to.equal(true)
    expect(page.$visible).to.equal(false)
    expect(pageVm.$valid).to.equal(true)
    expect(pageVm.$visible).to.equal(false)
    expect(pageVm.$refs.vm1Id.$valid).to.equal(true)
    expect(pageVm.$refs.vm1Id.$visible).to.equal(false)
    expect(pageVm.$refs.vm2Id.$valid).to.equal(true)
    expect(pageVm.$refs.vm2Id.$visible).to.equal(false)

    // 全局API：改变页面状态
    global.changeVisiblePage(page.id, true)

    expect(page.$valid).to.equal(true)
    expect(page.$visible).to.equal(true)
    expect(pageVm.$valid).to.equal(true)
    expect(pageVm.$visible).to.equal(true)
    expect(pageVm.$refs.vm1Id.$valid).to.equal(true)
    expect(pageVm.$refs.vm1Id.$visible).to.equal(true)
    expect(pageVm.$refs.vm2Id.$valid).to.equal(true)
    expect(pageVm.$refs.vm2Id.$visible).to.equal(true)

    // 销毁自定义组件
    pageVm.toggleRender()
    await waitForOK()

    expect(pageVm.$refs.vm2Id).to.equal(undefined)

    // 获取引用：销毁后无法通过父组件引用
    const subVm1 = pageVm.$refs.vm1Id
    const subVm2 = pageVm.$refs.vm2Id

    expect(pageVm.$destroyed).to.equal(false)
    // 销毁页面
    global.destroyPage(page.id)

    expect(page.$valid).to.equal(false)
    expect(page.$visible).to.equal(false)
    expect(pageVm.$valid).to.equal(false)
    expect(pageVm.$visible).to.equal(false)
    expect(subVm1.$valid).to.equal(false)
    expect(subVm1.$visible).to.equal(false)
    expect(subVm2).to.equal(undefined)
    expect(pageVm.$destroyed).to.equal(true)
  })
})
