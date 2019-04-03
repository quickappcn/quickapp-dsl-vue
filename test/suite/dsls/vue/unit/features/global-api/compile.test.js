import '../../utils/imports'
import Vue from '../../utils/vue'
import { toString } from '../../utils/helper'

describe('Global API: compile', () => {
  it('should compile render functions', () => {
    const res = Vue.compile('<div><span>{{ msg }}</span></div>')
    const vm = new Vue({
      data: {
        msg: 'hello'
      },
      render: res.render,
      staticRenderFns: res.staticRenderFns
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><span value="hello"></span></div>')
  })
})
