import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options extends', () => {
  it('should work on objects', () => {
    const A = {
      data() {
        return { a: 1 }
      }
    }
    const B = {
      extends: A,
      data() {
        return { b: 2 }
      }
    }
    const vm = new Vue({
      extends: B,
      data: {
        c: 3
      }
    })
    expect(vm.a).to.equal(1)
    expect(vm.b).to.equal(2)
    expect(vm.c).to.equal(3)
  })

  it('should work on extended constructors', () => {
    const A = Vue.extend({
      data() {
        return { a: 1 }
      }
    })
    const B = Vue.extend({
      extends: A,
      data() {
        return { b: 2 }
      }
    })
    const vm = new Vue({
      extends: B,
      data: {
        c: 3
      }
    })
    expect(vm.a).to.equal(1)
    expect(vm.b).to.equal(2)
    expect(vm.c).to.equal(3)
  })
})
