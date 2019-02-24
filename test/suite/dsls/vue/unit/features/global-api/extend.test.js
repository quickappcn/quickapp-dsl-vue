import '../../utils/imports'
import Vue from '../../utils/vue'
import { toString } from '../../utils/helper'

describe('Global API: extend', () => {
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

  it('should correctly merge options', () => {
    const Test = Vue.extend({
      name: 'test',
      a: 1,
      b: 2
    })
    expect(Test.options.a).to.equal(1)
    expect(Test.options.b).to.equal(2)
    expect(Test.super).to.equal(Vue)
    const t = new Test({
      a: 2
    })
    expect(t.$options.a).to.equal(2)
    expect(t.$options.b).to.equal(2)
    // inheritance
    const Test2 = Test.extend({
      a: 2
    })
    expect(Test2.options.a).to.equal(2)
    expect(Test2.options.b).to.equal(2)
    const t2 = new Test2({
      a: 3
    })
    expect(t2.$options.a).to.equal(3)
    expect(t2.$options.b).to.equal(2)
  })

  it('should warn invalid names', () => {
    Vue.extend({ name: '123' })
    expect(countError).to.equal(1)
    Vue.extend({ name: '_fesf' })
    expect(countError).to.equal(2)
    Vue.extend({ name: 'Some App' })
    expect(countError).to.equal(3)
  })

  it('should work when used as components', () => {
    const foo = Vue.extend({
      template: '<span>foo</span>'
    })
    const bar = Vue.extend({
      template: '<span>bar</span>'
    })
    const vm = new Vue({
      template: '<div><foo></foo><bar></bar></div>',
      components: { foo, bar }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="foo"></span><span value="bar"></span></div>'
    )
  })

  it('should merge lifecycle hooks', () => {
    const calls = []
    const A = Vue.extend({
      created() {
        calls.push(1)
      }
    })
    const B = A.extend({
      created() {
        calls.push(2)
      }
    })
    new B({
      created() {
        calls.push(3)
      }
    })
    expect(calls).to.deep.equal([1, 2, 3])
  })

  it('should merge methods', () => {
    const A = Vue.extend({
      methods: {
        a() {
          return this.n
        }
      }
    })
    const B = A.extend({
      methods: {
        b() {
          return this.n + 1
        }
      }
    })
    const b = new B({
      data: { n: 0 },
      methods: {
        c() {
          return this.n + 2
        }
      }
    })
    expect(b.a()).to.equal(0)
    expect(b.b()).to.equal(1)
    expect(b.c()).to.equal(2)
  })

  it('should merge assets', () => {
    const A = Vue.extend({
      components: {
        aa: {
          template: '<div>A</div>'
        }
      }
    })
    const B = A.extend({
      components: {
        bb: {
          template: '<div>B</div>'
        }
      }
    })
    const b = new B({
      template: '<div><aa></aa><bb></bb></div>'
    }).$mount()
    expect(toString(b.$el)).to.equal('<div><div value="A"></div><div value="B"></div></div>')
  })

  it('caching', () => {
    const options = {
      template: '<div></div>'
    }
    const A = Vue.extend(options)
    const B = Vue.extend(options)
    expect(A).to.equal(B)
  })

  // #4767
  it('extended options should use different identify from parent', () => {
    const A = Vue.extend({ computed: {} })
    const B = A.extend()
    const computedB = () => 'foo'
    B.options.computed.b = computedB
    expect(B.options.computed).not.to.equal(A.options.computed)
    expect(A.options.computed.b).to.equal(undefined)
    expect(B.options.computed.b).to.equal(computedB)
  })
})
