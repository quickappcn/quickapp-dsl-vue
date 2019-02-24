import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options methods', () => {
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

  it('should have correct context', () => {
    const vm = new Vue({
      data: {
        a: 1
      },
      methods: {
        plus() {
          this.a++
        }
      }
    })
    vm.plus()
    expect(vm.a).to.equal(2)
  })

  it('should warn undefined methods', () => {
    new Vue({
      methods: {
        hello: undefined
      }
    })
    expect(countError).to.equal(1)
  })

  it('should warn methods conflicting with data', () => {
    new Vue({
      data: {
        foo: 1
      },
      methods: {
        foo() {}
      }
    })
    expect(countError).to.equal(1)
  })

  it('should warn methods conflicting with internal methods', () => {
    new Vue({
      methods: {
        _update() {}
      }
    })
    expect(countError).to.equal(1)
  })
})
