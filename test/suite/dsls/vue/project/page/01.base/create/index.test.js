/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../utils/imports'

describe('框架：01.页面以及框架初始化', () => {
  const pageId = uniqueId()
  let page, pageVm

  const intent = {
    action: 'view',
    uri: 'hap://app/com.application.demo/specified',
    orientation: 'portrait'
  }

  const meta = {
    name: 'vm/01.base/create',
    component: 'index',
    path: '/specified'
  }

  let query = {
    k1: 'v1'
  }

  before(() => {
    callActionJsonList.splice(0)

    initPage(pageId, null, __dirname, query, intent, meta)
    page = global.getPage(pageId)
    pageVm = page.vm
  })

  after(() => {
    callActionJsonList.splice(0)

    global.destroyPage(pageId)
  })

  beforeEach(() => {})

  afterEach(() => {})

  it('页面的路由信息正确', () => {
    // intent信息
    expect(pageVm.$page.action).to.equal(intent.action)
    expect(pageVm.$page.uri).to.equal(intent.uri)
    expect(pageVm.$page.orientation).to.equal(intent.orientation)
    // meta信息
    expect(pageVm.$page.name).to.equal(meta.name)
    expect(pageVm.$page.component).to.equal(meta.component)
    expect(pageVm.$page.path).to.equal(meta.path)
    // 请求参数
    expect(pageVm.$page.query).to.equal(query)
  })

  it('数据初始化正确', () => {
    expect(pageVm.d1Str).to.equal('v1Str')
    // 请求参数
    expect(pageVm.query).to.equal(query)
  })

  it('DOM初始化正确', () => {
    const d1Comp = pageVm.$refs['d1Id']

    expect(d1Comp.attr.value).to.equal('v1Str')
  })

  it('vm.$page功能', async () => {
    const docPage = pageVm.$page

    const attr = { k1: 'v1' }

    await waitForOK()
    callActionJsonList.splice(0)
    docPage.setTitleBar(attr)
    await waitForOK()

    expect(callActionJsonList.length).to.equal(2)
    expect(callActionJsonList[0]).to.include('updateTitleBar')
    expect(callActionJsonList[0]).to.include(JSON.stringify(attr))

    callActionJsonList.splice(0)
    docPage.exitFullscreen()
    await waitForOK()

    expect(callActionJsonList.length).to.equal(2)
    expect(callActionJsonList[0]).to.include('exitFullscreen')
    callActionJsonList.splice(0)

    docPage.setStatusBar(attr)
    await waitForOK()

    expect(callActionJsonList.length).to.equal(2)
    expect(callActionJsonList[0]).to.include('updateStatusBar')
    expect(callActionJsonList[0]).to.include(JSON.stringify(attr))
    callActionJsonList.splice(0)
  })
})
