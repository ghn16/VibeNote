<template>
  <div class="admin-container">
    <nav class="admin-nav">
      <router-link to="/dashboard" class="back-btn">
        ← Retour
      </router-link>
      <h2>👨‍💼 Admin Panel</h2>
      <div class="spacer"></div>
    </nav>

    <div class="admin-content">
      <!-- Stats globales -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ adminStore.globalStats.totalUsers }}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📬</div>
          <div class="stat-info">
            <h3>{{ adminStore.globalStats.totalMessages }}</h3>
            <p>Messages</p>
          </div>
        </div>

        <div class="stat-card alert">
          <div class="stat-icon">🚨</div>
          <div class="stat-info">
            <h3>{{ adminStore.globalStats.totalReports }}</h3>
            <p>Signalements</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h3>{{ adminStore.globalStats.activeUsers }}</h3>
            <p>Actifs (7j)</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          @click="currentTab = 'reports'"
          :class="{ active: currentTab === 'reports' }"
          class="tab-btn"
        >
          🚨 Signalements ({{ adminStore.reports.filter(r => r.status === 'pending').length }})
        </button>
        <button
          @click="currentTab = 'users'"
          :class="{ active: currentTab === 'users' }"
          class="tab-btn"
        >
          👥 Utilisateurs
        </button>
        <button
          @click="currentTab = 'words'"
          :class="{ active: currentTab === 'words' }"
          class="tab-btn"
        >
           Mots interdits
        </button>
      </div>

      <!-- Tab Signalements -->
      <div v-if="currentTab === 'reports'" class="tab-content">
        <div v-if="adminStore.reports.length === 0" class="empty-state">
          <p>Aucun signalement</p>
        </div>

        <div v-else class="reports-list">
          <div
            v-for="report in adminStore.reports"
            :key="report.id"
            class="report-card"
            :class="'status-' + report.status"
          >
            <div class="report-header">
              <span class="report-status">{{ getStatusLabel(report.status) }}</span>
              <span class="report-date">{{ formatDate(report.created_at) }}</span>
            </div>

            <div class="report-message">
              <strong>Message signalé :</strong>
              <p>{{ report.messages?.content }}</p>
            </div>

            <div class="report-reason">
              <strong>Raison :</strong>
              <p>{{ report.reason }}</p>
            </div>

            <div class="report-author">
              <strong>Signalé par :</strong>
              {{ report.user_profiles?.username || 'Utilisateur supprimé' }}
            </div>

            <div v-if="report.status === 'pending'" class="report-actions">
              <button @click="resolveReport(report.id)" class="btn-resolve">
                Résoudre
              </button>
              <button @click="dismissReport(report.id)" class="btn-dismiss">
                 Rejeter
              </button>
              <button @click="banMessageAuthor(report)" class="btn-ban">
                Bannir l'auteur
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Utilisateurs -->
      <div v-if="currentTab === 'users'" class="tab-content">
        <div class="users-list">
          <div v-for="user in adminStore.users" :key="user.id" class="user-card">
            <div class="user-info">
              <div class="user-avatar">{{ user.username[0].toUpperCase() }}</div>
              <div>
                <strong>{{ user.username }}</strong>
                <p class="user-meta">
                  {{ user.role }} ·
                  Membre depuis {{ formatDate(user.created_at) }}
                </p>
              </div>
            </div>

            <div class="user-stats">
              <span>📬 {{ user.total_messages_received || 0 }} messages</span>
              <span>👁️ {{ user.profile_views || 0 }} vues</span>
            </div>

            <div class="user-actions">
              <button @click="viewUserProfile(user)" class="btn-view">
                Voir profil
              </button>
              <button
                v-if="user.role !== 'banned'"
                @click="confirmBan(user)"
                class="btn-ban"
              >
                Bannir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Mots interdits -->
      <div v-if="currentTab === 'words'" class="tab-content">
        <div class="add-word-form">
          <input
            v-model="newWord"
            type="text"
            placeholder="Nouveau mot à bloquer"
            @keyup.enter="addWord"
          />
          <select v-model="newWordSeverity">
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
          <button @click="addWord" class="btn-add">Ajouter</button>
        </div>

        <div class="words-list">
          <div
            v-for="word in adminStore.blockedWords"
            :key="word.id"
            class="word-item"
            :class="'severity-' + word.severity"
          >
            <span class="word-text">{{ word.word }}</span>
            <span class="word-severity">{{ getSeverityLabel(word.severity) }}</span>
            <button @click="removeWord(word.id)" class="btn-remove">✕</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const adminStore = useAdminStore()
const auth = useAuthStore()

const currentTab = ref('reports')
const newWord = ref('')
const newWordSeverity = ref('medium')

onMounted(async () => {
  // Vérifier que l'utilisateur est admin
  if (auth.user?.profile?.role !== 'admin') {
    router.push('/dashboard')
    return
  }

  await adminStore.fetchGlobalStats()
  await adminStore.fetchReports()
  await adminStore.fetchUsers()
  await adminStore.fetchBlockedWords()
})

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getStatusLabel(status) {
  const labels = {
    pending: '⏳ En attente',
    reviewed: '👀 Examiné',
    resolved: '✅ Résolu',
    dismissed: '❌ Rejeté'
  }
  return labels[status] || status
}

