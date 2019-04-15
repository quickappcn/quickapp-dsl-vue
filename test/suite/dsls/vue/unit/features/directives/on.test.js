import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild, fireEvent } from '../../utils/helper'

describe('Directive v-on', () => {
  let vm, spy, el, args
  let count = 0

  beforeEach(() => {
    vm = null
    spy = function(...argSpy) {
      args = argSpy
      count++
    }
  })

  afterEach(() => {
    count = 0
    args = []
  })

  it('should bind event to a method', () => {
    vm = new Vue({
      template: '<div v-on:click="foo"></div>',
      methods: { foo: spy }
    }).$mount()
    fireEvent(vm.$el, 'click')
    expect(count).to.equal(1)
    const event = args[0]
    expect(event.type).to.equal('click')
  })

  it('should bind event to a inline statement', () => {
    vm = new Vue({
      template: '<div v-on:click="foo(1,2,3,$event)"></div>',
      methods: { foo: spy }
    }).$mount()
    fireEvent(vm.$el, 'click')
    expect(count).to.equal(1)

    const firstArgs = args
    expect(firstArgs.length).to.equal(4)
    expect(firstArgs[0]).to.equal(1)
    expect(firstArgs[1]).to.equal(2)
    expect(firstArgs[2]).to.equal(3)
    expect(firstArgs[3].type).to.equal('click')
  })

  it('should support inline function expression', () => {
    let content
    const spy = function(e) {
      content = e
    }
    vm = new Vue({
      template: `<div class="test" @click="function (e) { log(e.target.attr.class) }"></div>`,
      methods: {
        log: spy
      }
    }).$mount()
    fireEvent(vm.$el, 'click')
    expect(content).to.equal('test')
  })

  it('should support shorthand', done => {
    vm = new Vue({
      template: '<a href="#test" @click.prevent="foo"></a>',
      methods: { foo: spy }
    }).$mount()
    // TODO 快应用暂不支持preventDefault
    done()
    // fireEvent(vm.$el, 'click')
    expect(count).to.equal(1)
  })

  it('should support stop propagation', () => {
    vm = new Vue({
      template: `
        <div @click.stop="function(e) { foo(e) }"></div>
      `,
      methods: { foo: spy }
    }).$mount()
    fireEvent(vm.$el, 'click')
  })

  it('should support prevent default', done => {
    vm = new Vue({
      template: `
        <input type="checkbox" ref="input" @click.prevent="foo">
      `,
      methods: {
        foo($event) {
          spy($event.defaultPrevented)
        }
      }
    }).$mount()
    vm.$refs.input.checked = false
    // TODO 暂时不支持preventDefault
    done()
    // fireEvent(vm.$refs.input, 'click')
  })

  it('should support capture', () => {
    const callOrder = []
    vm = new Vue({
      template: `
        <div @click.capture="foo">
          <div @click="bar"></div>
        </div>
      `,
      methods: {
        foo() {
          callOrder.push(1)
        },
        bar() {
          callOrder.push(2)
        }
      }
    }).$mount()
    fireEvent(firstChild(vm.$el), 'click')
    expect(callOrder.toString()).to.equal('1,2')
  })

  it('should support once', () => {
    vm = new Vue({
      template: `
        <div @click.once="foo">
        </div>
      `,
      methods: { foo: spy }
    }).$mount()
    fireEvent(vm.$el, 'click')
    expect(count).to.equal(1)
    fireEvent(vm.$el, 'click')
    expect(count).to.equal(1)
  })

  // #4655
  it('should handle .once on multiple elements properly', () => {
    vm = new Vue({
      template: `
        <div>
          <button ref="one" @click.once="foo">one</button>
          <button ref="two" @click.once="foo">two</button>
        </div>
      `,
      methods: { foo: spy }
    }).$mount()
    fireEvent(vm.$refs.one, 'click')
    expect(count).to.equal(1)
    fireEvent(vm.$refs.one, 'click')
    expect(count).to.equal(1)
    fireEvent(vm.$refs.two, 'click')
    expect(count).to.equal(2)
    fireEvent(vm.$refs.one, 'click')
    fireEvent(vm.$refs.two, 'click')
    expect(count).to.equal(2)
  })

  it('should support capture and once', () => {
    const callOrder = []
    vm = new Vue({
      template: `
        <div @click.capture.once="foo">
          <div @click="bar"></div>
        </div>
      `,
      methods: {
        foo() {
          callOrder.push(1)
        },
        bar() {
          callOrder.push(2)
        }
      }
    }).$mount()
    fireEvent(firstChild(vm.$el), 'click')
    expect(callOrder.toString()).to.equal('1,2')
    fireEvent(firstChild(vm.$el), 'click')
    expect(callOrder.toString()).to.equal('1,2,2')
  })

  // #4846
  it('should support once and other modifiers', done => {
    vm = new Vue({
      template: `<div @click.once.self="foo"><span/></div>`,
      methods: {
        foo: function() {
          spy()
        }
      }
    }).$mount()
    // with(this){return _c('div',{on:{"~click":function($event){if($event.target !== $event.currentTarget)return null;foo($event)}}},[_c('span')])}
    // TODO 涉及到$event，快应用的DOM暂时与DOM规范不一致，所以待修改$event.target
    done()
    fireEvent(firstChild(vm.$el), 'click')
    expect(count).to.equal(0)
    fireEvent(vm.$el, 'click')
    expect(count).to.equal(1)
    fireEvent(vm.$el, 'click')
    expect(count).to.equal(1)
  })

  it('should support keyCode', done => {
    vm = new Vue({
      template: `<input @keyup.enter="foo">`,
      methods: { foo: spy }
    }).$mount()
    // TODO 快应用暂时不支持keyup事件
    done()
    fireEvent(vm.$el, 'keyup', e => {
      e.keyCode = 13
    })
    expect(count).to.equal(0)
  })

  it('should support automatic key name inference', done => {
    vm = new Vue({
      template: `<input @keyup.arrow-right="foo">`,
      methods: { foo: spy }
    }).$mount()
    // TODO 快应用暂时不支持keyup事件
    done()
    fireEvent(vm.$el, 'keyup', e => {
      e.key = 'ArrowRight'
    })
    expect(count).to.equal(0)
  })

  // ctrl, shift, alt, meta
  it('should support system modifers', done => {
    vm = new Vue({
      template: `
        <div>
          <input ref="ctrl" @keyup.ctrl="foo">
          <input ref="shift" @keyup.shift="foo">
          <input ref="alt" @keyup.alt="foo">
          <input ref="meta" @keyup.meta="foo">
        </div>
      `,
      methods: { foo: spy }
    }).$mount()
    // TODO 快应用暂时不支持keyup事件
    done()
    fireEvent(vm.$refs.ctrl, 'keyup')
    expect(count).to.equal(0)
    fireEvent(vm.$refs.ctrl, 'keyup', e => {
      e.ctrlKey = true
    })
    expect(count).to.equal(1)

    fireEvent(vm.$refs.shift, 'keyup')
    expect(count).to.equal(1)
    fireEvent(vm.$refs.shift, 'keyup', e => {
      e.shiftKey = true
    })
    expect(count).to.equal(2)

    fireEvent(vm.$refs.alt, 'keyup')
    expect(count).to.equal(2)
    fireEvent(vm.$refs.alt, 'keyup', e => {
      e.altKey = true
    })
    expect(count).to.equal(3)

    fireEvent(vm.$refs.meta, 'keyup')
    expect(count).to.equal(3)
    fireEvent(vm.$refs.meta, 'keyup', e => {
      e.metaKey = true
    })
    expect(count).to.equal(4)
  })

  it('should support exact modifier', done => {
    vm = new Vue({
      template: `
        <div>
          <input ref="ctrl" @keyup.exact="foo">
        </div>
      `,
      methods: { foo: spy }
    }).$mount()

    // TODO 快应用暂时不支持keyup事件
    done()
    fireEvent(vm.$refs.ctrl, 'keyup')
    expect(count).to.equal(1)

    fireEvent(vm.$refs.ctrl, 'keyup', e => {
      e.ctrlKey = true
    })
    expect(count).to.equal(1)

    // should not trigger if has other system modifiers
    fireEvent(vm.$refs.ctrl, 'keyup', e => {
      e.ctrlKey = true
      e.altKey = true
    })
    expect(count).to.equal(1)
  })

  it('should support system modifers with exact', done => {
    vm = new Vue({
      el,
      template: `
        <div>
          <input ref="ctrl" @keyup.ctrl.exact="foo">
        </div>
      `,
      methods: { foo: spy }
    })
    // TODO 快应用暂时不支持keyup事件
    done()
    fireEvent(vm.$refs.ctrl, 'keyup')
    expect(count).to.equal(0)

    fireEvent(vm.$refs.ctrl, 'keyup', e => {
      e.ctrlKey = true
    })
    expect(count).to.equal(1)

    // should not trigger if has other system modifiers
    fireEvent(vm.$refs.ctrl, 'keyup', e => {
      e.ctrlKey = true
      e.altKey = true
    })
    expect(count).to.equal(1)
  })

  it('should support number keyCode', done => {
    vm = new Vue({
      template: `<input @keyup.13="foo">`,
      methods: { foo: spy }
    }).$mount()
    // TODO 快应用暂时不支持keyup事件
    done()

    fireEvent(vm.$el, 'keyup', e => {
      e.keyCode = 13
    })
    expect(spy).toHaveBeenCalled()
  })

  it('should support mouse modifier', done => {
    const emptyFn = () => {}
    vm = new Vue({
      template: `
        <div>
          <div ref="left" @mousedown.left="foo">left</div>
          <div ref="right" @mousedown.right="foo1">right</div>
          <div ref="middle" @mousedown.middle="foo2">right</div>
        </div>
      `,
      methods: {
        foo: emptyFn,
        foo1: emptyFn,
        foo2: emptyFn
      }
    }).$mount()
    // TODO 快应用暂时不支持mouse事件
    done()
  })

  it('should support custom keyCode', done => {
    Vue.config.keyCodes.test = 1
    vm = new Vue({
      template: `<input @keyup.test="foo">`,
      methods: { foo: spy }
    }).$mount()
    // TODO 快应用暂时不支持keyup事件
    done()
    fireEvent(vm.$el, 'keyup', e => {
      e.keyCode = 1
    })
    expect(spy).toHaveBeenCalled()
    Vue.config.keyCodes = Object.create(null)
  })

  it('should override build-in keyCode', done => {
    Vue.config.keyCodes.up = [1, 87]
    vm = new Vue({
      template: `<input @keyup.up="foo" @keyup.down="foo">`,
      methods: { foo: spy }
    }).$mount()
    // TODO 快应用暂时不支持keyup事件
    done()
    fireEvent(vm.$el, 'keyup', e => {
      e.keyCode = 87
    })
    expect(spy).toHaveBeenCalled()
    fireEvent(vm.$el, 'keyup', e => {
      e.keyCode = 1
    })
    expect(spy).toHaveBeenCalledTimes(2)
    // should not affect build-in down keycode
    fireEvent(vm.$el, 'keyup', e => {
      e.keyCode = 40
    })
    expect(spy).toHaveBeenCalledTimes(3)
    Vue.config.keyCodes = Object.create(null)
  })

  it('should bind to a child component', () => {
    vm = new Vue({
      template: '<bar @custom="foo"></bar>',
      methods: { foo: spy },
      components: {
        bar: {
          template: '<span>Hello</span>'
        }
      }
    }).$mount()
    vm.$children[0].$emit('custom', 'foo', 'bar')
    expect(args).to.deep.equal(['foo', 'bar'])
  })

  it('should be able to bind native events for a child component', () => {
    vm = new Vue({
      template: '<bar @click.native="foo"></bar>',
      methods: { foo: spy },
      components: {
        bar: {
          template: '<span>Hello</span>'
        }
      }
    }).$mount()
    vm.$children[0].$emit('click')
    expect(count).to.equal(0)
    fireEvent(vm.$children[0].$el, 'click')
    expect(count).to.equal(1)
  })

  it('.once modifier should work with child components', () => {
    vm = new Vue({
      template: '<bar @custom.once="foo"></bar>',
      methods: { foo: spy },
      components: {
        bar: {
          template: '<span>Hello</span>'
        }
      }
    }).$mount()
    vm.$children[0].$emit('custom')
    expect(count).to.equal(1)
    vm.$children[0].$emit('custom')
    expect(count).to.equal(1) // should not be called again
  })

  it('remove listener', done => {
    let count2 = 0
    const spy2 = function() {
      count2++
    }
    vm = new Vue({
      methods: { foo: spy, bar: spy2 },
      data: {
        ok: true
      },
      render(h) {
        return this.ok
          ? h('input', { on: { click: this.foo }})
          : h('input', { on: { input: this.bar }})
      }
    }).$mount()
    fireEvent(vm.$el, 'click')
    expect(count).to.equal(1)
    expect(count2).to.equal(0)
    vm.ok = false
    global
      .waitForUpdate(() => {
        fireEvent(vm.$el, 'click')
        expect(count).to.equal(1) // should no longer trigger
        fireEvent(vm.$el, 'input')
        expect(count2).to.equal(1)
      })
      .then(done)
  })

  it('remove capturing listener', done => {
    let count2 = 0
    const spy2 = function() {
      count2++
    }
    vm = new Vue({
      methods: {
        foo: spy,
        bar: spy2,
        stopped(ev) {
          ev.stopPropagation()
        }
      },
      data: {
        ok: true
      },
      render(h) {
        return this.ok
          ? h('div', { on: { '!click': this.foo }}, [h('div', { on: { click: this.stopped }})])
          : h('div', { on: { mouseOver: this.bar }}, [h('div')])
      }
    }).$mount()
    fireEvent(firstChild(vm.$el), 'click')
    expect(count).to.equal(1)
    expect(count2).to.equal(0)
    vm.ok = false
    global
      .waitForUpdate(() => {
        fireEvent(firstChild(vm.$el), 'click')
        expect(count).to.equal(1) // should no longer trigger
        fireEvent(vm.$el, 'mouseOver')
        expect(count2).to.equal(1)
      })
      .then(done)
  })

  it('remove once listener', done => {
    let count2 = 0
    const spy2 = function() {
      count2++
    }
    vm = new Vue({
      methods: { foo: spy, bar: spy2 },
      data: {
        ok: true
      },
      render(h) {
        return this.ok
          ? h('input', { on: { '~click': this.foo }})
          : h('input', { on: { input: this.bar }})
      }
    }).$mount()
    fireEvent(vm.$el, 'click')
    expect(count).to.equal(1)
    fireEvent(vm.$el, 'click')
    expect(count).to.equal(1) // should no longer trigger
    expect(count2).to.equal(0)
    vm.ok = false
    global
      .waitForUpdate(() => {
        fireEvent(vm.$el, 'click')
        expect(count).to.equal(1) // should no longer trigger
        fireEvent(vm.$el, 'input')
        expect(count2).to.equal(1)
      })
      .then(done)
  })

  it('remove capturing and once listener', done => {
    let count2 = 0
    const spy2 = function() {
      count2++
    }
    vm = new Vue({
      methods: {
        foo: spy,
        bar: spy2,
        stopped(ev) {
          ev.stopPropagation()
        }
      },
      data: {
        ok: true
      },
      render(h) {
        return this.ok
          ? h('div', { on: { '~!click': this.foo }}, [h('div', { on: { click: this.stopped }})])
          : h('div', { on: { mouseOver: this.bar }}, [h('div')])
      }
    }).$mount()
    fireEvent(firstChild(vm.$el), 'click')
    expect(count).to.equal(1)
    fireEvent(firstChild(vm.$el), 'click')
    expect(count).to.equal(1) // should no longer trigger
    expect(count2).to.equal(0)
    vm.ok = false
    global
      .waitForUpdate(() => {
        fireEvent(firstChild(vm.$el), 'click')
        expect(count).to.equal(1) // should no longer trigger
        fireEvent(vm.$el, 'mouseOver')
        expect(count2).to.equal(1)
      })
      .then(done)
  })

  it('remove listener on child component', done => {
    let count2 = 0
    const spy2 = function() {
      count2++
    }
    vm = new Vue({
      methods: { foo: spy, bar: spy2 },
      data: {
        ok: true
      },
      components: {
        test: {
          template: '<div></div>'
        }
      },
      render(h) {
        return this.ok ? h('test', { on: { foo: this.foo }}) : h('test', { on: { bar: this.bar }})
      }
    }).$mount()
    vm.$children[0].$emit('foo')
    expect(count).to.equal(1)
    expect(count2).to.equal(0)
    vm.ok = false
    global
      .waitForUpdate(() => {
        vm.$children[0].$emit('foo')
        expect(count).to.equal(1) // should no longer trigger
        vm.$children[0].$emit('bar')
        expect(count2).to.equal(1)
      })
      .then(done)
  })

  it('warn missing handlers', () => {
    vm = new Vue({
      el,
      data: { none: null },
      template: `<div @click="none"></div>`
    })
  })

  // Github Issue #5046
  it('should support keyboard modifier for direction keys', done => {
    const emptyFn = new Function()
    // TODO 快应用暂时不支持keyboard事件
    done()
    vm = new Vue({
      el,
      template: `
        <div>
          <input ref="left" @keydown.left="foo"></input>
          <input ref="right" @keydown.right="foo1"></input>
          <input ref="up" @keydown.up="foo2"></input>
          <input ref="down" @keydown.down="foo3"></input>
        </div>
      `,
      methods: {
        foo: emptyFn,
        foo1: emptyFn,
        foo2: emptyFn,
        foo3: emptyFn
      }
    })
    fireEvent(vm.$refs.left, 'keydown', e => {
      e.keyCode = 37
    })
    fireEvent(vm.$refs.left, 'keydown', e => {
      e.keyCode = 39
    })

    fireEvent(vm.$refs.right, 'keydown', e => {
      e.keyCode = 39
    })
    fireEvent(vm.$refs.right, 'keydown', e => {
      e.keyCode = 38
    })

    fireEvent(vm.$refs.up, 'keydown', e => {
      e.keyCode = 38
    })
    fireEvent(vm.$refs.up, 'keydown', e => {
      e.keyCode = 37
    })

    fireEvent(vm.$refs.down, 'keydown', e => {
      e.keyCode = 40
    })
    fireEvent(vm.$refs.down, 'keydown', e => {
      e.keyCode = 39
    })
  })

  // GitHub Issues #5146
  it('should only prevent when match keycode', done => {
    // TODO 快应用暂时不支持keyboard事件
    done()
    let prevented = false
    vm = new Vue({
      el,
      template: `
        <input ref="input" @keydown.enter.prevent="foo">
      `,
      methods: {
        foo($event) {
          prevented = $event.defaultPrevented
        }
      }
    })

    fireEvent(vm.$refs.input, 'keydown', e => {
      e.keyCode = 32
    })
    expect(prevented).to.equal(false)
    fireEvent(vm.$refs.input, 'keydown', e => {
      e.keyCode = 13
    })
    expect(prevented).to.equal(true)
  })

  it('should warn click.right', done => {
    // TODO 快应用暂时不支持menucontext事件
    done()
    new Vue({
      template: `<div @click.right="foo"></div>`,
      methods: { foo() {} }
    }).$mount()
  })

  it('object syntax (no argument)', () => {
    let clickCount = 0
    let mouseupCount = 0
    const click = function() {
      clickCount++
    }
    const mouseup = function() {
      mouseupCount++
    }
    vm = new Vue({
      template: `<button v-on="listeners">foo</button>`,
      created() {
        this.listeners = {
          click,
          mouseup
        }
      }
    }).$mount()

    fireEvent(vm.$el, 'click')
    expect(clickCount).to.equal(1)
    expect(mouseupCount).to.equal(0)

    fireEvent(vm.$el, 'mouseup')
    expect(clickCount).to.equal(1)
    expect(mouseupCount).to.equal(1)
  })

  it('object syntax (no argument, mixed with normal listeners)', () => {
    let click1Count = 0
    let click2Count = 0
    let mouseupCount = 0
    const click1 = function() {
      click1Count++
    }
    const click2 = function() {
      click2Count++
    }
    const mouseup = function() {
      mouseupCount++
    }
    vm = new Vue({
      template: `<button v-on="listeners" @click="click2">foo</button>`,
      created() {
        this.listeners = {
          click: click1,
          mouseup
        }
      },
      methods: {
        click2
      }
    }).$mount()

    fireEvent(vm.$el, 'click')
    expect(click1Count).to.equal(1)
    expect(click2Count).to.equal(1)
    expect(mouseupCount).to.equal(0)

    fireEvent(vm.$el, 'mouseup')
    expect(click1Count).to.equal(1)
    expect(click2Count).to.equal(1)
    expect(mouseupCount).to.equal(1)
  })

  it('object syntax (usage in HOC, mixed with native listeners)', () => {
    let clickCount = 0
    let mousedownCount = 0
    let mouseupCount = 0
    const click = function() {
      clickCount++
    }
    const mousedown = function() {
      mousedownCount++
    }
    const mouseup = function() {
      mouseupCount++
    }

    vm = new Vue({
      template: `
        <foo-button
          @click="click"
          @mousedown="mousedown"
          @mouseup.native="mouseup">
        </foo-button>
      `,
      methods: {
        click,
        mouseup,
        mousedown
      },
      components: {
        fooButton: {
          template: `
            <button v-on="$listeners"></button>
          `
        }
      }
    }).$mount()

    fireEvent(vm.$el, 'click')
    expect(clickCount).to.equal(1)
    expect(mouseupCount).to.equal(0)
    expect(mousedownCount).to.equal(0)

    fireEvent(vm.$el, 'mouseup')
    expect(clickCount).to.equal(1)
    expect(mouseupCount).to.equal(1)
    expect(mousedownCount).to.equal(0)

    fireEvent(vm.$el, 'mousedown')
    expect(clickCount).to.equal(1)
    expect(mouseupCount).to.equal(1)
    expect(mousedownCount).to.equal(1)
  })

  // #6805 (v-on="object" bind order problem)
  it('object syntax (no argument): should fire after high-priority listeners', () => {
    const MyCheckbox = {
      template: '<input type="checkbox" v-model="model" ref="input" v-on="$listeners">',
      props: {
        value: false
      },
      computed: {
        model: {
          get() {
            return this.value
          },
          set(val) {
            this.$emit('input', val)
          }
        }
      }
    }

    vm = new Vue({
      template: `
        <div>
          <my-checkbox v-model="check" @change="change" ref="cb"></my-checkbox>
        </div>
      `,
      components: { MyCheckbox },
      data: {
        check: false
      },
      methods: {
        change() {
          expect(this.check).to.equal(true)
        }
      }
    }).$mount()
    // TODO 快应用暂时没有给checkbox添加方法
    // vm.$refs.cb.$refs.input.change()
  })

  it('warn object syntax with modifier', () => {
    new Vue({
      template: `<button v-on.self="{}"></button>`
    }).$mount()
  })

  it('warn object syntax with non-object value', () => {
    new Vue({
      template: `<button v-on="123"></button>`
    }).$mount()
  })
})
