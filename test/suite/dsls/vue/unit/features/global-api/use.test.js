import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Global API: use', () => {
  const def = {}
  const options = {}
  const pluginStub = {
    install: (Vue, opts) => {
      Vue.directive('plugin-test', def)
      expect(opts).to.equal(options)
    }
  }

  it('should apply Object plugin', () => {
    Vue.use(pluginStub, options)
    expect(Vue.options.directives['plugin-test']).to.equal(def)
    delete Vue.options.directives['plugin-test']
    expect(Vue.options.directives['plugin-test']).to.equal(undefined)

    // should not double apply
    Vue.use(pluginStub, options)
    expect(Vue.options.directives['plugin-test']).to.equal(undefined)
  })

  it('should apply Function plugin', () => {
    Vue.use(pluginStub.install, options)
    expect(Vue.options.directives['plugin-test']).to.equal(def)
    delete Vue.options.directives['plugin-test']
  })

  it('should work on extended constructors without polluting the base', () => {
    const Ctor = Vue.extend({})
    Ctor.use(pluginStub, options)
    expect(Vue.options.directives['plugin-test']).to.equal(undefined)
    expect(Ctor.options.directives['plugin-test']).to.equal(def)
  })

  // GitHub issue #5970
  it('should work on multi version', () => {
    const Ctor1 = Vue.extend({})
    const Ctor2 = Vue.extend({})

    Ctor1.use(pluginStub, options)
    expect(Vue.options.directives['plugin-test']).to.equal(undefined)
    expect(Ctor1.options.directives['plugin-test']).to.equal(def)

    // multi version Vue Ctor with the same cid
    Ctor2.cid = Ctor1.cid
    Ctor2.use(pluginStub, options)
    expect(Vue.options.directives['plugin-test']).to.equal(undefined)
    expect(Ctor2.options.directives['plugin-test']).to.equal(def)
  })
})
