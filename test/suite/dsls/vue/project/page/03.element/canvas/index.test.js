/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, commandsList } from '../../../utils/imports'

describe('框架：03.Canvas', () => {
  const pageId = uniqueId()
  let page, pageVm

  before(() => {
    commandsList.splice(0)

    initPage(pageId, null, __dirname)
    page = global.getPage(pageId)
    pageVm = page.vm
  })

  after(() => {
    commandsList.splice(0)

    global.destroyPage(pageId)
  })

  beforeEach(() => {})

  afterEach(() => {})

  it('Canvas命令发送', async () => {
    const canvas = pageVm.$refs.canvasInst1
    const ctx = canvas.getContext('2d')

    ctx.fillText('hello', 99, 100)
    await waitForOK()
    expect(commandsList[0]).to.include('T')

    ctx.strokeText('hello', 99, 100)
    await waitForOK()
    expect(commandsList[1]).to.include('aGVsbG8=')

    ctx.rect(1, 2, 3, 4)
    await waitForOK()
    expect(commandsList[2]).to.include('w')

    ctx.putImageData(
      {
        width: 10,
        height: 10,
        data: new Uint8ClampedArray(10 * 10 * 4)
      },
      0,
      0
    )
    await waitForOK()
    expect(commandsList[3]).to.include('P')

    ctx.getImageData(0, 0, 100, 100)
    await waitForOK()
    expect(commandsList[4]).to.include('R')

    // setLineDash 参数值为数组，且元素为数字类型，不能为 NaN
    // getLineDash
    ctx.setLineDash(0)
    expect(ctx.getLineDash().length).to.equal(0)
    await waitForOK()
    expect(commandsList[5]).to.be.an('undefined')

    ctx.setLineDash([1, false])
    expect(ctx.getLineDash().length).to.equal(0)
    await waitForOK()
    expect(commandsList[5]).to.be.an('undefined')

    ctx.setLineDash([1, NaN])
    expect(ctx.getLineDash().length).to.equal(0)
    await waitForOK()
    expect(commandsList[5]).to.be.an('undefined')

    ctx.setLineDash([1, 2])
    expect(ctx.getLineDash().length).to.equal(2)
    expect(ctx.getLineDash()[0]).to.equal(1)
    expect(ctx.getLineDash()[1]).to.equal(2)
    await waitForOK()
    expect(commandsList[5]).to.equal('I1,2;')

    ctx.setLineDash([1])
    expect(ctx.getLineDash().length).to.equal(2)
    expect(ctx.getLineDash()[0]).to.equal(1)
    expect(ctx.getLineDash()[1]).to.equal(1)
    await waitForOK()
    expect(commandsList[6]).to.equal('I1,1;')
  })

  it('CreateImageData返回值', () => {
    const canvas = pageVm.$refs.canvasInst1
    const ctx = canvas.getContext('2d')

    const imagedata = ctx.createImageData(10, 10)
    expect(imagedata).to.have.all.keys('width', 'height', 'data')
    expect(imagedata.width).to.equal(10)
    expect(imagedata.height).to.equal(10)
    expect(imagedata.data).to.be.a('Uint8ClampedArray')
    expect(imagedata.data).to.have.lengthOf(10 * 10 * 4)

    const imagedata2 = ctx.createImageData({
      width: 10,
      height: 20,
      data: new Uint8ClampedArray(10 * 20 * 4)
    })
    expect(imagedata2).to.have.all.keys('width', 'height', 'data')
    expect(imagedata2.width).to.equal(10)
    expect(imagedata2.height).to.equal(20)
    expect(imagedata2.data).to.be.a('Uint8ClampedArray')
    expect(imagedata2.data).to.have.lengthOf(10 * 20 * 4)
  })

  it('Canvas lineDashOffset', () => {
    const canvas = pageVm.$refs.canvasInst1
    const ctx = canvas.getContext('2d')

    // lineDashOffset 属性值必须为数组类型且不能为 NaN
    expect(ctx.lineDashOffset).to.equal(0)

    ctx.lineDashOffset = '22'
    expect(ctx.lineDashOffset).to.equal(0)

    ctx.lineDashOffset = NaN
    expect(ctx.lineDashOffset).to.equal(0)

    ctx.lineDashOffset = 5
    expect(ctx.lineDashOffset).to.equal(5)
  })
})
