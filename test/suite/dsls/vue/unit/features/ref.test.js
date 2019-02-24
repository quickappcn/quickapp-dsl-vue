import '../../utils/imports'
import Vue from '../../utils/vue'

describe('ref', () => {
  const components = {
    test: {
      id: 'test',
      template: '<div>test</div>'
    },
    test2: {
      id: 'test2',
      template: '<div>test2</div>'
    }
  }

  it('should work', () => {
    const vm = new Vue({
      data: {
        value: 'bar'
      },
      template: `<div>
        <test ref="foo"></test>
        <test2 :ref="value"></test2>
      </div>`,
      components
    })
    vm.$mount()
    expect(vm.$refs.foo).to.exist
    expect(vm.$refs.foo.$options.id).to.equal('test')
    expect(vm.$refs.bar).to.exist
    expect(vm.$refs.bar.$options.id).to.equal('test2')
  })

  it('should dynamically update refs', done => {
    const vm = new Vue({
      data: {
        value: 'foo'
      },
      template: '<div :ref="value"></div>'
    }).$mount()
    expect(vm.$refs.foo).to.equal(vm.$el)
    vm.value = 'bar'
    global
      .waitForUpdate(() => {
        expect(vm.$refs.foo).to.equal(undefined)
        expect(vm.$refs.bar).to.equal(vm.$el)
      })
      .then(done)
  })

  it('should work as a hyperscript prop', () => {
    const vm = new Vue({
      components,
      render(h) {
        return h('div', null, [h('test', { ref: 'test' })])
      }
    })
    vm.$mount()
    expect(vm.$refs.test).to.exist
    expect(vm.$refs.test.$options.id).to.equal('test')
  })

  it('should accept HOC component', () => {
    const vm = new Vue({
      template: '<test ref="test"></test>',
      components
    })
    vm.$mount()
    expect(vm.$refs.test).to.exist
    expect(vm.$refs.test.$options.id).to.equal('test')
  })

  it('should accept dynamic component', done => {
    const vm = new Vue({
      template: `<div>
        <component :is="test" ref="test"></component>
      </div>`,
      components,
      data: { test: 'test' }
    })
    vm.$mount()
    expect(vm.$refs.test.$options.id).to.equal('test')
    vm.test = 'test2'
    global
      .waitForUpdate(() => {
        expect(vm.$refs.test.$options.id).to.equal('test2')
        vm.test = ''
      })
      .then(() => {
        expect(vm.$refs.test).to.equal(undefined)
      })
      .then(done)
  })

  it('should register as Array when used with v-for', done => {
    const vm = new Vue({
      data: {
        items: [1, 2, 3]
      },
      template: `
        <div>
          <div v-for="n in items" ref="list">{{n}}</div>
        </div>
      `
    }).$mount()
    assertRefs()
    // updating
    vm.items.push(4)
    global
      .waitForUpdate(assertRefs)
      .then(() => {
        vm.items = []
      })
      .then(assertRefs)
      .then(done)

    function assertRefs() {
      expect(Array.isArray(vm.$refs.list)).to.equal(true)
      expect(vm.$refs.list.length).to.equal(vm.items.length)
      expect(vm.$refs.list.every((item, i) => item.attr.value === String(i + 1))).to.equal(true)
    }
  })

  it('should register as Array when used with v-for (components)', done => {
    const vm = new Vue({
      data: {
        items: [1, 2, 3]
      },
      template: `
        <div>
          <test v-for="n in items" ref="list" :key="n" :n="n"></test>
        </div>
      `,
      components: {
        test: {
          props: ['n'],
          template: '<div>{{ n }}</div>'
        }
      }
    }).$mount()
    assertRefs()
    // updating
    vm.items.push(4)
    global
      .waitForUpdate(assertRefs)
      .then(() => {
        vm.items = []
      })
      .then(assertRefs)
      .then(done)

    function assertRefs() {
      expect(Array.isArray(vm.$refs.list)).to.equal(true)
      expect(vm.$refs.list.length).to.equal(vm.items.length)
      expect(vm.$refs.list.every((comp, i) => comp.$el.attr.value === String(i + 1))).to.equal(true)
    }
  })

  it('should work with v-for on dynamic component', done => {
    components.test3 = {
      id: 'test3',
      template: `<test1 v-if="!normal"></test1><div v-else>test3</div>`,
      data() {
        return { normal: false }
      },
      components: { test1: components.test }
    }
    // a flag that representing whether to test component content or not
    let testContent = false

    const vm = new Vue({
      template: `
        <div>
          <component
            v-for="(item, index) in items"
            :key="index"
            :is="item"
            ref="children">
          </component>
        </div>
      `,
      data: {
        items: ['test2', 'test3']
      },
      components
    }).$mount()
    assertRefs()
    expect(vm.$refs.children[0].$el.attr.value).to.equal('test2')
    expect(vm.$refs.children[1].$el.attr.value).to.equal('test')
    // updating
    vm.$refs.children[1].normal = true
    testContent = true
    global
      .waitForUpdate(assertRefs)
      .then(() => {
        vm.items.push('test')
      })
      .then(assertRefs)
      .then(done)

    function assertRefs() {
      expect(Array.isArray(vm.$refs.children)).to.equal(true)
      expect(vm.$refs.children.length).to.equal(vm.items.length)
      if (testContent) {
        expect(vm.$refs.children.every((comp, i) => comp.$el.attr.value === vm.items[i])).to.equal(
          true
        )
      }
    }
  })

  it('should register on component with empty roots', done => {
    const vm = new Vue({
      template: '<child ref="test"></child>',
      components: {
        child: {
          template: '<div v-if="show"></div>',
          data() {
            return { show: false }
          }
        }
      }
    }).$mount()
    expect(vm.$refs.test).to.equal(vm.$children[0])
    vm.$refs.test.show = true
    global
      .waitForUpdate(() => {
        expect(vm.$refs.test).to.equal(vm.$children[0])
        vm.$refs.test.show = false
      })
      .then(() => {
        expect(vm.$refs.test).to.equal(vm.$children[0])
      })
      .then(done)
  })
})
