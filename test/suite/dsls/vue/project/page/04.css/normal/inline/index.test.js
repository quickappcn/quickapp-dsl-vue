/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../../utils/imports'

describe('框架：04.css样式计算', () => {
  const pageId = uniqueId()
  let page, pageVm

  before(() => {
    callActionJsonList.splice(0)

    initPage(pageId, null, __dirname, {})
    page = global.getPage(pageId)
    pageVm = page.vm
  })

  after(() => {
    callActionJsonList.splice(0)

    global.destroyPage(pageId)
  })

  beforeEach(() => {})

  afterEach(() => {})

  it('内联样式正常显示', () => {
    const $refs = pageVm.$refs
    expect($refs.d1Id.style).to.deep.equal({
      backgroundColor: 'v1Str',
      color: '#ffff00'
    })
    expect($refs.d2Id.style).to.deep.equal({
      backgroundColor: '#ff0000',
      color: '#ffff00'
    })
    expect($refs.d3Id.style).to.deep.equal({
      color: '#f00f00'
    })
  })
})
