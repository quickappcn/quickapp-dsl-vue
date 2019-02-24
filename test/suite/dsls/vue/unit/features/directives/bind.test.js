import '../../utils/imports'
import Vue from '../../utils/vue'
import {
  toString,
  firstChild,
  secondChild,
  lastChild,
  fireEvent,
  getStyle
} from '../../utils/helper'

describe('Component slot', () => {
  let oriConsole, countWarn, countError

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

  it('normal attr', done => {
    const vm = new Vue({
      template: '<div><span :test="foo">hello</span></div>',
      data: { foo: 'ok' }
    }).$mount()
    expect(firstChild(vm.$el).attr.test).to.equal('ok')
    vm.foo = 'again'
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).attr.test).to.equal('again')
        vm.foo = null
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.test).to.equal('')
        vm.foo = false
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.test).to.equal(false)
        vm.foo = true
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.test).to.equal(true)
        vm.foo = 0
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.test).to.equal(0)
      })
      .then(done)
  })

  it('should set property for input value', done => {
    const vm = new Vue({
      template: `
        <div>
          <input type="text" :value="foo">
          <input type="checkbox" :checked="bar">
        </div>
      `,
      data: {
        foo: 'ok',
        bar: false
      }
    }).$mount()
    expect(firstChild(vm.$el).value).to.equal('ok')
    expect(lastChild(vm.$el).checked).to.equal(false)
    vm.bar = true
    global
      .waitForUpdate(() => {
        expect(lastChild(vm.$el).checked).to.equal(true)
      })
      .then(done)
  })

  it('enumerated attr', done => {
    const vm = new Vue({
      template: '<div><span :draggable="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(firstChild(vm.$el).attr.draggable).to.equal(true)
    vm.foo = 'again'
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).attr.draggable).to.equal('again')
        vm.foo = null
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.draggable).to.equal('')
        vm.foo = ''
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.draggable).to.equal('')
        vm.foo = false
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.draggable).to.equal(false)
        vm.foo = 'false'
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.draggable).to.equal('false')
      })
      .then(done)
  })

  it('boolean attr', done => {
    const vm = new Vue({
      template: '<div><span :disabled="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(firstChild(vm.$el).attr.disabled).to.equal(true)
    vm.foo = 'again'
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).attr.disabled).to.equal('again')
        vm.foo = null
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.disabled).to.equal('')
        vm.foo = ''
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.disabled).to.equal('')
      })
      .then(done)
  })

  it('.prop modifier', () => {
    const vm = new Vue({
      template:
        '<div><span v-bind:text-content.prop="foo"></span><span :inner-html.prop="bar"></span></div>',
      data: {
        foo: 'hello',
        bar: '<span>qux</span>'
      }
    }).$mount()
    expect(toString(firstChild(vm.$el))).to.equal('<span textContent="hello"></span>')
    expect(toString(secondChild(vm.$el))).to.equal('<span innerHTML="<span>qux</span>"></span>')
  })

  it('.prop modifier with normal attribute binding', () => {
    const vm = new Vue({
      template: '<input :some.prop="some" :id="id">',
      data: {
        some: 'hello',
        id: false
      }
    }).$mount()
    expect(vm.$el.attr.some).to.equal('hello')
    expect(vm.$el.id).to.equal(false)
  })

  it('.camel modifier', () => {
    const vm = new Vue({
      template: '<svg :view-box.camel="viewBox"></svg>',
      data: {
        viewBox: '0 0 1 1'
      }
    }).$mount()
    expect(vm.$el.attr.viewBox).to.equal('0 0 1 1')
  })

  it('.sync modifier', done => {
    const vm = new Vue({
      template: `<test :foo-bar.sync="bar"/>`,
      data: {
        bar: 1
      },
      components: {
        test: {
          props: ['fooBar'],
          template: `<div @click="$emit('update:fooBar', 2)">{{ fooBar }}</div>`
        }
      }
    }).$mount()

    expect(vm.$el.attr.value).to.equal('1')
    fireEvent(vm.$el, 'click')
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('2')
      })
      .then(done)
  })

  it('bind object', done => {
    const vm = new Vue({
      template: '<input v-bind="test">',
      data: {
        test: {
          id: 'test',
          class: 'ok',
          value: 'hello'
        }
      }
    }).$mount()
    expect(vm.$el.id).to.equal('test')
    expect(vm.$el.attr.class).to.equal('ok')
    expect(vm.$el.value).to.equal('hello')
    vm.test.id = 'hi'
    vm.test.value = 'bye'
    global
      .waitForUpdate(() => {
        expect(vm.$el.id).to.equal('hi')
        expect(vm.$el.attr.class).to.equal('ok')
        expect(vm.$el.value).to.equal('bye')
      })
      .then(done)
  })

  it('.sync modifier with bind object', done => {
    const vm = new Vue({
      template: `<test v-bind.sync="test"/>`,
      data: {
        test: {
          fooBar: 1
        }
      },
      components: {
        test: {
          props: ['fooBar'],
          template: `<div @click="handleUpdate">{{ fooBar }}</div>`,
          methods: {
            handleUpdate() {
              this.$emit('update:fooBar', 2)
            }
          }
        }
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('1')
    fireEvent(vm.$el, 'click')
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('2')
        vm.test.fooBar = 3
      })
      .then(() => {
        expect(vm.$el.attr.value).to.equal('3')
      })
      .then(done)
  })

  it('bind object with overwrite', done => {
    const vm = new Vue({
      template: '<input v-bind="test" id="foo" :class="test.value">',
      data: {
        test: {
          id: 'test',
          class: 'ok',
          value: 'hello'
        }
      }
    }).$mount()
    expect(vm.$el.id).to.equal('foo')
    expect(vm.$el.attr.class).to.equal('hello')
    expect(vm.$el.value).to.equal('hello')
    vm.test.id = 'hi'
    vm.test.value = 'bye'
    global
      .waitForUpdate(() => {
        expect(vm.$el.id).to.equal('foo')
        expect(vm.$el.attr.class).to.equal('bye')
        expect(vm.$el.value).to.equal('bye')
      })
      .then(done)
  })

  it('bind object with class/style', done => {
    const vm = new Vue({
      template: '<input class="a" style="color:red" v-bind="test">',
      data: {
        test: {
          id: 'test',
          class: ['b', 'c'],
          style: { fontSize: '12px' }
        }
      }
    }).$mount()
    expect(vm.$el.id).to.equal('test')
    expect(vm.$el.attr.class).to.equal('a b c')
    expect(getStyle(vm.$el, 'color')).to.equal('red')
    expect(getStyle(vm.$el, 'fontSize')).to.equal('12px')
    vm.test.id = 'hi'
    vm.test.class = ['d']
    vm.test.style = { fontSize: '14px' }
    global
      .waitForUpdate(() => {
        expect(vm.$el.id).to.equal('hi')
        expect(vm.$el.attr.class).to.equal('a d')
        expect(getStyle(vm.$el, 'color')).to.equal('red')
        expect(getStyle(vm.$el, 'fontSize')).to.equal('14px')
      })
      .then(done)
  })

  it('bind object as prop', done => {
    const vm = new Vue({
      template: '<input v-bind.prop="test">',
      data: {
        test: {
          id: 'test',
          className: 'ok',
          value: 'hello'
        }
      }
    }).$mount()
    expect(vm.$el.id).to.equal('test')
    expect(vm.$el.attr.className).to.equal('ok')
    expect(vm.$el.value).to.equal('hello')
    vm.test.id = 'hi'
    vm.test.className = 'okay'
    vm.test.value = 'bye'
    global
      .waitForUpdate(() => {
        expect(vm.$el.id).to.equal('hi')
        expect(vm.$el.attr.className).to.equal('okay')
        expect(vm.$el.value).to.equal('bye')
      })
      .then(done)
  })

  it('bind array', done => {
    const vm = new Vue({
      template: '<input v-bind="test">',
      data: {
        test: [{ id: 'test', class: 'ok' }, { value: 'hello' }]
      }
    }).$mount()
    expect(vm.$el.id).to.equal('test')
    expect(vm.$el.attr.class).to.equal('ok')
    expect(vm.$el.value).to.equal('hello')
    vm.test[0].id = 'hi'
    vm.test[1].value = 'bye'
    global
      .waitForUpdate(() => {
        expect(vm.$el.id).to.equal('hi')
        expect(vm.$el.attr.class).to.equal('ok')
        expect(vm.$el.value).to.equal('bye')
      })
      .then(done)
  })

  it('warn expect object', () => {
    new Vue({
      template: '<input v-bind="test">',
      data: {
        test: 1
      }
    }).$mount()
    expect(countError).to.equal(1)
  })

  // it('set value for option element', () => {
  //   const vm = new Vue({
  //     template: '<select><option :value="val">val</option></select>',
  //     data: {
  //       val: 'val'
  //     }
  //   }).$mount()
  //   // check value attribute
  //   expect(vm.$el.options[0].attr.value).to.equal('val')
  // })

  // a vdom patch edge case where the user has several un-keyed elements of the
  // same tag next to each other, and toggling them.
  it('properly update for toggling un-keyed children', done => {
    const vm = new Vue({
      template: `
        <div>
          <div v-if="ok" id="a" data-test="1"></div>
          <div v-if="!ok" id="b"></div>
        </div>
      `,
      data: {
        ok: true
      }
    }).$mount()
    expect(firstChild(vm.$el).id).to.equal('a')
    expect(firstChild(vm.$el).attr['data-test']).to.equal('1')
    vm.ok = false
    global
      .waitForUpdate(() => {
        expect(secondChild(vm.$el).id).to.equal('b')
        expect(secondChild(vm.$el).attr['data-test']).to.equal('')
      })
      .then(done)
  })

  describe('bind object with special attribute', () => {
    function makeInstance(options) {
      return new Vue({
        template: `<div>${options.parentTemp}</div>`,
        data: {
          attrs: {
            [options.attr]: options.value
          }
        },
        components: {
          comp: {
            template: options.childTemp
          }
        }
      }).$mount()
    }

    it('key', () => {
      const vm = makeInstance({
        attr: 'key',
        value: 'test',
        parentTemp: '<div v-bind="attrs"></div>'
      })
      expect(vm._vnode.children[0].key).to.equal('test')
    })

    it('ref', () => {
      const vm = makeInstance({
        attr: 'ref',
        value: 'test',
        parentTemp: '<div v-bind="attrs"></div>'
      })
      expect(vm.$refs.test).to.equal(firstChild(vm.$el))
    })

    it('slot', () => {
      const vm = makeInstance({
        attr: 'slot',
        value: 'test',
        parentTemp: '<comp><span v-bind="attrs">123</span></comp>',
        childTemp: '<div>slot:<slot name="test"></slot></div>'
      })
      expect(toString(vm.$el)).to.equal(
        '<div><div value="slot:"><span value="123"></span></div></div>'
      )
    })

    it('is', () => {
      const vm = makeInstance({
        attr: 'is',
        value: 'comp',
        parentTemp: '<component v-bind="attrs"></component>',
        childTemp: '<div>comp</div>'
      })
      expect(toString(vm.$el)).to.equal('<div><div value="comp"></div></div>')
    })
  })
})
