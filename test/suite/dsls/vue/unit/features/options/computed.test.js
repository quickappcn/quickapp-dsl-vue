import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild } from '../../utils/helper'

describe('Options computed', () => {
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

  it('basic usage', done => {
    const vm = new Vue({
      template: '<div>{{ b }}</div>',
      data: {
        a: 1
      },
      computed: {
        b() {
          return this.a + 1
        }
      }
    }).$mount()
    expect(vm.b).to.equal(2)
    expect(vm.$el.attr.value).to.equal('2')
    vm.a = 2
    expect(vm.b).to.equal(3)
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('3')
      })
      .then(done)
  })

  it('with setter', done => {
    const vm = new Vue({
      template: '<div>{{ b }}</div>',
      data: {
        a: 1
      },
      computed: {
        b: {
          get() {
            return this.a + 1
          },
          set(v) {
            this.a = v - 1
          }
        }
      }
    }).$mount()
    expect(vm.b).to.equal(2)
    expect(vm.$el.attr.value).to.equal('2')
    vm.a = 2
    expect(vm.b).to.equal(3)
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('3')
        vm.b = 1
        expect(vm.a).to.equal(0)
      })
      .then(() => {
        expect(vm.$el.attr.value).to.equal('1')
      })
      .then(done)
  })

  it('warn with setter and no getter', () => {
    const vm = new Vue({
      template: `
        <div>
          <test></test>
        </div>
      `,
      components: {
        test: {
          data() {
            return {
              a: 1
            }
          },
          computed: {
            b: {
              set(v) {
                this.a = v
              }
            }
          },
          template: `<div>{{a}}</div>`
        }
      }
    }).$mount()
    expect(firstChild(vm.$el).attr.value).to.equal('1')
    expect(countError).to.equal(1)
  })

  it('warn assigning to computed with no setter', () => {
    const vm = new Vue({
      computed: {
        b() {
          return 1
        }
      }
    })
    vm.b = 2
    expect(countError).to.equal(1)
  })

  it('watching computed', done => {
    let count = 0
    const spy = () => {
      count++
    }
    const vm = new Vue({
      data: {
        a: 1
      },
      computed: {
        b() {
          return this.a + 1
        }
      }
    })
    vm.$watch('b', spy)
    vm.a = 2
    global
      .waitForUpdate(() => {
        expect(count).to.equal(1)
      })
      .then(done)
  })

  it('caching', () => {
    let count = 0
    const spy = () => {
      count++
    }
    const vm = new Vue({
      data: {
        a: 1
      },
      computed: {
        b() {
          spy()
          return this.a + 1
        }
      }
    })
    expect(count).to.equal(0)
    vm.b
    expect(count).to.equal(1)
    vm.b
    expect(count).to.equal(1)
  })

  it('cache: false', () => {
    let count = 0
    const spy = () => {
      count++
    }
    const vm = new Vue({
      data: {
        a: 1
      },
      computed: {
        b: {
          cache: false,
          get() {
            spy()
            return this.a + 1
          }
        }
      }
    })
    expect(count).to.equal(0)
    vm.b
    expect(count).to.equal(1)
    vm.b
    expect(count).to.equal(2)
  })

  it('as component', done => {
    const Comp = Vue.extend({
      template: `<div>{{ b }} {{ c }}</div>`,
      data() {
        return { a: 1 }
      },
      computed: {
        // defined on prototype
        b() {
          return this.a + 1
        }
      }
    })

    const vm = new Comp({
      computed: {
        // defined at instantiation
        c() {
          return this.b + 1
        }
      }
    }).$mount()
    expect(vm.b).to.equal(2)
    expect(vm.c).to.equal(3)
    expect(vm.$el.attr.value).to.equal('2 3')
    vm.a = 2
    expect(vm.b).to.equal(3)
    expect(vm.c).to.equal(4)
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('3 4')
      })
      .then(done)
  })

  it('warn conflict with data', () => {
    new Vue({
      data: {
        a: 1
      },
      computed: {
        a: () => 2
      }
    })
    expect(countError).to.equal(1)
  })

  it('warn conflict with props', () => {
    new Vue({
      props: ['a'],
      propsData: { a: 1 },
      computed: {
        a: () => 2
      }
    })
    expect(countError).to.equal(1)
  })

  it('rethrow computed error', () => {
    const err = new Error('rethrow')
    try {
      const vm = new Vue({
        computed: {
          a: () => {
            throw err
          }
        }
      })
      vm.a
    } catch (e) {
      expect(e).to.equal(err)
    }
  })
})
