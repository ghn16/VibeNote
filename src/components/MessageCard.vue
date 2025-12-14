<template>
  <div class="msg-card">
    <p>{{ message.content }}</p>
    <small>{{ new Date(message.created_at).toLocaleString() }}</small>
  </div>
</template>

<script setup>
defineProps({ message: Object })
</script>

<style scoped>
.msg-card { padding:10px; border-bottom:1px solid #eee }
</style>
