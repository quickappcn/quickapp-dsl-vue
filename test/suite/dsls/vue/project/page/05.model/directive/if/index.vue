<template>
  <div>
    <div ref="ref0">
      <span v-if="foo">hello</span>
      <span v-else>bye</span>
    </div>
    <div ref="ref1">
      <span v-if="foo">hello</span>
      <span v-else-if="bar">elseif</span>
      <span v-else>bye</span>
    </div>
    <div ref="ref2">
      <span v-for="(item, i) in list1" v-if="item.value">{{i}}</span>
    </div>
    <div ref="ref3">
      <span v-for="(item, i) in list2" v-if="item.value">hello</span>
      <span v-else>bye</span>
    </div>
    <div ref="ref4">
      <span v-if="false">hello</span>
      <span v-else v-for="item in list3">{{ item }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      foo: true,
      bar: false,
      list1: [{ value: true }, { value: false }, { value: true }],
      list2: [{ value: true }, { value: false }, { value: true }],
      list3: [1, 2, 3]
    }
  }
}
</script>
