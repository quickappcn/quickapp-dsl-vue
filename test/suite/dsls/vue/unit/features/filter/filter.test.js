import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Filters', () => {
  let oriConsole, countError

  beforeEach(() => {
    oriConsole = console
    console.error = function() {
      countError++
    }
  })

  afterEach(() => {
    countError = 0
    console.error = oriConsole.error
  })
  it('basic usage', () => {
    const vm = new Vue({
      template: '<div>{{ msg | upper }}</div>',
      data: {
        msg: 'hi'
      },
      filters: {
        upper: v => v.toUpperCase()
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('HI')
  })

  it('chained usage', () => {
    const vm = new Vue({
      template: '<div>{{ msg | upper | reverse }}</div>',
      data: {
        msg: 'hi'
      },
      filters: {
        upper: v => v.toUpperCase(),
        reverse: v =>
          v
            .split('')
            .reverse()
            .join('')
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('IH')
  })

  it('in v-bind', () => {
    const vm = new Vue({
      template: `
        <div
          v-bind:id="id | upper | reverse"
          :class="cls | reverse"
          :ref="ref | lower">
        </div>
      `,
      filters: {
        upper: v => v.toUpperCase(),
        reverse: v =>
          v
            .split('')
            .reverse()
            .join(''),
        lower: v => v.toLowerCase()
      },
      data: {
        id: 'abc',
        cls: 'foo',
        ref: 'BAR'
      }
    }).$mount()
    expect(vm.$el.id).to.equal('CBA')
    expect(vm.$el.attr.class).to.equal('oof')
    expect(vm.$refs.bar).to.equal(vm.$el)
  })

  it('handle regex with pipe', () => {
    const vm = new Vue({
      template: `<test ref="test" :pattern="/a|b\\// | identity"></test>`,
      filters: { identity: v => v },
      components: {
        test: {
          props: ['pattern'],
          template: '<div></div>'
        }
      }
    }).$mount()
    expect(vm.$refs.test.pattern instanceof RegExp).to.equal(true)
    expect(vm.$refs.test.pattern.toString()).to.equal('/a|b\\//')
  })

  it('handle division', () => {
    const vm = new Vue({
      data: { a: 2 },
      template: `<div>{{ 1/a / 4 | double }}</div>`,
      filters: { double: v => v * 2 }
    }).$mount()
    expect(vm.$el.attr.value).to.equal(String(1 / 4))
  })

  it('handle division with parenthesis', () => {
    const vm = new Vue({
      data: { a: 20 },
      template: `<div>{{ (a*2) / 5 | double }}</div>`,
      filters: { double: v => v * 2 }
    }).$mount()
    expect(vm.$el.attr.value).to.equal(String(16))
  })

  it('handle division with dot', () => {
    const vm = new Vue({
      template: `<div>{{ 20. / 5 | double }}</div>`,
      filters: { double: v => v * 2 }
    }).$mount()
    expect(vm.$el.attr.value).to.equal(String(8))
  })

  it('handle division with array values', () => {
    const vm = new Vue({
      data: { a: [20] },
      template: `<div>{{ a[0] / 5 | double }}</div>`,
      filters: { double: v => v * 2 }
    }).$mount()
    expect(vm.$el.attr.value).to.equal(String(8))
  })

  it('handle division with hash values', () => {
    const vm = new Vue({
      data: { a: { n: 20 }},
      template: `<div>{{ a['n'] / 5 | double }}</div>`,
      filters: { double: v => v * 2 }
    }).$mount()
    expect(vm.$el.attr.value).to.equal(String(8))
  })

  it('handle division with variable_', () => {
    const vm = new Vue({
      data: { a_: 8 },
      template: `<div>{{ a_ / 2 | double }}</div>`,
      filters: { double: v => v * 2 }
    }).$mount()
    expect(vm.$el.attr.value).to.equal(String(8))
  })

  it('arguments', () => {
    const vm = new Vue({
      template: `<div>{{ msg | add(a, 3) }}</div>`,
      data: {
        msg: 1,
        a: 2
      },
      filters: {
        add: (v, arg1, arg2) => v + arg1 + arg2
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('6')
  })

  it('quotes', () => {
    const vm = new Vue({
      template: `<div>{{ msg + "b | c" + 'd' | upper }}</div>`,
      data: {
        msg: 'a'
      },
      filters: {
        upper: v => v.toUpperCase()
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('AB | CD')
  })

  it('double pipe', () => {
    const vm = new Vue({
      template: `<div>{{ b || msg | upper }}</div>`,
      data: {
        b: false,
        msg: 'a'
      },
      filters: {
        upper: v => v.toUpperCase()
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('A')
  })

  it('object literal', () => {
    const vm = new Vue({
      template: `<div>{{ { a: 123 } | pick('a') }}</div>`,
      filters: {
        pick: (v, key) => v[key]
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('123')
  })

  it('array literal', () => {
    const vm = new Vue({
      template: `<div>{{ [1, 2, 3] | reverse }}</div>`,
      filters: {
        reverse: arr => arr.reverse().join(',')
      }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('3,2,1')
  })

  it('warn non-existent', () => {
    new Vue({
      template: '<div>{{ msg | upper }}</div>',
      data: { msg: 'foo' }
    }).$mount()
    expect(countError).to.equal(1)
  })
})
