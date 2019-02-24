<template>
  <div>
  </div>
</template>

<script>
  // 引入全部接口
  import system from '@system'
  // 示例接口
  import sample from '@system.sample'
  // 可实例化的模块
  import Class1 from '@system.Class1'
  // 支持通过create方法创建实例的模块
  import websocketfactory from '@system.websocketfactory'

  export default {
    data() {
      return {

      }
    },
    created () {
      this.system = system
      this.sample = sample
      this.Class1 = Class1
      this.websocketfactory = websocketfactory
    },
    methods: {
      // 读写
      opsTestReadwrite () {
        sample.readwrite = 'readwrite-v2'
        const readwrite = sample.readwrite
        return readwrite
      },
      opsTestAttrReadwrite () {
        return sample.getAttr('readwrite')
      },
      // 只读
      opsTestReadonly () {
        sample.readonly = 'readonly-v2'
        const readonly = sample.readonly
        return readonly
      },
      opsTestAttrReadonly () {
        return sample.getAttr('readonly')
      },
      // 只写
      opsTestWriteonly () {
        sample.writeonly = 'writeonly-v2'
        const writeonly = sample.writeonly
        return writeonly
      },
      opsTestAttrWriteonly () {
        return sample.getAttr('writeonly')
      },

      // 事件
      opsTestCustomEvent1 () {
        return (sample.onCustomEvent1 = function (ret) {
          this.onCustomEvent1Result = ret
        }.bind(this))
      },
      // 事件：删除回调
      opsTestCustomEvent1Clear () {
        return (sample.onCustomEvent1 = null)
      },
      // 事件：赋值对象会警告并不生效
      opsTestCustomEvent1Object () {
        return (sample.onCustomEvent1 = {})
      }
    }
  }
</script>