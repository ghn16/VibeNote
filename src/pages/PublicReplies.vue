<template>
  <div class="replies-container">
    <!-- Navigation -->
    <nav class="replies-nav">
      <router-link to="/dashboard" class="back-btn">
        ← Retour
      </router-link>
      <h2>VibeNote</h2>
      <div class="spacer"></div>
    </nav>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <div v-else class="replies-content">
      <!-- En-tête du profil -->
      <div class="profile-header">
        <div class="avatar">
          {{ avatarLetter }}
        </div>
        <h1>{{ auth.user?.profile?.display_name || auth.user?.profile?.username }}</h1>
        <p class="subtitle">🌟 Réponses Publiques</p>
      </div>

      <!-- Informations -->
      <div class="info-banner">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="info-title">Comment ça marche ?</p>
          <ul class="info-list">
            <li>Les réponses publiques sont visibles par tout le monde</li>
            <li>Les visiteurs peuvent réagir ❤️ 👍 🔥 et mettre en favori ⭐</li>
            <li>Construisez votre communauté en partageant vos meilleures réponses</li>
          </ul>
        </div>
      </div>

      <!-- Stats des réactions -->
      <div class="reactions-stats">
        <div class="stat-item">
          <div class="stat-icon">❤️</div>
          <div class="stat-value">{{ totalLove }}</div>
          <div class="stat-label">Love</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">👍</div>
          <div class="stat-value">{{ totalLike }}</div>
          <div class="stat-label">Like</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">{{ totalFire }}</div>
          <div class="stat-label">Fire</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">{{ totalFavorites }}</div>
          <div class="stat-label">Favoris</div>
        </div>
      </div>

      <!-- État vide -->
      <div v-if="publicReplies.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="empty-text">Aucune réponse publique pour le moment</p>
        <p class="empty-subtext">Répondez à des messages en mode "Public" pour commencer</p>
        <router-link to="/messages" class="btn-primary">
          Voir mes messages
        </router-link>
      </div>

      <!-- Liste des réponses -->
      <div v-else class="replies-list">
        <h3 class="section-title">Mes Réponses ({{ publicReplies.length }})</h3>

        <div
          v-for="reply in publicReplies"
          :key="reply.id"
          class="reply-card"
        >
          <!-- Message original -->
          <div class="original-message">
            <p class="original-label">📩 Message anonyme reçu:</p>
            <p class="original-text">"{{ reply.original_message }}"</p>
          </div>

          <!-- Ma réponse -->
          <div class="reply-content">
            <p>{{ reply.content }}</p>
          </div>

          <!-- Réactions et actions -->
          <div class="reply-footer">
            <div class="reactions">
              <!-- Love -->
              <button
                @click="toggleReaction(reply.id, 'love')"
                :class="['reaction-btn', { active: reply.user_reaction === 'love' }]"
                :title="reply.user_reaction === 'love' ? 'Retirer' : 'Ajouter Love'"
              >
                <svg
                  :class="['reaction-icon', { filled: reply.user_reaction === 'love' }]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{{ reply.reactions?.love || 0 }}</span>
              </button>

              <!-- Like -->
              <button
                @click="toggleReaction(reply.id, 'like')"
                :class="['reaction-btn', { active: reply.user_reaction === 'like' }]"
                :title="reply.user_reaction === 'like' ? 'Retirer' : 'Ajouter Like'"
              >
                <svg
                  :class="['reaction-icon', { filled: reply.user_reaction === 'like' }]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{{ reply.reactions?.like || 0 }}</span>
              </button>

              <!-- Fire -->
              <button
                @click="toggleReaction(reply.id, 'fire')"
                :class="['reaction-btn', { active: reply.user_reaction === 'fire' }]"
                :title="reply.user_reaction === 'fire' ? 'Retirer' : 'Ajouter Fire'"
              >
                <svg
                  :class="['reaction-icon', { filled: reply.user_reaction === 'fire' }]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <span>{{ reply.reactions?.fire || 0 }}</span>
              </button>

              <!-- Favori -->
              <button
                @click="toggleFavorite(reply.id)"
                :class="['favorite-btn', { active: reply.is_favorited }]"
                :title="reply.is_favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'"
              >
                <svg
                  :class="['reaction-icon', { filled: reply.is_favorited }]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span>{{ reply.favorites_count || 0 }}</span>
              </button>
            </div>

            <span class="reply-date">{{ formatDate(reply.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Créé avec VibeNote ❤️</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMessagesStore } from '@/stores/messages'

const auth = useAuthStore()
const messagesStore = useMessagesStore()

const loading = ref(true)

const publicReplies = computed(() => messagesStore.publicReplies || [])

const avatarLetter = computed(() => {
  const name = auth.user?.profile?.display_name || auth.user?.profile?.username || '?'
  return name.charAt(0).toUpperCase()
})

const totalLove = computed(() => {
  return publicReplies.value.reduce((total, reply) => {
    return total + (reply.reactions?.love || 0)
  }, 0)
})

const totalLike = computed(() => {
  return publicReplies.value.reduce((total, reply) => {
    return total + (reply.reactions?.like || 0)
  }, 0)
})

const totalFire = computed(() => {
  return publicReplies.value.reduce((total, reply) => {
    return total + (reply.reactions?.fire || 0)
  }, 0)
})

const totalFavorites = computed(() => {
  return publicReplies.value.reduce((total, reply) => {
    return total + (reply.favorites_count || 0)
  }, 0)
})

onMounted(async () => {
  await messagesStore.loadPublicReplies()
  loading.value = false
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'Il y a quelques minutes'
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const toggleReaction = async (replyId, reactionType) => {
  await messagesStore.toggleReaction(replyId, reactionType)
}

const toggleFavorite = async (replyId) => {
  await messagesStore.toggleFavorite(replyId)
}
</script>

<style scoped>
.replies-container {
  min-height: 100vh;
  background: #0B0F14;
}

/* Navigation */
.replies-nav {
  background: #121821;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(139, 148, 158, 0.1);
}

.replies-nav h2 {
  font-size: 22px;
  font-weight: 600;
  color: #E6EDF3;
}

.back-btn {
  color: #E6EDF3;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  background: transparent;
  border: 1px solid rgba(139, 148, 158, 0.2);
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #2F81F7;
  box-shadow: 0 0 0 1px rgba(47, 129, 247, 0.4);
}

.spacer {
  width: 120px;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: #8B949E;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #2F81F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Content */
.replies-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Profile Header */
.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  margin: 0 auto 20px;
  border: 4px solid rgba(102, 126, 234, 0.2);
}

.profile-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #E6EDF3;
}

.subtitle {
  font-size: 18px;
  color: #A0AEC0;
}

/* Info Banner */
.info-banner {
  background: #121821;
  border: 2px solid rgba(47, 129, 247, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.info-icon {
  width: 24px;
  height: 24px;
  color: #3B82F6;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-title {
  color: #E6EDF3;
  font-weight: 600;
  margin-bottom: 10px;
}

.info-list {
  color: #A0AEC0;
  font-size: 14px;
  list-style: disc;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* Reactions Stats */
.reactions-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-item {
  background: #121821;
  border: 1px solid rgba(139, 148, 158, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s;
}

.stat-item:hover {
  border-color: rgba(47, 129, 247, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #E6EDF3;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #8B949E;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #121821;
  border-radius: 16px;
  border: 1px solid rgba(139, 148, 158, 0.1);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #A0AEC0;
  margin: 0 auto 20px;
  opacity: 0.5;
}

.empty-text {
  color: #E6EDF3;
  font-size: 18px;
  margin-bottom: 8px;
}

.empty-subtext {
  color: #A0AEC0;
  font-size: 14px;
  margin-bottom: 25px;
}

.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background: #2F81F7;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1e5fd1;
  box-shadow: 0 0 15px rgba(47, 129, 247, 0.3);
}

/* Replies List */
.section-title {
  color: #E6EDF3;
  font-size: 20px;
  margin-bottom: 20px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reply-card {
  background: #121821;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(139, 148, 158, 0.1);
  transition: all 0.2s;
}

.reply-card:hover {
  border-color: rgba(47, 129, 247, 0.3);
}

/* Original Message */
.original-message {
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 2px solid rgba(139, 148, 158, 0.1);
}

.original-label {
  color: #718096;
  font-size: 13px;
  margin-bottom: 8px;
}

.original-text {
  color: #E6EDF3;
  font-style: italic;
  line-height: 1.5;
}

/* Reply Content */
.reply-content {
  margin-bottom: 15px;
}

.reply-content p {
  color: #E6EDF3;
  line-height: 1.6;
}

/* Reply Footer */
.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.reactions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.reaction-btn,
.favorite-btn {
  background: rgba(139, 148, 158, 0.1);
  border: 1px solid rgba(139, 148, 158, 0.2);
  color: #8B949E;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.reaction-btn:hover,
.favorite-btn:hover {
  background: rgba(139, 148, 158, 0.2);
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

.reaction-icon {
  width: 16px;
  height: 16px;
}

.reaction-icon.filled {
  fill: currentColor;
}

.reply-date {
  color: #718096;
  font-size: 13px;
}

/* Footer */
.footer {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .replies-nav {
    padding: 15px 20px;
  }

  .replies-content {
    padding: 20px 15px;
  }

  .reactions-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .reply-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .reactions {
    width: 100%;
  }

  .reaction-btn,
  .favorite-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
