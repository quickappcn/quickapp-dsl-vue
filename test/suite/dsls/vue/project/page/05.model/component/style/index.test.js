/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../../utils/imports'

import { getStyle } from '../../../../utils/helper'

describe(`框架：05.component测试Style样式绑定`, () => {
  const pageId = uniqueId()
  let page, pageVm, pageDoc

  before(() => {
    callActionJsonList.splice(0)
    initPage(pageId, null, __dirname)
    page = global.getPage(pageId)
    pageVm = page.vm
    pageDoc = page.doc
  })

  after(() => {
    callActionJsonList.splice(0)

    global.destroyPage(pageId)
  })

  beforeEach(() => {})

  afterEach(() => {})

  it(`静态Style正常解析`, () => {
    const text1 = pageVm.$refs.text1
    expect(getStyle(text1)).to.deep.equal({
      fontSize: '100'
    })
  })

  it(`模板内使用数组表达式绑定Style`, async () => {
    const text2 = pageVm.$refs.text2
    expect(getStyle(text2)).to.deep.equal({
      fontSize: '100',
      color: '#ff0000',
      fontWeight: 'bold'
    })
    pageVm.changeStyle1()
    await waitForOK()
    expect(getStyle(text2)).to.deep.equal({
      fontSize: '200',
      color: '#ff0000',
      fontWeight: ''
    })
  })

  it(`模板内使用对象表达式绑定Style`, async () => {
    const text3 = pageVm.$refs.text3
    const text4 = pageVm.$refs.text4
    expect(getStyle(text3)).to.deep.equal({
      fontSize: '100',
      color: '#00ff00'
    })
    expect(getStyle(text4)).to.deep.equal({
      color: '#ff0000',
      fontWeight: 'bold'
    })
    pageVm.changeStyle2()
    await waitForOK()
    expect(getStyle(text3)).to.deep.equal({
      fontSize: '200',
      color: '#00ff00'
    })
    expect(getStyle(text4)).to.deep.equal({
      color: '#0000ff',
      fontWeight: ''
    })
  })
})
