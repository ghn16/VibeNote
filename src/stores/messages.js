import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import { moderationService } from '@/services/moderation'

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref([])
  const loading = ref(false)

  const unreadCount = computed(() =>
    messages.value.filter(m => !m.is_read).length
  )

  const starredMessages = computed(() =>
    messages.value.filter(m => m.is_starred)
  )

  const archivedMessages = computed(() =>
    messages.value.filter(m => m.is_archived)
  )

  const activeMessages = computed(() =>
    messages.value.filter(m => !m.is_archived)
  )

  // Charger tous les messages de l'utilisateur
  async function fetchMessages() {
    const auth = useAuthStore()
    if (!auth.user) return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', auth.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      messages.value = data || []
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    } finally {
      loading.value = false
    }
  }

  // Marquer comme lu
  async function markAsRead(messageId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)

      if (error) throw error

      const msg = messages.value.find(m => m.id === messageId)
      if (msg) {
        msg.is_read = true
        msg.read_at = new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur marquage lu:', error)
    }
  }

  // Toggle star
  async function toggleStar(messageId) {
    const msg = messages.value.find(m => m.id === messageId)
    if (!msg) return

    const newStarValue = !msg.is_starred

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_starred: newStarValue })
        .eq('id', messageId)

      if (error) throw error
      msg.is_starred = newStarValue
    } catch (error) {
      console.error('Erreur toggle star:', error)
    }
  }

  // Archiver
  async function toggleArchive(messageId) {
    const msg = messages.value.find(m => m.id === messageId)
    if (!msg) return

    const newArchiveValue = !msg.is_archived

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_archived: newArchiveValue })
        .eq('id', messageId)

      if (error) throw error
      msg.is_archived = newArchiveValue
    } catch (error) {
      console.error('Erreur toggle archive:', error)
    }
  }

  // Supprimer
  async function deleteMessage(messageId) {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      messages.value = messages.value.filter(m => m.id !== messageId)
      return { success: true }
    } catch (error) {
      console.error('Erreur suppression:', error)
      return { success: false, error: error.message }
    }
  }

  // Envoyer un message anonyme (avec toutes les vérifications de sécurité)
  async function sendAnonymousMessage(recipientLink, content) {
    try {
      // 1. Trouver le destinataire
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, allow_anonymous')
        .eq('unique_link', recipientLink)
        .single()

      if (profileError || !profile) {
        return { success: false, error: 'Utilisateur introuvable' }
      }

      // Vérifier si l'utilisateur accepte les messages anonymes
      if (profile.allow_anonymous === false) {
        return {
          success: false,
          error: 'Cet utilisateur n\'accepte plus de messages anonymes.'
        }
      }

      // 2. Obtenir IP et fingerprint
      const ipAddress = await moderationService.getClientIP()
      const fingerprint = moderationService.generateFingerprint()

      // 3. Vérifier si bloqué
      const blockCheck = await moderationService.isBlocked(
        profile.id,
        ipAddress,
        fingerprint
      )

      if (blockCheck.blocked) {
        return {
          success: false,
          error: 'Tu es bloqué et ne peux plus envoyer de messages à cet utilisateur.'
        }
      }

      // 4. Vérifier le rate limiting
      const rateLimitOk = await moderationService.checkRateLimit(
        profile.id,
        ipAddress,
        fingerprint
      )

      if (!rateLimitOk) {
        return {
          success: false,
          error: 'Trop de messages envoyés. Attends un peu avant de réessayer (max 10/heure).'
        }
      }

      // 5. Charger les mots interdits et vérifier le contenu
      const blockedWords = await moderationService.loadBlockedWords()
      const contentCheck = moderationService.checkContent(content, blockedWords)

      if (!contentCheck.isClean && contentCheck.hasHighSeverity) {
        return {
          success: false,
          error: 'Ton message contient du contenu inapproprié. Sois respectueux.'
        }
      }

      // 6. Envoyer le message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          recipient_id: profile.id,
          content: content,
          sender_ip: ipAddress,
          sender_fingerprint: fingerprint,
          is_flagged: !contentCheck.isClean // Marquer si contenu douteux
        }])

      if (messageError) throw messageError

      // 7. Enregistrer pour le rate limiting
      await moderationService.recordMessageSent(profile.id, ipAddress, fingerprint)

      return { success: true }
    } catch (error) {
      console.error('Erreur envoi message:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    messages,
    loading,
    unreadCount,
    starredMessages,
    archivedMessages,
    activeMessages,
    fetchMessages,
    markAsRead,
    toggleStar,
    toggleArchive,
    deleteMessage,
    sendAnonymousMessage
  }
})
