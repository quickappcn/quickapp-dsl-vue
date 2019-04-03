import '../../utils/imports'
import Vue from '../../utils/vue'
import { toString } from '../../utils/helper'

describe('Directive v-for', () => {
  it('should render array of primitive values', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="item in list">{{item}}</span>
        </div>
      `,
      data: {
        list: ['a', 'b', 'c']
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="a"></span><span value="b"></span><span value="c"></span></div>'
    )
    Vue.set(vm.list, 0, 'd')
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="d"></span><span value="b"></span><span value="c"></span></div>'
        )
        vm.list.push('d')
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="d"></span><span value="b"></span><span value="c"></span><span value="d"></span></div>'
        )
        vm.list.splice(1, 2)
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="d"></span><span value="d"></span></div>'
        )
        vm.list = ['x', 'y']
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="x"></span><span value="y"></span></div>'
        )
      })
      .then(done)
  })

  it('should render array of primitive values with index', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="(item, i) in list">{{i}}-{{item}}</span>
        </div>
      `,
      data: {
        list: ['a', 'b', 'c']
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="0-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    Vue.set(vm.list, 0, 'd')
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="0-d"></span><span value="1-b"></span><span value="2-c"></span></div>'
        )
        vm.list.push('d')
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="0-d"></span><span value="1-b"></span><span value="2-c"></span><span value="3-d"></span></div>'
        )
        vm.list.splice(1, 2)
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="0-d"></span><span value="1-d"></span></div>'
        )
        vm.list = ['x', 'y']
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="0-x"></span><span value="1-y"></span></div>'
        )
      })
      .then(done)
  })

  it('should render array of object values', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="item in list">{{item.value}}</span>
        </div>
      `,
      data: {
        list: [{ value: 'a' }, { value: 'b' }, { value: 'c' }]
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="a"></span><span value="b"></span><span value="c"></span></div>'
    )
    Vue.set(vm.list, 0, { value: 'd' })
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="d"></span><span value="b"></span><span value="c"></span></div>'
        )
        vm.list[0].value = 'e'
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="e"></span><span value="b"></span><span value="c"></span></div>'
        )
        vm.list.push({})
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="e"></span><span value="b"></span><span value="c"></span><span value=""></span></div>'
        )
        vm.list.splice(1, 2)
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="e"></span><span value=""></span></div>'
        )
        vm.list = [{ value: 'x' }, { value: 'y' }]
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="x"></span><span value="y"></span></div>'
        )
      })
      .then(done)
  })

  it('should render array of object values with index', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="(item, i) in list">{{i}}-{{item.value}}</span>
        </div>
      `,
      data: {
        list: [{ value: 'a' }, { value: 'b' }, { value: 'c' }]
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="0-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    Vue.set(vm.list, 0, { value: 'd' })
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="0-d"></span><span value="1-b"></span><span value="2-c"></span></div>'
        )
        vm.list[0].value = 'e'
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="0-e"></span><span value="1-b"></span><span value="2-c"></span></div>'
        )
        vm.list.push({})
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="0-e"></span><span value="1-b"></span><span value="2-c"></span><span value="3-"></span></div>'
        )
        vm.list.splice(1, 2)
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="0-e"></span><span value="1-"></span></div>'
        )
        vm.list = [{ value: 'x' }, { value: 'y' }]
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="0-x"></span><span value="1-y"></span></div>'
        )
      })
      .then(done)
  })

  it('should render an Object', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="val in obj">{{val}}</span>
        </div>
      `,
      data: {
        obj: { a: 0, b: 1, c: 2 }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="0"></span><span value="1"></span><span value="2"></span></div>'
    )
    vm.obj.a = 3
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="3"></span><span value="1"></span><span value="2"></span></div>'
        )
        Vue.set(vm.obj, 'd', 4)
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="3"></span><span value="1"></span><span value="2"></span><span value="4"></span></div>'
        )
        Vue.delete(vm.obj, 'a')
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="1"></span><span value="2"></span><span value="4"></span></div>'
        )
      })
      .then(done)
  })

  it('should render an Object with key', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="(val, key) in obj">{{val}}-{{key}}</span>
        </div>
      `,
      data: {
        obj: { a: 0, b: 1, c: 2 }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="0-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    vm.obj.a = 3
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="3-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
        )
        Vue.set(vm.obj, 'd', 4)
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="3-a"></span><span value="1-b"></span><span value="2-c"></span><span value="4-d"></span></div>'
        )
        Vue.delete(vm.obj, 'a')
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="1-b"></span><span value="2-c"></span><span value="4-d"></span></div>'
        )
      })
      .then(done)
  })

  it('should render an Object with key and index', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="(val, key, i) in obj">{{val}}-{{key}}-{{i}}</span>
        </div>
      `,
      data: {
        obj: { a: 0, b: 1, c: 2 }
      }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="0-a-0"></span><span value="1-b-1"></span><span value="2-c-2"></span></div>'
    )
    vm.obj.a = 3
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="3-a-0"></span><span value="1-b-1"></span><span value="2-c-2"></span></div>'
        )
        Vue.set(vm.obj, 'd', 4)
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="3-a-0"></span><span value="1-b-1"></span><span value="2-c-2"></span><span value="4-d-3"></span></div>'
        )
        Vue.delete(vm.obj, 'a')
      })
      .then(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="1-b-0"></span><span value="2-c-1"></span><span value="4-d-2"></span></div>'
        )
      })
      .then(done)
  })

  it('should render each key of data', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="(val, key) in $data">{{val}}-{{key}}</span>
        </div>
      `,
      data: { a: 0, b: 1, c: 2 }
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="0-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
    )
    vm.a = 3
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="3-a"></span><span value="1-b"></span><span value="2-c"></span></div>'
        )
      })
      .then(done)
  })

  it('check priorities: v-if before v-for', function() {
    const vm = new Vue({
      data: {
        items: [1, 2, 3]
      },
      template: '<div><div v-if="item < 3" v-for="item in items">{{item}}</div></div>'
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div value="1"></div><div value="2"></div><!--  --></div>'
    )
  })

  it('check priorities: v-if after v-for', function() {
    const vm = new Vue({
      data: {
        items: [1, 2, 3]
      },
      template: '<div><div v-for="item in items" v-if="item < 3">{{item}}</div></div>'
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div value="1"></div><div value="2"></div><!--  --></div>'
    )
  })

  it('range v-for', () => {
    const vm = new Vue({
      template: '<div><div v-for="n in 3">{{n}}</div></div>'
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div value="1"></div><div value="2"></div><div value="3"></div></div>'
    )
  })

  it('without key', done => {
    const vm = new Vue({
      data: {
        items: [{ id: 1, msg: 'a' }, { id: 2, msg: 'b' }, { id: 3, msg: 'c' }]
      },
      template: '<div><div v-for="item in items">{{ item.msg }}</div></div>'
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div value="a"></div><div value="b"></div><div value="c"></div></div>'
    )
    const first = vm.$el.layoutChildren[0]
    vm.items.reverse()
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><div value="c"></div><div value="b"></div><div value="a"></div></div>'
        )
        // assert reusing DOM element in place
        expect(vm.$el.layoutChildren[0]).to.equal(first)
      })
      .then(done)
  })

  it('with key', done => {
    const vm = new Vue({
      data: {
        items: [{ id: 1, msg: 'a' }, { id: 2, msg: 'b' }, { id: 3, msg: 'c' }]
      },
      template: '<div><div v-for="item in items" :key="item.id">{{ item.msg }}</div></div>'
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div value="a"></div><div value="b"></div><div value="c"></div></div>'
    )
    const first = vm.$el.layoutChildren[0]
    vm.items.reverse()
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><div value="c"></div><div value="b"></div><div value="a"></div></div>'
        )
        // assert moving DOM element
        expect(vm.$el.layoutChildren[0]).not.to.equal(first)
        expect(vm.$el.layoutChildren[2]).to.equal(first)
      })
      .then(done)
  })

  it('nested loops', () => {
    const vm = new Vue({
      data: {
        items: [{ items: [{ a: 1 }, { a: 2 }], a: 1 }, { items: [{ a: 3 }, { a: 4 }], a: 2 }]
      },
      template:
        '<div>' +
        '<div v-for="(item, i) in items">' +
        '<p v-for="(subItem, j) in item.items">{{j}} {{subItem.a}} {{i}} {{item.a}}</p>' +
        '</div>' +
        '</div>'
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><div><p value="0 1 0 1"></p><p value="1 2 0 1"></p></div><div><p value="0 3 1 2"></p><p value="1 4 1 2"></p></div></div>'
    )
  })

  it('template v-for', done => {
    const vm = new Vue({
      data: {
        list: [{ a: 1 }, { a: 2 }, { a: 3 }]
      },
      template:
        '<div>' +
        '<template v-for="item in list">' +
        '<p>{{item.a}}</p>' +
        '<p>{{item.a + 1}}</p>' +
        '</template>' +
        '</div>'
    }).$mount()
    assertMarkup(
      '<div><p value="1"></p><p value="2"></p><p value="2"></p><p value="3"></p><p value="3"></p><p value="4"></p></div>'
    )
    vm.list.reverse()
    global
      .waitForUpdate(() => {
        assertMarkup(
          '<div><p value="3"></p><p value="4"></p><p value="2"></p><p value="3"></p><p value="1"></p><p value="2"></p></div>'
        )
        vm.list.splice(1, 1)
      })
      .then(() => {
        assertMarkup(
          '<div><p value="3"></p><p value="4"></p><p value="1"></p><p value="2"></p></div>'
        )
        vm.list.splice(1, 0, { a: 2 })
      })
      .then(done)

    function assertMarkup(markup) {
      expect(toString(vm.$el)).to.equal(markup)
    }
  })

  it('component v-for', done => {
    const vm = new Vue({
      data: {
        list: [{ a: 1 }, { a: 2 }, { a: 3 }]
      },
      template:
        '<div>' +
        '<test v-for="item in list" :msg="item.a" :key="item.a">' +
        '<span>{{item.a}}</span>' +
        '</test>' +
        '</div>',
      components: {
        test: {
          props: ['msg'],
          template: '<p>{{msg}}<slot></slot></p>'
        }
      }
    }).$mount()
    assertMarkup(
      '<div><p value="1"><span value="1"></span></p><p value="2"><span value="2"></span></p><p value="3"><span value="3"></span></p></div>'
    )
    vm.list.reverse()
    global
      .waitForUpdate(() => {
        assertMarkup(
          '<div><p value="3"><span value="3"></span></p><p value="2"><span value="2"></span></p><p value="1"><span value="1"></span></p></div>'
        )
        vm.list.splice(1, 1)
      })
      .then(() => {
        assertMarkup(
          '<div><p value="3"><span value="3"></span></p><p value="1"><span value="1"></span></p></div>'
        )
        vm.list.splice(1, 0, { a: 2 })
      })
      .then(done)

    function assertMarkup(markup) {
      expect(toString(vm.$el)).to.equal(markup)
    }
  })

  it('dynamic component v-for', done => {
    const vm = new Vue({
      data: {
        list: [{ type: 'one' }, { type: 'two' }]
      },
      template:
        '<div>' +
        '<component v-for="item in list" :key="item.type" :is="item.type"></component>' +
        '</div>',
      components: {
        one: {
          template: '<p>One!</p>'
        },
        two: {
          template: '<div>Two!</div>'
        }
      }
    }).$mount()
    expect(toString(vm.$el)).to.include('<div><p value="One!"></p><div value="Two!"></div></div>')
    vm.list.reverse()
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.include(
          '<div><div value="Two!"></div><p value="One!"></p></div>'
        )
      })
      .then(done)
  })

  it('multi nested array reactivity', done => {
    const vm = new Vue({
      data: {
        list: [[['foo']]]
      },
      template: `
        <div>
          <div v-for="i in list">
            <div v-for="j in i">
              <div v-for="k in j">
                {{ k }}
              </div>
            </div>
          </div>
        </div>
      `
    }).$mount()
    expect(toString(vm.$el)).to.match(/\s+foo\s+/)
    vm.list[0][0].push('bar')
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.match(/\s+foo\s+.+\s+bar\s+/)
      })
      .then(done)
  })

  it('strings', done => {
    const vm = new Vue({
      data: {
        text: 'foo'
      },
      template: `
        <div>
          <span v-for="letter in text">{{ letter }}.</span>
        </div>
      `
    }).$mount()
    expect(toString(vm.$el)).to.equal(
      '<div><span value="f."></span><span value="o."></span><span value="o."></span></div>'
    )
    vm.text += 'bar'
    global
      .waitForUpdate(() => {
        expect(toString(vm.$el)).to.equal(
          '<div><span value="f."></span><span value="o."></span><span value="o."></span><span value="b."></span><span value="a."></span><span value="r."></span></div>'
        )
      })
      .then(done)
  })
})
