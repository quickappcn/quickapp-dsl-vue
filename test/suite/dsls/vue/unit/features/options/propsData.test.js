import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options propsData', () => {
  let oriConsole
  let countWarn = 0 // eslint-disable-line no-unused-vars
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

  it('should work', done => {
    const A = Vue.extend({
      props: ['a'],
      template: '<div>{{ a }}</div>'
    })
    const vm = new A({
      propsData: {
        a: 123
      }
    }).$mount()
    expect(vm.a).to.equal(123)
    expect(vm.$el.attr.value).to.equal('123')
    vm.a = 234
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('234')
      })
      .then(done)
  })

  it('warn non instantiation usage', () => {
    Vue.extend({
      propsData: {
        a: 123
      }
    })
    expect(countError).to.equal(1)
  })
})
