import '../../utils/imports'
import Vue from '../../utils/vue'
import { fireEvent, firstChild, toString } from '../../utils/helper'

describe('Options functional', () => {
  it('should work', done => {
    const vm = new Vue({
      data: { test: 'foo' },
      template: '<div><wrap :msg="test">bar</wrap></div>',
      components: {
        wrap: {
          functional: true,
          props: ['msg'],
          render(h, { props, children }) {
            return h('div', null, [props.msg, ' '].concat(children))
          }
        }
      }
    }).$mount()
    expect(firstChild(vm.$el).attr.value).to.equal('foo bar')
    vm.test = 'qux'
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('qux bar')
      })
      .then(done)
  })

  it('should expose all props when not declared', done => {
    const fn = {
      functional: true,
      render(h, vm) {
        const { props } = vm
        return h('div', `${props.msg} ${props.kebabMsg}`)
      }
    }

    const vm = new Vue({
      data: { test: 'foo' },
      render(h) {
        return h('div', [
          h(fn, {
            props: { msg: this.test },
            attrs: { 'kebab-msg': 'bar' }
          })
        ])
      }
    }).$mount()

    expect(firstChild(vm.$el).attr.value).to.equal('foo bar')
    vm.test = 'qux'
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('qux bar')
      })
      .then(done)
  })

  it('should expose data.on as listeners', () => {
    let countFoo = 0
    let countBar = 0
    const foo = function(...args) {
      countFoo++
    }
    const bar = function(...args) {
      countBar++
    }
    const vm = new Vue({
      template: '<div><wrap @click="foo" @test="bar"/></div>',
      methods: { foo, bar },
      components: {
        wrap: {
          functional: true,
          render(h, vm) {
            const { listeners } = vm
            return h('div', {
              on: {
                click: [listeners.click, () => listeners.test('bar')],
                test: [listeners.test, () => listeners.click()]
              }
            })
          }
        }
      }
    }).$mount()

    fireEvent(firstChild(vm.$el), 'click')
    expect(countBar).to.equal(1)
    fireEvent(firstChild(vm.$el), 'test')
    expect(countFoo).to.equal(2)
  })

  it('should support returning more than one root node', () => {
    const vm = new Vue({
      template: `<div><test></test></div>`,
      components: {
        test: {
          functional: true,
          render(h) {
            return [h('span', 'foo'), h('span', 'bar')]
          }
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="foo"></span><span value="bar"></span></div>'
    )
  })

  it('should support slots', () => {
    const vm = new Vue({
      data: { test: 'foo' },
      template: '<div><wrap><div slot="a">foo</div><div slot="b">bar</div></wrap></div>',
      components: {
        wrap: {
          functional: true,
          props: ['msg'],
          render(h, { slots }) {
            slots = slots()
            return h('div', null, [slots.b, slots.a])
          }
        }
      }
    }).$mount()
    expect(toString(firstChild(vm.$el))).to.equal(
      '<div><div value="bar"></div><div value="foo"></div></div>'
    )
  })

  it('create empty vnode when render return null', done => {
    done()
    const child = {
      functional: true,
      render() {
        return null
      }
    }
    const vm = new Vue({
      components: {
        child
      }
    })
    const h = vm.$createElement
    const vnode = h('child')
    expect(vnode).to.deep.equal(h(undefined))
  })

  it('should work with render fns compiled from template', done => {
    // code generated via vue-template-es2015-compiler
    const render = function(_h, _vm) {
      const _c = _vm._c
      return _c(
        'div',
        [
          _c('h2', { staticClass: 'red' }, [_vm._v(_vm._s(_vm.props.msg))]),
          _vm._t('default'),
          _vm._t('slot2'),
          _vm._t('scoped', null, { msg: _vm.props.msg }),
          _vm._m(0),
          _c('div', { ref: 'ref1', staticClass: 'clickable', on: { click: _vm.parent.fn }}, [
            _vm._v('click me')
          ])
        ],
        2
      )
    }
    const staticRenderFns = [
      function(_h, _vm) {
        const _c = _vm._c
        return _c('div', [_vm._v('Some '), _c('span', [_vm._v('text')])])
      }
    ]

    const child = {
      functional: true,
      _compiled: true,
      render,
      staticRenderFns
    }

    const parent = new Vue({
      components: {
        child
      },
      data: {
        msg: 'hello'
      },
      template: `
      <div>
        <child :msg="msg">
          <span>{{ msg }}</span>
          <div slot="slot2">Second slot</div>
          <template slot="scoped" slot-scope="scope">{{ scope.msg }}</template>
        </child>
      </div>
      `,
      methods: {
        fn() {
          this.msg = 'bye'
        }
      }
    }).$mount()

    function assertMarkup() {
      expect(toString(parent.$el)).to.equal(
        `<div><div value="${parent.msg}"><h2 value="${parent.msg}" class="red"></h2><span value="${
          parent.msg
        }"></span><div value="Second slot"></div><div value="Some "><span value="text"></span></div><div value="click me" class="clickable"></div></div></div>`
      )
    }

    assertMarkup()
    fireEvent(parent.$refs.ref1, 'click')
    global.waitForUpdate(assertMarkup).then(done)
  })
})
