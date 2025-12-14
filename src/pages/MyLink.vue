<template>
  <div class="mylink-container">
    <!-- Navigation -->
    <nav class="mylink-nav">
      <router-link to="/dashboard" class="back-btn">
        ← Retour
      </router-link>
      <h2>VibeNote</h2>
      <div class="spacer"></div>
    </nav>

    <div class="mylink-content">
      <div class="editor-section">
        <h1>🎨 Personnalise ton profil</h1>
        <p class="subtitle">Rends ton lien unique et attrayant</p>

        <div class="form-card">
          <div class="form-group">
            <label>Nom d'affichage</label>
            <input
              v-model="displayName"
              type="text"
              placeholder="John Doe"
              maxlength="50"
            />
            <span class="hint">C'est le nom que les gens verront</span>
          </div>

          <div class="form-group">
            <label>Bio</label>
            <textarea
              v-model="bio"
              rows="3"
              placeholder="Parle un peu de toi..."
              maxlength="150"
            ></textarea>
            <span class="hint">{{ bio.length }}/150 caractères</span>
          </div>

          <div class="form-group">
            <label>Thème</label>
            <div class="theme-selector">
              <div
                v-for="themeOption in themes"
                :key="themeOption.value"
                @click="theme = themeOption.value"
                class="theme-option"
                :class="{ active: theme === themeOption.value }"
                :style="{ background: themeOption.gradient }"
              >
                <span v-if="theme === themeOption.value">✓</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="saveProfile" :disabled="saving" class="btn-save">
              {{ saving ? 'Enregistrement...' : '💾 Enregistrer' }}
            </button>
          </div>

          <div v-if="saveMessage" class="save-message" :class="saveSuccess ? 'success' : 'error'">
            {{ saveMessage }}
          </div>
        </div>

        <!-- Partage -->
        <div class="share-card">
          <h3>🔗 Ton lien unique</h3>
          <div class="link-display">
            <input :value="uniqueLink" readonly ref="linkInput" />
            <button @click="copyLink" class="btn-copy">
              {{ copied ? '✅' : '📋' }}
            </button>
          </div>

          <div class="share-buttons">
            <a :href="whatsappShare" target="_blank" class="share-btn whatsapp">
              WhatsApp
            </a>
            <a :href="twitterShare" target="_blank" class="share-btn twitter">
              Twitter
            </a>
            <a :href="facebookShare" target="_blank" class="share-btn facebook">
              Facebook
            </a>
          </div>
        </div>
      </div>

      <!-- Prévisualisation -->
      <div class="preview-section">
        <h3>📱 Aperçu</h3>
        <div class="preview-card">
          <div class="preview-content" :style="{ background: currentTheme.gradient }">
            <div class="preview-inner">
              <div class="preview-avatar">
                {{ (displayName || username).charAt(0).toUpperCase() }}
              </div>
              <h2>{{ displayName || username }}</h2>
              <p v-if="bio">{{ bio }}</p>
              <p v-else class="preview-placeholder">Ta bio apparaîtra ici</p>

              <div class="preview-form">
                <div class="preview-textarea">
                  Envoie-moi un message anonyme...
                </div>
                <div class="preview-button">Envoyer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/services/supabase'

const auth = useAuthStore()

const displayName = ref('')
const bio = ref('')
const theme = ref('default')
const saving = ref(false)
const saveMessage = ref('')
const saveSuccess = ref(false)
const copied = ref(false)
const linkInput = ref(null)

const username = computed(() => auth.user?.profile?.username || '')

