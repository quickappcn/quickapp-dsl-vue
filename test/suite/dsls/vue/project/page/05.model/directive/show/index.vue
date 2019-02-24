<template>
  <div>
    <div ref="ref1"><span v-show="foo1">hello</span></div>
    <div ref="ref2"><span v-show="foo2" style="display:block">hello</span></div>
    <div ref="ref3">
      <div v-if="tester"><span v-show="false"></span></div>
      <div v-else><span @click="tester=!tester">show</span></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      foo1: true,
      foo2: true,
      tester: true
    }
  }
}
</script>
