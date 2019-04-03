import '../../utils/imports'
import Vue from '../../utils/vue'
import { toString, firstChild, secondChild, lastChild } from '../../utils/helper'

describe('Component slot', () => {
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

  let vm, child
  function mount(options) {
    vm = new Vue({
      data: {
        msg: 'parent message'
      },
      template: `<div><test>${options.parentContent || ''}</test></div>`,
      components: {
        test: {
          template: options.childTemplate,
          data() {
            return {
              msg: 'child message'
            }
          }
        }
      }
    }).$mount()
    child = vm.$children[0]
  }

  it('no content', () => {
    mount({
      childTemplate: '<div><slot></slot></div>'
    })
    expect(child.$el.childNodes.length).to.equal(0)
  })

  it('default slot', done => {
    mount({
      childTemplate: '<div><slot></slot></div>',
      parentContent: '<p>{{ msg }}</p>'
    })
    expect(child.$el.tagName).to.equal('DIV')
    expect(firstChild(child.$el).tagName).to.equal('P')
    expect(firstChild(child.$el).attr.value).to.equal('parent message')
    vm.msg = 'changed'
    global
      .waitForUpdate(() => {
        expect(firstChild(child.$el).attr.value).to.equal('changed')
      })
      .then(done)
  })

  it('named slot', done => {
    mount({
      childTemplate: '<div><slot name="test"></slot></div>',
      parentContent: '<p slot="test">{{ msg }}</p>'
    })
    expect(child.$el.tagName).to.equal('DIV')
    expect(firstChild(child.$el).tagName).to.equal('P')
    expect(firstChild(child.$el).attr.value).to.equal('parent message')
    vm.msg = 'changed'
    global
      .waitForUpdate(() => {
        expect(firstChild(child.$el).attr.value).to.equal('changed')
      })
      .then(done)
  })

  it('named slot with 0 as a number', done => {
    mount({
      childTemplate: '<div><slot :name="0"></slot></div>',
      parentContent: '<p :slot="0">{{ msg }}</p>'
    })
    expect(child.$el.tagName).to.equal('DIV')
    expect(firstChild(child.$el).tagName).to.equal('P')
    expect(firstChild(child.$el).attr.value).to.equal('parent message')
    vm.msg = 'changed'
    global
      .waitForUpdate(() => {
        expect(firstChild(child.$el).attr.value).to.equal('changed')
      })
      .then(done)
  })

  it('fallback content', () => {
    mount({
      childTemplate: '<div><slot><p>{{msg}}</p></slot></div>'
    })
    expect(firstChild(child.$el).tagName).to.equal('P')
    expect(firstChild(child.$el).attr.value).to.equal('child message')
  })

  it('fallback content with multiple named slots', () => {
    mount({
      childTemplate: `
        <div>
          <slot name="a"><p>fallback a</p></slot>
          <slot name="b">fallback b</slot>
        </div>
      `,
      parentContent: '<p slot="b">slot b</p>'
    })
    expect(child.$el.childNodes.length).to.equal(2)
    expect(firstChild(child.$el).attr.value).to.equal('fallback a')
    expect(lastChild(child.$el).attr.value).to.equal('slot b')
  })

  it('fallback content with mixed named/unnamed slots', () => {
    mount({
      childTemplate: `
        <div>
          <slot><p>fallback a</p></slot>
          <slot name="b">fallback b</slot>
        </div>
      `,
      parentContent: '<p slot="b">slot b</p>'
    })
    expect(child.$el.childNodes.length).to.equal(2)
    expect(firstChild(child.$el).attr.value).to.equal('fallback a')
    expect(lastChild(child.$el).attr.value).to.equal('slot b')
  })

  it('selector matching multiple elements', () => {
    mount({
      childTemplate: '<div><slot name="t"></slot></div>',
      parentContent: '<p slot="t">1</p><div></div><p slot="t">2</p>'
    })
    expect(toString(child.$el)).to.equal('<div><p value="1"></p><p value="2"></p></div>')
  })

  it('default content should only render parts not selected', () => {
    mount({
      childTemplate: `
        <div>
          <slot name="a"></slot>
          <slot></slot>
          <slot name="b"></slot>
        </div>
      `,
      parentContent: '<div>foo</div><p slot="a">1</p><p slot="b">2</p>'
    })
    expect(toString(child.$el)).to.equal(
      '<div value=" "><p value="1"></p><div value="foo"></div><p value="2"></p></div>'
    )
  })

  it('name should only match children', function() {
    mount({
      childTemplate: `
        <div>
          <slot name="a"><p>fallback a</p></slot>
          <slot name="b"><p>fallback b</p></slot>
          <slot name="c"><p>fallback c</p></slot>
        </div>
      `,
      parentContent: `
        '<p slot="b">select b</p>
        '<span><p slot="b">nested b</p></span>
        '<span><p slot="c">nested c</p></span>
      `
    })
    expect(child.$el.childNodes.length).to.equal(3)
    expect(firstChild(child.$el).attr.value).to.equal('fallback a')
    expect(secondChild(child.$el).attr.value).to.equal('select b')
    expect(lastChild(child.$el).attr.value).to.equal('fallback c')
  })

  it('should accept expressions in slot attribute and slot names', () => {
    mount({
      childTemplate: `<div><slot :name="'a'"></slot></div>`,
      parentContent: `<p>one</p><p :slot="'a'">two</p>`
    })
    expect(toString(child.$el)).to.equal('<div><p value="two"></p></div>')
  })

  it('slot inside v-if', done => {
    const vm = new Vue({
      data: {
        a: 1,
        b: 2,
        show: true
      },
      template: '<test :show="show"><p slot="b">{{b}}</p><p>{{a}}</p></test>',
      components: {
        test: {
          props: ['show'],
          template: '<div v-if="show"><slot></slot><slot name="b"></slot></div>'
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><p value="1"></p><p value="2"></p></div>')
    vm.a = 2
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal('<div><p value="2"></p><p value="2"></p></div>')
        vm.show = false
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal('<!--  -->')
        vm.show = true
        vm.a = 3
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal('<div><p value="3"></p><p value="2"></p></div>')
      })
      .then(done)
  })

  it('slot inside v-for', () => {
    mount({
      childTemplate: '<div><slot v-for="i in 3" :name="i"></slot></div>',
      parentContent: '<p v-for="i in 3" :slot="i">{{ i - 1 }}</p>'
    })
    expect(toString(child.$el)).to.equal(
      '<div><p value="0"></p><p value="1"></p><p value="2"></p></div>'
    )
  })

  it('nested slots', done => {
    const vm = new Vue({
      template: '<test><test2><p>{{ msg }}</p></test2></test>',
      data: {
        msg: 'foo'
      },
      components: {
        test: {
          template: '<div><slot></slot></div>'
        },
        test2: {
          template: '<div><slot></slot></div>'
        }
      }
    }).$mount()
    expect(toString(firstChild(vm.$el))).to.equal('<div><p value="foo"></p></div>')
    vm.msg = 'bar'
    global
      .waitForUpdate(() => {
        expect(toString(firstChild(vm.$el))).to.equal('<div><p value="bar"></p></div>')
      })
      .then(done)
  })

  it('v-if on inserted content', done => {
    const vm = new Vue({
      template: '<test><p v-if="ok">{{ msg }}</p></test>',
      data: {
        ok: true,
        msg: 'hi'
      },
      components: {
        test: {
          template: '<div><slot>fallback</slot></div>'
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><p value="hi"></p></div>')
    vm.ok = false
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('fallback')
        vm.ok = true
        vm.msg = 'bye'
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal('<div value="fallback"><p value="bye"></p></div>')
      })
      .then(done)
  })

  it('template slot', function() {
    const vm = new Vue({
      template: '<test><template slot="test">hello</template></test>',
      components: {
        test: {
          template: '<div><slot name="test"></slot> world</div>'
        }
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('hello world')
  })

  it('combined with v-for', () => {
    const vm = new Vue({
      template: '<div><test v-for="i in 3" :key="i">{{ i }}</test></div>',
      components: {
        test: {
          template: '<div><slot></slot></div>'
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div value="1"></div><div value="2"></div><div value="3"></div></div>'
    )
  })

  it('inside template v-if', () => {
    mount({
      childTemplate: `
        <div>
          <template v-if="true"><slot></slot></template>
        </div>
      `,
      parentContent: 'foo'
    })
    expect(child.$el.attr.value).to.equal('foo')
  })

  it('default slot should use fallback content if has only whitespace', () => {
    mount({
      childTemplate: `
        <div>
          <slot name="first"><p>first slot</p></slot>
          <slot><p>this is the default slot</p></slot>
          <slot name="second"><p>second named slot</p></slot>
        </div>
      `,
      parentContent: `<div slot="first">1</div> <div slot="second">2</div> <div slot="second">2+</div>`
    })
    expect(toString(child.$el)).to.equal(
      '<div value=" "><div value="1"></div><p value="this is the default slot"></p><div value="2"></div><div value="2+"></div></div>'
    )
  })

  it('programmatic access to $slots', () => {
    const vm = new Vue({
      template: '<test><p slot="a">A</p><div>C</div><p slot="b">B</p></test>',
      components: {
        test: {
          render() {
            expect(this.$slots.a.length).to.equal(1)
            expect(this.$slots.a[0].tag).to.equal('p')
            expect(this.$slots.a[0].children.length).to.equal(1)
            expect(this.$slots.a[0].children[0].text).to.equal('A')

            expect(this.$slots.b.length).to.equal(1)
            expect(this.$slots.b[0].tag).to.equal('p')
            expect(this.$slots.b[0].children.length).to.equal(1)
            expect(this.$slots.b[0].children[0].text).to.equal('B')

            expect(this.$slots.default.length).to.equal(1)
            expect(this.$slots.default[0].tag).to.equal('div')
            expect(this.$slots.default[0].children.length).to.equal(1)
            expect(this.$slots.default[0].children[0].text).to.equal('C')

            return this.$slots.default[0]
          }
        }
      }
    }).$mount()
    expect(vm.$el.tagName).to.equal('DIV')
    expect(vm.$el.attr.value).to.equal('C')
  })

  it('warn if user directly returns array', () => {
    new Vue({
      template: '<test><div slot="foo"></div><div slot="foo"></div></test>',
      components: {
        test: {
          render() {
            return this.$slots.foo
          }
        }
      }
    }).$mount()
    expect(countError).to.equal(1)
  })

  // #3254
  it('should not keep slot name when passed further down', () => {
    const vm = new Vue({
      template: '<test ref="xxx"><span slot="foo">foo</span></test>',
      components: {
        test: {
          template: '<child ref="yyy"><slot name="foo"></slot></child>',
          components: {
            child: {
              template: `
                <div>
                  <div ref="default"><slot></slot></div>
                  <div ref="named"><slot name="foo"></slot></div>
                </div>
              `
            }
          }
        }
      }
    }).$mount()
    expect(toString(vm.$refs.xxx.$refs.yyy.$refs.default)).to.equal(
      '<div><span value="foo"></span></div>'
    )
    expect(toString(vm.$refs.xxx.$refs.yyy.$refs.named)).to.equal('<div></div>')
  })

  it('should not keep slot name when passed further down (nested)', () => {
    const vm = new Vue({
      template: '<wrap><test ref="yyy"><span slot="foo">foo</span></test></wrap>',
      components: {
        wrap: {
          template: '<div><slot></slot></div>'
        },
        test: {
          template: '<child ref="zzz"><slot name="foo"></slot></child>',
          components: {
            child: {
              template: `
                <div>
                  <div ref="default"><slot></slot></div>
                  <div ref="named"><slot name="foo"></slot></div>
                </div>
              `
            }
          }
        }
      }
    }).$mount()
    expect(toString(vm.$refs.yyy.$refs.zzz.$refs.default)).to.equal(
      '<div><span value="foo"></span></div>'
    )
    expect(toString(vm.$refs.yyy.$refs.zzz.$refs.named)).to.equal('<div></div>')
  })

  it('should not keep slot name when passed further down (functional)', () => {
    const child = {
      template: `
        <div>
          <div ref="default"><slot></slot></div>
          <div ref="named"><slot name="foo"></slot></div>
        </div>
      `
    }

    const vm = new Vue({
      template: '<test ref="yyy"><span slot="foo">foo</span></test>',
      components: {
        test: {
          functional: true,
          render(h, ctx) {
            const slots = ctx.slots()
            // 加上ref ctx.data === { ref: 'yyy'}
            return h(child, ctx.data, slots.foo)
          }
        }
      }
    }).$mount()
    expect(toString(vm.$refs.yyy.$refs.default)).to.equal('<div><span value="foo"></span></div>')
    expect(toString(vm.$refs.yyy.$refs.named)).to.equal('<div></div>')
  })

  // #3400
  it('named slots should be consistent across re-renders', done => {
    const vm = new Vue({
      template: `
        <comp>
          <div slot="foo">foo</div>
        </comp>
      `,
      components: {
        comp: {
          data() {
            return { a: 1 }
          },
          template: `<div><slot name="foo"></slot>{{ a }}</div>`
        }
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('1')
    expect(firstChild(vm.$el).attr.value).to.equal('foo')
    vm.$children[0].a = 2
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('2')
        expect(firstChild(vm.$el).attr.value).to.equal('foo')
      })
      .then(done)
  })

  // #3437
  it('should correctly re-create components in slot', done => {
    const calls = []
    const vm = new Vue({
      template: `
        <comp ref="child">
          <div slot="foo">
            <child></child>
          </div>
        </comp>
      `,
      components: {
        comp: {
          data() {
            return { ok: true }
          },
          template: `<div><slot name="foo" v-if="ok"></slot></div>`
        },
        child: {
          template: '<div>child</div>',
          created() {
            calls.push(1)
          },
          destroyed() {
            calls.push(2)
          }
        }
      }
    }).$mount()

    expect(calls.toString()).to.equal([1].toString())
    vm.$refs.child.ok = false
    global
      .waitForUpdate(() => {
        expect(calls.toString()).to.equal([1, 2].toString())
        vm.$refs.child.ok = true
      })
      .then(() => {
        expect(calls.toString()).to.equal([1, 2, 1].toString())
        vm.$refs.child.ok = false
      })
      .then(() => {
        expect(calls.toString()).to.equal([1, 2, 1, 2].toString())
      })
      .then(done)
  })

  it('warn duplicate slots', () => {
    new Vue({
      template: `<div>
        <test>
          <div>foo</div>
          <div slot="a">bar</div>
        </test>
      </div>`,
      components: {
        test: {
          template: `<div>
            <slot></slot><slot></slot>
            <div v-for="i in 3"><slot name="a"></slot></div>
          </div>`
        }
      }
    }).$mount()
    expect(countError).to.equal(3)
  })

  it('should not warn valid conditional slots', () => {
    new Vue({
      template: `<div>
        <test>
          <div>foo</div>
        </test>
      </div>`,
      components: {
        test: {
          template: `<div>
            <slot v-if="true"></slot>
            <slot v-else></slot>
          </div>`
        }
      }
    }).$mount()
    expect(countWarn).to.equal(0)
    expect(countError).to.equal(0)
  })

  it('should support duplicate slots', done => {
    const vm = new Vue({
      template: `
        <foo ref="foo">
          <div slot="a">{{ n }}</div>
        </foo>
      `,
      data: {
        n: 1
      },
      components: {
        foo: {
          data() {
            return { ok: true }
          },
          template: `
            <div>
              <slot name="a" />
              <slot v-if="ok" name="a" />
              <pre><slot name="a" /></pre>
            </div>
          `
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div value=" "><div value="1"></div><div value="1"></div><pre><div value="1"></div></pre></div>'
    )
    vm.n++
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><div value="1"></div><div value="1"></div><pre><div value="2"></div></pre></div>'
        )
        vm.n++
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><div value="1"></div><div value="1"></div><pre><div value="3"></div></pre></div>'
        )
        vm.$refs.foo.ok = false
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><div value="1"></div><div value="1"></div><pre></pre></div>'
        )
        vm.n++
        vm.$refs.foo.ok = true
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><div value="1"></div><div value="1"></div><pre></pre></div>'
        )
      })
      .then(done)
  })

  it('renders static tree with text', () => {
    const vm = new Vue({
      template: `<div><test><template><div></div>Hello<div></div></template></test></div>`,
      components: {
        test: {
          template: '<div><slot></slot></div>'
        }
      }
    })
    vm.$mount()
    expect(countWarn).to.equal(0)
    expect(countError).to.equal(0)
  })

  // #3872
  it('functional component as slot', () => {
    const vm = new Vue({
      template: `
        <parent>
          <child>one</child>
          <child slot="a">two</child>
        </parent>
      `,
      components: {
        parent: {
          template: `<div><slot name="a"></slot><slot></slot></div>`
        },
        child: {
          functional: true,
          render(h, { slots }) {
            return h('div', slots().default)
          }
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div value=" "><div value="two"></div><div value="one"></div></div>'
    )
  })

  // #4209
  it('slot of multiple text nodes should not be infinitely merged', done => {
    const wrap = {
      template: `<inner ref="inner">foo<slot></slot></inner>`,
      components: {
        inner: {
          data: () => ({ a: 1 }),
          template: `<div>{{a}}<slot></slot></div>`
        }
      }
    }
    const vm = new Vue({
      template: `<wrap ref="wrap">bar</wrap>`,
      components: { wrap }
    }).$mount()

    expect(vm.$el.attr.value).to.equal('1foobar')
    vm.$refs.wrap.$refs.inner.a++
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('2foobar')
      })
      .then(done)
  })

  // #4315
  it('functional component passing slot content to stateful child component', done => {
    const ComponentWithSlots = {
      render(h) {
        return h('div', this.$slots.slot1)
      }
    }

    const FunctionalComp = {
      functional: true,
      render(h) {
        return h(ComponentWithSlots, [h('span', { slot: 'slot1' }, 'foo')])
      }
    }

    const vm = new Vue({
      data: { n: 1 },
      render(h) {
        return h('div', [this.n, h(FunctionalComp)])
      }
    }).$mount()

    expect(toString(vm.$el)).to.equal('<div value="1"><div><span value="foo"></span></div></div>')
    vm.n++
    global
      .waitForUpdate(() => {
        // should not lose named slot
        expect(toString(vm.$el)).to.equal(
          '<div value="2"><div><span value="foo"></span></div></div>'
        )
      })
      .then(done)
  })

  it('the elements of slot should be updated correctly', done => {
    const vm = new Vue({
      data: { n: 1 },
      template:
        '<div><test><span v-for="i in n" :key="i">{{ i }}</span><input value="a"/></test></div>',
      components: {
        test: {
          template: '<div><slot></slot></div>'
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div><span value="1"></span><input value="a"></input></div></div>'
    )
    vm.n++
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><div><span value="1"></span><span value="2"></span><input value="a"></input></div></div>'
        )
      })
      .then(done)
  })

  // GitHub issue #5888
  it('should resolve correctly slot with keep-alive', () => {
    const vm = new Vue({
      template: `
      <div>
        <container>
          <keep-alive slot="foo">
            <child></child>
          </keep-alive>
        </container>
      </div>
      `,
      components: {
        container: {
          template: '<div><slot>default</slot><slot name="foo">named</slot></div>'
        },
        child: {
          template: '<span>foo</span>'
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div value="default"><span value="foo"></span></div></div>'
    )
  })

  // #6372, #6915
  it('should handle nested components in slots properly', done => {
    const TestComponent = {
      template: `
        <component :is="toggleEl ? 'b' : 'i'">
          <slot />
        </component>
      `,
      data() {
        return {
          toggleEl: true
        }
      }
    }

    const vm = new Vue({
      template: `
        <div>
          <test-component ref="test">
            <div>
              <foo/>
            </div>
            <bar>
              <foo/>
            </bar>
          </test-component>
        </div>
      `,
      components: {
        TestComponent,
        foo: {
          template: `<div>foo</div>`
        },
        bar: {
          template: `<div>bar<slot/></div>`
        }
      }
    }).$mount()

    expect(toString(vm.$el)).to.equal(
      '<div><b value=" "><div><div value="foo"></div></div><div value="bar"><div value="foo"></div></div></b></div>'
    )
    vm.$refs.test.toggleEl = false
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><i value=" "><div><div value="foo"></div></div><div value="bar"><div value="foo"></div></div></i></div>'
        )
      })
      .then(done)
  })

  it('should preserve slot attribute if not absorbed by a Vue component', () => {
    const vm = new Vue({
      template: `
        <div>
          <div slot="foo"></div>
        </div>
      `
    }).$mount()

    expect(firstChild(vm.$el).attr.slot).to.equal('foo')
  })
})
