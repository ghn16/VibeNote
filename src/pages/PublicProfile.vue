<template>
  <div class="public-profile-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="profile" class="profile-card">
      <div class="profile-header">
        <div class="avatar">
          {{ profile.display_name?.[0]?.toUpperCase() || profile.username[0].toUpperCase() }}
        </div>
        <h1>{{ profile.display_name || profile.username }}</h1>
        <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>
      </div>

      <div class="message-form">
        <h2>📩 Envoie-moi un message anonyme</h2>
        <textarea
          v-model="messageContent"
          placeholder="Écris quelque chose d'anonyme..."
          rows="6"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ messageContent.length }}/500</div>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">✅ Message envoyé !</div>

        <button
          @click="sendMessage"
          :disabled="!messageContent.trim() || sending"
          class="btn-send"
        >
          {{ sending ? 'Envoi...' : 'Envoyer anonymement' }}
        </button>
      </div>

      <div class="footer-note">
        <p>🔒 Ton identité restera 100% anonyme</p>
      </div>
    </div>

    <div v-else class="error-card">
      <h2>❌ Utilisateur introuvable</h2>
      <p>Ce lien n'existe pas ou n'est plus actif.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
import { useMessagesStore } from '@/stores/messages'

const route = useRoute()
const messagesStore = useMessagesStore()

const profile = ref(null)
const loading = ref(true)
const messageContent = ref('')
const sending = ref(false)
const error = ref('')
const success = ref(false)

// Récupérer le lien unique depuis l'URL
const uniqueLink = route.params.link

onMounted(async () => {
  await loadProfile()

  // Incrémenter les vues de profil si le profil existe
  if (profile.value) {
    await incrementProfileView()
  }
})

async function loadProfile() {
  try {
    const { data, error: err } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, bio, avatar_url')
      .eq('unique_link', uniqueLink)
      .single()

    if (err) throw err
    profile.value = data
  } catch (err) {
    console.error('Erreur chargement profil:', err)
    profile.value = null
  } finally {
    loading.value = false
  }
}

async function incrementProfileView() {
  try {
    // Vérifier si la fonction RPC existe
    const { error } = await supabase.rpc('increment_profile_view', {
      profile_link: uniqueLink
    })

    // Si la fonction n'existe pas, on l'ignore silencieusement
    if (error && !error.message.includes('function')) {
      console.warn('Erreur incrémentation vues:', error)
    }
  } catch (err) {
    // Ignorer les erreurs de vues
    console.warn('Fonction increment_profile_view non disponible')
  }
}

async function sendMessage() {
  if (!messageContent.value.trim()) return

  error.value = ''
  success.value = false
  sending.value = true

  try {
    const result = await messagesStore.sendAnonymousMessage(
      uniqueLink,
      messageContent.value.trim()
    )

    if (result.success) {
      success.value = true
      messageContent.value = ''
      setTimeout(() => {
        success.value = false
      }, 3000)
    } else {
      error.value = result.error || 'Erreur lors de l\'envoi'
    }
  } catch (err) {
    error.value = 'Erreur lors de l\'envoi du message'
    console.error('Erreur sendMessage:', err)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
/* ===========================
   Public Profile - Dark Theme
=========================== */
.public-profile-container {
  min-height: 100vh;
  background: #0B0F14;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.profile-card, .error-card {
  background: #121521;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  margin: 0 auto 15px;
}

.profile-header h1 {
  font-size: 28px;
  color: #E6EDF3;
  margin-bottom: 10px;
}

.bio {
  color: #A0AEC0;
  font-size: 16px;
}

.message-form h2 {
  color: #E6EDF3;
  font-size: 20px;
  margin-bottom: 15px;
}

textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #1E2230;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 8px;
  background: #0F121A;
  color: #E6EDF3;
}

textarea:focus {
  outline: none;
  border-color: #667eea;
}

.char-count {
  text-align: right;
  font-size: 13px;
  color: #718096;
  margin-bottom: 15px;
}

.btn-send {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #3C1F1F;
  color: #F56565;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.success-message {
  background: #1F3D2F;
  color: #48BB78;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
}

.footer-note {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #1E2230;
}

.footer-note p {
  color: #718096;
  font-size: 14px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
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

.error-card {
  text-align: center;
  padding: 60px 40px;
}

.error-card h2 {
  color: #E6EDF3;
  margin-bottom: 15px;
}

.error-card p {
  color: #A0AEC0;
  font-size: 16px;
}
</style>
