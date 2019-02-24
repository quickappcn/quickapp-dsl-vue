import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options components', () => {
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

  it('should accept plain object', () => {
    const vm = new Vue({
      template: '<test></test>',
      components: {
        test: {
          template: '<div>hi</div>'
        }
      }
    }).$mount()
    expect(vm.$el.tagName).to.equal('DIV')
    expect(vm.$el.attr.value).to.equal('hi')
  })

  it('should accept extended constructor', () => {
    const Test = Vue.extend({
      template: '<div>hi</div>'
    })
    const vm = new Vue({
      template: '<test></test>',
      components: {
        test: Test
      }
    }).$mount()
    expect(vm.$el.tagName).to.equal('DIV')
    expect(vm.$el.attr.value).to.equal('hi')
  })

  it('should accept camelCase', () => {
    const myComp = {
      template: '<div>hi</div>'
    }
    const vm = new Vue({
      template: '<my-comp></my-comp>',
      components: {
        myComp
      }
    }).$mount()
    expect(vm.$el.tagName).to.equal('DIV')
    expect(vm.$el.attr.value).to.equal('hi')
  })

  it('should accept PascalCase', () => {
    const MyComp = {
      template: '<div>hi</div>'
    }
    const vm = new Vue({
      template: '<my-comp></my-comp>',
      components: {
        MyComp
      }
    }).$mount()
    expect(vm.$el.tagName).to.equal('DIV')
    expect(vm.$el.attr.value).to.equal('hi')
  })

  it('should warn native HTML elements', () => {
    new Vue({
      components: {
        div: { template: '<div></div>' }
      }
    })
    expect(countError).to.equal(1)
  })

  it('should warn built-in elements', () => {
    new Vue({
      components: {
        component: { template: '<div></div>' }
      }
    })
    expect(countError).to.equal(1)
  })
})
