import '../../utils/imports'
import Vue from '../../utils/vue'
import { toString } from '../../utils/helper'

describe('Options computed', () => {
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

  it('should proxy and be reactive', done => {
    const data = { msg: 'foo' }
    const vm = new Vue({
      data,
      template: '<div>{{ msg }}</div>'
    }).$mount()
    expect(vm.$data).to.deep.equal({ msg: 'foo' })
    expect(vm.$data).to.equal(data)
    data.msg = 'bar'
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('bar')
      })
      .then(done)
  })

  it('should merge data properly', () => {
    const Test = Vue.extend({
      data() {
        return { a: 1 }
      }
    })
    let vm = new Test({
      data: { b: 2 }
    })
    expect(vm.a).to.equal(1)
    expect(vm.b).to.equal(2)
    // no instance data
    vm = new Test()
    expect(vm.a).to.equal(1)
    // no child-val
    const Extended = Test.extend({})
    vm = new Extended()
    expect(vm.a).to.equal(1)
    // recursively merge objects
    const WithObject = Vue.extend({
      data() {
        return {
          obj: {
            a: 1
          }
        }
      }
    })
    vm = new WithObject({
      data: {
        obj: {
          b: 2
        }
      }
    })
    expect(vm.obj.a).to.equal(1)
    expect(vm.obj.b).to.equal(2)
  })

  it('should warn non-function during extend', () => {
    Vue.extend({
      data: { msg: 'foo' }
    })
    expect(countError).to.equal(1)
  })

  it('should warn non object return', () => {
    new Vue({
      data() {}
    })
    expect(countError).to.equal(1)
  })

  it('should warn replacing root $data', () => {
    const vm = new Vue({
      data: {}
    })
    vm.$data = {}
    expect(countError).to.equal(1)
  })

  it('should have access to props', () => {
    const Test = {
      props: ['a'],
      render() {},
      data() {
        return {
          b: this.a
        }
      }
    }
    const vm = new Vue({
      template: `<test ref="test" :a="1"></test>`,
      components: { Test }
    }).$mount()
    expect(vm.$refs.test.b).to.equal(1)
  })

  it('should have access to methods', () => {
    const vm = new Vue({
      methods: {
        get() {
          return { a: 1 }
        }
      },
      data() {
        return this.get()
      }
    })
    expect(vm.a).to.equal(1)
  })

  it('should called with this', () => {
    const vm = new Vue({
      template: '<div><child></child></div>',
      provide: { foo: 1 },
      components: {
        child: {
          template: '<span>{{bar}}</span>',
          inject: ['foo'],
          data({ foo }) {
            return { bar: 'foo:' + foo }
          }
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><span value="foo:1"></span></div>')
  })
})
