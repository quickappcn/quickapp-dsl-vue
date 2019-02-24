import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Options mixins', () => {
  it('vm should have options from mixin', () => {
    const mixin = {
      directives: {
        c: {}
      },
      methods: {
        a: function() {}
      }
    }

    const vm = new Vue({
      mixins: [mixin],
      methods: {
        b: function() {}
      }
    })

    expect(vm.a).to.exist
    expect(vm.b).to.exist
    expect(vm.$options.directives.c).to.exist
  })

  it('should call hooks from mixins first', () => {
    const a = {}
    const b = {}
    const c = {}
    const f1 = function() {}
    const f2 = function() {}
    const f3 = function() {}
    const mixinA = {
      a: 1,
      template: 'foo',
      directives: {
        a: a
      },
      created: f1
    }
    const mixinB = {
      b: 1,
      directives: {
        b: b
      },
      created: f2
    }
    const vm = new Vue({
      directives: {
        c: c
      },
      template: 'bar',
      mixins: [mixinA, mixinB],
      created: f3
    })

    const result = vm.$options
    expect(result.a).to.equal(1)
    expect(result.b).to.equal(1)
    expect(result.directives.a).to.equal(a)
    expect(result.directives.b).to.equal(b)
    expect(result.directives.c).to.equal(c)
    expect(result.created[0]).to.equal(f1)
    expect(result.created[1]).to.equal(f2)
    expect(result.created[2]).to.equal(f3)
    expect(result.template).to.equal('bar')
  })

  it('mixin methods should not override defined method', () => {
    const f1 = function() {}
    const f2 = function() {}
    const f3 = function() {}
    const mixinA = {
      methods: {
        xyz: f1
      }
    }
    const mixinB = {
      methods: {
        xyz: f2
      }
    }
    const vm = new Vue({
      mixins: [mixinA, mixinB],
      methods: {
        xyz: f3
      }
    })
    expect(vm.$options.methods.xyz).to.equal(f3)
  })

  it('should accept constructors as mixins', () => {
    const mixin = Vue.extend({
      directives: {
        c: {}
      },
      methods: {
        a: function() {}
      }
    })

    const vm = new Vue({
      mixins: [mixin],
      methods: {
        b: function() {}
      }
    })

    expect(vm.a).to.exist
    expect(vm.b).to.exist
    expect(vm.$options.directives.c).to.exist
  })
})
