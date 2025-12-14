import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useAnalyticsStore = defineStore('analytics', () => {
  const stats = ref(null)
  const messagesByDay = ref([])
  const loading = ref(false)

  // Charger les statistiques globales
  async function fetchStats(userId) {
    loading.value = true
    try {
      // Récupérer les stats directement depuis les tables
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('profile_views')
        .eq('id', userId)
        .single()

      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)

      const { count: unreadMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)

      const { count: starredMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_starred', true)

      const { count: totalReplies } = await supabase
        .from('replies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: publicReplies } = await supabase
        .from('replies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_public', true)

      stats.value = {
        profile_views: profile?.profile_views || 0,
        total_messages: totalMessages || 0,
        unread_messages: unreadMessages || 0,
        starred_messages: starredMessages || 0,
        total_replies: totalReplies || 0,
        public_replies: publicReplies || 0
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      loading.value = false
    }
  }

  // Charger les messages par jour (pour graphique)
  async function fetchMessagesByDay(userId, days = 30) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('created_at')
        .eq('recipient_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Grouper par jour
      const grouped = {}
      data.forEach(msg => {
        const date = new Date(msg.created_at).toLocaleDateString('fr-FR')
        grouped[date] = (grouped[date] || 0) + 1
      })

      messagesByDay.value = Object.entries(grouped).map(([date, count]) => ({
        date,
        count
      }))
    } catch (error) {
      console.error('Erreur chargement messages par jour:', error)
    }
  }

  // Analyse de sentiment (simple)
  function analyzeSentiment(messages) {
    const positiveWords = ['merci', 'super', 'génial', 'top', 'cool', 'love', '❤️', '😊', '🔥']
    const negativeWords = ['nul', 'mauvais', 'horreur', 'déteste', 'déçu', '😡', '😢']

    let positive = 0
    let negative = 0
    let neutral = 0

    messages.forEach(msg => {
      const content = msg.content.toLowerCase()
      const hasPositive = positiveWords.some(word => content.includes(word))
      const hasNegative = negativeWords.some(word => content.includes(word))

      if (hasPositive && !hasNegative) positive++
      else if (hasNegative && !hasPositive) negative++
      else neutral++
    })

    return { positive, negative, neutral }
  }

  return {
    stats,
    messagesByDay,
    loading,
    fetchStats,
    fetchMessagesByDay,
    analyzeSentiment
  }
})
