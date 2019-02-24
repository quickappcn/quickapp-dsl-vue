import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Instance methods data', () => {
  it('$set/$delete', done => {
    const vm = new Vue({
      template: '<div>{{ a.msg }}</div>',
      data: {
        a: {}
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('')
    vm.$set(vm.a, 'msg', 'hello')
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('hello')
        vm.$delete(vm.a, 'msg')
      })
      .then(() => {
        expect(vm.$el.attr.value).to.equal('')
      })
      .then(done)
  })

  describe('$watch', () => {
    let vm, spy
    let count = 0
    beforeEach(() => {
      count = 0
      spy = () => {
        count++
      }
      vm = new Vue({
        data: {
          a: {
            b: 1
          }
        },
        methods: {
          foo: spy
        }
      })
    })

    it('basic usage', done => {
      vm.$watch('a.b', spy)
      vm.a.b = 2
      global
        .waitForUpdate(() => {
          expect(count).to.equal(1)
          vm.a = { b: 3 }
        })
        .then(() => {
          expect(count).to.equal(2)
        })
        .then(done)
    })

    it('immediate', () => {
      vm.$watch('a.b', spy, { immediate: true })
      expect(count).to.equal(1)
    })

    it('unwatch', done => {
      const unwatch = vm.$watch('a.b', spy)
      unwatch()
      vm.a.b = 2
      global
        .waitForUpdate(() => {
          expect(count).to.equal(0)
        })
        .then(done)
    })

    it('function watch', done => {
      vm.$watch(function() {
        return this.a.b
      }, spy)
      vm.a.b = 2
      global
        .waitForUpdate(() => {
          expect(count).to.equal(1)
        })
        .then(done)
    })

    it('deep watch', done => {
      vm.$watch('a', spy, { deep: true })
      vm.a.b = 2
      global
        .waitForUpdate(() => {
          expect(count).to.equal(1)
          vm.a = { b: 3 }
        })
        .then(() => {
          expect(count).to.equal(2)
        })
        .then(done)
    })

    it('handler option', done => {
      vm.$watch('a', {
        handler: spy,
        deep: true
      })
      vm.a.b = 2
      global
        .waitForUpdate(() => {
          expect(count).to.equal(1)
          vm.a = { b: 3 }
        })
        .then(() => {
          expect(count).to.equal(2)
        })
        .then(done)
    })

    it('handler option in string', () => {
      vm.$watch('a.b', {
        handler: 'foo',
        immediate: true
      })
      expect(count).to.equal(1)
    })

    it('warn expression', () => {
      vm.$watch('a + b', spy)
      vm.a.b = 100
      expect(count).to.equal(0)
    })
  })
})
