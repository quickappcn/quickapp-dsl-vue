import '../../utils/imports'
import Vue from '../../utils/vue'
import { toString } from '../../utils/helper'

describe('Global API: set/delete', () => {
  describe('Vue.set', () => {
    it('should update a vue object', done => {
      const vm = new Vue({
        template: '<div>{{x}}</div>',
        data: { x: 1 }
      }).$mount()
      expect(vm.$el.attr.value).to.equal('1')
      Vue.set(vm, 'x', 2)
      global
        .waitForUpdate(() => {
          expect(vm.$el.attr.value).to.equal('2')
        })
        .then(done)
    })

    it('should update a observing object', done => {
      const vm = new Vue({
        template: '<div>{{foo.x}}</div>',
        data: { foo: { x: 1 } }
      }).$mount()
      expect(vm.$el.attr.value).to.equal('1')
      Vue.set(vm.foo, 'x', 2)
      global
        .waitForUpdate(() => {
          expect(vm.$el.attr.value).to.equal('2')
        })
        .then(done)
    })

    it('should update a observing array', done => {
      const vm = new Vue({
        template: '<div><div v-for="v,k in list">{{k}}-{{v}}</div></div>',
        data: { list: ['a', 'b', 'c'] }
      }).$mount()
      expect(toString(vm.$el)).to.equal(
        '<div><div value="0-a"></div><div value="1-b"></div><div value="2-c"></div></div>'
      )
      Vue.set(vm.list, 1, 'd')
      global
        .waitForUpdate(() => {
          expect(toString(vm.$el)).to.equal(
            '<div><div value="0-a"></div><div value="1-d"></div><div value="2-c"></div></div>'
          )
          Vue.set(vm.list, '2', 'e')
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal(
            '<div><div value="0-a"></div><div value="1-d"></div><div value="2-e"></div></div>'
          )
          /* eslint-disable no-new-wrappers */
          Vue.set(vm.list, new Number(1), 'f')
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal(
            '<div><div value="0-a"></div><div value="1-f"></div><div value="2-e"></div></div>'
          )
          Vue.set(vm.list, '3g', 'g')
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal(
            '<div><div value="0-a"></div><div value="1-f"></div><div value="2-e"></div></div>'
          )
        })
        .then(done)
    })

    it('should update a vue object with nothing', done => {
      const vm = new Vue({
        template: '<div>{{x}}</div>',
        data: { x: 1 }
      }).$mount()
      expect(vm.$el.attr.value).to.equal('1')
      Vue.set(vm, 'x', null)
      global
        .waitForUpdate(() => {
          expect(vm.$el.attr.value).to.equal('')
          Vue.set(vm, 'x')
        })
        .then(() => {
          expect(vm.$el.attr.value).to.equal('')
        })
        .then(done)
    })

    it('be able to use string type index in array', done => {
      const vm = new Vue({
        template: '<div><p v-for="obj in lists">{{obj.name}}</p></div>',
        data: {
          lists: [{ name: 'A' }, { name: 'B' }, { name: 'C' }]
        }
      }).$mount()
      expect(toString(vm.$el)).to.equal(
        '<div><p value="A"></p><p value="B"></p><p value="C"></p></div>'
      )
      Vue.set(vm.lists, '0', { name: 'D' })
      global
        .waitForUpdate(() => {
          expect(toString(vm.$el)).to.equal(
            '<div><p value="D"></p><p value="B"></p><p value="C"></p></div>'
          )
        })
        .then(done)
    })

    // #6845
    it('should not overwrite properties on prototype chain', () => {
      class Model {
        constructor() {
          this._bar = null
        }
        get bar() {
          return this._bar
        }
        set bar(newvalue) {
          this._bar = newvalue
        }
      }

      const vm = new Vue({
        data: {
          data: new Model()
        }
      })

      Vue.set(vm.data, 'bar', 123)
      expect(vm.data.bar).to.equal(123)
      expect(vm.data.hasOwnProperty('bar')).to.equal(false)
      expect(vm.data._bar).to.equal(123)
    })
  })

  describe('Vue.delete', () => {
    it('should delete a key', done => {
      const vm = new Vue({
        template: '<div>{{obj.x}}</div>',
        data: { obj: { x: 1 } }
      }).$mount()
      expect(vm.$el.attr.value).to.equal('1')
      vm.obj.x = 2
      global
        .waitForUpdate(() => {
          expect(vm.$el.attr.value).to.equal('2')
          Vue.delete(vm.obj, 'x')
        })
        .then(() => {
          expect(vm.$el.attr.value).to.equal('')
          vm.obj.x = 3
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal('<div value=""></div>')
        })
        .then(done)
    })

    it('be able to delete an item in array', done => {
      const vm = new Vue({
        template: '<div><p v-for="obj in lists">{{obj.name}}</p></div>',
        data: {
          lists: [{ name: 'A' }, { name: 'B' }, { name: 'C' }]
        }
      }).$mount()
      expect(toString(vm.$el)).to.equal(
        '<div><p value="A"></p><p value="B"></p><p value="C"></p></div>'
      )
      Vue.delete(vm.lists, 1)
      global
        .waitForUpdate(() => {
          expect(toString(vm.$el)).to.equal('<div><p value="A"></p><p value="C"></p></div>')
          Vue.delete(vm.lists, NaN)
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal('<div><p value="A"></p><p value="C"></p></div>')
          Vue.delete(vm.lists, -1)
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal('<div><p value="A"></p><p value="C"></p></div>')
          Vue.delete(vm.lists, '1.3')
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal('<div><p value="A"></p><p value="C"></p></div>')
          Vue.delete(vm.lists, true)
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal('<div><p value="A"></p><p value="C"></p></div>')
          Vue.delete(vm.lists, {})
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal('<div><p value="A"></p><p value="C"></p></div>')
          Vue.delete(vm.lists, '1')
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal('<div><p value="A"></p></div>')
          /* eslint-disable no-new-wrappers */
          Vue.delete(vm.lists, new Number(0))
        })
        .then(() => {
          expect(toString(vm.$el)).to.equal('<div></div>')
        })
        .then(done)
    })
  })
})
