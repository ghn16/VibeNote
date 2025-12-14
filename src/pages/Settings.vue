<template>
  <div class="settings-container">
    <nav class="settings-nav">
      <router-link to="/dashboard" class="back-btn">
        ← Retour
      </router-link>
      <h2>VibeNote</h2>
      <div class="spacer"></div>
    </nav>

    <div class="settings-content">
      <h1>⚙️ Paramètres de sécurité</h1>

      <!-- Liste des expéditeurs bloqués -->
      <div class="settings-card">
        <h3>🚫 Expéditeurs bloqués</h3>
        <p class="subtitle">Gère les personnes que tu as bloquées</p>

        <div v-if="blockedSenders.length === 0" class="empty-state">
          <p>Aucun expéditeur bloqué</p>
        </div>

        <div v-else class="blocked-list">
          <div v-for="block in blockedSenders" :key="block.id" class="blocked-item">
            <div class="blocked-info">
              <span class="blocked-id">Expéditeur #{{ block.id.substring(0, 8) }}</span>
              <span class="blocked-reason">{{ block.reason || 'Aucune raison' }}</span>
              <span class="blocked-date">{{ formatDate(block.created_at) }}</span>
            </div>
            <button @click="unblock(block.id)" class="btn-unblock">
              Débloquer
            </button>
          </div>
        </div>
      </div>

      <!-- Paramètres de confidentialité -->
      <div class="settings-card">
        <h3>🔒 Confidentialité</h3>

        <label class="setting-toggle">
          <input type="checkbox" v-model="allowAnonymous" @change="saveSettings" />
          <span>Autoriser les messages anonymes</span>
        </label>

        <label class="setting-toggle">
          <input type="checkbox" v-model="allowMedia" @change="saveSettings" />
          <span>Autoriser les médias dans les messages (bientôt disponible)</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/services/supabase'

const auth = useAuthStore()
const blockedSenders = ref([])
const allowAnonymous = ref(true)
const allowMedia = ref(true)

onMounted(async () => {
  await loadBlockedSenders()
  loadSettings()
})

async function loadBlockedSenders() {
  const { data } = await supabase
    .from('blocked_senders')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })

  blockedSenders.value = data || []
}

function loadSettings() {
  if (auth.user?.profile) {
    allowAnonymous.value = auth.user.profile.allow_anonymous ?? true
    allowMedia.value = auth.user.profile.allow_media ?? true
  }
}

async function saveSettings() {
  await supabase
    .from('user_profiles')
    .update({
      allow_anonymous: allowAnonymous.value,
      allow_media: allowMedia.value
    })
    .eq('id', auth.user.id)

  await auth.loadUserProfile()
}

async function unblock(blockId) {
  if (!confirm('Débloquer cet expéditeur ?')) return

  const { error } = await supabase
    .from('blocked_senders')
    .delete()
    .eq('id', blockId)

  if (!error) {
    await loadBlockedSenders()
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR')
}
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: #f7fafc;
}

.settings-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-nav h2 {
  font-size: 24px;
}

.back-btn {
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
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

.settings-content {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-content h1 {
  font-size: 32px;
  color: #1a202c;
  margin-bottom: 30px;
}

.settings-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.settings-card h3 {
  font-size: 20px;
  color: #2d3748;
  margin-bottom: 10px;
}

.subtitle {
  color: #718096;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #a0aec0;
}

.blocked-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.blocked-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f7fafc;
  border-radius: 8px;
}

.blocked-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.blocked-id {
  font-weight: 600;
  color: #2d3748;
}

.blocked-reason {
  font-size: 14px;
  color: #718096;
}

.blocked-date {
  font-size: 12px;
  color: #a0aec0;
}

.btn-unblock {
  padding: 8px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-unblock:hover {
  background: #c53030;
}

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
}

.setting-toggle:last-child {
  border-bottom: none;
}

.setting-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.setting-toggle span {
  font-size: 15px;
  color: #2d3748;
}
</style>
