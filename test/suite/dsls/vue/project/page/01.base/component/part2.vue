<template>
  <div>
  </div>
</template>

<script>
  /**
   * VM被销毁时事件不再被$broadcast触发
   */
  import sample from '@system.sample'

  export default {
    data() {
      return {
        list: []
      }
    },
    props: ['obj'],
    created () {
      this.$on('sub2', this.bindVMEvt2)
    },
    methods: {
      bindVMEvt2 () {
        throw new Error(`不应该被调到`)
      },
      fn () {},
      accessVmAsync () {
        const thiz = this
        sample.methodCallback1({
          success () {
            // data
            thiz.list.push('success')
            // props
            thiz.obj.name
            // method
            thiz.fn()
            // 不应该被调用
            thiz.$emit('sub2')
          }
        })
      }
    }
  }
</script>