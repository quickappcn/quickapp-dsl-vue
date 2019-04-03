/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../../utils/imports'

describe('框架：05.页面ViewModel数据更新', () => {
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

  it('数组方法更新数据', async () => {
    callActionJsonList.splice(0)
    pageVm.arr.push('item-test')
    await waitForOK()

    expect(callActionJsonList.length).to.equal(2)
    expect(callActionJsonList[0]).to.include('updateAttrs')
    expect(callActionJsonList[0]).to.include('item-test')
  })
})
