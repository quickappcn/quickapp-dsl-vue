import Vue from '../../utils/vue'
import { toString } from '../../utils/helper'

describe('Global API: assets', () => {
  const Test = Vue.extend()

  it('directive / filters', () => {
    const assets = ['directive', 'filter']
    assets.forEach(function(type) {
      const def = {}
      Test[type]('test', def)
      expect(Test.options[type + 's'].test).to.equal(def)
      expect(Test[type]('test')).to.equal(def)
      // extended registration should not pollute global
      expect(Vue.options[type + 's'].test).to.equal(undefined)
    })
  })

  describe('Vue.component', () => {
    it('should register a component', () => {
      Vue.component('foo', {
        template: '<span>foo</span>'
      })
      Vue.component('bar', {
        template: '<span>bar</span>'
      })
      const vm = new Vue({
        template: '<div><foo></foo><bar></bar></div>'
      }).$mount()
      expect(toString(vm.$el)).to.equal(
        '<div><span value="foo"></span><span value="bar"></span></div>'
      )
      // unregister them
      delete Vue.options.components.foo
      delete Vue.options.components.bar
    })
  })

  it('component on extended constructor', () => {
    const def = { a: 1 }
    Test.component('test', def)
    const component = Test.options.components.test
    expect(typeof component).to.equal('function')
    expect(component.super).to.equal(Vue)
    expect(component.options.a).to.equal(1)
    expect(component.options.name).to.equal('test')
    expect(Test.component('test')).to.equal(component)
    // already extended
    Test.component('test2', component)
    expect(Test.component('test2')).to.equal(component)
    // extended registration should not pollute global
    expect(Vue.options.components.test).to.equal(undefined)
  })

  // #4434
  it('local registration should take priority regardless of naming convention', () => {
    Vue.component('x-foo', {
      template: '<span>global</span>'
    })
    const vm = new Vue({
      components: {
        xFoo: {
          template: '<span>local</span>'
        }
      },
      template: '<div><x-foo></x-foo></div>'
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><span value="local"></span></div>')
    delete Vue.options.components['x-foo']
  })
})
