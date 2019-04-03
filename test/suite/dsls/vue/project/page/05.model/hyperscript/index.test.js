/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import { uniqueId, initPage, callActionJsonList } from '../../../utils/imports'

import { toString } from '../../../utils/helper'

describe(`框架：05.测试hyperscript方法`, () => {
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

  it(`单节点render`, () => {
    const renderNode = pageVm.renderNode(
      'node1',
      `h('div', {}, [
      h('text', {
        attrs: {
          value: 'Hello World'
        }
      })
    ])`
    )
    expect(toString(renderNode.$el.layoutChildren[0])).to.deep.equal(
      '<text value="Hello World"></text>'
    )
  })

  it('多个text组件和文本节点render', () => {
    const renderNode = pageVm.renderNode(
      'node2',
      `h('div', {}, [
      'Hap',
      h('text', {
        attrs: {
          value: 'Hello'
        }
      }),
      'QuickApp',
      'Hap',
      h('text', {}, ['World'])
    ])`
    )
    expect(toString(renderNode.$el)).to.deep.equal(
      '<div value="QuickAppHap"><text value="Hello"></text><text value="World"></text></div>'
    )
  })

  it('带有自定义子组件render', () => {
    const renderNode = pageVm.renderPropsNode(
      `node3`,
      `
      {
        render: function (h) {
          return h('div', {}, [
            h('text', { attrs: { value: 'Hello' }}, []),
            h('Hap', { props: { x: 'Hap' }})
          ])
        },
        components: {
          Hap: {
            props: {
              x: { default: 'World' }
            },
            render: function (h) {
              return h('text', { attrs: { value: this.x }}, [])
            }
          }
        }
      }
    `
    )
    expect(toString(renderNode.$el)).to.deep.equal(
      '<div><text value="Hello"></text><text value="Hap"></text></div>'
    )
  })

  it('带有v-if/v-for指令render', async () => {
    const renderForIfNode = pageVm.renderForIfNode(
      `node4`,
      `
      {
        data: function () {
          return {
            list: [
              { v: 'Hello', x: true },
              { v: 'World', x: false },
              { v: 'Hap', x: true }
            ]
          }
        },
        methods: {
          operateList (v) {
            switch (v) {
              case 1:
              this.list[1].x = true
              break
              case 2:
              this.list.push({ v: 'v-if' })
              break
              case 3:
              this.list.push({ v: 'v-for', x: true })
              break
              case 4:
              this.list.splice(1, 2)
              break
            }
          }
        }
      }
    `
    )
    expect(toString(renderForIfNode.$el)).to.deep.equal(
      '<div><text value="Hello"></text><!--  --><text value="Hap"></text></div>'
    )
    renderForIfNode.operateList(1)
    await waitForOK()
    expect(toString(renderForIfNode.$el)).to.deep.equal(
      '<div><text value="Hello"></text><text value="World"></text><text value="Hap"></text></div>'
    )
    renderForIfNode.operateList(2)
    await waitForOK()
    expect(toString(renderForIfNode.$el)).to.deep.equal(
      '<div><text value="Hello"></text><text value="World"></text><text value="Hap"></text><!--  --></div>'
    )
    renderForIfNode.operateList(3)
    await waitForOK()
    expect(toString(renderForIfNode.$el)).to.deep.equal(
      '<div><text value="Hello"></text><text value="World"></text><text value="Hap"></text><!--  --><text value="v-for"></text></div>'
    )
    renderForIfNode.operateList(4)
    await waitForOK()
    expect(toString(renderForIfNode.$el)).to.deep.equal(
      '<div><text value="Hello"></text><!--  --><text value="v-for"></text></div>'
    )
  })
})
