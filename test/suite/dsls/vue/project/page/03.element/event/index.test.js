/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../utils/imports'

import { toString } from '../../../utils/helper'

describe(`框架：03.测试事件触发`, () => {
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

  it(`VM绑定的事件能够正常触发`, async () => {
    const text1 = pageVm.$refs.text1
    const div1 = pageVm.$refs.div1
    expect(toString(text1)).to.deep.equal('<text value="Hello World"></text>')
    processCallbacks(pageId, [
      {
        action: 1,
        args: [div1.ref, 'click', {}]
      }
    ])
    await waitForOK()
    expect(toString(text1)).to.deep.equal('<text value="Hello QuickApp"></text>')
  })

  it(`VM的自定义事件触发，原生事件不受影响`, async () => {
    const sub1 = pageVm.$refs.sub1
    const text2 = sub1.$refs.text2
    expect(toString(text2)).to.deep.equal('<text value="Hello World"></text>')
    sub1.triggerEvent()
    await waitForOK()
    expect(toString(text2)).to.deep.equal('<text value="Hello QuickApp"></text>')
  })
})
