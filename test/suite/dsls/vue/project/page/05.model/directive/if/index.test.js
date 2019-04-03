/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../../utils/imports'

import { toString } from '../../../../utils/helper'

describe(`框架：05.测试常用指令if指令`, () => {
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

  it(`v-if/v-else正常使用`, async () => {
    const ref = pageVm.$refs.ref0
    expect(toString(ref)).to.equal(`<div><span value="hello"></span></div>`)
    pageVm.foo = false
    await waitForOK()
    expect(toString(ref)).to.equal(`<div><span value="bye"></span></div>`)
    pageVm.foo = {}
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="hello"></span></div>')
    pageVm.foo = 0
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="bye"></span></div>')
    pageVm.foo = []
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="hello"></span></div>')
    pageVm.foo = null
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="bye"></span></div>')
    pageVm.foo = '0'
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="hello"></span></div>')
    pageVm.foo = undefined
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="bye"></span></div>')
    pageVm.foo = 1
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="hello"></span></div>')
  })

  it(`v-if/v-else/v-elseif正常使用`, async () => {
    const ref = pageVm.$refs.ref1
    expect(toString(ref)).to.equal('<div><span value="hello"></span></div>')
    pageVm.foo = false
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="bye"></span></div>')
    pageVm.bar = true
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="elseif"></span></div>')
    pageVm.bar = false
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="bye"></span></div>')
    pageVm.foo = true
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="hello"></span></div>')
    pageVm.foo = false
    pageVm.bar = {}
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="elseif"></span></div>')
    pageVm.bar = 0
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="bye"></span></div>')
    pageVm.bar = []
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="elseif"></span></div>')
    pageVm.bar = null
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="bye"></span></div>')
    pageVm.bar = '0'
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="elseif"></span></div>')
    pageVm.bar = undefined
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="bye"></span></div>')
    pageVm.bar = 1
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="elseif"></span></div>')
  })

  it(`v-if和v-for组合使用`, async () => {
    const ref = pageVm.$refs.ref2
    expect(toString(ref)).to.equal(
      '<div><span value="0"></span><!--  --><span value="2"></span></div>'
    )
    pageVm.list1[0].value = false
    await waitForOK()
    expect(toString(ref)).to.equal('<div><!--  --><!--  --><span value="2"></span></div>')
    pageVm.list1.push({ value: true })
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><!--  --><!--  --><span value="2"></span><span value="3"></span></div>'
    )
    pageVm.list1.splice(1, 2)
    await waitForOK()
    expect(toString(ref)).to.equal('<div><!--  --><span value="1"></span></div>')
  })

  it(`v-if/v-for和v-else组合使用`, async () => {
    const ref = pageVm.$refs.ref3
    expect(toString(ref)).to.equal(
      '<div><span value="hello"></span><span value="bye"></span><span value="hello"></span></div>'
    )
    pageVm.list2[0].value = false
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="bye"></span><span value="bye"></span><span value="hello"></span></div>'
    )
    pageVm.list2.push({ value: true })
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="bye"></span><span value="bye"></span><span value="hello"></span><span value="hello"></span></div>'
    )
    pageVm.list2.splice(1, 2)
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="bye"></span><span value="hello"></span></div>'
    )
  })

  it(`v-if与v-else/v-for组合使用`, async () => {
    const ref = pageVm.$refs.ref4
    expect(toString(ref)).to.equal(
      '<div><span value="1"></span><span value="2"></span><span value="3"></span></div>'
    )
    pageVm.list3.reverse()
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="3"></span><span value="2"></span><span value="1"></span></div>'
    )
  })
})
