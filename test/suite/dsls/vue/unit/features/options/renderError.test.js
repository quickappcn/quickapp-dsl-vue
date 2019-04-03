import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options renderError', () => {
  it('should be used on render errors', done => {
    Vue.config.errorHandler = () => {}
    const vm = new Vue({
      data: {
        ok: true
      },
      render(h) {
        if (this.ok) {
          return h('div', 'ok')
        }
        throw new Error('no')
      },
      renderError(h, err) {
        return h('div', err.toString())
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('ok')
    vm.ok = false
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('Error: no')
        Vue.config.errorHandler = null
      })
      .then(done)
  })

  it('should pass on errors in renderError to global handler', () => {
    let message = []
    const spy = (...args) => {
      message = args
    }
    Vue.config.errorHandler = spy
    const err = new Error('renderError')
    const vm = new Vue({
      render() {
        throw new Error('render')
      },
      renderError() {
        throw err
      }
    }).$mount()
    expect(message).to.deep.equal([err, vm, 'renderError'])
  })
})
