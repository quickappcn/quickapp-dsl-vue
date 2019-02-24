import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options parent', () => {
  it('should work', () => {
    const parent = new Vue({
      render() {}
    }).$mount()

    const child = new Vue({
      parent: parent,
      render() {}
    }).$mount()

    // this option is straight-forward
    // it should register 'parent' as a $parent for 'child'
    // and push 'child' to $children array on 'parent'
    expect(child.$options.parent).to.exist
    expect(child.$options.parent).to.equal(parent)
    expect(child.$parent).to.exist
    expect(child.$parent).to.equal(parent)
    expect(parent.$children).to.contain(child)

    // destroy 'child' and check if it was removed from 'parent' $children
    child.$destroy()
    expect(parent.$children.length).to.equal(0)
    parent.$destroy()
  })
})
