import '../../utils/imports'
import Vue from '../../utils/vue'
import { toString } from '../../utils/helper'

describe('Comments', () => {
  it('comments should be kept', () => {
    const vm = new Vue({
      comments: true,
      data() {
        return {
          foo: 1
        }
      },
      template: '<div><span>node1</span><!--comment1-->{{foo}}<!--comment2--></div>'
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div value="1"><span value="node1"></span><!-- comment1 --><!-- comment2 --></div>'
    )
  })
})
