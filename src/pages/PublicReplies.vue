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
.replies-container {
  min-height: 100vh;
  padding: 40px 20px;
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
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
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
  background: rgba(255, 255, 255, 0.3);
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
}

.subtitle {
  font-size: 18px;
  opacity: 0.9;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
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
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.reply-date {
  font-size: 13px;
  color: #a0aec0;
  margin-bottom: 12px;
}

.reply-content {
  color: #2d3748;
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
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-like:hover {
  background: #fee;
  border-color: #fc8181;
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
  color: white;
  text-decoration: none;
  opacity: 0.8;
}
</style>
