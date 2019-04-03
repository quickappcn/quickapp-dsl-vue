/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../utils/imports'

describe('框架：04.css样式计算', () => {
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

  it('CSS样式节点计算', () => {
    const textDom = pageVm.$refs.ref1.$refs.textRef
    const divDom1 = pageVm.$refs.ref1.$refs.divRef
    const divDom2 = pageVm.$refs.ref2.$refs.divRef
    expect(textDom._finalStyleCache).to.deep.equal({
      height: '10px',
      color: '#eeee99',
      width: '100px'
    })
    expect(divDom1._finalStyleCache).to.deep.equal({
      color: '#ff0000'
    })
    expect(divDom2._finalStyleCache).to.deep.equal({
      color: '#00ff00',
      height: '102px',
      width: '102px'
    })
  })
})
