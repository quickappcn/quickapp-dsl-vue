import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild } from '../../utils/helper'

describe('Options inheritAttrs', () => {
  it('should work', done => {
    const vm = new Vue({
      template: `<foo :id="foo"/>`,
      data: { foo: 'foo' },
      components: {
        foo: {
          inheritAttrs: false,
          template: `<div>foo</div>`
        }
      }
    }).$mount()
    expect(vm.$el.id).to.equal('foo')
    vm.foo = 'bar'
    global
      .waitForUpdate(() => {
        // 不一致 **warning**
        expect(vm.$el.id).to.equal('bar')
      })
      .then(done)
  })

  it('with inner v-bind', done => {
    const vm = new Vue({
      template: `<foo :id="foo"/>`,
      data: { foo: 'foo' },
      components: {
        foo: {
          inheritAttrs: false,
          template: `<div><div v-bind="$attrs"></div></div>`
        }
      }
    }).$mount()
    expect(firstChild(vm.$el).id).to.equal('foo')
    vm.foo = 'bar'
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).id).to.equal('bar')
      })
      .then(done)
  })
})
