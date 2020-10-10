<!--
 - index.test.vue
 - 
 - sobird<i@sobird.me> at 2020/10/10 13:19:39 created.
-->

<template>
  <div class="test">
    <h1>Test cases</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "hello message!",
    };
  },
  mounted() {
    this.message = "hello world!";
  },
};
</script>

<style lang="scss" scoped>
// test
.test {
  font-size: 14px;
  p {
    font-size: 16px;
  }
}
</style>
<style>
div {
  text-align: center;
}
</style>
