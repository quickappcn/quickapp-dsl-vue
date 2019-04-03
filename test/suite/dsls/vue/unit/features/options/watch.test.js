import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options watch', () => {
  let spy
  let count = 0
  beforeEach(() => {
    spy = () => {
      count++
    }
  })

  afterEach(() => {
    count = 0
  })

  it('basic usage', done => {
    const vm = new Vue({
      data: {
        a: 1
      },
      watch: {
        a: spy
      }
    })
    expect(count).to.equal(0)
    vm.a = 2
    expect(count).to.equal(0)
    global
      .waitForUpdate(() => {
        // Vue的同步watcher只用于计算属性computed，watch和UI更新都是异步watcher
        expect(count).to.equal(1)
      })
      .then(done)
  })

  it('string method name', done => {
    const vm = new Vue({
      data: {
        a: 1
      },
      watch: {
        a: 'onChange'
      },
      methods: {
        onChange: spy
      }
    })
    expect(count).to.equal(0)
    vm.a = 2
    expect(count).to.equal(0)
    global
      .waitForUpdate(() => {
        expect(count).to.equal(1)
      })
      .then(done)
  })

  it('multiple cbs (after option merge)', done => {
    let count1 = 0
    const spy1 = () => {
      count1++
    }
    const Test = Vue.extend({
      watch: {
        a: spy1
      }
    })
    const vm = new Test({
      data: { a: 1 },
      watch: {
        a: spy
      }
    })
    vm.a = 2
    global
      .waitForUpdate(() => {
        expect(count1).to.equal(1)
        expect(count).to.equal(1)
      })
      .then(done)
  })

  it('with option: immediate', done => {
    const vm = new Vue({
      data: { a: 1 },
      watch: {
        a: {
          handler: spy,
          immediate: true
        }
      }
    })
    expect(count).to.equal(1)
    vm.a = 2
    global
      .waitForUpdate(() => {
        expect(count).to.equal(2)
      })
      .then(done)
  })

  it('with option: deep', done => {
    const vm = new Vue({
      data: { a: { b: 1 } },
      watch: {
        a: {
          handler: spy,
          deep: true
        }
      }
    })
    expect(count).to.equal(0)
    vm.a.b = 2
    expect(count).to.equal(0)
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

  it('correctly merges multiple extends', done => {
    let count2 = 0
    let count3 = 0
    const spy2 = () => {
      count2++
    }
    const spy3 = () => {
      count3++
    }
    const A = Vue.extend({
      data: function() {
        return {
          a: 0,
          b: 0
        }
      },
      watch: {
        b: spy
      }
    })

    const B = Vue.extend({
      extends: A,
      watch: {
        a: spy2
      }
    })

    const C = Vue.extend({
      extends: B,
      watch: {
        a: spy3
      }
    })

    const vm = new C()
    vm.a = 1

    global
      .waitForUpdate(() => {
        expect(count).to.equal(0)
        expect(count2).to.equal(1)
        expect(count3).to.equal(1)
      })
      .then(done)
  })
})
