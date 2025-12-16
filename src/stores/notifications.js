import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)
  const realtimeChannel = ref(null)
  const soundEnabled = ref(true)
  const isSubscribed = ref(false)
  const connectionTimeout = ref(null)

  // Son de notification
  const notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Gyv==')

  // Initialiser les notifications temps réel
  function initRealtime(userId) {
    // Éviter les doubles souscriptions
    if (isSubscribed.value || realtimeChannel.value) {
      console.log('Déjà souscrit aux notifications')
      return
    }

    console.log('Initialisation des notifications temps réel pour:', userId)

    try {
      const channel = supabase
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

      // Timeout de sécurité pour éviter les connexions zombies
      connectionTimeout.value = setTimeout(() => {
        if (!isSubscribed.value) {
          console.warn('Timeout de connexion WebSocket notifications')
          cleanup()
        }
      }, 10000)

      // Souscrire avec gestion du statut
      channel.subscribe((status) => {
        console.log('Status de souscription notifications:', status)

        if (status === 'SUBSCRIBED') {
          isSubscribed.value = true
          realtimeChannel.value = channel
          if (connectionTimeout.value) {
            clearTimeout(connectionTimeout.value)
            connectionTimeout.value = null
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Erreur de souscription notifications:', status)
          cleanup()
        }
      })
    } catch (error) {
      console.error('Erreur init realtime:', error)
      cleanup()
    }
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
      try {
        const permission = await Notification.requestPermission()
        console.log('Permission notifications:', permission)
      } catch (error) {
        console.error('Erreur permission notifications:', error)
      }
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

  // Cleanup amélioré
  async function cleanup() {
    console.log('Nettoyage des notifications')

    // Nettoyer le timeout
    if (connectionTimeout.value) {
      clearTimeout(connectionTimeout.value)
      connectionTimeout.value = null
    }

    // Déconnecter le channel si existant
    if (realtimeChannel.value) {
      try {
        if (isSubscribed.value) {
          // Connexion établie, déconnexion normale
          await supabase.removeChannel(realtimeChannel.value)
          console.log('Channel notifications désinscrit')
        } else {
          // Pas encore connecté, forcer la fermeture
          realtimeChannel.value.unsubscribe()
          console.log('Channel notifications forcé à se fermer')
        }
      } catch (error) {
        // Ignorer les erreurs si déjà fermé
        if (!error.message?.includes('closed')) {
          console.error('Erreur cleanup notifications:', error)
        }
      } finally {
        realtimeChannel.value = null
        isSubscribed.value = false
      }
    } else {
      isSubscribed.value = false
    }
  }

  return {
    unreadCount,
    soundEnabled,
    isSubscribed,
    initRealtime,
    requestNotificationPermission,
    toggleSound,
    loadPreferences,
    cleanup
  }
})
