<template>
  <div class="replies-container" :style="{ background: themeGradient }">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="profile" class="replies-content">
      <div class="profile-header">
        <div class="avatar">
          {{ avatarLetter }}
        </div>
        <h1>{{ profile.display_name || profile.username }}</h1>
        <p class="subtitle">Réponses publiques</p>
      </div>

      <div v-if="publicReplies.length === 0" class="empty-state">
        <p>{{ profile.display_name || profile.username }} n'a pas encore de réponses publiques</p>
        <router-link :to="`/${profile.unique_link}`" class="btn-primary">
          Envoyer un message
        </router-link>
      </div>

      <div v-else class="replies-list">
        <div v-for="reply in publicReplies" :key="reply.id" class="reply-card">
          <div class="reply-date">{{ formatDate(reply.created_at) }}</div>
          <p class="reply-content">{{ reply.content }}</p>
          <div class="reply-footer">
            <button @click="likeReply(reply.id)" class="btn-like">
              ❤️ {{ reply.likes_count || 0 }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-link">
      <router-link to="/">Créé avec VibeNote</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const profile = ref(null)
const publicReplies = ref([])
const loading = ref(true)

const username = route.params.username

const avatarLetter = computed(() => {
  const name = profile.value?.display_name || profile.value?.username || '?'
  return name.charAt(0).toUpperCase()
})

const themeGradient = computed(() => {
  const themes = {
    default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    forest: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
    fire: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
    dark: 'linear-gradient(135deg, #434343 0%, #000000 100%)'
  }
  return themes[profile.value?.theme] || themes.default
})

onMounted(async () => {
  await loadProfile()
  await loadPublicReplies()
})

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
  } finally {
    loading.value = false
  }
}

async function loadPublicReplies() {
  if (!profile.value) return

  try {
    const { data, error } = await supabase
      .from('replies')
      .select('*')
      .eq('user_id', profile.value.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    publicReplies.value = data || []
  } catch (error) {
    console.error('Erreur chargement réponses:', error)
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function likeReply(replyId) {
  // Fonctionnalité à implémenter si besoin
  console.log('Like reply:', replyId)
}
</script>

<style scoped>

/* ===========================
   Replies - Dark Theme
=========================== */
.replies-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: #0B0F14;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.replies-content {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
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
  border: 4px solid white;
}

.profile-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #E6EDF3;
}

.subtitle {
  font-size: 18px;
  opacity: 0.9;
  color: #A0AEC0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #121521;
  border-radius: 16px;
}

.empty-state p {
  color: #718096;
  margin-bottom: 20px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reply-card {
  background: #1E2230;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.reply-date {
  font-size: 13px;
  color: #718096;
  margin-bottom: 12px;
}

.reply-content {
  color: #E6EDF3;
  line-height: 1.6;
  font-size: 16px;
  margin-bottom: 15px;
}

.reply-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-like {
  padding: 8px 16px;
  background: #0F121A;
  border: 2px solid #1E2230;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: #E6EDF3;
}

.btn-like:hover {
  background: #2d3748;
  border-color: #667eea;
}

.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
}

.footer-link {
  text-align: center;
  margin-top: 40px;
}

.footer-link a {
  color: #667eea;
  text-decoration: none;
  opacity: 0.9;
}

</style>
