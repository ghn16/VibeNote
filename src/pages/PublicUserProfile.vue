<template>
  <div class="public-profile-container">
    <nav class="profile-nav">
      <router-link to="/search" class="back-btn">
        ← Retour à la recherche
      </router-link>
      <h2>Profil Public</h2>
      <div class="spacer"></div>
    </nav>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement du profil...</p>
    </div>

    <div v-else-if="!profile" class="error-state">
      <div class="error-icon">😕</div>
      <h2>Profil introuvable</h2>
      <p>Ce profil n'existe pas ou a été supprimé</p>
      <router-link to="/search" class="btn-primary">
        🔍 Rechercher des utilisateurs
      </router-link>
    </div>

    <div v-else class="profile-content">
      <div class="profile-header">
        <div class="profile-avatar-large">
          {{ getInitials(profile.display_name || profile.username) }}
        </div>

        <h1 class="profile-name">{{ profile.display_name || profile.username }}</h1>
        <p class="profile-username">@{{ profile.username }}</p>

        <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>

        <div class="profile-stats">
          <div class="stat-item">
            <strong>{{ publicReplies.length }}</strong>
            <span>Réponses</span>
          </div>
          <div class="stat-item">
            <strong>{{ totalReactions }}</strong>
            <span>Réactions</span>
          </div>
        </div>

        <button @click="goToSendMessage" class="btn-send-message">
          💬 Envoyer un message anonyme
        </button>
      </div>

      <div class="replies-section">
        <h2 class="section-title">📝 Réponses publiques</h2>

        <div v-if="publicReplies.length === 0" class="empty-replies">
          <div class="empty-icon">📭</div>
          <p>Aucune réponse publique pour le moment</p>
        </div>

        <div v-else class="replies-list">
          <div
            v-for="reply in publicReplies"
            :key="reply.id"
            class="reply-card"
          >
            <blockquote class="original-question-public">
              <strong>Question :</strong> {{ reply.message?.content || 'Message original non trouvé' }}
            </blockquote>

            <div class="reply-content">
              <p class="reply-text">{{ reply.content }}</p>
              <span class="reply-date">{{ formatDate(reply.created_at) }}</span>
            </div>

            <div class="reply-actions">
              <button
                @click="toggleReaction(reply.id, 'love')"
                class="reaction-btn"
                :class="{ active: reply.user_reaction === 'love' }"
                :disabled="!currentUser"
                title="J'adore"
              >
                ❤️ {{ reply.reactions?.love || 0 }}
              </button>
              <button
                @click="toggleReaction(reply.id, 'like')"
                class="reaction-btn"
                :class="{ active: reply.user_reaction === 'like' }"
                :disabled="!currentUser"
                title="J'aime"
              >
                👍 {{ reply.reactions?.like || 0 }}
              </button>
              <button
                @click="toggleReaction(reply.id, 'fire')"
                class="reaction-btn"
                :class="{ active: reply.user_reaction === 'fire' }"
                :disabled="!currentUser"
                title="C'est chaud"
              >
                🔥 {{ reply.reactions?.fire || 0 }}
              </button>
              <button
                @click="toggleFavorite(reply.id)"
                class="favorite-btn"
                :class="{ active: reply.is_favorited }"
                :disabled="!currentUser"
                title="Ajouter aux favoris"
              >
                {{ reply.is_favorited ? '⭐' : '☆' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const router = useRouter()

const profile = ref(null)
const publicReplies = ref([])
const loading = ref(true)
const currentUser = ref(null)

const username = route.params.username

const totalReactions = computed(() => {
  return publicReplies.value.reduce((total, reply) => {
    return total + (reply.reactions?.love || 0) +
           (reply.reactions?.like || 0) +
           (reply.reactions?.fire || 0)
  }, 0)
})

onMounted(async () => {
  await loadCurrentUser()
  await loadProfile()
  if (profile.value) {
    await loadPublicReplies()
    await loadUserReactions()
  }
  loading.value = false
})

async function loadCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    currentUser.value = user
  } catch (error) {
    console.error('Erreur chargement utilisateur:', error)
  }
}

async function loadProfile() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error) throw error
    profile.value = data
  } catch (error) {
    console.error('Erreur chargement profil:', error)
    profile.value = null
  }
}

