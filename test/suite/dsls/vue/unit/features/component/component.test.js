import '../../utils/imports'
import Vue from '../../utils/vue'
import { toString } from '../../utils/helper'

describe('Component', () => {
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

  it('static', () => {
    const vm = new Vue({
      template: '<test></test>',
      components: {
        test: {
          data() {
            return { a: 123 }
          },
          template: '<span>{{a}}</span>'
        }
      }
    }).$mount()
    expect(vm.$el.tagName).to.equal('SPAN')
    expect(toString(vm.$el)).to.equal('<span value="123"></span>')
  })

  it('using component in restricted elements', () => {
    const vm = new Vue({
      template: '<div><table><tbody><test></test></tbody></table></div>',
      components: {
        test: {
          data() {
            return { a: 123 }
          },
          template: '<tr><td>{{a}}</td></tr>'
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><table><tbody><tr><td value="123"></td></tr></tbody></table></div>'
    )
  })

  it('"is" attribute', () => {
    const vm = new Vue({
      template: '<div><table><tbody><tr is="test"></tr></tbody></table></div>',
      components: {
        test: {
          data() {
            return { a: 123 }
          },
          template: '<tr><td>{{a}}</td></tr>'
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><table><tbody><tr><td value="123"></td></tr></tbody></table></div>'
    )
  })

  it('inline-template', () => {
    const vm = new Vue({
      template: '<div><test inline-template><span>{{a}}</span></test></div>',
      data: {
        a: 'parent'
      },
      components: {
        test: {
          data() {
            return { a: 'child' }
          }
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><span value="child"></span></div>')
  })

  it('fragment instance warning', () => {
    new Vue({
      template: '<test></test>',
      components: {
        test: {
          data() {
            return { a: 123, b: 234 }
          },
          template: '<p>{{a}}</p><p>{{b}}</p>'
        }
      }
    }).$mount()
    expect(countError).to.equal(1)
  })

  it('dynamic', done => {
    const vm = new Vue({
      template: '<component :is="view" :view="view"></component>',
      data: {
        view: 'view-a'
      },
      components: {
        'view-a': {
          template: '<div>foo {{view}}</div>',
          data() {
            return { view: 'a' }
          }
        },
        'view-b': {
          template: '<div>bar {{view}}</div>',
          data() {
            return { view: 'b' }
          }
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div value="foo a" view="view-a"></div>')
    vm.view = 'view-b'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal('<div value="bar b" view="view-b"></div>')
        vm.view = ''
      })
      .then(() => {
        expect(vm.$el.nodeType).to.equal(8)
        expect(vm.$el.data).to.equal('')
      })
      .then(done)
  })

  it('dynamic with props', done => {
    const vm = new Vue({
      template: '<component :is="view" :view="view"></component>',
      data: {
        view: 'view-a'
      },
      components: {
        'view-a': {
          template: '<div>foo {{view}}</div>',
          props: ['view']
        },
        'view-b': {
          template: '<div>bar {{view}}</div>',
          props: ['view']
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div value="foo view-a"></div>')
    vm.view = 'view-b'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal('<div value="bar view-b"></div>')
        vm.view = ''
      })
      .then(() => {
        expect(vm.$el.nodeType).to.equal(8)
        expect(vm.$el.data).to.equal('')
      })
      .then(done)
  })

  it(':is using raw component constructor', () => {
    const vm = new Vue({
      template:
        '<div>' +
        '<component :is="$options.components.test"></component>' +
        '<component :is="$options.components.async"></component>' +
        '</div>',
      components: {
        test: {
          template: '<span>foo</span>'
        },
        async: function(resolve) {
          resolve({
            template: '<span>bar</span>'
          })
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="foo"></span><span value="bar"></span></div>'
    )
  })

  it('dynamic combined with v-for', done => {
    const vm = new Vue({
      template:
        '<div>' +
        '<component v-for="(c, i) in comps" :key="i" :is="c.type"></component>' +
        '</div>',
      data: {
        comps: [{ type: 'one' }, { type: 'two' }]
      },
      components: {
        one: {
          template: '<span>one</span>'
        },
        two: {
          template: '<span>two</span>'
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="one"></span><span value="two"></span></div>'
    )
    vm.comps[1].type = 'one'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="one"></span><span value="one"></span></div>'
        )
      })
      .then(done)
  })

  it('dynamic elements with domProps', done => {
    const vm = new Vue({
      template: '<component :is="view" :value.prop="val"></component>',
      data: {
        view: 'input',
        val: 'hello'
      }
    }).$mount()
    expect(vm.$el.tagName).to.equal('INPUT')
    expect(vm.$el.value).to.equal('hello')
    vm.view = 'textarea'
    vm.val += ' world'
    global
      .waitForUpdate(() => {
        expect(vm.$el.tagName).to.equal('TEXTAREA')
        expect(vm.$el.attr.value).to.equal('hello world')
        vm.view = ''
      })
      .then(done)
  })

  // it('should compile parent template directives & content in parent scope', done => {
  //   const vm = new Vue({
  //     data: {
  //       ok: false,
  //       message: 'hello'
  //     },
  //     template: '<test v-show="ok">{{message}}</test>',
  //     components: {
  //       test: {
  //         template: '<div><slot></slot> {{message}}</div>',
  //         data () {
  //           return {
  //             message: 'world'
  //           }
  //         }
  //       }
  //     }
  //   }).$mount()
  //   expect(getStyle(vm.$el, 'display')).to.equal('none')
  //   expect(vm.$el.attr.value).to.equal('hello world')
  //   vm.ok = true
  //   vm.message = 'bye'
  //   global.waitForUpdate(() => {
  //     expect(getStyle(vm.$el, 'display')).to.equal('')
  //     expect(vm.$el.attr.value).to.equal('bye world')
  //   }).then(done)
  // })

  it('parent content + v-if', done => {
    const vm = new Vue({
      data: {
        ok: false,
        message: 'hello'
      },
      template: '<test v-if="ok">{{message}}</test>',
      components: {
        test: {
          template: '<div><slot></slot> {{message}}</div>',
          data() {
            return {
              message: 'world'
            }
          }
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<!--  -->')
    expect(vm.$children.length).to.equal(0)
    vm.ok = true
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('hello world')
      })
      .then(done)
  })

  it('props', () => {
    const vm = new Vue({
      data: {
        list: [{ a: 1 }, { a: 2 }]
      },
      template: '<test :collection="list"></test>',
      components: {
        test: {
          template: '<ul><li v-for="item in collection">{{item.a}}</li></ul>',
          props: ['collection']
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<ul><li value="1"></li><li value="2"></li></ul>')
  })

  it('should warn when using camelCased props in in-DOM template', () => {
    new Vue({
      data: {
        list: [{ a: 1 }, { a: 2 }]
      },
      template: '<test :somecollection="list"></test>', // <-- simulate lowercased template
      components: {
        test: {
          template: '<ul><li v-for="item in someCollection">{{item.a}}</li></ul>',
          props: ['someCollection']
        }
      }
    }).$mount()
    expect(countWarn).to.equal(2)
  })

  it('should warn when using camelCased events in in-DOM template', () => {
    new Vue({
      template: '<test @foobar="a++"></test>', // <-- simulate lowercased template
      components: {
        test: {
          template: '<div></div>',
          created() {
            this.$emit('fooBar')
          }
        }
      }
    }).$mount()
    expect(countWarn).to.equal(1)
  })

  // it('not found component should not throw', () => {
  //   expect(function () {
  //     new Vue({
  //       template: '<div is="non-existent"></div>'
  //     })
  //   }).not.toThrow()
  // })

  it('properly update replaced higher-order component root node', done => {
    const vm = new Vue({
      data: {
        color: 'red'
      },
      template: '<test id="foo" :class="color"></test>',
      components: {
        test: {
          data() {
            return { tag: 'div' }
          },
          render(h) {
            return h(this.tag, { class: 'test' }, 'hi')
          }
        }
      }
    }).$mount()

    expect(vm.$el.tagName).to.equal('DIV')
    expect(vm.$el.id).to.equal('foo')
    expect(vm.$el.attr.class).to.equal('test red')

    vm.color = 'green'
    global
      .waitForUpdate(() => {
        expect(vm.$el.tagName).to.equal('DIV')
        expect(vm.$el.id).to.equal('foo')
        expect(vm.$el.attr.class).to.equal('test green')
        vm.$children[0].tag = 'p'
      })
      .then(() => {
        expect(vm.$el.tagName).to.equal('P')
        expect(vm.$el.id).to.equal('foo')
        expect(vm.$el.attr.class).to.equal('test green')
        vm.color = 'red'
      })
      .then(() => {
        expect(vm.$el.tagName).to.equal('P')
        expect(vm.$el.id).to.equal('foo')
        expect(vm.$el.attr.class).to.equal('test red')
      })
      .then(done)
  })

  it('catch component render error and preserve previous vnode', done => {
    Vue.config.errorHandler = new Function()
    const vm = new Vue({
      data: {
        a: {
          b: 123
        }
      },
      render(h) {
        return h('div', [this.a.b])
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('123')
    vm.a = null
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('123') // should preserve rendered DOM
        vm.a = { b: 234 }
      })
      .then(() => {
        expect(vm.$el.attr.value).to.equal('234') // should be able to recover
        Vue.config.errorHandler = null
      })
      .then(done)
  })

  // it('relocates node without error', done => {
  //   const el = document.createElement('div')
  //   document.body.appendChild(el)
  //   const target = document.createElement('div')
  //   document.body.appendChild(target)

  //   const Test = {
  //     render (h) {
  //       return h('div', { class: 'test' }, this.$slots.default)
  //     },
  //     mounted () {
  //       target.appendChild(this.$el)
  //     },
  //     beforeDestroy () {
  //       const parent = this.$el.parentNode
  //       if (parent) {
  //         parent.removeChild(this.$el)
  //       }
  //     }
  //   }
  //   const vm = new Vue({
  //     data () {
  //       return {
  //         view: true
  //       }
  //     },
  //     template: `<div><test v-if="view">Test</test></div>`,
  //     components: {
  //       test: Test
  //     }
  //   }).$mount(el)

  //   expect(el.outerHTML).to.equal('<div></div>')
  //   expect(target.outerHTML).to.equal('<div><div class="test">Test</div></div>')
  //   vm.view = false
  //   global.waitForUpdate(() => {
  //     expect(el.outerHTML).to.equal('<div></div>')
  //     expect(target.outerHTML).to.equal('<div></div>')
  //     vm.$destroy()
  //   }).then(done)
  // })
})
