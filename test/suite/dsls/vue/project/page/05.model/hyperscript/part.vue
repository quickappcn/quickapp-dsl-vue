<template>
  <div>
    <text v-for="(item, index) in list" :key="index" v-if="item.x">{{item.v}}</text>
  </div>
</template>
