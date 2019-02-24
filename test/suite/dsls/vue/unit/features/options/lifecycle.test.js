import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild } from '../../utils/helper'

describe('Options lifecycle hooks', () => {
  let spy
  let count = 0
  beforeEach(() => {
    spy = () => {
      count++
    }
  })

  afterEach(() => {
    count = 0
  })

  describe('beforeCreate', () => {
    it('should allow modifying options', () => {
      const vm = new Vue({
        data: {
          a: 1
        },
        beforeCreate() {
          spy()
          expect(this.a).to.equal(undefined)
          this.$options.computed = {
            b() {
              return this.a + 1
            }
          }
        }
      })
      expect(count).to.equal(1)
      expect(vm.b).to.equal(2)
    })
  })

  describe('created', () => {
    it('should have completed observation', () => {
      new Vue({
        data: {
          a: 1
        },
        created() {
          expect(this.a).to.equal(1)
          spy()
        }
      })
      expect(count).to.equal(1)
    })
  })

  describe('beforeMount', () => {
    it('should not have mounted', () => {
      const vm = new Vue({
        render() {},
        beforeMount() {
          spy()
          expect(this._isMounted).to.equal(false)
          expect(this.$el).to.equal(undefined) // due to empty mount
          expect(this._vnode).to.equal(null)
          expect(this._watcher).to.equal(null)
        }
      })
      expect(count).to.equal(0)
      vm.$mount()
      expect(count).to.equal(1)
    })
  })

  describe('mounted', () => {
    it('should have mounted', () => {
      const vm = new Vue({
        template: '<div></div>',
        mounted() {
          spy()
          expect(this._isMounted).to.equal(true)
          expect(this.$el.tagName).to.equal('DIV')
          expect(this._vnode.tag).to.equal('div')
        }
      })
      expect(count).to.equal(0)
      vm.$mount()
      expect(count).to.equal(1)
    })

    // #3898
    it('should call for manually mounted instance with parent', () => {
      const parent = new Vue()
      expect(count).to.equal(0)
      new Vue({
        parent,
        template: '<div></div>',
        mounted() {
          spy()
        }
      }).$mount()
      expect(count).to.equal(1)
    })

    it('should mount child parent in correct order', () => {
      const calls = []
      new Vue({
        template: '<div><test></test></div>',
        mounted() {
          calls.push('parent')
        },
        components: {
          test: {
            template: '<nested></nested>',
            mounted() {
              expect(this.$el.parentNode).to.exist
              calls.push('child')
            },
            components: {
              nested: {
                template: '<div></div>',
                mounted() {
                  expect(this.$el.parentNode).exist
                  calls.push('nested')
                }
              }
            }
          }
        }
      }).$mount()
      expect(calls).to.deep.equal(['nested', 'child', 'parent'])
    })
  })

  describe('beforeUpdate', () => {
    it('should be called before update', done => {
      const vm = new Vue({
        template: '<div>{{ msg }}</div>',
        data: { msg: 'foo' },
        beforeUpdate() {
          spy()
          expect(this.$el.attr.value).to.equal('foo')
        }
      }).$mount()
      expect(count).to.equal(0)
      vm.msg = 'bar'
      expect(count).to.equal(0) // should be async
      global
        .waitForUpdate(() => {
          expect(count).to.equal(1)
        })
        .then(done)
    })
  })

  describe('updated', () => {
    it('should be called after update', done => {
      const vm = new Vue({
        template: '<div>{{ msg }}</div>',
        data: { msg: 'foo' },
        updated() {
          spy()
          expect(this.$el.attr.value).to.equal('bar')
        }
      }).$mount()
      expect(count).to.equal(0)
      vm.msg = 'bar'
      expect(count).to.equal(0) // should be async
      global
        .waitForUpdate(() => {
          expect(count).to.equal(1)
        })
        .then(done)
    })

    it('should be called after children are updated', done => {
      const calls = []
      const vm = new Vue({
        template: '<div><test ref="child">{{ msg }}</test></div>',
        data: { msg: 'foo' },
        components: {
          test: {
            template: `<div><slot></slot></div>`,
            updated() {
              expect(this.$el.attr.value).to.equal('bar')
              calls.push('child')
            }
          }
        },
        updated() {
          expect(firstChild(this.$el).attr.value).to.equal('bar')
          calls.push('parent')
        }
      }).$mount()

      expect(calls).to.deep.equal([])
      vm.msg = 'bar'
      expect(calls).to.deep.equal([])
      global
        .waitForUpdate(() => {
          expect(calls).to.deep.equal(['child', 'parent'])
        })
        .then(done)
    })
  })

  describe('beforeDestroy', () => {
    it('should be called before destroy', () => {
      const vm = new Vue({
        render() {},
        beforeDestroy() {
          spy()
          expect(this._isBeingDestroyed).to.equal(false)
          expect(this._isDestroyed).to.equal(false)
        }
      }).$mount()
      expect(count).to.equal(0)
      vm.$destroy()
      vm.$destroy()
      expect(count).to.equal(1)
      expect(count).to.equal(1)
    })
  })

  describe('destroyed', () => {
    it('should be called after destroy', () => {
      const vm = new Vue({
        render() {},
        destroyed() {
          spy()
          expect(this._isBeingDestroyed).to.equal(true)
          expect(this._isDestroyed).to.equal(true)
        }
      }).$mount()
      expect(count).to.equal(0)
      vm.$destroy()
      vm.$destroy()
      expect(count).to.equal(1)
      expect(count).to.equal(1)
    })
  })

  it('should emit hook events', () => {
    const store = {
      created: 0,
      mounted: 0,
      destroyed: 0
    }

    const spy = key => () => {
      store[key]++
    }

    const created = spy('created')
    const mounted = spy('mounted')
    const destroyed = spy('destroyed')
    const vm = new Vue({
      render() {},
      beforeCreate() {
        this.$on('hook:created', created)
        this.$on('hook:mounted', mounted)
        this.$on('hook:destroyed', destroyed)
      }
    })

    expect(store).to.deep.equal({
      created: 1,
      mounted: 0,
      destroyed: 0
    })

    vm.$mount()
    expect(store).to.deep.equal({
      created: 1,
      mounted: 1,
      destroyed: 0
    })

    vm.$destroy()
    expect(store).to.deep.equal({
      created: 1,
      mounted: 1,
      destroyed: 1
    })
  })
})
