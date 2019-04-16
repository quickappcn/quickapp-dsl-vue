/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../utils/imports'

/* eslint-disable */
describe('框架：02.native接口', () => {
  const pageId = uniqueId()
  let page, pageVm, model, modRet

  before(() => {
    callActionJsonList.splice(0)

    initPage(pageId, null, __dirname)
    page = global.getPage(pageId)
    pageVm = model = page.vm
  })

  after(() => {
    callActionJsonList.splice(0)

    global.destroyPage(pageId)
  })

  beforeEach(() => {})

  afterEach(() => {})

  it('引入system接口', () => {
    // 具体接口为对象，且拥有方法等
    expect(model.system.router).to.be.an('object')
    expect(Object.keys(model.system.router).length).to.not.equal(0)
    // 具体接口为对象，且拥有方法等
    expect(model.system.sample).to.be.an('object')
    expect(Object.keys(model.system.sample).length).to.not.equal(0)
  })

  it('接口的各类方法处理', async () => {
    const sample = model.sample

    let count = 0

    function fnCounter() {
      count++
    }

    // 同步
    modRet = sample.methodSync1()
    expect(Object.keys(modRet).length).to.above(0)

    // 异步：callback
    modRet = sample.methodCallback1({ success: fnCounter })
    await waitForOK()
    expect(count).to.equal(1)

    // 异步：callback
    modRet = sample.methodCallback1({ callback: fnCounter })
    await waitForOK()
    expect(count).to.equal(2)

    // 异步：callback
    modRet = sample.methodCallback1({ complete: fnCounter })
    await waitForOK()
    expect(count).to.equal(3)

    // 异步：callback
    modRet = sample.methodCallback1({ success: fnCounter, fail: fnCounter })
    await waitForOK()
    expect(count).to.equal(4)

    // 异步：Promise
    modRet = sample.methodCallback1({})
    modRet.then(fnCounter, fnCounter)
    await waitForOK()
    expect(modRet).to.instanceof(Promise)
    expect(count).to.equal(5)

    // 异步：Promise
    modRet = sample.methodCallback1({ attr1: 'v1' })
    modRet.then(fnCounter, fnCounter)
    await waitForOK()
    expect(modRet).to.instanceof(Promise)
    expect(count).to.equal(6)

    // 订阅
    modRet = sample.methodSubscribe1({ callback: fnCounter })
    await waitForOK()
    expect(modRet).to.equal(undefined)
    expect(count).to.above(6)

    // 取消订阅
    modRet = sample.methodUnsubscribe1()

    // 订阅
    modRet = sample.methodSubscribe1({ attr1: 'v1' })
    expect(modRet).to.equal(undefined)

    // 取消订阅
    modRet = sample.methodUnsubscribe1()

    // 同步接口返回接口实例
    const metaData1 = { name: 'system.sample', instId: 1, _nativeType: 0 }
    modRet = sample.methodBindInstSync1({ _data: metaData1 })
    Object.keys(sample).forEach(key => {
      expect(modRet).to.have.property(key)
    })
    // 调用接口方法时，底层应该收到上面的moduleInstId
    modRet.methodBindInstSync1({
      _data: Object.assign(metaData1, { moduleInstId: metaData1.instId })
    })
    modRet.methodBindInstCallback1({
      _data: Object.assign(metaData1, { moduleInstId: metaData1.instId })
    })

    // 异步接口返回接口实例
    const metaDataCallback1 = { name: 'system.sample', instId: 2, _nativeType: 0 }
    sample.methodBindInstCallback1({
      _data: metaDataCallback1,
      success: result => {
        modRet = result
      }
    })
    await waitForOK()
    Object.keys(sample).forEach(key => {
      expect(modRet).to.have.property(key)
    })
    // 调用接口方法时，底层应该收到上面的moduleInstId
    modRet.methodBindInstSync1({
      _data: Object.assign(metaDataCallback1, { moduleInstId: metaDataCallback1.instId })
    })
    modRet.methodBindInstCallback1({
      _data: Object.assign(metaDataCallback1, { moduleInstId: metaDataCallback1.instId })
    })
  })

  it('接口的属性操作', async () => {
    // 读写
    const rw = model.opsTestReadwrite()
    expect(rw).to.equal('readwrite-v2')
    const rwv = model.opsTestAttrReadwrite()
    expect(rwv).to.equal('readwrite-v2')

    // 只读
    const ro = model.opsTestReadonly()
    const rv = model.opsTestAttrReadonly()
    expect(ro).to.equal(rv)

    // 只写
    const wo = model.opsTestWriteonly()
    expect(wo).to.equal(undefined)
    const wv = model.opsTestAttrWriteonly()
    expect(wv).to.equal('writeonly-v2')
  })

  it('接口的事件操作', async () => {
    let ret

    // 赋值：函数
    ret = model.opsTestCustomEvent1()
    await waitForOK()
    expect(typeof model.sample.onCustomEvent1).to.equal('function')
    expect(model.onCustomEvent1Result).to.equal('onCustomEvent1')
    model.onCustomEvent1Result = undefined

    // 清空
    ret = model.opsTestCustomEvent1Clear()
    await waitForOK()
    expect(model.sample.onCustomEvent1).to.equal(null)
    expect(model.onCustomEvent1Result).to.equal(undefined)

    // 赋值：函数
    ret = model.opsTestCustomEvent1()
    await waitForOK()
    expect(typeof model.sample.onCustomEvent1).to.equal('function')
    expect(model.onCustomEvent1Result).to.equal('onCustomEvent1')
    model.onCustomEvent1Result = undefined

    // 赋值：忽略对象等非合法值，等于之前的赋值
    ret = model.opsTestCustomEvent1Object()
    expect(typeof model.sample.onCustomEvent1).to.equal('function')
  })

  it('接口调用中原始数据类型', async () => {
    const sample = model.sample

    let callbackData = null
    const rawData1 = new Int8Array()
    const options1 = {
      // 传递过去
      _data: rawData1,
      success: function(data) {
        // 接收回来
        callbackData = data
      }
    }
    sample.methodCallback2(options1)
    await waitForOK()
    expect(callbackData).to.equal(rawData1)
  })

  it('接口的回调函数中this调整为undefined', async () => {
    const sample = model.sample

    // 1040及以后的回调中如果用到this调用，会报错
    const fnWithThis = function() {
      this.anyAttr = undefined
    }
    modRet = sample.methodCallback1({
      success: fnWithThis
    })
    await waitForOK()
  })

  it('模块类，支持new Class1()生成模块实例', async () => {
    // class1 = new Class1()，其中，class1为模块Class1的实例
    const Class1 = model.Class1

    Class1.methodClass1()
    expect(Class1.methodInst1).to.equal(undefined)

    // 实例
    const inst1 = new model.Class1()
    expect(moduleInstId).to.equal(undefined)
    const inst2 = new model.Class1()
    expect(moduleInstId).to.equal(undefined)

    // 实例方法
    expect(inst1.methodClass1).to.equal(undefined)
    expect(inst2.methodClass1).to.equal(undefined)

    inst1.methodInst1()
    expect(moduleInstId).to.not.equal(undefined)
    inst1.instId = moduleInstId
    inst2.methodInst1()
    expect(moduleInstId).to.not.equal(undefined)
    inst2.instId = moduleInstId
    expect(inst2.instId).to.not.equal(inst1.instId)
    moduleInstId = undefined

    // 实例属性
    inst1.readwrite = 1
    expect(moduleInstId).to.equal(inst1.instId)
    inst2.readwrite = 2
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    const inst1Readwrite = inst1.readwrite
    expect(moduleInstId).to.equal(inst1.instId)
    const inst2Readwrite = inst2.readwrite
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    // 实例事件
    inst1.onCustomEvent1 = function() {}
    expect(moduleInstId).to.equal(inst1.instId)
    inst2.onCustomEvent1 = function() {}
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    await waitForOK()
  })

  it('接口:this', async () => {
    const Class1 = model.Class1
    const obj = { name: 'obj' }

    Class1.methodClass1()
    // 实例
    const inst1 = new model.Class1()
    expect(moduleInstId).to.equal(undefined)
    const inst2 = new model.Class1()
    expect(moduleInstId).to.equal(undefined)

    // 方法：common
    const inst1Mth1 = inst1.methodInst1
    const inst2Mth1 = inst2.methodInst1
    expect(moduleInstId).to.equal(undefined)
    inst1Mth1()
    expect(moduleInstId).to.not.equal(undefined)
    inst1.instId = moduleInstId
    inst2Mth1()
    expect(moduleInstId).to.not.equal(undefined)
    inst2.instId = moduleInstId
    expect(inst2.instId).to.not.equal(inst1.instId)
    moduleInstId = undefined

    // 方法：bind无效
    inst1.methodInst1.bind(obj)()
    expect(moduleInstId).to.equal(inst1.instId)
    inst2.methodInst1.bind(obj)()
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    // 方法：call无效
    inst1.methodInst1.call(obj)
    expect(moduleInstId).to.equal(inst1.instId)
    inst2.methodInst1.call(obj)
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    // 属性：common
    const inst1Readwrite = inst1.readwrite
    expect(moduleInstId).to.equal(inst1.instId)
    const inst2Readwrite = inst2.readwrite
    expect(moduleInstId).to.equal(inst2.instId)
    inst1.readwrite = 1
    expect(moduleInstId).to.equal(inst1.instId)
    inst2.readwrite = 2
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    // 事件：正常写法，无call与bind
    inst1.onCustomEvent1 = function(res) {
      expect(this._instId).to.equal(inst1.instId)
    }
    expect(moduleInstId).to.equal(inst1.instId)
    inst2.onCustomEvent1 = function(res) {
      expect(this._instId).to.equal(inst2.instId)
    }
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined
    await waitForOK()

    // 事件：bind有效
    inst1.onCustomEvent1 = function(res) {
      expect(this.name).to.equal(obj.name)
    }.bind(obj)
    expect(moduleInstId).to.equal(inst1.instId)
    inst2.onCustomEvent1 = function(res) {
      expect(this.name).to.equal(obj.name)
    }.bind(obj)
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    await waitForOK()

    // 事件：call有效
    inst1.onCustomEvent1.call(obj)
    inst2.onCustomEvent1.call(obj)
  })

  it('支持module.create()创建模块实例', async () => {
    // ws = websocketfactory.create({})，其中ws为模块websockt的实例
    const websocketfactory = model.websocketfactory
    const inst1 = websocketfactory.create()
    expect(moduleInstId).to.equal(undefined)
    const inst2 = websocketfactory.create()
    expect(moduleInstId).to.equal(undefined)

    // 实例方法
    inst1.methodInstance()
    expect(moduleInstId).to.not.equal(undefined)
    inst1.instId = moduleInstId
    inst2.methodInstance()
    expect(moduleInstId).to.not.equal(undefined)
    inst2.instId = moduleInstId
    expect(inst2.instId).to.not.equal(inst1.instId)
    moduleInstId = undefined

    // 实例属性
    inst1.readwrite = 0
    expect(moduleInstId).to.equal(inst1.instId)
    inst2.readwrite = 0
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    const inst1Readwrite = inst1.readwrite
    expect(moduleInstId).to.equal(inst1.instId)
    const inst2Readwrite = inst2.readwrite
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    // 实例事件
    inst1.onCustomEvent1 = function() {}
    expect(moduleInstId).to.equal(inst1.instId)
    inst2.onCustomEvent1 = function() {}
    expect(moduleInstId).to.equal(inst2.instId)
    moduleInstId = undefined

    await waitForOK()
  })

  // 这项测试必须作为最后一项：因为需要做销毁页面的测试
  it('在页面销毁后调用接口方法', async () => {
    // 销毁页面
    global.destroyPage(pageId)

    model.sample.methodSync1()
    model.sample.methodCallback1({ success: new Function() })
    await waitForOK()
  })
})
