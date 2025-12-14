import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  // Initialiser l'utilisateur au chargement
  async function init() {
    try {
      loading.value = true
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        user.value = session.user
        await loadUserProfile()
      }
    } catch (error) {
      console.error('Erreur initialisation:', error)
    } finally {
      loading.value = false
    }
  }

  // Charger le profil utilisateur depuis user_profiles
  async function loadUserProfile() {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.value.id)
        .maybeSingle()

      if (error) {
        console.error('Erreur chargement profil:', error)
        return
      }

      if (data) {
        user.value.profile = data
      } else {
        console.warn('Aucun profil trouvé pour cet utilisateur')
      }
    } catch (err) {
      console.error('Exception loadUserProfile:', err)
    }
  }

  // Inscription
  async function signup(email, password, username) {
    try {
      // 1. Créer le compte auth avec metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé')
      }

      // Le trigger handle_new_user() va créer automatiquement le profil
      // Mais on attend un peu pour être sûr
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Vérifier que le profil existe, sinon le créer manuellement
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (!existingProfile) {
        console.log('Profil non trouvé, création manuelle...')
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: authData.user.id,
              username: username,
              role: 'user'
            }
          ])

        if (profileError) {
          console.error('Erreur création profil:', profileError)
          // Si c'est un problème de duplicate, on ignore
          if (!profileError.code?.includes('23505')) {
            throw profileError
          }
        }
      }

      user.value = authData.user

      // Charger le profil avec retry
      let retries = 3
      while (retries > 0) {
        await loadUserProfile()
        if (user.value.profile) break
        await new Promise(resolve => setTimeout(resolve, 1000))
        retries--
      }

      return { success: true }
    } catch (error) {
      console.error('Erreur signup:', error)
      return { success: false, error: error.message }
    }
  }

  // Connexion
  async function login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      user.value = data.user
      await loadUserProfile()

      return { success: true }
    } catch (error) {
      console.error('Erreur login:', error)
      return { success: false, error: error.message }
    }
  }

  // Déconnexion
  async function logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      return { success: true }
    } catch (error) {
      console.error('Erreur logout:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    loading,
    init,
    signup,
    login,
    logout,
    loadUserProfile
  }
})
