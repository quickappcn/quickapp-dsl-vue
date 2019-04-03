import '../../utils/imports'
import Vue from '../../utils/vue'

if (typeof Proxy !== 'undefined') {
  describe('render proxy', () => {
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

    it('should warn missing property in render fns with `with`', () => {
      new Vue({
        template: `<div>{{ a }}</div>`
      }).$mount()
      expect(countError).to.equal(1)
      expect(countWarn).to.equal(0)
    })

    it('should warn missing property in render fns without `with`', () => {
      const render = function(h) {
        return h('div', [this.a])
      }
      render._withStripped = true
      new Vue({
        render
      }).$mount()
      expect(countError).to.equal(1)
      expect(countWarn).to.equal(0)
    })

    it('should not warn for hand-written render functions', () => {
      new Vue({
        render(h) {
          return h('div', [this.a])
        }
      }).$mount()
      expect(countError).to.equal(0)
      expect(countWarn).to.equal(0)
    })
  })
}
