import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options props', () => {
  let oriConsole
  let countWarn = 0 // eslint-disable-line no-unused-vars
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

  it('array syntax', done => {
    const vm = new Vue({
      data: {
        b: 'bar'
      },
      template: '<test v-bind:b="b" ref="child"></test>',
      components: {
        test: {
          props: ['b'],
          template: '<div>{{b}}</div>'
        }
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('bar')
    vm.b = 'baz'
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('baz')
        vm.$refs.child.b = 'qux'
      })
      .then(() => {
        expect(vm.$el.attr.value).to.equal('qux')
        expect(countError).to.equal(1)
      })
      .then(done)
  })

  it('object syntax', done => {
    const vm = new Vue({
      data: {
        b: 'bar'
      },
      template: '<test v-bind:b="b" ref="child"></test>',
      components: {
        test: {
          props: { b: String },
          template: '<div>{{b}}</div>'
        }
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('bar')
    vm.b = 'baz'
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('baz')
        vm.$refs.child.b = 'qux'
      })
      .then(() => {
        expect(vm.$el.attr.value).to.equal('qux')
        expect(countError).to.equal(1)
      })
      .then(done)
  })

  it('warn mixed syntax', () => {
    new Vue({
      props: [{ b: String }]
    })
    expect(countError).to.equal(1)
  })

  it('default values', () => {
    const vm = new Vue({
      data: {
        b: undefined
      },
      template: '<test :b="b"></test>',
      components: {
        test: {
          props: {
            a: {
              default: 'A' // absent
            },
            b: {
              default: 'B' // undefined
            }
          },
          template: '<div>{{a}}{{b}}</div>'
        }
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('AB')
  })

  it('default value reactivity', done => {
    const vm = new Vue({
      props: {
        a: {
          default: () => ({ b: 1 })
        }
      },
      propsData: {
        a: undefined
      },
      template: '<div>{{ a.b }}</div>'
    }).$mount()
    expect(vm.$el.attr.value).to.equal('1')
    vm.a.b = 2
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('2')
      })
      .then(done)
  })

  it('default value Function', () => {
    const func = () => 132
    const vm = new Vue({
      props: {
        a: {
          type: Function,
          default: func
        }
      },
      propsData: {
        a: undefined
      }
    })
    expect(vm.a).to.equal(func)
  })

  it('warn object/array default values', () => {
    new Vue({
      props: {
        a: {
          default: { b: 1 }
        }
      },
      propsData: {
        a: undefined
      }
    })
    expect(countError).to.equal(1)
  })

  it('warn missing required', () => {
    new Vue({
      template: '<test></test>',
      components: {
        test: {
          props: { a: { required: true }},
          template: '<div>{{a}}</div>'
        }
      }
    }).$mount()
    expect(countError).to.equal(1)
  })

  describe('assertions', () => {
    function makeInstance(value, type, validator, required) {
      return new Vue({
        template: '<test :test="val"></test>',
        data: {
          val: value
        },
        components: {
          test: {
            template: '<div></div>',
            props: {
              test: {
                type,
                validator,
                required
              }
            }
          }
        }
      }).$mount()
    }

    it('string', () => {
      makeInstance('hello', String)
      makeInstance(123, String)
      expect(countError).to.equal(1)
    })

    it('number', () => {
      makeInstance(123, Number)
      makeInstance('123', Number)
      expect(countError).to.equal(1)
    })

    it('boolean', () => {
      makeInstance(true, Boolean)
      makeInstance('123', Boolean)
      expect(countError).to.equal(1)
    })

    it('function', () => {
      makeInstance(() => {}, Function)
      makeInstance(123, Function)
      expect(countError).to.equal(1)
    })

    it('object', () => {
      makeInstance({}, Object)
      makeInstance([], Object)
      expect(countError).to.equal(1)
    })

    it('array', () => {
      makeInstance([], Array)
      makeInstance({}, Array)
      expect(countError).to.equal(1)
    })

    it('primitive wrapper objects', () => {
      /* eslint-disable no-new-wrappers */
      makeInstance(new String('s'), String)
      makeInstance(new Number(1), Number)
      makeInstance(new Boolean(true), Boolean)
      /* eslint-enable no-new-wrappers */
    })

    it('custom constructor', () => {
      function Class() {}
      makeInstance(new Class(), Class)
      makeInstance({}, Class)
      expect(countError).to.equal(1)
    })

    it('multiple types', () => {
      makeInstance([], [Array, Number, Boolean])
      makeInstance({}, [Array, Number, Boolean])
      expect(countError).to.equal(1)
      expect(countError).to.equal(1)
    })

    it('custom validator', () => {
      makeInstance(123, null, v => v === 123)
      makeInstance(123, null, v => v === 234)
      expect(countError).to.equal(1)
    })

    it('type check + custom validator', () => {
      makeInstance(123, Number, v => v === 123)
      makeInstance(123, Number, v => v === 234)
      expect(countError).to.equal(1)
      makeInstance(123, String, v => v === 123)
      expect(countError).to.equal(2)
    })

    it('multiple types + custom validator', () => {
      makeInstance(123, [Number, String, Boolean], v => v === 123)
      makeInstance(123, [Number, String, Boolean], v => v === 234)
      makeInstance(123, [String, Boolean], v => v === 123)
    })

    it('optional with type + null/undefined', () => {
      makeInstance(undefined, String)
      makeInstance(null, String)
    })

    it('required with type + null/undefined', () => {
      makeInstance(undefined, String, null, true)
      expect(countError).to.equal(1)
      makeInstance(null, Boolean, null, true)
      expect(countError).to.equal(2)
    })

    it('optional prop of any type (type: true or prop: true)', () => {
      makeInstance(1, true)
      makeInstance('any', true)
      makeInstance({}, true)
      makeInstance(undefined, true)
      makeInstance(null, true)
    })
  })

  it('should work with v-bind', () => {
    const vm = new Vue({
      template: `<test v-bind="{ a: 1, b: 2 }"></test>`,
      components: {
        test: {
          props: ['a', 'b'],
          template: '<div>{{ a }} {{ b }}</div>'
        }
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('1 2')
  })

  it('should warn data fields already defined as a prop', () => {
    new Vue({
      template: '<test a="1"></test>',
      components: {
        test: {
          template: '<div></div>',
          data: function() {
            return { a: 123 }
          },
          props: {
            a: null
          }
        }
      }
    }).$mount()
    expect(countError).to.equal(1)
  })

  it('should warn methods already defined as a prop', () => {
    new Vue({
      template: '<test a="1"></test>',
      components: {
        test: {
          template: '<div></div>',
          props: {
            a: null
          },
          methods: {
            a() {}
          }
        }
      }
    }).$mount()
    expect(countError).to.equal(2)
  })

  it('treat boolean props properly', () => {
    const vm = new Vue({
      template: '<comp ref="child" prop-a prop-b="prop-b"></comp>',
      components: {
        comp: {
          template: '<div></div>',
          props: {
            propA: Boolean,
            propB: Boolean,
            propC: Boolean
          }
        }
      }
    }).$mount()
    expect(vm.$refs.child.propA).to.equal(true)
    expect(vm.$refs.child.propB).to.equal(true)
    expect(vm.$refs.child.propC).to.equal(false)
  })

  it('should respect default value of a Boolean prop', function() {
    const vm = new Vue({
      template: '<test></test>',
      components: {
        test: {
          props: {
            prop: {
              type: Boolean,
              default: true
            }
          },
          template: '<div>{{prop}}</div>'
        }
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('true')
  })

  it('non reactive values passed down as prop should not be converted', done => {
    const a = Object.freeze({
      nested: {
        msg: 'hello'
      }
    })
    const parent = new Vue({
      template: '<comp :a="a.nested"></comp>',
      data: {
        a: a
      },
      components: {
        comp: {
          template: '<div></div>',
          props: ['a']
        }
      }
    }).$mount()
    const child = parent.$children[0]
    expect(child.a.msg).to.equal('hello')
    expect(child.a.__ob__).to.equal(undefined) // should not be converted
    parent.a = Object.freeze({
      nested: {
        msg: 'yo'
      }
    })
    global
      .waitForUpdate(() => {
        expect(child.a.msg).to.equal('yo')
        expect(child.a.__ob__).to.equal(undefined)
      })
      .then(done)
  })

  it('should not warn for non-required, absent prop', function() {
    new Vue({
      template: '<test></test>',
      components: {
        test: {
          template: '<div></div>',
          props: {
            prop: {
              type: String
            }
          }
        }
      }
    }).$mount()
  })

  // #3453
  it('should not fire watcher on object/array props when parent re-renders', done => {
    let count = 0
    const spy = () => {
      count++
    }
    const vm = new Vue({
      data: {
        arr: []
      },
      template: '<test :prop="arr">hi</test>',
      components: {
        test: {
          props: ['prop'],
          watch: {
            prop: spy
          },
          template: '<div><slot></slot></div>'
        }
      }
    }).$mount()
    vm.$forceUpdate()
    global
      .waitForUpdate(() => {
        expect(count).to.equal(0)
      })
      .then(done)
  })

  // #4090
  it('should not trigger watcher on default value', done => {
    let count = 0
    const spy = () => {
      count++
    }
    const vm = new Vue({
      template: `<test :value="a" :test="b"></test>`,
      data: {
        a: 1,
        b: undefined
      },
      components: {
        test: {
          template: '<div>{{ value }}</div>',
          props: {
            value: { type: Number },
            test: {
              type: Object,
              default: () => ({})
            }
          },
          watch: {
            test: spy
          }
        }
      }
    }).$mount()

    vm.a++
    global
      .waitForUpdate(() => {
        expect(count).to.equal(0)
        vm.b = {}
      })
      .then(() => {
        expect(count).to.equal(1)
      })
      .then(() => {
        vm.b = undefined
      })
      .then(() => {
        expect(count).to.equal(2)
        vm.a++
      })
      .then(() => {
        expect(count).to.equal(2)
      })
      .then(done)
  })

  it('warn reserved props', () => {
    const specialAttrs = ['key', 'ref', 'slot', 'is', 'slot-scope']
    new Vue({
      props: specialAttrs
    })
    specialAttrs.forEach(attr => {
      expect(countError).to.equal(5)
    })
  })
})
