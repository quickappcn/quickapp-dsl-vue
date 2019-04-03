import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild, toString } from '../../utils/helper'

describe('Directive v-if', () => {
  it('should check if value is truthy', () => {
    const vm = new Vue({
      template: '<div><span v-if="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(firstChild(vm.$el).attr.value).to.equal('hello')
  })

  it('should check if value is falsy', () => {
    const vm = new Vue({
      template: '<div><span v-if="foo">hello</span></div>',
      data: { foo: false }
    }).$mount()
    expect(firstChild(vm.$el).nodeName).to.equal('#comment')
  })

  it('should update if value changed', done => {
    const vm = new Vue({
      template: '<div><span v-if="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(firstChild(vm.$el).attr.value).to.equal('hello')
    vm.foo = false
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).nodeName).to.equal('#comment')
        vm.foo = {}
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('hello')
        vm.foo = 0
      })
      .then(() => {
        expect(firstChild(vm.$el).nodeName).to.equal('#comment')
        vm.foo = []
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('hello')
        vm.foo = null
      })
      .then(() => {
        expect(firstChild(vm.$el).nodeName).to.equal('#comment')
        vm.foo = '0'
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('hello')
        vm.foo = undefined
      })
      .then(() => {
        expect(firstChild(vm.$el).nodeName).to.equal('#comment')
        vm.foo = 1
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('hello')
      })
      .then(done)
  })

  it('should work well with v-else', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-if="foo">hello</span>
          <span v-else>bye</span>
        </div>
      `,
      data: { foo: true }
    }).$mount()
    expect(firstChild(vm.$el).attr.value).to.equal('hello')
    vm.foo = false
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('bye')
        vm.foo = {}
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('hello')
        vm.foo = 0
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('bye')
        vm.foo = []
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('hello')
        vm.foo = null
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('bye')
        vm.foo = '0'
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('hello')
        vm.foo = undefined
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('bye')
        vm.foo = 1
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('hello')
      })
      .then(done)
  })

  it('should work well with v-else-if', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-if="foo">hello</span>
          <span v-else-if="bar">elseif</span>
          <span v-else>bye</span>
        </div>
      `,
      data: { foo: true, bar: false }
    }).$mount()
    expect(firstChild(vm.$el).attr.value).to.equal('hello')
    vm.foo = false
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('bye')
        vm.bar = true
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('elseif')
        vm.bar = false
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('bye')
        vm.foo = true
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('hello')
        vm.foo = false
        vm.bar = {}
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('elseif')
        vm.bar = 0
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('bye')
        vm.bar = []
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('elseif')
        vm.bar = null
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('bye')
        vm.bar = '0'
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('elseif')
        vm.bar = undefined
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('bye')
        vm.bar = 1
      })
      .then(() => {
        expect(firstChild(vm.$el).attr.value).to.equal('elseif')
      })
      .then(done)
  })

  it('should work well with v-for', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="(item, i) in list" v-if="item.value">{{i}}</span>
        </div>
      `,
      data: {
        list: [{ value: true }, { value: false }, { value: true }]
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="0"></span><!--  --><span value="2"></span></div>'
    )
    vm.list[0].value = false
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal('<div><!--  --><!--  --><span value="2"></span></div>')
        vm.list.push({ value: true })
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><!--  --><!--  --><span value="2"></span><span value="3"></span></div>'
        )
        vm.list.splice(1, 2)
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal('<div><!--  --><span value="1"></span></div>')
      })
      .then(done)
  })

  it('should work well with v-for and v-else', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="(item, i) in list" v-if="item.value">hello</span>
          <span v-else>bye</span>
        </div>
      `,
      data: {
        list: [{ value: true }, { value: false }, { value: true }]
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="hello"></span><span value="bye"></span><span value="hello"></span></div>'
    )
    vm.list[0].value = false
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="bye"></span><span value="bye"></span><span value="hello"></span></div>'
        )
        vm.list.push({ value: true })
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="bye"></span><span value="bye"></span><span value="hello"></span><span value="hello"></span></div>'
        )
        vm.list.splice(1, 2)
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="bye"></span><span value="hello"></span></div>'
        )
      })
      .then(done)
  })

  it('should work with v-for on v-else branch', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-if="false">hello</span>
          <span v-else v-for="item in list">{{ item }}</span>
        </div>
      `,
      data: {
        list: [1, 2, 3]
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="1"></span><span value="2"></span><span value="3"></span></div>'
    )
    vm.list.reverse()
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="3"></span><span value="2"></span><span value="1"></span></div>'
        )
      })
      .then(done)
  })

  it('should work properly on component root', done => {
    const vm = new Vue({
      template: `
        <div>
          <test class="test"></test>
        </div>
      `,
      components: {
        test: {
          data() {
            return { ok: true }
          },
          template: '<div v-if="ok" id="ok" class="inner">test</div>'
        }
      }
    }).$mount()
    expect(firstChild(vm.$el).id).to.equal('ok')
    expect(firstChild(vm.$el).attr.class).to.equal('inner test')
    vm.$children[0].ok = false
    global
      .waitForUpdate(() => {
        expect(firstChild(vm.$el).nodeName).to.equal('#comment')
        vm.$children[0].ok = true
      })
      .then(() => {
        expect(firstChild(vm.$el).id).to.equal('ok')
        expect(firstChild(vm.$el).attr.class).to.equal('inner test')
      })
      .then(done)
  })

  it('should maintain stable list to avoid unnecessary patches', done => {
    let cn = 0
    let dn = 0
    const vm = new Vue({
      data: {
        ok: true
      },
      template: `
        <div>
          <div v-if="ok"></div>
          <div><test></test></div>
        </div>
      `,
      components: {
        test: {
          template: '<div></div>',
          created() {
            cn++
          },
          destroyed() {
            dn++
          }
        }
      }
    }).$mount()

    expect(cn).to.equal(1)
    vm.ok = false
    global
      .waitForUpdate(() => {
        expect(cn).to.equal(1)
        expect(dn).to.equal(0)
      })
      .then(done)
  })
})
