import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild, getStyle } from '../../utils/helper'

describe('Directive v-show', () => {
  it('should check show value is truthy', () => {
    const vm = new Vue({
      template: '<div><span v-show="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(getStyle(firstChild(vm.$el)).display).to.equal('')
  })

  it('should check show value is falsy', () => {
    const vm = new Vue({
      template: '<div><span v-show="foo">hello</span></div>',
      data: { foo: false }
    }).$mount()
    expect(getStyle(firstChild(vm.$el)).display).to.equal('none')
  })

  it('should update show value changed', done => {
    const vm = new Vue({
      template: '<div><span v-show="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(getStyle(firstChild(vm.$el)).display).to.equal('')
    vm.foo = false
    global
      .waitForUpdate(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('none')
        vm.foo = {}
      })
      .then(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('')
        vm.foo = 0
      })
      .then(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('none')
        vm.foo = []
      })
      .then(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('')
        vm.foo = null
      })
      .then(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('none')
        vm.foo = '0'
      })
      .then(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('')
        vm.foo = undefined
      })
      .then(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('none')
        vm.foo = 1
      })
      .then(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('')
      })
      .then(done)
  })

  it('should respect display value in style attribute', done => {
    const vm = new Vue({
      template: '<div><span v-show="foo" style="display:block">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(getStyle(firstChild(vm.$el)).display).to.equal('block')
    vm.foo = false
    global
      .waitForUpdate(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('none')
        vm.foo = true
      })
      .then(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('block')
      })
      .then(done)
  })

  it('should support unbind when reused', done => {
    const vm = new Vue({
      template:
        '<div v-if="tester"><span v-show="false"></span></div>' +
        '<div v-else><span @click="tester=!tester">show</span></div>',
      data: { tester: true }
    }).$mount()
    expect(getStyle(firstChild(vm.$el)).display).to.equal('none')
    vm.tester = false
    global
      .waitForUpdate(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('')
        vm.tester = true
      })
      .then(() => {
        expect(getStyle(firstChild(vm.$el)).display).to.equal('none')
      })
      .then(done)
  })
})
