import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Global config', () => {
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

  it('should warn replacing config object', () => {
    const originalConfig = Vue.config
    Vue.config = {}
    expect(Vue.config).to.equal(originalConfig)
    expect(countError).to.equal(1)
  })

  describe('silent', () => {
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

    it('should be false by default', () => {
      expect(countError).to.equal(0)
      expect(countWarn).to.equal(0)
    })

    it('should work when set to true', () => {
      Vue.config.silent = true
      expect(countError).to.equal(0)
      expect(countWarn).to.equal(0)
      Vue.config.silent = false
    })
  })

  describe('optionMergeStrategies', () => {
    it('should allow defining custom option merging strategies', () => {
      Vue.config.optionMergeStrategies.__test__ = (parent, child, vm) => {
        return child + 1
      }
      const Test = Vue.extend({
        __test__: 1
      })
      expect(Test.options.__test__).to.equal(2)
      const test = new Test({
        __test__: 2
      })
      expect(test.$options.__test__).to.equal(3)
    })
  })

  describe('ignoredElements', () => {
    it('should work', () => {
      Vue.config.ignoredElements = ['foo', /^ion-/]
      new Vue({
        template: `<div><foo/><ion-foo/><ion-bar/></div>`
      }).$mount()
      expect(countError).to.equal(0)
      expect(countWarn).to.equal(0)
      Vue.config.ignoredElements = []
    })
  })
})
