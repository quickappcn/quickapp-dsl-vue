import '../../utils/imports'
import Vue from '../../utils/vue'
import { fireEvent } from '../../utils/helper'

describe('Directive v-model text', () => {
  it('should update value both ways', done => {
    const vm = new Vue({
      data: {
        test: 'b'
      },
      template: '<input v-model="test">'
    }).$mount()
    expect(vm.$el.attr.value).to.equal('b')
    vm.test = 'a'
    global
      .waitForUpdate(() => {
        expect(vm.$el.attr.value).to.equal('a')
        vm.$el.attr.value = 'c'
        fireEvent(vm.$el, 'input')
        expect(vm.test).to.equal('c')
      })
      .then(done)
  })

  it('.lazy modifier', () => {
    const vm = new Vue({
      data: {
        test: 'b'
      },
      template: '<input v-model.lazy="test">'
    }).$mount()
    expect(vm.$el.attr.value).to.equal('b')
    expect(vm.test).to.equal('b')
    vm.$el.attr.value = 'c'
    fireEvent(vm.$el, 'input')
    expect(vm.test).to.equal('b')
    fireEvent(vm.$el, 'change')
    expect(vm.test).to.equal('c')
  })

  it('.number modifier', () => {
    const vm = new Vue({
      data: {
        test: 1
      },
      template: '<input v-model.number="test">'
    }).$mount()
    expect(vm.test).to.equal(1)
    vm.$el.attr.value = '2'
    fireEvent(vm.$el, 'input')
    expect(vm.test).to.equal(2)
    // should let strings pass through
    vm.$el.attr.value = 'f'
    fireEvent(vm.$el, 'input')
    expect(vm.test).to.equal('f')
  })

  it('.trim modifier', () => {
    const vm = new Vue({
      data: {
        test: 'hi'
      },
      template: '<input v-model.trim="test">'
    }).$mount()
    expect(vm.test).to.equal('hi')
    vm.$el.attr.value = ' what '
    fireEvent(vm.$el, 'input')
    expect(vm.test).to.equal('what')
  })

  it('.number focus and typing', done => {
    const vm = new Vue({
      data: {
        test: 0,
        update: 0
      },
      template:
        '<div>' +
        '<input ref="input" v-model.number="test">{{ update }}' +
        '<input ref="blur">' +
        '</div>'
    }).$mount()
    done()

    // todo 快应用暂时不支持直接DOM获取value
    document.body.appendChild(vm.$el)
    vm.$refs.input.focus()
    expect(vm.test).to.equal(0)
    vm.$refs.input.value = '1.0'
    fireEvent(vm.$refs.input, 'input')
    expect(vm.test).to.equal(1)
    vm.update++
    global
      .waitForUpdate(() => {
        expect(vm.$refs.input.value).to.equal('1.0')
        vm.$refs.blur.focus()
        vm.update++
      })
      .then(() => {
        expect(vm.$refs.input.value).to.equal('1')
      })
      .then(done)
  })

  it('.trim focus and typing', done => {
    const vm = new Vue({
      data: {
        test: 'abc',
        update: 0
      },
      template:
        '<div>' +
        '<input ref="input" v-model.trim="test" type="text">{{ update }}' +
        '<input ref="blur"/>' +
        '</div>'
    }).$mount()

    done()
    // todo 快应用暂时不支持DOM元素添加方法
    document.body.appendChild(vm.$el)
    vm.$refs.input.focus()
    vm.$refs.input.value = ' abc '
    fireEvent(vm.$refs.input, 'input')
    expect(vm.test).to.equal('abc')
    vm.update++
    global
      .waitForUpdate(() => {
        expect(vm.$refs.input.value).to.equal(' abc ')
        vm.$refs.blur.focus()
        vm.update++
      })
      .then(() => {
        expect(vm.$refs.input.value).to.equal('abc')
      })
      .then(done)
  })

  it('multiple inputs', done => {
    // TODO 快应用暂时不支持mutiple input
    done()
    const spy = function() {
      return true
    }
    const vm = new Vue({
      data: {
        selections: [[1, 2, 3], [4, 5]],
        inputList: [
          {
            name: 'questionA',
            data: ['a', 'b', 'c']
          },
          {
            name: 'questionB',
            data: ['1', '2']
          }
        ]
      },
      watch: {
        selections: spy
      },
      template:
        '<div>' +
        '<div v-for="(inputGroup, idx) in inputList">' +
        '<div>' +
        '<span v-for="(item, index) in inputGroup.data">' +
        '<input v-bind:name="item" type="text" v-model.number="selections[idx][index]" v-bind:id="idx+\'-\'+index"/>' +
        '<label>{{item}}</label>' +
        '</span>' +
        '</div>' +
        '</div>' +
        '<span ref="rs">{{selections}}</span>' +
        '</div>'
    }).$mount()
    const inputs = vm.$el.getElementsByTagName('input')
    inputs[1].value = 'test'
    fireEvent(inputs[1], 'input')
    global
      .waitForUpdate(() => {
        expect(vm.selections).toEqual([[1, 'test', 3], [4, 5]])
      })
      .then(done)
  })

  it('warn invalid tag', () => {
    new Vue({
      data: {
        test: 'foo'
      },
      template: '<div v-model="test"></div>'
    }).$mount()
  })

  // #3468
  it('should have higher priority than user v-on events', () => {
    const vm = new Vue({
      data: {
        a: 'a'
      },
      template: '<input v-model="a" @input="onInput">',
      methods: {
        onInput(e) {
          expect(this.a).to.equal('b')
        }
      }
    }).$mount()
    vm.$el.attr.value = 'b'
    fireEvent(vm.$el, 'input')
  })

  it('warn binding to v-for alias', () => {
    new Vue({
      data: {
        strings: ['hi']
      },
      template: `
        <div>
          <div v-for="str in strings">
            <input v-model="str">
          </div>
        </div>
      `
    }).$mount()
  })
})
