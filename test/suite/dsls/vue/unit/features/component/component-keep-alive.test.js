import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild } from '../../utils/helper'

describe('Component keep-alive', () => {
  it('include (string)', () => {
    const one = {
      template: '<div>one</div>'
    }
    const two = {
      template: '<div>two</div>'
    }
    const components = {
      one,
      two
    }
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive>
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    expect(firstChild(vm.$el).attr.value).to.equal('one')
  })
})
