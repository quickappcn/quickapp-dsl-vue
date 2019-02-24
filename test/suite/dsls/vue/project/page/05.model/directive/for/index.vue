<template>
  <div>
    <div ref="ref0">
      <span v-for="item in list0">{{item}}</span>
    </div>
    <div ref="ref1">
      <span v-for="(item, i) in list1">{{i}}-{{item}}</span>
    </div>
    <div ref="ref2">
      <span v-for="item in list2">{{item.value}}</span>
    </div>
    <div ref="ref3">
      <span v-for="(item, i) in list3">{{i}}-{{item.value}}</span>
    </div>
    <div ref="ref4">
      <span v-for="val in obj1">{{val}}</span>
    </div>
    <div ref="ref5">
      <span v-for="(val, key) in obj2">{{val}}-{{key}}</span>
    </div>
    <div ref="ref6">
      <span v-for="(val, key, i) in obj3">{{val}}-{{key}}-{{i}}</span>
    </div>
    <div ref="ref7">
      <span v-for="(val, key) in $data">{{val}}-{{key}}</span>
    </div>
    <div ref="ref8">
      <div v-if="item < 3" v-for="item in items1">{{item}}</div>
    </div>
    <div ref="ref9">
      <div v-for="item in items2" v-if="item < 3">{{item}}</div>
    </div>
    <div ref="ref10">
      <div v-for="n in 3">{{n}}</div>
    </div>
    <div ref="ref11">
      <div v-for="item in items3">{{ item.msg }}</div>
    </div>
    <div ref="ref12">
      <div v-for="item in items4" :key="item.id">{{ item.msg }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list0: ["a", "b", "c"],
      list1: ["a", "b", "c"],
      list2: [{ value: "a" }, { value: "b" }, { value: "c" }],
      list3: [{ value: "a" }, { value: "b" }, { value: "c" }],
      obj1: { a: 0, b: 1, c: 2 },
      obj2: { a: 0, b: 1, c: 2 },
      obj3: { a: 0, b: 1, c: 2 },
      items1: [1, 2, 3],
      items2: [1, 2, 3],
      items3: [{ id: 1, msg: "a" }, { id: 2, msg: "b" }, { id: 3, msg: "c" }],
      items4: [{ id: 1, msg: "a" }, { id: 2, msg: "b" }, { id: 3, msg: "c" }]
    }
  }
}
</script>
