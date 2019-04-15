import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options render', () => {
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
      render(h) {
        const children = []
        for (let i = 0; i < this.items.length; i++) {
          children.push(h('li', { staticClass: 'task' }, [this.items[i].name]))
        }
        return h('ul', { staticClass: 'tasks' }, children)
      },
      data: {
        items: [{ id: 1, name: 'task1' }, { id: 2, name: 'task2' }]
      }
    }).$mount()
    expect(vm.$el.tagName).to.equal('UL')
    for (let i = 0; i < vm.$el.layoutChildren.length; i++) {
      const li = vm.$el.layoutChildren[i]
      expect(li.tagName).to.equal('LI')
      expect(li.attr.value).to.equal(vm.items[i].name)
    }
  })

  it('allow null data', () => {
    const vm = new Vue({
      render(h) {
        return h('div', null, 'hello' /* string as children*/)
      }
    }).$mount()
    expect(vm.$el.tagName).to.equal('DIV')
    expect(vm.$el.attr.value).to.equal('hello')
  })

  it('should warn non `render` option and non `template` option', () => {
    new Vue().$mount()
    expect(countError).to.equal(1)
  })
})
