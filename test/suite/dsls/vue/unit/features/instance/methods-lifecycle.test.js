import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Instance methods lifecycle', () => {
  describe('$mount', () => {
    it('empty mount', () => {
      const vm = new Vue({
        data: { msg: 'hi' },
        template: '<div>{{ msg }}</div>'
      }).$mount()
      expect(vm.$el.tagName).to.equal('DIV')
      expect(vm.$el.attr.value).to.equal('hi')
    })

    it('mount to existing element', done => {
      done()
      const el = document.createElement('div')
      el.innerHTML = '{{ msg }}'
      const vm = new Vue({
        data: { msg: 'hi' }
      }).$mount(el)
      expect(vm.$el.tagName).to.equal('DIV')
      expect(vm.$el.attr.value).to.equal('hi')
    })

    it('mount to id', done => {
      // 快应用不支持，所以done掉
      done()
      const el = document.createElement('div')
      el.id = 'mount-test'
      el.innerHTML = '{{ msg }}'
      document.body.appendChild(el)
      const vm = new Vue({
        data: { msg: 'hi' }
      }).$mount('#mount-test')
      expect(vm.$el.tagName).to.equal('DIV')
      expect(vm.$el.textContent).to.equal('hi')
    })
  })

  describe('$destroy', () => {
    it('remove self from parent', () => {
      const vm = new Vue({
        template: '<test></test>',
        components: {
          test: { template: '<div></div>' }
        }
      }).$mount()
      vm.$children[0].$destroy()
      expect(vm.$children.length).to.equal(0)
    })

    it('teardown watchers', () => {
      const vm = new Vue({
        data: { a: 123 },
        template: '<div></div>'
      }).$mount()
      vm.$watch('a', () => {})
      vm.$destroy()
      expect(vm._watcher.active).to.equal(false)
      expect(vm._watchers.every(w => !w.active)).to.equal(true)
    })

    it('remove self from data observer', () => {
      const vm = new Vue({ data: { a: 1 } })
      vm.$destroy()
      expect(vm.$data.__ob__.vmCount).to.equal(0)
    })

    it('avoid duplicate calls', () => {
      let count = 0
      const spy = () => {
        count++
      }
      const vm = new Vue({
        beforeDestroy: spy
      })
      vm.$destroy()
      vm.$destroy()
      expect(count).to.equal(1)
    })
  })

  describe('$forceUpdate', () => {
    it('should force update', done => {
      const vm = new Vue({
        data: {
          a: {}
        },
        template: '<div>{{ a.b }}</div>'
      }).$mount()
      expect(vm.$el.attr.value).to.equal('')
      vm.a.b = 'foo'
      global
        .waitForUpdate(() => {
          // should not work because adding new property
          expect(vm.$el.attr.value).to.equal('')
          vm.$forceUpdate()
        })
        .then(() => {
          expect(vm.$el.attr.value).to.equal('foo')
        })
        .then(done)
    })
  })

  describe('$nextTick', () => {
    it('should be called after DOM update in correct context', done => {
      const vm = new Vue({
        template: '<div>{{ msg }}</div>',
        data: {
          msg: 'foo'
        }
      }).$mount()
      vm.msg = 'bar'
      vm.$nextTick(function() {
        expect(this).to.equal(vm)
        expect(vm.$el.attr.value).to.equal('bar')
        done()
      })
    })

    if (typeof Promise !== 'undefined') {
      it('should be called after DOM update in correct context, when using Promise syntax', done => {
        const vm = new Vue({
          template: '<div>{{ msg }}</div>',
          data: {
            msg: 'foo'
          }
        }).$mount()
        vm.msg = 'bar'
        vm.$nextTick().then(ctx => {
          expect(ctx).to.equal(vm)
          expect(vm.$el.attr.value).to.equal('bar')
          done()
        })
      })
    }
  })
})
