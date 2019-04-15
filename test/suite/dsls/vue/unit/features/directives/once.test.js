import '../../utils/imports'
import Vue from '../../utils/vue'
import { toString, firstChild } from '../../utils/helper'

describe('Directive v-once', () => {
  let oriConsole, countWarn, countError // eslint-disable-line no-unused-vars

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

  it('should not rerender component', done => {
    const vm = new Vue({
      template: '<div v-once>{{ a }}</div>',
      data: { a: 'hello' }
    }).$mount()
    expect(vm.$el.attr.value).to.equal('hello')
    vm.a = 'world'
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('hello')
      })
      .then(done)
  })

  it('should not rerender self and child component', done => {
    const vm = new Vue({
      template: `
        <div v-once>
          <span>{{ a }}</span>
          <item :b="a"></item>
        </div>`,
      data: { a: 'hello' },
      components: {
        item: {
          template: '<div>{{ b }}</div>',
          props: ['b']
        }
      }
    }).$mount()
    expect(vm.$children.length).to.equal(1)
    expect(toString(vm.$el)).to.equal(
      '<div value=" "><span value="hello"></span><div value="hello"></div></div>'
    )
    vm.a = 'world'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><span value="hello"></span><div value="hello"></div></div>'
        )
      })
      .then(done)
  })

  it('should rerender parent but not self', done => {
    const vm = new Vue({
      template: `
        <div>
          <span>{{ a }}</span>
          <item v-once :b="a"></item>
        </div>`,
      data: { a: 'hello' },
      components: {
        item: {
          template: '<div>{{ b }}</div>',
          props: ['b']
        }
      }
    }).$mount()
    expect(vm.$children.length).to.equal(1)
    expect(toString(vm.$el)).to.equal(
      '<div value=" "><span value="hello"></span><div value="hello"></div></div>'
    )
    vm.a = 'world'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><span value="world"></span><div value="hello"></div></div>'
        )
      })
      .then(done)
  })

  it('should not rerender static sub nodes', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-once>{{ a }}</span>
          <item :b="a"></item>
          <span>{{ suffix }}</span>
        </div>`,
      data: {
        a: 'hello',
        suffix: '?'
      },
      components: {
        item: {
          template: '<div>{{ b }}</div>',
          props: ['b']
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div value=" "><span value="hello"></span><div value="hello"></div><span value="?"></span></div>'
    )
    vm.a = 'world'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><span value="hello"></span><div value="world"></div><span value="?"></span></div>'
        )
        vm.suffix = '!'
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div value=" "><span value="hello"></span><div value="world"></div><span value="!"></span></div>'
        )
      })
      .then(done)
  })

  it('should work with v-if', done => {
    const vm = new Vue({
      data: {
        tester: true,
        yes: 'y',
        no: 'n'
      },
      template: `
        <div>
          <div v-if="tester">{{ yes }}</div>
          <div v-else>{{ no }}</div>
          <div v-if="tester" v-once>{{ yes }}</div>
          <div v-else>{{ no }}</div>
          <div v-if="tester">{{ yes }}</div>
          <div v-else v-once>{{ no }}</div>
          <div v-if="tester" v-once>{{ yes }}</div>
          <div v-else v-once>{{ no }}</div>
        </div>
      `
    }).$mount()
    vm.yes = 'yes'
    global
      .waitForUpdate(() => {
        expectTextContent(
          vm,
          '<div value=" "><div value="yes"></div><div value="y"></div><div value="yes"></div><div value="y"></div></div>'
        )
        vm.tester = false
      })
      .then(() => {
        expectTextContent(
          vm,
          '<div value=" "><div value="n"></div><div value="n"></div><div value="n"></div><div value="n"></div></div>'
        )
        vm.no = 'no'
      })
      .then(() => {
        expectTextContent(
          vm,
          '<div value=" "><div value="no"></div><div value="no"></div><div value="n"></div><div value="n"></div></div>'
        )
      })
      .then(done)
  })

  it('should work with v-for', done => {
    const vm = new Vue({
      data: {
        list: [1, 2, 3]
      },
      template: `<div><div v-for="i in list" v-once>{{i}}</div></div>`
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div value="1"></div><div value="2"></div><div value="3"></div></div>'
    )
    vm.list.reverse()
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><div value="1"></div><div value="2"></div><div value="3"></div></div>'
        )
      })
      .then(done)
  })

  it('should work inside v-for', done => {
    const vm = new Vue({
      data: {
        list: [{ id: 0, text: 'a' }, { id: 1, text: 'b' }, { id: 2, text: 'c' }]
      },
      template: `
        <div>
          <div v-for="i in list" :key="i.id">
            <span v-once>{{ i.text }}</span><span>{{ i.text }}</span>
          </div>
        </div>
      `
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div><span value="a"></span><span value="a"></span></div><div><span value="b"></span><span value="b"></span></div><div><span value="c"></span><span value="c"></span></div></div>'
    )

    vm.list[0].text = 'd'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><div><span value="a"></span><span value="d"></span></div><div><span value="b"></span><span value="b"></span></div><div><span value="c"></span><span value="c"></span></div></div>'
        )
        vm.list[1].text = 'e'
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><div><span value="a"></span><span value="d"></span></div><div><span value="b"></span><span value="e"></span></div><div><span value="c"></span><span value="c"></span></div></div>'
        )
        vm.list.reverse()
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><div><span value="c"></span><span value="c"></span></div><div><span value="b"></span><span value="e"></span></div><div><span value="a"></span><span value="d"></span></div></div>'
        )
      })
      .then(done)
  })

  it('should work inside v-for with v-if', done => {
    const vm = new Vue({
      data: {
        list: [{ id: 0, text: 'a', tester: true, truthy: 'y' }]
      },
      template: `
        <div>
          <div v-for="i in list" :key="i.id">
              <span v-if="i.tester" v-once>{{ i.truthy }}</span>
              <span v-else v-once>{{ i.text }}</span>
              <span v-if="i.tester" v-once>{{ i.truthy }}</span>
              <span v-else>{{ i.text }}</span>
              <span v-if="i.tester">{{ i.truthy }}</span>
              <span v-else v-once>{{ i.text }}</span>
              <span v-if="i.tester">{{ i.truthy }}</span>
              <span v-else>{{ i.text }}</span>
          </div>
        </div>
      `
    }).$mount()

    expectTextContent(
      vm,
      '<div><div value=" "><span value="y"></span><span value="y"></span><span value="y"></span><span value="y"></span></div></div>'
    )

    vm.list[0].truthy = 'yy'
    global
      .waitForUpdate(() => {
        expectTextContent(
          vm,
          '<div><div value=" "><span value="y"></span><span value="y"></span><span value="yy"></span><span value="yy"></span></div></div>'
        )
        vm.list[0].tester = false
      })
      .then(() => {
        expectTextContent(
          vm,
          '<div><div value=" "><span value="a"></span><span value="a"></span><span value="a"></span><span value="a"></span></div></div>'
        )
        vm.list[0].text = 'nn'
      })
      .then(() => {
        expectTextContent(
          vm,
          '<div><div value=" "><span value="a"></span><span value="nn"></span><span value="a"></span><span value="nn"></span></div></div>'
        )
      })
      .then(done)
  })

  it('should work inside v-for with nested v-else', done => {
    const vm = new Vue({
      data: {
        list: [{ id: 0, text: 'a', tester: true, truthy: 'y' }]
      },
      template: `
        <div v-if="0"></div>
        <div v-else>
          <div v-for="i in list" :key="i.id">
            <span v-if="i.tester" v-once>{{ i.truthy }}</span>
            <span v-else v-once>{{ i.text }}</span>
          </div>
        </div>
      `
    }).$mount()
    expectTextContent(vm, '<div><div><span value="y"></span></div></div>')
    vm.list[0].truthy = 'yy'
    global
      .waitForUpdate(() => {
        expectTextContent(vm, '<div><div><span value="y"></span></div></div>')
        vm.list[0].tester = false
      })
      .then(() => {
        expectTextContent(vm, '<div><div><span value="a"></span></div></div>')
        vm.list[0].text = 'nn'
      })
      .then(() => {
        expectTextContent(vm, '<div><div><span value="a"></span></div></div>')
      })
      .then(done)
  })

  it('should work inside v-for with nested v-else-if and v-else', done => {
    const vm = new Vue({
      data: {
        tester: false,
        list: [{ id: 0, text: 'a', tester: true, truthy: 'y' }]
      },
      template: `
        <div v-if="0"></div>
        <div v-else-if="tester">
          <div v-for="i in list" :key="i.id">
            <span v-if="i.tester" v-once>{{ i.truthy }}</span>
            <span v-else-if="tester" v-once>{{ i.text }}elseif</span>
            <span v-else v-once>{{ i.text }}</span>
          </div>
        </div>
        <div v-else>
          <div v-for="i in list" :key="i.id">
            <span v-if="i.tester" v-once>{{ i.truthy }}</span>
            <span v-else-if="tester">{{ i.text }}elseif</span>
            <span v-else v-once>{{ i.text }}</span>
          </div>
        </div>
      `
    }).$mount()
    expectTextContent(vm, '<div><div><span value="y"></span></div></div>')
    vm.list[0].truthy = 'yy'
    global
      .waitForUpdate(() => {
        expectTextContent(vm, '<div><div><span value="y"></span></div></div>')
        vm.list[0].tester = false
      })
      .then(() => {
        expectTextContent(vm, '<div><div><span value="a"></span></div></div>')
        vm.list[0].text = 'nn'
      })
      .then(() => {
        expectTextContent(vm, '<div><div><span value="a"></span></div></div>')
        vm.tester = true
      })
      .then(() => {
        expectTextContent(vm, '<div><div><span value="nnelseif"></span></div></div>')
        vm.list[0].text = 'xx'
      })
      .then(() => {
        expectTextContent(vm, '<div><div><span value="nnelseif"></span></div></div>')
        vm.list[0].tester = true
      })
      .then(() => {
        expectTextContent(vm, '<div><div><span value="yy"></span></div></div>')
        vm.list[0].truthy = 'nn'
      })
      .then(() => {
        expectTextContent(vm, '<div><div><span value="yy"></span></div></div>')
      })
      .then(done)
  })

  it('should warn inside non-keyed v-for', () => {
    const vm = new Vue({
      data: {
        list: [{ id: 0, text: 'a' }, { id: 1, text: 'b' }, { id: 2, text: 'c' }]
      },
      template: `
        <div>
          <div v-for="i in list">
            <span v-once>{{ i.text }}</span><span>{{ i.text }}</span>
          </div>
        </div>
      `
    }).$mount()
    expect(countError).to.equal(1)
    expect(toString(vm.$el)).to.equal(
      '<div><div><span value="a"></span><span value="a"></span></div><div><span value="b"></span><span value="b"></span></div><div><span value="c"></span><span value="c"></span></div></div>'
    )
  })

  // #4288
  it('should inherit child reference for v-once', done => {
    const vm = new Vue({
      template: `<div>{{a}}<test v-if="ok" v-once></test></div>`,
      data: {
        a: 0,
        ok: true
      },
      components: {
        test: {
          template: '<div>foo</div>'
        }
      }
    }).$mount()
    vm.a++ // first update to force a patch
    global
      .waitForUpdate(() => {
        expect(toString(firstChild(vm.$el))).to.equal('<div value="foo"></div>')
      })
      .then(() => {
        // teardown component with v-once
        vm.ok = false
      })
      .then(done) // should not throw
  })
})

function expectTextContent(vm, text) {
  expect(toString(vm.$el)).to.equal(text)
}
