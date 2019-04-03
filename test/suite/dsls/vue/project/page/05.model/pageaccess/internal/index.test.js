/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage } from '../../../../utils/imports'

describe('框架：05.权限控制：应用内传递数据', () => {
  const pageId = uniqueId()
  let page, pageVm

  const pageData = {
    d1Public: '外部public值',
    d2Protected: '外部protected值',
    d3Private: '外部private值'
  }

  before(() => {
    initPage(pageId, null, __dirname, pageData, { fromExternal: false })
    page = global.getPage(pageId)
    pageVm = page.vm
  })

  after(() => {
    global.destroyPage(pageId)
  })

  beforeEach(() => {})

  afterEach(() => {})

  it('数据初始化正确', () => {
    expect(pageVm.d1Public).to.equal(pageData.d1Public)
    expect(pageVm.d2Protected).to.equal(pageData.d2Protected)
    expect(pageVm.d3Private).to.equal('内部private值')
  })
})
