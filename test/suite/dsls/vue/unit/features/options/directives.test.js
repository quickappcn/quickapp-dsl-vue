import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild } from '../../utils/helper'

describe('Options directives', () => {
  let oriConsole
  let countWarn = 0
  let countError = 0

  beforeEach(() => {
    oriConsole = console
    console.warn = function() {
      countWarn++
    }
    console.error = function() {
      countError++
    }
  })

  afterEach(() => {
    countWarn = 0
    countError = 0
    console.warn = oriConsole.warn
    console.error = oriConsole.error
  })

  it('basic usage', done => {
    const store = {
      bind: 0,
      inserted: 0,
      update: 0,
      componentUpdated: 0,
      unbind: 0
    }
    const spy = key => {
      store[key]++
    }

    const assertContext = (el, binding, vnode) => {
      expect(vnode.context).to.equal(vm)
      expect(binding.arg).to.equal('arg')
      expect(binding.modifiers).to.deep.equal({ hello: true })
    }

    const vm = new Vue({
      template: '<div class="hi"><div v-if="ok" v-test:arg.hello="a">{{ msg }}</div></div>',
      data: {
        msg: 'hi',
        a: 'foo',
        ok: true
      },
      directives: {
        test: {
          bind(el, binding, vnode) {
            spy('bind')
            assertContext(el, binding, vnode)
            expect(binding.value).to.equal('foo')
            expect(binding.expression).to.equal('a')
            expect(binding.oldValue).to.equal(undefined)
            expect(el.parentNode).to.equal(null)
          },
          inserted(el, binding, vnode) {
            spy('inserted')
            assertContext(el, binding, vnode)
            expect(binding.value).to.equal('foo')
            expect(binding.expression).to.equal('a')
            expect(binding.oldValue).to.equal(undefined)
            expect(el.parentNode.attr.class).to.equal('hi')
          },
          update(el, binding, vnode, oldVnode) {
            spy('update')
            assertContext(el, binding, vnode)
            expect(el).to.equal(firstChild(vm.$el))
            expect(oldVnode).not.to.equal(vnode)
            expect(binding.expression).to.equal('a')
            if (binding.value !== binding.oldValue) {
              expect(binding.value).to.equal('bar')
              expect(binding.oldValue).to.equal('foo')
            }
          },
          componentUpdated(el, binding, vnode) {
            spy('componentUpdated')
            assertContext(el, binding, vnode)
          },
          unbind(el, binding, vnode) {
            spy('unbind')
            assertContext(el, binding, vnode)
          }
        }
      }
    })

    vm.$mount()
    expect(store.bind).to.equal(1)
    expect(store.inserted).to.equal(1)
    expect(store.update).to.equal(0)
    expect(store.componentUpdated).to.equal(0)
    expect(store.unbind).to.equal(0)
    vm.a = 'bar'
    global
      .waitForUpdate(() => {
        expect(store.update).to.equal(1)
        expect(store.componentUpdated).to.equal(1)
        expect(store.unbind).to.equal(0)
        vm.msg = 'bye'
      })
      .then(() => {
        expect(store.componentUpdated).to.equal(2)
        vm.ok = false
      })
      .then(() => {
        expect(store.unbind).to.equal(1)
      })
      .then(done)
  })

  it('function shorthand', done => {
    const store = {
      before: undefined,
      after: undefined
    }
    const spy = (after, before) => {
      store['before'] = before
      store['after'] = after
    }
    const vm = new Vue({
      template: '<div v-test:arg.hello="a"></div>',
      data: { a: 'foo' },
      directives: {
        test(el, binding, vnode) {
          expect(vnode.context).to.equal(vm)
          expect(binding.arg).to.equal('arg')
          expect(binding.modifiers).to.deep.equal({ hello: true })
          spy(binding.value, binding.oldValue)
        }
      }
    })
    vm.$mount()
    expect(store).to.deep.equal({
      before: undefined,
      after: 'foo'
    })
    vm.a = 'bar'
    global
      .waitForUpdate(() => {
        expect(store).to.deep.equal({
          before: 'foo',
          after: 'bar'
        })
      })
      .then(done)
  })

  it('function shorthand (global)', done => {
    const store = {
      before: undefined,
      after: undefined
    }
    const spy = (after, before) => {
      store['before'] = before
      store['after'] = after
    }
    Vue.directive('test', function(el, binding, vnode) {
      expect(vnode.context).to.equal(vm)
      expect(binding.arg).to.equal('arg')
      expect(binding.modifiers).to.deep.equal({ hello: true })
      spy(binding.value, binding.oldValue)
    })
    const vm = new Vue({
      template: '<div v-test:arg.hello="a"></div>',
      data: { a: 'foo' }
    })
    vm.$mount()
    expect(store).to.deep.equal({
      before: undefined,
      after: 'foo'
    })
    vm.a = 'bar'
    global
      .waitForUpdate(() => {
        expect(store).to.deep.equal({
          before: 'foo',
          after: 'bar'
        })
        delete Vue.options.directives.test
      })
      .then(done)
  })

  it('should teardown directives on old vnodes when new vnodes have none', done => {
    const vm = new Vue({
      data: {
        ok: true
      },
      template: `
        <div>
          <div v-if="ok" v-test>a</div>
          <div v-else class="b">b</div>
        </div>
      `,
      directives: {
        test: {
          bind: el => {
            el.attr.id = 'a'
          } /** el.id是一个getter，需要在dom上实现一个set的接口 */,
          unbind: el => {
            el.attr.id = ''
          }
        }
      }
    }).$mount()
    expect(firstChild(vm.$el).id).to.equal('a')
    vm.ok = false
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).id).to.equal('')
        expect(firstChild(vm.$el).attr.class).to.equal('b')
      })
      .then(done)
  })

  it('should properly handle same node with different directive sets', done => {
    const spies = {}
    const createSpy = name => {
      spies[name] = {
        count: 0
      }
      return () => {
        spies[name] = {
          count: ++spies[name].count
        }
      }
    }
    const vm = new Vue({
      data: {
        ok: true,
        val: 123
      },
      template: `
        <div>
          <div v-if="ok" v-test="val" v-test.hi="val"></div>
          <div v-if="!ok" v-test.hi="val" v-test2="val"></div>
        </div>
      `,
      directives: {
        test: {
          bind: createSpy('bind1'),
          inserted: createSpy('inserted1'),
          update: createSpy('update1'),
          componentUpdated: createSpy('componentUpdated1'),
          unbind: createSpy('unbind1')
        },
        test2: {
          bind: createSpy('bind2'),
          inserted: createSpy('inserted2'),
          update: createSpy('update2'),
          componentUpdated: createSpy('componentUpdated2'),
          unbind: createSpy('unbind2')
        }
      }
    }).$mount()

    expect(spies.bind1.count).to.equal(2)
    expect(spies.inserted1.count).to.equal(2)
    expect(spies.bind2.count).to.equal(0)
    expect(spies.inserted2.count).to.equal(0)

    vm.ok = false
    global
      .waitForUpdate(() => {
        // v-test with modifier should be updated
        expect(spies.update1.count).to.equal(1)
        expect(spies.componentUpdated1.count).to.equal(1)

        // v-test without modifier should be unbound
        expect(spies.unbind1.count).to.equal(1)

        // v-test2 should be bound
        expect(spies.bind2.count).to.equal(1)
        expect(spies.inserted2.count).to.equal(1)
        vm.ok = true
      })
      .then(() => {
        // v-test without modifier should be bound again
        expect(spies.bind1.count).to.equal(3)
        expect(spies.inserted1.count).to.equal(3)
        // v-test2 should be unbound
        expect(spies.unbind2.count).to.equal(1)
        // v-test with modifier should be updated again
        expect(spies.update1.count).to.equal(2)
        expect(spies.componentUpdated1.count).to.equal(2)
        vm.val = 234
      })
      .then(() => {
        expect(spies.update1.count).to.equal(4)
        expect(spies.componentUpdated1.count).to.equal(4)
      })
      .then(done)
  })

  it('warn non-existent', () => {
    new Vue({
      template: '<div v-test></div>'
    }).$mount()
    expect(countError).to.equal(1)
  })

  // #6513
  it('should invoke unbind & inserted on inner component root element change', done => {
    const store = {
      bind: 0,
      inserted: 0,
      unbind: 0
    }

    const spy = key => () => {
      store[key]++
    }

    const dir = {
      bind: spy('bind'),
      inserted: spy('inserted'),
      unbind: spy('unbind')
    }

    const Child = {
      template: `<div v-if="ok"/><span v-else/>`,
      data: () => ({ ok: true })
    }

    const vm = new Vue({
      template: `<child ref="child" v-test />`,
      directives: { test: dir },
      components: { Child }
    }).$mount()

    expect(store.bind).to.equal(1)
    expect(store.inserted).to.equal(1)
    expect(store.unbind).to.equal(0)

    vm.$refs.child.ok = false
    global
      .waitForUpdate(() => {
        expect(vm.$el.tagName).to.equal('SPAN')
        expect(store.bind).to.equal(2)
        expect(store.inserted).to.equal(2)
        expect(store.unbind).to.equal(1)
      })
      .then(done)
  })
})
