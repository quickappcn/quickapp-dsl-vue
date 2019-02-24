import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild } from '../../utils/helper'

describe('Global API: mixin', () => {
  let options
  beforeEach(() => {
    options = Vue.options
  })
  afterEach(() => {
    Vue.options = options
  })

  it('should work', () => {
    let count = 0
    Vue.mixin({
      created() {
        count++
      }
    })
    new Vue({
      myOption: 'hello'
    })
    expect(count).to.equal(1)
    new Vue({
      myOption: 'hello'
    })
    expect(count).to.equal(2)
  })

  it('should work for constructors created before mixin is applied', () => {
    const calls = []
    const Test = Vue.extend({
      name: 'test',
      beforeCreate() {
        calls.push(this.$options.myOption + ' local')
      }
    })
    Vue.mixin({
      beforeCreate() {
        calls.push(this.$options.myOption + ' global')
      }
    })
    expect(Test.options.name).to.equal('test')
    new Test({
      myOption: 'hello'
    })
    expect(calls).to.deep.equal(['hello global', 'hello local'])
  })

  // #3957
  it('should work for global props', () => {
    const Test = Vue.extend({
      template: `<div>{{ prop }}</div>`
    })

    Vue.mixin({
      props: ['prop']
    })

    // test child component
    const vm = new Vue({
      template: '<test prop="hi"></test>',
      components: { Test }
    }).$mount()

    expect(vm.$el.attr.value).to.equal('hi')
  })

  // vue-loader#433
  it('should not drop late-set render functions', () => {
    const Test = Vue.extend({})
    Test.options.render = h => h('div', 'hello')

    Vue.mixin({})

    const vm = new Vue({
      render: h => h(Test)
    }).$mount()

    expect(vm.$el.attr.value).to.equal('hello')
  })

  // #4266
  it('should not drop scopedId', () => {
    const Test = Vue.extend({})
    Test.options._scopeId = 'foo'

    Vue.mixin({})

    const vm = new Test({
      template: '<div><p>hi</p></div>'
    }).$mount()
    expect(firstChild(vm.$el).attr.foo).to.equal('')
  })

  // #4976
  it('should not drop late-attached custom options on existing constructors', () => {
    const str = []
    const spy = s => () => str.push(s)
    const Base = Vue.extend({
      beforeCreate: spy('base')
    })

    const Test = Base.extend({})

    // Inject options later
    // vue-loader and vue-hot-reload-api are doing like this
    Test.options.computed = {
      $style: () => 123
    }

    Test.options.beforeCreate = Test.options.beforeCreate.concat(spy('test'))

    // Update super constructor's options
    Vue.mixin({
      beforeCreate: spy('mixin')
    })

    // mount the component
    const vm = new Test({
      template: '<div>{{ $style }}</div>'
    }).$mount()

    expect(vm.$el.attr.value).to.equal('123')
    expect(vm.$style).to.equal(123)

    // Should not be dropped
    expect(Test.options.computed.$style()).to.equal(123)
    expect(str).to.deep.equal(['mixin', 'base', 'test'])
  })

  // vue-class-component#83
  it('should work for a constructor mixin', () => {
    let str
    const Mixin = Vue.extend({
      created() {
        str = this.$options.myOption
      }
    })

    Vue.mixin(Mixin)

    new Vue({
      myOption: 'hello'
    })
    expect(str).to.equal('hello')
  })

  // vue-class-component#87
  it('should not drop original lifecycle hooks', () => {
    const str = []
    const spy = s => () => str.push(s)
    const base = spy('base')

    const Base = Vue.extend({
      beforeCreate: base
    })

    const injected = spy('injected')

    // inject a function
    Base.options.beforeCreate = Base.options.beforeCreate.concat(injected)

    Vue.mixin({})

    new Base({})

    expect(str).to.deep.equal(['base', 'injected'])
  })
})
