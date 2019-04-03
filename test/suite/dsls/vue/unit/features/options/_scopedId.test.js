import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild } from '../../utils/helper'

describe('Options _scopeId', () => {
  it('should add scopeId attributes', () => {
    const vm = new Vue({
      _scopeId: 'foo',
      template: '<div><p><span></span></p></div>'
    }).$mount()
    expect(vm.$el.attr.foo).to.equal('')
    expect(firstChild(vm.$el).attr.foo).to.equal('')
    expect(firstChild(firstChild(vm.$el).attr.foo)).to.equal(null)
  })

  it('should add scopedId attributes from both parent and child on child root', () => {
    const vm = new Vue({
      _scopeId: 'foo',
      template: '<div><child></child></div>',
      components: {
        child: {
          _scopeId: 'bar',
          template: '<div></div>'
        }
      }
    }).$mount()
    expect(firstChild(vm.$el).attr.foo).to.equal('')
    expect(firstChild(vm.$el).attr.bar).to.equal('')
  })

  it('should add scopedId attributes from both parent and child on slot contents', () => {
    const vm = new Vue({
      _scopeId: 'foo',
      template: '<div><child><p>hi</p></child></div>',
      components: {
        child: {
          _scopeId: 'bar',
          template: '<div><slot></slot></div>'
        }
      }
    }).$mount()
    expect(firstChild(firstChild(vm.$el).attr.foo)).to.equal(null)
    expect(firstChild(firstChild(vm.$el).attr.bar)).to.equal(null)
  })

  // #4774
  it('should not discard parent scopeId when component root element is replaced', done => {
    const vm = new Vue({
      _scopeId: 'data-1',
      template: `<div><child ref="child" /></div>`,
      components: {
        child: {
          _scopeId: 'data-2',
          data: () => ({ show: true }),
          template: '<div v-if="show"></div>'
        }
      }
    }).$mount()

    const child = vm.$refs.child

    expect(child.$el.hasAttribute('data-1')).to.equal(true)
    expect(child.$el.hasAttribute('data-2')).to.equal(true)

    child.show = false
    global
      .waitForUpdate(() => {
        child.show = true
      })
      .then(() => {
        expect(child.$el.hasAttribute('data-1')).to.equal(true)
        expect(child.$el.hasAttribute('data-2')).to.equal(true)
      })
      .then(done)
  })

  it('should work on functional components', () => {
    const child = {
      functional: true,
      _scopeId: 'child',
      render(h) {
        return h('div', { class: 'child', ref: 'cld1' }, [
          h('span', { class: 'child', ref: 'cld2' }, 'child')
        ])
      }
    }
    const vm = new Vue({
      _scopeId: 'parent',
      components: { child },
      template: '<div><child></child></div>'
    }).$mount()

    expect(vm.$el.hasAttribute('parent')).to.equal(true)
    const childEls = [vm.$refs.cld1, vm.$refs.cld2]
    ;[].forEach.call(childEls, el => {
      expect(el.hasAttribute('child')).to.equal(true)
      // functional component with scopeId will not inherit parent scopeId
      expect(el.hasAttribute('parent')).to.equal(false)
    })
  })
})
