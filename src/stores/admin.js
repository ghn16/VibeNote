import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useAdminStore = defineStore('admin', () => {
  const globalStats = ref({
    totalUsers: 0,
    totalMessages: 0,
    totalReports: 0,
    activeUsers: 0
  })

  const reports = ref([])
  const users = ref([])
  const blockedWords = ref([])
  const loading = ref(false)

  // Charger les stats globales
  async function fetchGlobalStats() {
    try {
      // Total utilisateurs
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Total messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

      // Total signalements
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Utilisateurs actifs (ayant envoyé un message dans les 7 derniers jours)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count: activeCount } = await supabase
        .from('messages')
        .select('recipient_id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo)

      globalStats.value = {
        totalUsers: usersCount || 0,
        totalMessages: messagesCount || 0,
        totalReports: reportsCount || 0,
        activeUsers: activeCount || 0
      }
    } catch (error) {
      console.error('Erreur stats globales:', error)
    }
  }

  // Charger les signalements
  async function fetchReports() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          messages (*),
          user_profiles!reports_reported_by_fkey (username)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      reports.value = data || []
    } catch (error) {
      console.error('Erreur chargement signalements:', error)
    } finally {
      loading.value = false
    }
  }

  // Traiter un signalement
  async function updateReportStatus(reportId, status, adminNotes = null) {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reportId)

      if (error) throw error
      await fetchReports()
      return { success: true }
    } catch (error) {
      console.error('Erreur mise à jour signalement:', error)
      return { success: false, error: error.message }
    }
  }

  // Charger tous les utilisateurs
  async function fetchUsers(limit = 50) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      users.value = data || []
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
    } finally {
      loading.value = false
    }
  }

  // Bannir un utilisateur
  async function banUser(userId, reason) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          role: 'banned',
          allow_anonymous: false
        })
        .eq('id', userId)

      if (error) throw error

      // Ajouter au blocage global
      await supabase
        .from('global_blocks')
        .insert([{
          reason: reason,
          blocked_until: null // Permanent
        }])

      return { success: true }
    } catch (error) {
      console.error('Erreur bannissement:', error)
      return { success: false, error: error.message }
    }
  }

  // Charger les mots interdits
  async function fetchBlockedWords() {
    try {
      const { data, error } = await supabase
        .from('blocked_words')
        .select('*')
        .order('severity', { ascending: false })

      if (error) throw error
      blockedWords.value = data || []
    } catch (error) {
      console.error('Erreur chargement mots interdits:', error)
    }
  }

  // Ajouter un mot interdit
  async function addBlockedWord(word, severity) {
    try {
      const { error } = await supabase
        .from('blocked_words')
        .insert([{ word: word.toLowerCase(), severity }])

      if (error) throw error
      await fetchBlockedWords()
      return { success: true }
    } catch (error) {
      console.error('Erreur ajout mot interdit:', error)
      return { success: false, error: error.message }
    }
  }

  // Supprimer un mot interdit
  async function removeBlockedWord(wordId) {
    try {
      const { error } = await supabase
        .from('blocked_words')
        .delete()
        .eq('id', wordId)

      if (error) throw error
      await fetchBlockedWords()
      return { success: true }
    } catch (error) {
      console.error('Erreur suppression mot:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    globalStats,
    reports,
    users,
    blockedWords,
    loading,
    fetchGlobalStats,
    fetchReports,
    updateReportStatus,
    fetchUsers,
    banUser,
    fetchBlockedWords,
    addBlockedWord,
    removeBlockedWord
  }
})
