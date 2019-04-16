<template>
  <div>
    <text ref="d1Id" :style="`background-color: ${d1Str}; color: #ffff00`">{{d1Str}}</text>
    <text ref="d2Id" :style="{ backgroundColor: '#ff0000', color: '#ffff00' }">{{d1Str}}</text>
    <text ref="d3Id" :style="d1Arr"></text>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        d1Str: 'v1Str',
        d1Arr: [{
          color: '#ff0000'
        }, {
          color: '#f00f00'
        }]
      }
    }
  }
</script>