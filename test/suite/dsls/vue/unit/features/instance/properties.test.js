import '../../utils/imports'
import Vue from '../../utils/vue'
import { fireEvent, firstChild } from '../../utils/helper'

describe('Instance properties', () => {
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

  it('$data', () => {
    const data = { a: 1 }
    const vm = new Vue({
      data
    })
    expect(vm.a).to.equal(1)
    expect(vm.$data).to.equal(data)
    // vm -> data
    vm.a = 2
    expect(data.a).to.equal(2)
    // data -> vm
    data.a = 3
    expect(vm.a).to.equal(3)
  })

  it('$options', () => {
    const A = Vue.extend({
      methods: {
        a() {}
      }
    })
    const vm = new A({
      methods: {
        b() {}
      }
    })
    expect(typeof vm.$options.methods.a).to.equal('function')
    expect(typeof vm.$options.methods.b).to.equal('function')
  })

  it('$root/$children', done => {
    const vm = new Vue({
      template: '<div><test v-if="ok"></test></div>',
      data: { ok: true },
      components: {
        test: {
          template: '<div></div>'
        }
      }
    }).$mount()
    expect(vm.$root).to.equal(vm)
    expect(vm.$children.length).to.equal(1)
    expect(vm.$children[0].$root).to.equal(vm)
    vm.ok = false
    global
      .waitForUpdate(() => {
        expect(vm.$children.length).to.equal(0)
        vm.ok = true
      })
      .then(() => {
        expect(vm.$children.length).to.equal(1)
        expect(vm.$children[0].$root).to.equal(vm)
      })
      .then(done)
  })

  it('$parent', () => {
    const calls = []
    const makeOption = name => ({
      name,
      template: `<div><slot></slot></div>`,
      created() {
        calls.push(`${name}:${this.$parent.$options.name}`)
      }
    })
    new Vue({
      template: `
        <div>
          <outer><middle><inner></inner></middle></outer>
          <next></next>
        </div>
      `,
      components: {
        outer: makeOption('outer'),
        middle: makeOption('middle'),
        inner: makeOption('inner'),
        next: makeOption('next')
      }
    }).$mount()
    expect(calls).to.deep.equal([
      'outer:undefined',
      'middle:outer',
      'inner:middle',
      'next:undefined'
    ])
  })

  it('$props', done => {
    const Comp = Vue.extend({
      props: ['msg'],
      template: '<div>{{ msg }} {{ $props.msg }}</div>'
    })
    const vm = new Comp({
      propsData: {
        msg: 'foo'
      }
    }).$mount()
    // check render
    expect(vm.$el.attr.value).to.equal('foo foo')
    // warn set
    vm.$props = {}
    expect(countError).to.equal(1)
    // check existence
    expect(vm.$props.msg).to.equal('foo')
    // check change
    vm.msg = 'bar'
    expect(vm.$props.msg).to.equal('bar')
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('bar bar')
      })
      .then(() => {
        vm.$props.msg = 'baz'
        expect(vm.msg).to.equal('baz')
      })
      .then(done)
  })

  it('warn mutating $props', () => {
    const Comp = {
      props: ['msg'],
      render() {},
      mounted() {
        expect(this.$props.msg).to.equal('foo')
        this.$props.msg = 'bar'
      }
    }
    new Vue({
      template: `<comp ref="comp" msg="foo" />`,
      components: { Comp }
    }).$mount()
    expect(countError).to.equal(1)
  })

  it('$attrs', done => {
    const vm = new Vue({
      template: `<foo :id="foo" bar="1"/>`,
      data: { foo: 'foo' },
      components: {
        foo: {
          props: ['bar'],
          template: `<div><div v-bind="$attrs"></div></div>`
        }
      }
    }).$mount()
    expect(firstChild(vm.$el).id).to.equal('foo')
    expect(firstChild(vm.$el).attr.bar).to.equal(undefined)
    vm.foo = 'bar'
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).id).to.equal('bar')
        expect(firstChild(vm.$el).attr.bar).to.equal(undefined)
      })
      .then(done)
  })

  // #6263
  it('$attrs should not be undefined when no props passed in', () => {
    const vm = new Vue({
      template: `<foo/>`,
      data: { foo: 'foo' },
      components: {
        foo: {
          template: `<div>{{ this.foo }}</div>`
        }
      }
    }).$mount()
    expect(vm.$attrs).to.deep.equal({})
  })

  it('warn mutating $attrs', () => {
    const vm = new Vue()
    vm.$attrs = {}
    expect(countError).to.equal(1)
  })

  it('$listeners', done => {
    let count1 = 0
    let count2 = 0
    const spyA = () => {
      count1++
    }
    const spyB = () => {
      count2++
    }
    const vm = new Vue({
      template: `<foo @click="foo"/>`,
      data: { foo: spyA },
      components: {
        foo: {
          template: `<div v-on="$listeners"></div>`
        }
      }
    }).$mount()

    // has to be in dom for test to pass in IE

    fireEvent(vm.$el, 'click')
    expect(count1).to.equal(1)
    expect(count2).to.equal(0)

    vm.foo = spyB
    global
      .waitForUpdate(() => {
        fireEvent(vm.$el, 'click')
        expect(count1).to.equal(1)
        expect(count2).to.equal(1)
      })
      .then(done)
  })

  it('warn mutating $listeners', () => {
    const vm = new Vue()
    vm.$listeners = {}
    expect(countError).to.equal(1)
    expect(countWarn).to.equal(0)
  })
})
