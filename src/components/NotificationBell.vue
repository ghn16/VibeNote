<template>
  <div class="notification-bell">
    <button
      @click="$emit('click')"
      class="bell-button"
      :class="{ hasNotifications: notificationsStore.unreadCount > 0 }"
    >
      🔔
      <span v-if="notificationsStore.unreadCount > 0" class="badge">
        {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { useNotificationsStore } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()

defineEmits(['click'])
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.bell-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.bell-button.hasNotifications {
  animation: ring 2s ease-in-out infinite;
}

@keyframes ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-10deg); }
  20%, 40% { transform: rotate(10deg); }
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}
</style>
