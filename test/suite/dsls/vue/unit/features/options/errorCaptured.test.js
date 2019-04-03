import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options errorCaptured', () => {
  let globalMessageBefore = []
  let globalMessage = []

  beforeEach(() => {
    Vue.config.errorHandler = (...args) => {
      globalMessageBefore = globalMessage
      globalMessage = args
    }
  })

  afterEach(() => {
    globalMessageBefore = []
    globalMessage = []
    Vue.config.errorHandler = null
  })

  it('should capture error from child component', () => {
    let message = []
    const spy = (...args) => {
      message = args
    }

    let child
    let err
    const Child = {
      created() {
        child = this
        err = new Error('child')
        throw err
      },
      render() {}
    }

    new Vue({
      errorCaptured: spy,
      render: h => h(Child)
    }).$mount()

    expect(message).to.deep.equal([err, child, 'created hook'])
    // should propagate by default
    expect(globalMessage).to.deep.equal([err, child, 'created hook'])
  })

  it('should be able to render the error in itself', done => {
    let child
    const Child = {
      created() {
        child = this
        throw new Error('error from child')
      },
      render() {}
    }

    const vm = new Vue({
      data: {
        error: null
      },
      errorCaptured(e, vm, info) {
        expect(vm).to.equal(child)
        this.error = e.toString() + ' in ' + info
      },
      render(h) {
        if (this.error) {
          return h('pre', this.error)
        }
        return h(Child)
      }
    }).$mount()

    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.contain('error from child')
        expect(vm.$el.attr.value).to.contain('in created hook')
      })
      .then(done)
  })

  it('should not propagate to global handler when returning true', () => {
    let message = []
    const spy = (...args) => {
      message = args
    }

    let child
    let err
    const Child = {
      created() {
        child = this
        err = new Error('child')
        throw err
      },
      render() {}
    }

    new Vue({
      errorCaptured(err, vm, info) {
        spy(err, vm, info)
        return false
      },
      render: h => h(Child, {})
    }).$mount()

    expect(message).to.deep.equal([err, child, 'created hook'])
    // should not propagate
    expect(globalMessage).to.deep.equal([])
  })

  it('should propagate to global handler if itself throws error', () => {
    let child
    let err
    const Child = {
      created() {
        child = this
        err = new Error('child')
        throw err
      },
      render() {}
    }

    let err2
    const vm = new Vue({
      errorCaptured() {
        err2 = new Error('foo')
        throw err2
      },
      render: h => h(Child, {})
    }).$mount()

    expect(globalMessage).to.deep.equal([err, child, 'created hook'])
    expect(globalMessageBefore).to.deep.equal([err2, vm, 'errorCaptured hook'])
  })

  it('should work across multiple parents, mixins and extends', () => {
    const calls = []

    const Child = {
      created() {
        throw new Error('child')
      },
      render() {}
    }

    const ErrorBoundaryBase = {
      errorCaptured() {
        calls.push(1)
      }
    }

    const mixin = {
      errorCaptured() {
        calls.push(2)
      }
    }

    const ErrorBoundaryExtended = {
      extends: ErrorBoundaryBase,
      mixins: [mixin],
      errorCaptured() {
        calls.push(3)
      },
      render: h => h(Child)
    }

    Vue.config.errorHandler = () => {
      calls.push(5)
    }

    new Vue({
      errorCaptured() {
        calls.push(4)
      },
      render: h => h(ErrorBoundaryExtended)
    }).$mount()

    expect(calls).to.deep.equal([1, 2, 3, 4, 5])
  })

  it('should work across multiple parents, mixins and extends with return false', () => {
    const calls = []

    const Child = {
      created() {
        throw new Error('child')
      },
      render() {}
    }

    const ErrorBoundaryBase = {
      errorCaptured() {
        calls.push(1)
      }
    }

    const mixin = {
      errorCaptured() {
        calls.push(2)
      }
    }

    const ErrorBoundaryExtended = {
      extends: ErrorBoundaryBase,
      mixins: [mixin],
      errorCaptured() {
        calls.push(3)
        return false
      },
      render: h => h(Child)
    }

    Vue.config.errorHandler = () => {
      calls.push(5)
    }

    new Vue({
      errorCaptured() {
        calls.push(4)
      },
      render: h => h(ErrorBoundaryExtended)
    }).$mount()

    expect(calls).to.deep.equal([1, 2, 3])
  })
})