function getSeverityLabel(severity) {
  const labels = {
    low: '🟢 Basse',
    medium: '🟡 Moyenne',
    high: '🔴 Haute'
  }
  return labels[severity] || severity
}

async function resolveReport(reportId) {
  const result = await adminStore.updateReportStatus(reportId, 'resolved')
  if (result.success) {
    alert('✅ Signalement résolu')
  }
}

async function dismissReport(reportId) {
  const result = await adminStore.updateReportStatus(reportId, 'dismissed')
  if (result.success) {
    alert('❌ Signalement rejeté')
  }
}

async function banMessageAuthor(report) {
  if (!confirm('Bannir définitivement l\'auteur de ce message ?')) return

  const result = await adminStore.banUser(
    report.messages.recipient_id,
    `Message signalé: ${report.reason}`
  )

  if (result.success) {
    alert('🚫 Utilisateur banni')
    await adminStore.updateReportStatus(report.id, 'resolved', 'Auteur banni')
  }
}

function confirmBan(user) {
  const reason = prompt(`Raison du bannissement de ${user.username} :`)
  if (!reason) return

  adminStore.banUser(user.id, reason)
  alert(`🚫 ${user.username} a été banni`)
}

function viewUserProfile(user) {
  window.open(`/${user.unique_link}`, '_blank')
}

async function addWord() {
  if (!newWord.value.trim()) return

  const result = await adminStore.addBlockedWord(newWord.value.trim(), newWordSeverity.value)
  if (result.success) {
    newWord.value = ''
    alert('✅ Mot ajouté à la liste')
  }
}

async function removeWord(wordId) {
  if (!confirm('Supprimer ce mot de la liste ?')) return

  const result = await adminStore.removeBlockedWord(wordId)
  if (result.success) {
    alert('✅ Mot supprimé')
  }
}
</script>

<style scoped>

/* ===============================
   ADMIN — Dark Secure Theme
   =============================== */

.admin-container {
  min-height: 100vh;
  background: #0B0F14;
  color: #E6EDF3;
}

/* Navigation */
.admin-nav {
  background: #121821;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(139, 148, 158, 0.1);
}

.admin-nav h2 {
  font-size: 22px;
  font-weight: 600;
}

.back-btn {
  color: #E6EDF3;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  background: transparent;
  border: 1px solid rgba(139, 148, 158, 0.2);
  transition: border 0.2s, box-shadow 0.2s;
}

.back-btn:hover {
  border-color: #2F81F7;
  box-shadow: 0 0 0 1px rgba(47, 129, 247, 0.4);
}

.spacer {
  width: 120px;
}

/* Content */
.admin-content {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #121821;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid rgba(139, 148, 158, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-card.alert {
  border-color: rgba(63, 185, 80, 0.5);
}

.stat-info h3 {
  font-size: 30px;
  margin-bottom: 5px;
}

.stat-info p {
  color: #8B949E;
  font-size: 14px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(139, 148, 158, 0.15);
}

.tab-btn {
  padding: 14px 22px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #8B949E;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border 0.2s;
}

.tab-btn:hover {
  color: #E6EDF3;
}

.tab-btn.active {
  color: #2F81F7;
  border-bottom-color: #2F81F7;
}

/* Panels */
.tab-content {
  background: #121821;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(139, 148, 158, 0.1);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8B949E;
}

/* Reports & Users */
.reports-list,
.users-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-card,
.user-card,
.word-item {
  padding: 20px;
  border-radius: 12px;
  background: #121821;
  border: 1px solid rgba(139, 148, 158, 0.15);
}

/* Report states */
.report-card.status-pending {
  border-color: rgba(47, 129, 247, 0.4);
}

.report-card.status-resolved {
  border-color: rgba(63, 185, 80, 0.5);
}

/* Report content */
.report-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.report-status {
  font-weight: 600;
  font-size: 14px;
}

.report-date {
  font-size: 13px;
  color: #8B949E;
}

.report-message strong,
.report-reason strong {
  display: block;
  margin-bottom: 5px;
}

.report-message p,
.report-reason p {
  background: #0B0F14;
  padding: 10px;
  border-radius: 6px;
  color: #E6EDF3;
}

.report-author {
  font-size: 14px;
  color: #8B949E;
  margin-bottom: 15px;
}

/* Buttons */
.btn-resolve,
.btn-dismiss,
.btn-ban,
.btn-view,
.btn-add,
.btn-remove {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, box-shadow 0.2s;
}

.btn-view,
.btn-add {
  background: #2F81F7;
  color: #fff;
}

.btn-resolve {
  background: #3FB950;
  color: #fff;
}

.btn-ban {
  background: #da3633;
  color: #fff;
}

.btn-dismiss,
.btn-remove {
  background: #1c2430;
  color: #8B949E;
}

.btn-view:hover,
.btn-add:hover,
.btn-resolve:hover,
.btn-ban:hover {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
}

/* User */
.user-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 20px;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2F81F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-meta,
.user-stats {
  font-size: 13px;
  color: #8B949E;
}

/* Forms */
.add-word-form input,
.add-word-form select {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(139, 148, 158, 0.2);
  background: #0B0F14;
  color: #E6EDF3;
}

/* Responsive */
@media (max-width: 1024px) {
  .user-card {
    grid-template-columns: 1fr;
  }
}


</style>

