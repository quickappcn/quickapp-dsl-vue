/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../../utils/imports'

describe(`框架：05.测试slot组件`, () => {
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

  it(`slot 为空`, async () => {
    const ref = pageVm.$refs.ref1
    expect(ref.childNodes[0].childNodes.length).to.equal(0)
  })

  it(`默认slot`, async () => {
    const ref = pageVm.$refs.ref2
    expect(ref.childNodes[0].childNodes.length).to.equal(1)
    expect(ref.childNodes[0].tagName).to.equal('DIV')
    expect(ref.childNodes[0].childNodes[0].tagName).to.equal('P')
    expect(ref.childNodes[0].childNodes[0].attr.value).to.equal('parent message')
    pageVm.msg = 'changed'
    await waitForOK()
    expect(ref.childNodes[0].childNodes[0].attr.value).to.equal('changed')
  })

  it(`具名slot`, async () => {
    const ref = pageVm.$refs.ref3
    expect(ref.childNodes[0].childNodes.length).to.equal(1)
    expect(ref.childNodes[0].tagName).to.equal('DIV')
    expect(ref.childNodes[0].childNodes[0].tagName).to.equal('P')
    expect(ref.childNodes[0].childNodes[0].attr.value).to.equal('parent message')
    pageVm.msg1 = 'changed'
    await waitForOK()
    expect(ref.childNodes[0].childNodes[0].attr.value).to.equal('changed')
  })

  it(`slot兜底`, async () => {
    const ref = pageVm.$refs.ref4
    expect(ref.childNodes[0].childNodes.length).to.equal(1)
    expect(ref.childNodes[0].childNodes[0].tagName).to.equal('P')
    expect(ref.childNodes[0].childNodes[0].attr.value).to.equal('child message')
  })

  it(`多个具名slot`, async () => {
    const ref = pageVm.$refs.ref5
    expect(ref.childNodes[0].childNodes.length).to.equal(2)
    expect(ref.childNodes[0].childNodes[0].attr.value).to.equal('fallback a')
    expect(ref.childNodes[0].childNodes[1].attr.value).to.equal('slot b')
  })
})
