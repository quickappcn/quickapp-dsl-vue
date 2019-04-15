/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../../utils/imports'

import { toString } from '../../../../utils/helper'

describe(`框架：05.component测试Attr绑定`, () => {
  const pageId = uniqueId()
  let page, pageVm, pageDoc // eslint-disable-line no-unused-vars

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

  it(`静态Attr正常解析`, () => {
    const text1 = pageVm.$refs.text1
    expect(toString(text1)).to.deep.equal('<text value="Hello World"></text>')
  })

  it(`Attr绑定数据并正常更新`, async () => {
    const text2 = pageVm.$refs.text2
    expect(toString(text2)).to.deep.equal('<text value="Hello World"></text>')
    pageVm.changeContent1()
    await waitForOK()
    expect(toString(text2)).to.deep.equal('<text value="Hello QuickApp"></text>')
  })

  it(`Attr绑定数据并正常清空`, async () => {
    const text3 = pageVm.$refs.text3
    expect(toString(text3)).to.deep.equal('<text value="Hello World"></text>')
    pageVm.changeContent2()
    await waitForOK()
    expect(toString(text3)).to.deep.equal('<text value=""></text>')
  })
})
