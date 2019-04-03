import Vue from '../../utils/vue'
describe('Initialization', () => {
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

  it('without new', () => {
    try {
      Vue()
    } catch (e) {}
    expect(countWarn).to.equal(0)
    expect(countError).to.equal(1)
  })

  it('with new', () => {
    expect(new Vue() instanceof Vue).to.equal(true)
  })
})
