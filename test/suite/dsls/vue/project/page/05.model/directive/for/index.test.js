/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../../utils/imports'

import { toString } from '../../../../utils/helper'

describe(`框架：05.测试常用指令for指令`, () => {
  const pageId = uniqueId()
  let page, pageVm, Vue

  before(() => {
    callActionJsonList.splice(0)
    initPage(pageId, null, __dirname)
    page = global.getPage(pageId)
    pageVm = page.vm
    Vue = pageVm.constructor.super
  })

  after(() => {
    callActionJsonList.splice(0)

    global.destroyPage(pageId)
  })

  beforeEach(() => {})

  afterEach(() => {})

  it(`v-for原始类型数组正常渲染`, async () => {
    const ref = pageVm.$refs.ref0
    expect(toString(ref)).to.equal(
      '<div><span value="a"></span><span value="b"></span><span value="c"></span></div>'
    )
    Vue.set(pageVm.list0, 0, 'd')
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="d"></span><span value="b"></span><span value="c"></span></div>'
    )
    pageVm.list0.push('d')
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="d"></span><span value="b"></span><span value="c"></span><span value="d"></span></div>'
    )
    pageVm.list0.splice(1, 2)
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="d"></span><span value="d"></span></div>')
    pageVm.list0 = ['x', 'y']
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="x"></span><span value="y"></span></div>')
  })
  it(`v-for数组正常渲染with index`, async () => {
    const ref = pageVm.$refs.ref1
    expect(toString(ref)).to.equal(
      '<div><span value="0-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    Vue.set(pageVm.list1, 0, 'd')
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="0-d"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    pageVm.list1.push('d')
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="0-d"></span><span value="1-b"></span><span value="2-c"></span><span value="3-d"></span></div>'
    )
    pageVm.list1.splice(1, 2)
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="0-d"></span><span value="1-d"></span></div>')
    pageVm.list1 = ['x', 'y']
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="0-x"></span><span value="1-y"></span></div>')
  })
  it(`v-for对象数组正常渲染`, async () => {
    const ref = pageVm.$refs.ref2
    expect(toString(ref)).to.equal(
      '<div><span value="a"></span><span value="b"></span><span value="c"></span></div>'
    )
    Vue.set(pageVm.list2, 0, { value: 'd' })
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="d"></span><span value="b"></span><span value="c"></span></div>'
    )
    pageVm.list2[0].value = 'e'
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="e"></span><span value="b"></span><span value="c"></span></div>'
    )
    pageVm.list2.push({})
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="e"></span><span value="b"></span><span value="c"></span><span value=""></span></div>'
    )
    pageVm.list2.splice(1, 2)
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="e"></span><span value=""></span></div>')
    pageVm.list2 = [{ value: 'x' }, { value: 'y' }]
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="x"></span><span value="y"></span></div>')
  })
  it(`v-for对象数组正常渲染with index`, async () => {
    const ref = pageVm.$refs.ref3
    expect(toString(ref)).to.equal(
      '<div><span value="0-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    Vue.set(pageVm.list3, 0, { value: 'd' })
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="0-d"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    pageVm.list3[0].value = 'e'
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="0-e"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    pageVm.list3.push({})
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="0-e"></span><span value="1-b"></span><span value="2-c"></span><span value="3-"></span></div>'
    )
    pageVm.list3.splice(1, 2)
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="0-e"></span><span value="1-"></span></div>')
    pageVm.list3 = [{ value: 'x' }, { value: 'y' }]
    await waitForOK()
    expect(toString(ref)).to.equal('<div><span value="0-x"></span><span value="1-y"></span></div>')
  })
  it(`v-for对象正常渲染`, async () => {
    const ref = pageVm.$refs.ref4
    expect(toString(ref)).to.equal(
      '<div><span value="0"></span><span value="1"></span><span value="2"></span></div>'
    )
    pageVm.obj1.a = 3
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="3"></span><span value="1"></span><span value="2"></span></div>'
    )
    Vue.set(pageVm.obj1, 'd', 4)
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="3"></span><span value="1"></span><span value="2"></span><span value="4"></span></div>'
    )
    Vue.delete(pageVm.obj1, 'a')
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="1"></span><span value="2"></span><span value="4"></span></div>'
    )
  })
  it(`v-for对象正常渲染with index`, async () => {
    const ref = pageVm.$refs.ref5
    expect(toString(ref)).to.equal(
      '<div><span value="0-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    pageVm.obj2.a = 3
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="3-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    Vue.set(pageVm.obj2, 'd', 4)
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="3-a"></span><span value="1-b"></span><span value="2-c"></span><span value="4-d"></span></div>'
    )
    Vue.delete(pageVm.obj2, 'a')
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="1-b"></span><span value="2-c"></span><span value="4-d"></span></div>'
    )
  })
  it(`v-for原始类型数组正常渲染with key`, async () => {
    const ref = pageVm.$refs.ref6
    expect(toString(ref)).to.equal(
      '<div><span value="0-a-0"></span><span value="1-b-1"></span><span value="2-c-2"></span></div>'
    )
    pageVm.obj3.a = 3
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="3-a-0"></span><span value="1-b-1"></span><span value="2-c-2"></span></div>'
    )
    Vue.set(pageVm.obj3, 'd', 4)
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="3-a-0"></span><span value="1-b-1"></span><span value="2-c-2"></span><span value="4-d-3"></span></div>'
    )
    Vue.delete(pageVm.obj3, 'a')
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><span value="1-b-0"></span><span value="2-c-1"></span><span value="4-d-2"></span></div>'
    )
  })
  it(`v-for正常渲染$data`, async () => {
    const ref = pageVm.$refs.ref7
    expect(toString(ref)).to.equal(
      '<div><span value="[\n  "x",\n  "y"\n]-list0"></span><span value="[\n  "x",\n  "y"\n]-list1"></span><span value="[\n  {\n    "value": "x"\n  },\n  {\n    "value": "y"\n  }\n]-list2"></span><span value="[\n  {\n    "value": "x"\n  },\n  {\n    "value": "y"\n  }\n]-list3"></span><span value="{\n  "b": 1,\n  "c": 2,\n  "d": 4\n}-obj1"></span><span value="{\n  "b": 1,\n  "c": 2,\n  "d": 4\n}-obj2"></span><span value="{\n  "b": 1,\n  "c": 2,\n  "d": 4\n}-obj3"></span><span value="[\n  1,\n  2,\n  3\n]-items1"></span><span value="[\n  1,\n  2,\n  3\n]-items2"></span><span value="[\n  {\n    "id": 1,\n    "msg": "a"\n  },\n  {\n    "id": 2,\n    "msg": "b"\n  },\n  {\n    "id": 3,\n    "msg": "c"\n  }\n]-items3"></span><span value="[\n  {\n    "id": 1,\n    "msg": "a"\n  },\n  {\n    "id": 2,\n    "msg": "b"\n  },\n  {\n    "id": 3,\n    "msg": "c"\n  }\n]-items4"></span></div>'
    )
  })
  it(`渲染:v-if在v-for之前`, async () => {
    const ref = pageVm.$refs.ref8
    expect(toString(ref)).to.equal('<div><div value="1"></div><div value="2"></div><!--  --></div>')
  })
  it(`渲染:v-if在v-for之后`, async () => {
    const ref = pageVm.$refs.ref9
    expect(toString(ref)).to.equal('<div><div value="1"></div><div value="2"></div><!--  --></div>')
  })
  it(`v-for 使用range in`, async () => {
    const ref = pageVm.$refs.ref10
    expect(toString(ref)).to.equal(
      '<div><div value="1"></div><div value="2"></div><div value="3"></div></div>'
    )
  })
  it(`v-for 不使用key`, async () => {
    const ref = pageVm.$refs.ref11
    expect(toString(ref)).to.equal(
      '<div><div value="a"></div><div value="b"></div><div value="c"></div></div>'
    )
    pageVm.items3.reverse()
    await waitForOK()
    expect(toString(ref)).to.equal(
      '<div><div value="c"></div><div value="b"></div><div value="a"></div></div>'
    )
  })
  it(`v-for 使用key`, async () => {
    const ref = pageVm.$refs.ref11
    expect(toString(ref)).to.equal(
      '<div><div value="c"></div><div value="b"></div><div value="a"></div></div>'
    )
    pageVm.items3.reverse()
    expect(toString(ref)).to.equal(
      '<div><div value="c"></div><div value="b"></div><div value="a"></div></div>'
    )
  })
})
