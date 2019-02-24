import '../../utils/imports'
import Vue from '../../utils/vue'
import { firstChild, toString } from '../../utils/helper'

describe('Component async', () => {
  let oriConsole
  let countWarn = 0
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

  it('normal', done => {
    const vm = new Vue({
      template: '<div><test></test></div>',
      components: {
        test: resolve => {
          setTimeout(() => {
            resolve({
              template: '<div>hi</div>'
            })
            // wait for parent update
            Vue.nextTick(next)
          }, 0)
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><!--  --></div>')
    expect(vm.$children.length).to.equal(0)

    function next() {
      expect(toString(vm.$el)).to.equal('<div><div value="hi"></div></div>')
      expect(vm.$children.length).to.equal(1)
      done()
    }
  })

  it('resolve ES module default', done => {
    const vm = new Vue({
      template: '<div><test></test></div>',
      components: {
        test: resolve => {
          setTimeout(() => {
            resolve({
              __esModule: true,
              default: {
                template: '<div>hi</div>'
              }
            })
            // wait for parent update
            Vue.nextTick(next)
          }, 0)
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><!--  --></div>')
    expect(vm.$children.length).to.equal(0)

    function next() {
      expect(toString(vm.$el)).to.equal('<div><div value="hi"></div></div>')
      expect(vm.$children.length).to.equal(1)
      done()
    }
  })

  it('as root', done => {
    const vm = new Vue({
      template: '<test></test>',
      components: {
        test: resolve => {
          setTimeout(() => {
            resolve({
              template: '<div>hi</div>'
            })
            // wait for parent update
            Vue.nextTick(next)
          }, 0)
        }
      }
    }).$mount()
    expect(vm.$el.nodeType).to.equal(8)
    expect(vm.$children.length).to.equal(0)

    function next() {
      expect(vm.$el.nodeType).to.equal(1)
      expect(toString(vm.$el)).to.equal('<div value="hi"></div>')
      expect(vm.$children.length).to.equal(1)
      done()
    }
  })

  it('dynamic', done => {
    const vm = new Vue({
      template: '<component :is="view"></component>',
      data: {
        view: 'view-a'
      },
      components: {
        'view-a': resolve => {
          setTimeout(() => {
            resolve({
              template: '<div>A</div>'
            })
            Vue.nextTick(step1)
          }, 0)
        },
        'view-b': resolve => {
          setTimeout(() => {
            resolve({
              template: '<p>B</p>'
            })
            Vue.nextTick(step2)
          }, 0)
        }
      }
    }).$mount()
    let aCalled = false

    function step1() {
      // ensure A is resolved only once
      expect(aCalled).to.equal(false)
      aCalled = true
      expect(vm.$el.tagName).to.equal('DIV')
      expect(vm.$el.attr.value).to.equal('A')
      vm.view = 'view-b'
    }

    function step2() {
      expect(vm.$el.tagName).to.equal('P')
      expect(vm.$el.attr.value).to.equal('B')
      vm.view = 'view-a'
      global
        .waitForUpdate(function() {
          expect(vm.$el.tagName).to.equal('DIV')
          expect(vm.$el.attr.value).to.equal('A')
        })
        .then(done)
    }
  })

  it('warn reject', () => {
    new Vue({
      template: '<test></test>',
      components: {
        test: (resolve, reject) => {
          reject('nooooo')
        }
      }
    }).$mount()
    expect(countError).to.equal(1)
  })

  it('with v-for', done => {
    const vm = new Vue({
      template: '<div><test v-for="n in list" :key="n" :n="n"></test></div>',
      data: {
        list: [1, 2, 3]
      },
      components: {
        test: resolve => {
          setTimeout(() => {
            resolve({
              props: ['n'],
              template: '<div>{{n}}</div>'
            })
            Vue.nextTick(next)
          }, 0)
        }
      }
    }).$mount()

    function next() {
      expect(toString(vm.$el)).to.equal(
        '<div><div value="1"></div><div value="2"></div><div value="3"></div></div>'
      )
      done()
    }
  })

  it('returning Promise', done => {
    const vm = new Vue({
      template: '<div><test></test></div>',
      components: {
        test: () => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                template: '<div>hi</div>'
              })
              // wait for promise resolve and then parent update
              Promise.resolve().then(() => {
                Vue.nextTick(next)
              })
            }, 0)
          })
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal('<div><!--  --></div>')
    expect(vm.$children.length).to.equal(0)

    function next() {
      expect(toString(vm.$el)).to.equal('<div><div value="hi"></div></div>')
      expect(vm.$children.length).to.equal(1)
      done()
    }
  })

  it('with loading component', done => {
    const vm = new Vue({
      template: `<div><test/></div>`,
      components: {
        test: () => ({
          component: new Promise(resolve => {
            setTimeout(() => {
              resolve({
                template: '<div>hi</div>'
              })
              // wait for promise resolve and then parent update
              Promise.resolve().then(() => {
                Vue.nextTick(next)
              })
            }, 50)
          }),
          loading: {
            template: `<div>loading</div>`
          },
          delay: 1
        })
      }
    }).$mount()

    expect(toString(vm.$el)).to.equal('<div><!--  --></div>')

    let loadingAsserted = false
    setTimeout(() => {
      Vue.nextTick(() => {
        loadingAsserted = true
        expect(firstChild(vm.$el).attr.value).to.equal('loading')
      })
    }, 1)

    function next() {
      expect(loadingAsserted).to.equal(true)
      expect(firstChild(vm.$el).attr.value).to.equal('hi')
      done()
    }
  })

  it('with loading component (0 delay)', done => {
    const vm = new Vue({
      template: `<div><test/></div>`,
      components: {
        test: () => ({
          component: new Promise(resolve => {
            setTimeout(() => {
              resolve({
                template: '<div>hi</div>'
              })
              // wait for promise resolve and then parent update
              Promise.resolve().then(() => {
                Vue.nextTick(next)
              })
            }, 50)
          }),
          loading: {
            template: `<div>loading</div>`
          },
          delay: 0
        })
      }
    }).$mount()

    expect(firstChild(vm.$el).attr.value).to.equal('loading')

    function next() {
      expect(firstChild(vm.$el).attr.value).to.equal('hi')
      done()
    }
  })

  it('with error component', done => {
    const vm = new Vue({
      template: `<div><test/></div>`,
      components: {
        test: () => ({
          component: new Promise((resolve, reject) => {
            setTimeout(() => {
              reject()
              // wait for promise resolve and then parent update
              Promise.resolve().then(() => {
                Vue.nextTick(next)
              })
            }, 50)
          }),
          loading: {
            template: `<div>loading</div>`
          },
          error: {
            template: `<div>error</div>`
          },
          delay: 0
        })
      }
    }).$mount()

    expect(firstChild(vm.$el).attr.value).to.equal('loading')

    function next() {
      expect(countError).to.not.equal(0)
      // expect(vm.$el.attr.value).to.equal('error')
      done()
    }
  })

  it('with error component + timeout', done => {
    const vm = new Vue({
      template: `<div><test/></div>`,
      components: {
        test: () => ({
          component: new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({
                template: '<div>hi</div>'
              })
              // wait for promise resolve and then parent update
              Promise.resolve().then(() => {
                Vue.nextTick(next)
              })
            }, 50)
          }),
          loading: {
            template: `<div>loading</div>`
          },
          error: {
            template: `<div>error</div>`
          },
          delay: 0,
          timeout: 1
        })
      }
    }).$mount()

    expect(firstChild(vm.$el).attr.value).to.equal('loading')

    setTimeout(() => {
      Vue.nextTick(() => {
        // expect(`Failed to resolve async component`).toHaveBeenWarned()
        expect(firstChild(vm.$el).attr.value).to.equal('error')
      })
    }, 1)

    function next() {
      expect(firstChild(vm.$el).attr.value).to.equal('error') // late resolve ignored
      done()
    }
  })

  it('should not trigger timeout if resolved', done => {
    const vm = new Vue({
      template: `<div><test/></div>`,
      components: {
        test: () => ({
          component: new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({
                template: '<div>hi</div>'
              })
            }, 10)
          }),
          error: {
            template: `<div>error</div>`
          },
          timeout: 20
        })
      }
    }).$mount()

    setTimeout(() => {
      expect(firstChild(vm.$el).attr.value).to.equal('hi')
      expect(countWarn).not.to.equal(0)
      done()
    }, 50)
  })
})
