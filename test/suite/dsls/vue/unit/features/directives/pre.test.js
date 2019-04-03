import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild, secondChild } from '../../utils/helper'

describe('Directive v-pre', function() {
  it('should not compile inner content', function() {
    const vm = new Vue({
      template: `<div>
        <div v-pre>{{ a }}</div>
        <div>{{ a }}</div>
        <div v-pre>
          <component></component>
        </div>
      </div>`,
      data: {
        a: 123
      }
    })
    vm.$mount()
    expect(firstChild(vm.$el).attr.value).to.equal('{{ a }}')
    expect(secondChild(vm.$el).attr.value).to.equal('123')
  })

  it('should not compile on root node', function() {
    const vm = new Vue({
      template: '<div v-pre>{{ a }}</div>',
      replace: true,
      data: {
        a: 123
      }
    })
    vm.$mount()
    expect(vm.$el.attr.value).to.equal('{{ a }}')
  })
})