const themes = [
  { value: 'default', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { value: 'sunset', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { value: 'ocean', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { value: 'forest', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
  { value: 'fire', gradient: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' },
  { value: 'dark', gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)' }
]

const currentTheme = computed(() => {
  return themes.find(t => t.value === theme.value) || themes[0]
})

const uniqueLink = computed(() => {
  const link = auth.user?.profile?.unique_link
  return link ? `${window.location.origin}/${link}` : ''
})

const whatsappShare = computed(() => {
  return `https://wa.me/?text=Envoie-moi un message anonyme ! ${uniqueLink.value}`
})

const twitterShare = computed(() => {
  return `https://twitter.com/intent/tweet?text=Envoie-moi un message anonyme !&url=${encodeURIComponent(uniqueLink.value)}`
})

const facebookShare = computed(() => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(uniqueLink.value)}`
})

onMounted(() => {
  loadProfile()
})

function loadProfile() {
  if (auth.user?.profile) {
    displayName.value = auth.user.profile.display_name || ''
    bio.value = auth.user.profile.bio || ''
    theme.value = auth.user.profile.theme || 'default'
  }
}

async function saveProfile() {
  saving.value = true
  saveMessage.value = ''

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        display_name: displayName.value.trim() || null,
        bio: bio.value.trim() || null,
        theme: theme.value
      })
      .eq('id', auth.user.id)

    if (error) throw error

    // Recharger le profil
    await auth.loadUserProfile()

    saveMessage.value = '✅ Profil enregistré avec succès !'
    saveSuccess.value = true

    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
    saveMessage.value = '❌ Erreur lors de la sauvegarde'
    saveSuccess.value = false
  } finally {
    saving.value = false
  }
}

function copyLink() {
  if (linkInput.value) {
    linkInput.value.select()
    document.execCommand('copy')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<style scoped>
/* ===========================
   MyLink Dark Theme
=========================== */
.mylink-container {
  min-height: 100vh;
  background: #0B0F14;
}

/* ---------------------------
   Navigation
--------------------------- */
.mylink-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.mylink-nav h2 {
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
  width: 120px;
}

/* ---------------------------
   Content Layout
--------------------------- */
.mylink-content {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
}

.editor-section h1 {
  font-size: 32px;
  color: #E6EDF3;
  margin-bottom: 10px;
}

.subtitle {
  color: #A0AEC0;
  margin-bottom: 30px;
}

/* ---------------------------
   Form & Share Cards
--------------------------- */
.form-card, .share-card {
  background: #121521;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #E6EDF3;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #1E2230;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  background: #0F121A;
  color: #E6EDF3;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.hint {
  display: block;
  font-size: 13px;
  color: #718096;
  margin-top: 5px;
}

/* ---------------------------
   Theme Selector
--------------------------- */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.theme-option {
  height: 60px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  border: 3px solid transparent;
}

.theme-option:hover {
  transform: scale(1.05);
}

.theme-option.active {
  border-color: white;
  box-shadow: 0 0 0 3px #667eea;
}

/* ---------------------------
   Form Actions & Messages
--------------------------- */
.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-message {
  margin-top: 15px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.save-message.success {
  background: #1F3D2F;
  color: #48BB78;
}

.save-message.error {
  background: #3C1F1F;
  color: #F56565;
}

/* ---------------------------
   Share Section
--------------------------- */
.share-card h3 {
  margin-bottom: 15px;
  color: #E6EDF3;
}

.link-display {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.link-display input {
  flex: 1;
  padding: 12px;
  border: 2px solid #1E2230;
  border-radius: 8px;
  background: #0F121A;
  color: #E6EDF3;
}

.btn-copy {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
}

.share-buttons {
  display: flex;
  gap: 10px;
}

.share-btn {
  flex: 1;
  padding: 10px;
  text-align: center;
  text-decoration: none;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.share-btn.whatsapp { background: #25D366; }
.share-btn.twitter { background: #1DA1F2; }
.share-btn.facebook { background: #4267B2; }

/* ---------------------------
   Preview Section
--------------------------- */
.preview-section h3 {
  font-size: 20px;
  color: #E6EDF3;
  margin-bottom: 20px;
}

.preview-card {
  background: #121521;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  overflow: hidden;
  position: sticky;
  top: 20px;
}

.preview-content {
  padding: 40px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-inner {
  background: #1A1F26;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  width: 100%;
}

.preview-avatar {
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

.preview-inner h2 {
  font-size: 24px;
  color: #E6EDF3;
  margin-bottom: 10px;
}

.preview-inner p {
  color: #A0AEC0;
  margin-bottom: 20px;
}

.preview-placeholder {
  font-style: italic;
  opacity: 0.6;
}

.preview-form {
  margin-top: 20px;
}

.preview-textarea {
  background: #0F121A;
  padding: 15px;
  border-radius: 8px;
  color: #E6EDF3;
  font-size: 14px;
  margin-bottom: 10px;
}

.preview-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
}

/* ---------------------------
   Responsive
--------------------------- */
@media (max-width: 1024px) {
  .mylink-content {
    grid-template-columns: 1fr;
  }
  .preview-section {
    order: -1;
  }
}


</style>
