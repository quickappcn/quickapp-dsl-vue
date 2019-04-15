/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../../utils/imports'

import { toString } from '../../../../utils/helper'

describe(`框架：05.component测试Class绑定`, () => {
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

  it(`静态Class正常解析`, () => {
    const text0 = pageVm.$refs.text0
    expect(toString(text0)).to.deep.equal('<text value="Hello World" class="a b c"></text>')
  })

  it(`模板内使用数组表达式绑定Class`, async () => {
    const text1 = pageVm.$refs.text1
    expect(toString(text1)).to.deep.equal('<text value="Hello World" class="a b"></text>')
    pageVm.changeClass1()
    await waitForOK()
    expect(toString(text1)).to.deep.equal('<text value="Hello World" class="a d"></text>')
  })

  it(`数组绑定Class并保证Class顺序`, async () => {
    const text2 = pageVm.$refs.text2
    expect(toString(text2)).to.deep.equal('<text value="Hello World" class="a b"></text>')
    pageVm.changeClass2()
    await waitForOK()
    expect(toString(text2)).to.deep.equal('<text value="Hello World" class="a b c"></text>')
  })

  it(`数组绑定Class，清空数组`, async () => {
    const text3 = pageVm.$refs.text3
    expect(toString(text3)).to.deep.equal('<text value="Hello World" class="a c"></text>')
    pageVm.changeClass3()
    await waitForOK()
    expect(toString(text3)).to.deep.equal('<text value="Hello World" class=""></text>')
  })
})
