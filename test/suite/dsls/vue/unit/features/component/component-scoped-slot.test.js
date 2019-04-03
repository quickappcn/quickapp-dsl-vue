import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild, toString, secondChild } from '../../utils/helper'

describe('Component scoped slot', () => {
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

  it('default slot', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot-scope="props">
            <span>{{ props.msg }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot :msg="msg"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(toString(vm.$el)).to.equal('<div><span value="hello"></span></div>')
    vm.$refs.test.msg = 'world'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal('<div><span value="world"></span></div>')
      })
      .then(done)
  })

  it('default slot (plain element)', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <span slot-scope="props">{{ props.msg }}</span>
        </test>
      `,
      components: {
        test: {
          data() {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot :msg="msg"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><span value="hello"></span></div>')
    vm.$refs.test.msg = 'world'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal('<div><span value="world"></span></div>')
      })
      .then(done)
  })

  it('with v-bind', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot-scope="props">
            <span>{{ props.msg }} {{ props.msg2 }} {{ props.msg3 }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return {
              msg: 'hello',
              obj: { msg2: 'world', msg3: '.' }
            }
          },
          template: `
            <div>
              <slot :msg="msg" v-bind="obj" msg3="!"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(toString(vm.$el)).to.equal('<div><span value="hello world !"></span></div>')
    vm.$refs.test.msg = 'bye'
    vm.$refs.test.obj.msg2 = 'bye'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal('<div><span value="bye bye !"></span></div>')
      })
      .then(done)
  })

  it('should warn when using v-bind with no object', () => {
    new Vue({
      template: `
        <test ref="test">
          <template scope="props">
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return {
              text: 'some text'
            }
          },
          template: `
            <div>
              <slot v-bind="text"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(countWarn).to.equal(1)
  })

  it('should not warn when using v-bind with object', () => {
    new Vue({
      template: `
        <test ref="test">
          <template scope="props">
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return {
              foo: {
                text: 'some text'
              }
            }
          },
          template: `
            <div>
              <slot v-bind="foo"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(countWarn).to.equal(0)
  })

  it('named scoped slot', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" slot-scope="props">
            <span>{{ props.foo }}</span><span>{{ props.bar }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return { foo: 'FOO', bar: 'BAR' }
          },
          template: `
            <div>
              <slot name="item" :foo="foo" :bar="bar"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(toString(firstChild(vm.$el))).to.equal('<span value="FOO"></span>')
    expect(toString(secondChild(vm.$el))).to.equal('<span value="BAR"></span>')
    vm.$refs.test.foo = 'BAZ'
    global
      .waitForUpdate(() => {
        expect(toString(firstChild(vm.$el))).to.equal('<span value="BAZ"></span>')
        expect(toString(secondChild(vm.$el))).to.equal('<span value="BAR"></span>')
      })
      .then(done)
  })

  it('named scoped slot (plain element)', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <span slot="item" slot-scope="props">{{ props.foo }} {{ props.bar }}</span>
        </test>
      `,
      components: {
        test: {
          data() {
            return { foo: 'FOO', bar: 'BAR' }
          },
          template: `
            <div>
              <slot name="item" :foo="foo" :bar="bar"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(toString(firstChild(vm.$el))).to.equal('<span value="FOO BAR"></span>')
    vm.$refs.test.foo = 'BAZ'
    global
      .waitForUpdate(() => {
        expect(toString(firstChild(vm.$el))).to.equal('<span value="BAZ BAR"></span>')
      })
      .then(done)
  })

  it('fallback content', () => {
    const vm = new Vue({
      template: `<test></test>`,
      components: {
        test: {
          data() {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot name="item" :text="msg">
                <span>{{ msg }} fallback</span>
              </slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(toString(firstChild(vm.$el))).to.equal('<span value="hello fallback"></span>')
  })

  it('slot with v-for', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" slot-scope="props">
            <span>{{ props.text }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return {
              items: ['foo', 'bar', 'baz']
            }
          },
          template: `
            <div>
              <slot v-for="item in items" name="item" :text="item"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(toString(vm.$el)).to.equal(
      '<div><span value="foo"></span><span value="bar"></span><span value="baz"></span></div>'
    )
    vm.$refs.test.items.reverse()
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="baz"></span><span value="bar"></span><span value="foo"></span></div>'
        )
        vm.$refs.test.items.push('qux')
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="baz"></span><span value="bar"></span><span value="foo"></span><span value="qux"></span></div>'
        )
      })
      .then(done)
  })

  it('slot inside v-for', done => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" slot-scope="props">
            <span>{{ props.text }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return {
              items: ['foo', 'bar', 'baz']
            }
          },
          template: `
            <ul>
              <li v-for="item in items">
                <slot name="item" :text="item"></slot>
              </li>
            </ul>
          `
        }
      }
    }).$mount()

    expect(toString(vm.$el)).to.equal(
      '<ul><li><span value="foo"></span></li><li><span value="bar"></span></li><li><span value="baz"></span></li></ul>'
    )
    vm.$refs.test.items.reverse()
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<ul><li><span value="baz"></span></li><li><span value="bar"></span></li><li><span value="foo"></span></li></ul>'
        )
        vm.$refs.test.items.push('qux')
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<ul><li><span value="baz"></span></li><li><span value="bar"></span></li><li><span value="foo"></span></li><li><span value="qux"></span></li></ul>'
        )
      })
      .then(done)
  })

  it('scoped slot without scope alias', () => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <span slot="item">I am static</span>
        </test>
      `,
      components: {
        test: {
          data() {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot name="item" :text="msg"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(toString(firstChild(vm.$el))).to.equal('<span value="I am static"></span>')
  })

  it('non-scoped slot with scope alias', () => {
    const vm = new Vue({
      template: `
        <test ref="test">
          <template slot="item" slot-scope="props">
            <span>{{ props.text || 'meh' }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot name="item"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(toString(firstChild(vm.$el))).to.equal('<span value="meh"></span>')
  })

  it('warn key on slot', () => {
    new Vue({
      template: `
        <test ref="test">
          <template slot="item" slot-scope="props">
            <span>{{ props.text }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return {
              items: ['foo', 'bar', 'baz']
            }
          },
          template: `
            <div>
              <slot v-for="item in items" name="item" :text="item" :key="item"></slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(countError).to.equal(1)
  })

  it('render function usage (named, via data)', done => {
    const vm = new Vue({
      render(h) {
        return h('test', {
          ref: 'test',
          scopedSlots: {
            item: props => h('span', props.text)
          }
        })
      },
      components: {
        test: {
          data() {
            return { msg: 'hello' }
          },
          render(h) {
            return h('div', [
              this.$scopedSlots.item({
                text: this.msg
              })
            ])
          }
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><span value="hello"></span></div>')
    vm.$refs.test.msg = 'world'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal('<div><span value="world"></span></div>')
      })
      .then(done)
  })

  it('render function usage (default, as children)', () => {
    const vm = new Vue({
      render(h) {
        return h('test', [props => h('span', [props.msg])])
      },
      components: {
        test: {
          data() {
            return { msg: 'hello' }
          },
          render(h) {
            return h('div', [this.$scopedSlots.default({ msg: this.msg })])
          }
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><span value="hello"></span></div>')
  })

  // #4779
  it('should support dynamic slot target', done => {
    const Child = {
      template: `
        <div>
          <slot name="a" msg="a" />
          <slot name="b" msg="b" />
        </div>
      `
    }

    const vm = new Vue({
      data: {
        a: 'a',
        b: 'b'
      },
      template: `
        <child>
          <template :slot="a" slot-scope="props">A {{ props.msg }}</template>
          <template :slot="b" slot-scope="props">B {{ props.msg }}</template>
        </child>
      `,
      components: { Child }
    }).$mount()

    expect(vm.$el.attr.value).to.equal('A a B b')

    // switch slots
    vm.a = 'b'
    vm.b = 'a'
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('B a A b')
      })
      .then(done)
  })

  // #5615
  it('scoped slot with v-for', done => {
    const vm = new Vue({
      data: { names: ['foo', 'bar'] },
      template: `
        <test ref="test">
          <template v-for="n in names" :slot="n" slot-scope="props">
            <span>{{ props.msg }}</span>
          </template>
          <template slot="abc" slot-scope="props">
            <span>{{ props.msg }}</span>
          </template>
        </test>
      `,
      components: {
        test: {
          data: () => ({ msg: 'hello' }),
          template: `
            <div>
              <slot name="foo" :msg="msg + ' foo'"></slot>
              <slot name="bar" :msg="msg + ' bar'"></slot>
              <slot name="abc" :msg="msg + ' abc'"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(toString(vm.$el)).to.equal(
      '<div value=" "><span value="hello foo"></span><span value="hello bar"></span><span value="hello abc"></span></div>'
    )
    vm.$refs.test.msg = 'world'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><span value="world foo"></span><span value="world bar"></span><span value="world abc"></span></div>'
        )
      })
      .then(done)
  })

  it('scoped slot with v-for (plain elements)', done => {
    const vm = new Vue({
      data: { names: ['foo', 'bar'] },
      template: `
        <test ref="test">
          <span v-for="n in names" :slot="n" slot-scope="props">{{ props.msg }}</span>
          <span slot="abc" slot-scope="props">{{ props.msg }}</span>
        </test>
      `,
      components: {
        test: {
          data: () => ({ msg: 'hello' }),
          template: `
            <div>
              <slot name="foo" :msg="msg + ' foo'"></slot>
              <slot name="bar" :msg="msg + ' bar'"></slot>
              <slot name="abc" :msg="msg + ' abc'"></slot>
            </div>
          `
        }
      }
    }).$mount()

    expect(toString(vm.$el)).to.equal(
      '<div value=" "><span value="hello foo"></span><span value="hello bar"></span><span value="hello abc"></span></div>'
    )
    vm.$refs.test.msg = 'world'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><span value="world foo"></span><span value="world bar"></span><span value="world abc"></span></div>'
        )
      })
      .then(done)
  })

  // #6725
  it('scoped slot with v-if', done => {
    const vm = new Vue({
      data: {
        ok: false
      },
      template: `
        <test>
          <template v-if="ok" slot-scope="foo">
            <p>{{ foo.text }}</p>
          </template>
        </test>
      `,
      components: {
        test: {
          data() {
            return { msg: 'hello' }
          },
          template: `
            <div>
              <slot :text="msg">
                <span>{{ msg }} fallback</span>
              </slot>
            </div>
          `
        }
      }
    }).$mount()
    expect(toString(firstChild(vm.$el))).to.equal('<span value="hello fallback"></span>')

    vm.ok = true
    global
      .waitForUpdate(() => {
        expect(toString(firstChild(vm.$el))).to.equal('<p value="hello"></p>')
      })
      .then(done)
  })
})
