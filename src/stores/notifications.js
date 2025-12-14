import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)
  const realtimeChannel = ref(null)
  const soundEnabled = ref(true)

  // Son de notification
  const notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Gyv==')

  // Initialiser les notifications temps réel
  function initRealtime(userId) {
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value)
    }

    realtimeChannel.value = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          handleNewMessage(payload.new)
        }
      )
      .subscribe()
  }

  // Gérer un nouveau message
  function handleNewMessage(message) {
    unreadCount.value++

    // Jouer le son
    if (soundEnabled.value) {
      notificationSound.play().catch(e => console.log('Son bloqué:', e))
    }

    // Notification navigateur
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nouveau message VibeNote ! 📬', {
        body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: message.id
      })
    }
  }

  // Demander la permission pour les notifications
  async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  // Toggle son
  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    localStorage.setItem('notificationSound', soundEnabled.value)
  }

  // Charger les préférences
  function loadPreferences() {
    const saved = localStorage.getItem('notificationSound')
    if (saved !== null) {
      soundEnabled.value = saved === 'true'
    }
  }

  // Cleanup
  function cleanup() {
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value)
      realtimeChannel.value = null
    }
  }

  return {
    unreadCount,
    soundEnabled,
    initRealtime,
    requestNotificationPermission,
    toggleSound,
    loadPreferences,
    cleanup
  }
})
