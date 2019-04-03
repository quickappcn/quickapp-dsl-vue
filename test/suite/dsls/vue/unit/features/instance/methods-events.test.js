import '../../utils/imports'
import Vue from '../../utils/vue'

describe('Instance methods events', () => {
  let vm
  let count = 0
  let str
  const spy = s => {
    count++
    str.push(s)
  }
  beforeEach(() => {
    vm = new Vue()
    count = 0
    str = []
  })

  it('$on', () => {
    vm.$on('test', function() {
      // expect correct context
      expect(this).to.equal(vm)
      spy.apply(this, arguments)
    })
    vm.$emit('test', 1, 2, 3, 4)
    expect(count).to.equal(1)
    expect(str).to.deep.equal([1])
  })

  it('$on multi event', () => {
    vm.$on(['test1', 'test2'], function() {
      expect(this).to.equal(vm)
      spy.apply(this, arguments)
    })
    vm.$emit('test1', 1, 2, 3, 4)
    expect(count).to.equal(1)
    expect(str).to.deep.equal([1])
    vm.$emit('test2', 5, 6, 7, 8)
    expect(count).to.equal(2)
    expect(str).to.deep.equal([1, 5])
  })

  it('$off multi event', () => {
    vm.$on(['test1', 'test2', 'test3'], spy)
    vm.$off(['test1', 'test2'], spy)
    vm.$emit('test1')
    vm.$emit('test2')
    expect(count).to.equal(0)
    vm.$emit('test3', 1, 2, 3, 4)
    expect(count).to.equal(1)
    expect(str).to.deep.equal([1])
  })

  it('$off multi event without callback', () => {
    vm.$on(['test1', 'test2'], spy)
    vm.$off(['test1', 'test2'])
    vm.$emit('test1')
    expect(count).to.equal(0)
  })

  it('$once', () => {
    vm.$once('test', spy)
    vm.$emit('test', 1, 2, 3)
    vm.$emit('test', 2, 3, 4)
    expect(count).to.equal(1)
    expect(str).to.deep.equal([1])
  })

  it('$off', () => {
    vm.$on('test1', spy)
    vm.$on('test2', spy)
    vm.$off()
    vm.$emit('test1')
    vm.$emit('test2')
    expect(count).to.equal(0)
  })

  it('$off event', () => {
    vm.$on('test1', spy)
    vm.$on('test2', spy)
    vm.$off('test1')
    vm.$off('test1') // test off something that's already off
    vm.$emit('test1', 1)
    vm.$emit('test2', 2)
    expect(count).to.equal(1)
    expect(str).to.deep.equal([2])
  })

  it('$off event + fn', () => {
    let count2 = 0
    const spy2 = () => {
      count2++
    }
    vm.$on('test', spy)
    vm.$on('test', spy2)
    vm.$off('test', spy)
    vm.$emit('test', 1, 2, 3)
    expect(count).to.equal(0)
    expect(count2).to.equal(1)
  })
})
