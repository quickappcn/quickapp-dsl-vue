import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options name', () => {
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

  it('should contain itself in self components', () => {
    const vm = Vue.extend({
      name: 'SuperVue'
    })

    expect(vm.options.components['SuperVue']).to.equal(vm)
  })

  it('should warn when incorrect name given', () => {
    Vue.extend({
      name: 'Hyper*Vue'
    })

    expect(countError).to.equal(1)

    Vue.extend({
      name: '2Cool2BValid'
    })

    expect(countError).to.equal(2)
  })

  it('id should not override given name when using Vue.component', () => {
    const SuperComponent = Vue.component('super-component', {
      name: 'SuperVue'
    })

    expect(SuperComponent.options.components['SuperVue']).to.equal(SuperComponent)
    expect(SuperComponent.options.components['super-component']).to.equal(SuperComponent)
  })
})
