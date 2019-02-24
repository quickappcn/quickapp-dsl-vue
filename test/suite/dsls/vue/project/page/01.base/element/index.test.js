/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../utils/imports'

describe('框架：01.获取DOM能力', () => {
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

  it('获取子组件内相应的DOM', () => {
    const subComp = pageVm.$refs.subComp.$refs.sub
    expect(subComp.attr.value).to.equal('xxx')
  })

  it('获取根组件内相应的DOM', () => {
    const mainComp = pageVm.$refs.pageComp
    expect(mainComp.attr.value).to.equal('main')
  })

  it('获取$el元素attr', () => {
    const $el = pageVm.$el
    expect($el.attr['test-key']).to.equal('testKey')
  })

  it('获取$root元素', () => {
    const $root = pageVm.$root
    expect($root.$parent).to.equal(undefined)
    expect($root).to.equal(pageVm.$parent)
  })

  it('测试DOM方法', () => {
    // input 方法存在
    expect(typeof pageVm.inputRefs.focus).to.equal('function')
    expect(typeof pageVm.videoRefs.requestFullscreen).to.equal('function')
  })
})