async function loadPublicReplies() {
  try {
    const { data, error } = await supabase
      .from('replies')
      .select(`
        *,
        message:messages(content)
      `)
      .eq('user_id', profile.value.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Charger les compteurs de réactions
    const repliesWithReactions = await Promise.all(
      (data || []).map(async (reply) => {
        // Compter les réactions
        const { data: reactions } = await supabase
          .from('reply_reactions')
          .select('reaction_type')
          .eq('reply_id', reply.id)

        const reactionCounts = {
          love: reactions?.filter(r => r.reaction_type === 'love').length || 0,
          like: reactions?.filter(r => r.reaction_type === 'like').length || 0,
          fire: reactions?.filter(r => r.reaction_type === 'fire').length || 0
        }

        // Compter les favoris
        const { count: favCount } = await supabase
          .from('reply_favorites')
          .select('*', { count: 'exact', head: true })
          .eq('reply_id', reply.id)

        return {
          ...reply,
          reactions: reactionCounts,
          favorites_count: favCount || 0,
          user_reaction: null,
          is_favorited: false
        }
      })
    )

    publicReplies.value = repliesWithReactions
  } catch (error) {
    console.error('Erreur chargement réponses:', error)
  }
}

async function loadUserReactions() {
  if (!currentUser.value) return

  try {
    const replyIds = publicReplies.value.map(r => r.id)

    // Charger les réactions de l'utilisateur
    const { data: reactions } = await supabase
      .from('reply_reactions')
      .select('reply_id, reaction_type')
      .eq('user_id', currentUser.value.id)
      .in('reply_id', replyIds)

    // Charger les favoris
    const { data: favorites } = await supabase
      .from('reply_favorites')
      .select('reply_id')
      .eq('user_id', currentUser.value.id)
      .in('reply_id', replyIds)

    const reactionsMap = {}
    reactions?.forEach(r => {
      reactionsMap[r.reply_id] = r.reaction_type
    })

    const favoritesSet = new Set(favorites?.map(f => f.reply_id) || [])

    publicReplies.value.forEach(reply => {
      reply.user_reaction = reactionsMap[reply.id] || null
      reply.is_favorited = favoritesSet.has(reply.id)
    })

  } catch (error) {
    console.error('Erreur chargement réactions utilisateur:', error)
  }
}

async function toggleReaction(replyId, reactionType) {
  if (!currentUser.value) {
    alert('Connectez-vous pour réagir')
    return
  }

  const reply = publicReplies.value.find(r => r.id === replyId)
  if (!reply) return

  try {
    // Vérifier si l'utilisateur a déjà une réaction
    const { data: existing } = await supabase
      .from('reply_reactions')
      .select('id, reaction_type')
      .eq('reply_id', replyId)
      .eq('user_id', currentUser.value.id)
      .maybeSingle()

    if (existing) {
      if (existing.reaction_type === reactionType) {
        // Retirer la réaction
        await supabase
          .from('reply_reactions')
          .delete()
          .eq('id', existing.id)

        reply.reactions[reactionType]--
        reply.user_reaction = null
      } else {
        // Changer la réaction
        await supabase
          .from('reply_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existing.id)

        reply.reactions[existing.reaction_type]--
        reply.reactions[reactionType]++
        reply.user_reaction = reactionType
      }
    } else {
      // Ajouter la réaction
      await supabase
        .from('reply_reactions')
        .insert({
          reply_id: replyId,
          user_id: currentUser.value.id,
          reaction_type: reactionType
        })

      reply.reactions[reactionType]++
      reply.user_reaction = reactionType
    }
  } catch (error) {
    console.error('Erreur toggle reaction:', error)
  }
}

async function toggleFavorite(replyId) {
  if (!currentUser.value) {
    alert('Connectez-vous pour ajouter aux favoris')
    return
  }

  const reply = publicReplies.value.find(r => r.id === replyId)
  if (!reply) return

  try {
    const { data: existing } = await supabase
      .from('reply_favorites')
      .select('id')
      .eq('reply_id', replyId)
      .eq('user_id', currentUser.value.id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('reply_favorites')
        .delete()
        .eq('id', existing.id)

      reply.favorites_count--
      reply.is_favorited = false
    } else {
      await supabase
        .from('reply_favorites')
        .insert({
          reply_id: replyId,
          user_id: currentUser.value.id
        })

      reply.favorites_count++
      reply.is_favorited = true
    }
  } catch (error) {
    console.error('Erreur toggle favorite:', error)
  }
}

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const dateStr = timestamp.replace(' ', 'T')
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 60) return "À l'instant"
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Il y a ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

function goToSendMessage() {
  router.push(`/${profile.value.unique_link}`)
}
</script>

<style scoped>
.public-profile-container {
  min-height: 100vh;
  background: #0B0F14;
}

.profile-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-nav h2 {
  font-size: 24px;
  margin: 0;
}

.back-btn {
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.back-btn:hover {
  background: white;
  color: #667eea;
}

.spacer {
  width: 150px;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  color: #718096;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #1E2230;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

/* Fichier: PublicUserProfile.vue (dans la section <style scoped>) */

/* Style pour la question anonyme associée dans la vue publique */
.original-question-public {
  /* Pour un look sobre et discret */
  background: #1c2430;
  border-left: 4px solid #8b949e; /* Ligne grise, couleur neutre */
  padding: 12px 15px;
  /* Utilisation de marges négatives pour que ce bloc s'étende visuellement */
  margin: -20px -20px 15px -20px;
  font-size: 14px;
  color: #8b949e;
  font-style: italic;
  border-radius: 8px 8px 0 0; /* Coins arrondis en haut */
  white-space: pre-wrap;
}

.original-question-public strong {
  color: #e6edf3;
  font-weight: 600;
}

/* Assurez-vous que la carte de réponse a un padding suffisant */
.reply-card {
    padding: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 100px 20px;
  color: #718096;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.error-state h2 {
  font-size: 28px;
  color: #E6EDF3;
  margin-bottom: 10px;
}

.btn-primary {
  display: inline-block;
  margin-top: 30px;
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.profile-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 50px 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 60px;
  background: #121521;
  border-radius: 20px;
  padding: 50px 30px;
}

.profile-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin: 0 auto 25px;
  border: 5px solid rgba(102, 126, 234, 0.2);
}

.profile-name {
  font-size: 32px;
  color: #E6EDF3;
  margin-bottom: 8px;
}

.profile-username {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 20px;
}

.profile-bio {
  font-size: 16px;
  color: #A0AEC0;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 30px;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin: 30px 0;
  padding: 25px 0;
  border-top: 1px solid #1E2230;
  border-bottom: 1px solid #1E2230;
}

.stat-item {
  text-align: center;
}

.stat-item strong {
  display: block;
  font-size: 28px;
  color: #E6EDF3;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-item span {
  font-size: 14px;
  color: #718096;
}

.btn-send-message {
  margin-top: 25px;
  padding: 15px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-send-message:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.replies-section {
  margin-top: 40px;
}

.section-title {
  font-size: 24px;
  color: #E6EDF3;
  margin-bottom: 30px;
  text-align: center;
}

.empty-replies {
  text-align: center;
  padding: 80px 20px;
  background: #121521;
  border-radius: 16px;
  color: #718096;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.empty-replies p {
  font-size: 16px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reply-card {
  background: #121521;
  border-radius: 16px;
  padding: 25px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.reply-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.reply-content {
  margin-bottom: 20px;
}

.reply-text {
  font-size: 16px;
  color: #E6EDF3;
  line-height: 1.7;
  margin-bottom: 12px;
}

.reply-date {
  font-size: 13px;
  color: #718096;
}

.reply-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 15px;
  border-top: 1px solid #1E2230;
}

.reaction-btn,
.favorite-btn {
  padding: 10px 18px;
  background: rgba(139, 148, 158, 0.1);
  border: 1px solid rgba(139, 148, 158, 0.2);
  border-radius: 20px;
  color: #8B949E;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.reaction-btn:hover:not(:disabled),
.favorite-btn:hover:not(:disabled) {
  background: rgba(139, 148, 158, 0.2);
  transform: translateY(-2px);
}

.reaction-btn:disabled,
.favorite-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.reaction-btn.active:nth-child(1) {
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(220, 38, 38, 0.3);
  color: #DC2626;
}

.reaction-btn.active:nth-child(2) {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(37, 99, 235, 0.3);
  color: #2563EB;
}

.reaction-btn.active:nth-child(3) {
  background: rgba(234, 88, 12, 0.15);
  border-color: rgba(234, 88, 12, 0.3);
  color: #EA580C;
}

.favorite-btn.active {
  background: rgba(234, 179, 8, 0.15);
  border-color: rgba(234, 179, 8, 0.3);
  color: #EAB308;
}

@media (max-width: 768px) {
  .profile-nav {
    padding: 15px 20px;
  }

  .profile-content {
    padding: 30px 15px;
  }

  .profile-header {
    padding: 40px 20px;
  }

  .profile-avatar-large {
    width: 100px;
    height: 100px;
    font-size: 40px;
  }

  .profile-name {
    font-size: 26px;
  }

  .profile-stats {
    gap: 30px;
  }

  .reply-card {
    padding: 20px;
  }

  .reply-actions {
    gap: 8px;
  }

  .reaction-btn,
  .favorite-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
}
</style>
