import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options template', () => {
  let oriConsole
  let countWarn = 0 // eslint-disable-line no-unused-vars
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

  it('basic usage', () => {
    const vm = new Vue({
      template: '<div>{{message}}</div>',
      data: { message: 'hello world' }
    }).$mount()
    expect(vm.$el.tagName).to.equal('DIV')
    expect(vm.$el.attr.value).to.equal(vm.message)
  })

  it('id reference', () => {
    // TODO 快应用暂时不支持html的模板
  })

  it('DOM element', () => {
    // TODO 快应用暂时不支持html的模板
  })

  it('invalid template', done => {
    try {
      new Vue({
        template: Vue,
        data: { message: 'hello world' }
      }).$mount()
    } catch (e) {
      done()
    }
  })

  it('warn error in generated function', () => {
    new Vue({
      template: '<div v-if="!@"><span>{{ a"" }}</span><span>{{ do + 1 }}</span></div>'
    }).$mount()
    expect(countError).to.equal(1)
  })

  it('should not warn $ prefixed keywords', () => {
    new Vue({
      template: `<div @click="$delete(foo, 'bar')"></div>`
    }).$mount()
    expect(countError).to.equal(0)
  })

  it('warn error in generated function (v-for)', () => {
    new Vue({
      template: '<div><div v-for="(1, 2) in a----"></div></div>'
    }).$mount()
    expect(countError).to.equal(1)
  })

  it('warn error in generated function (v-on)', () => {
    new Vue({
      template: `<div @click="delete('Delete')"></div>`,
      methods: { delete: function() {} }
    }).$mount()
    expect(countError).to.equal(1)
  })
})
