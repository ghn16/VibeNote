<template>
  <div class="messages-container">
    <!-- Navigation -->
    <nav class="messages-nav">
      <router-link to="/dashboard" class="back-btn">
        ← Retour
      </router-link>
      <h2>VibeNote</h2>
      <div class="spacer"></div>
    </nav>

    <div class="messages-header">
      <div class="header-content">
        <h1>📬 Mes Messages</h1>
        <div class="stats">
          <span class="stat">
            <strong>{{ messagesStore.messages.length }}</strong> total
          </span>
          <span class="stat unread" v-if="messagesStore.unreadCount > 0">
            <strong>{{ messagesStore.unreadCount }}</strong> non lu{{ messagesStore.unreadCount > 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <div class="filters">
        <button
          @click="currentFilter = 'all'"
          :class="{ active: currentFilter === 'all' }"
          class="filter-btn"
        >
          Tous ({{ messagesStore.messages.length }})
        </button>
        <button
          @click="currentFilter = 'unread'"
          :class="{ active: currentFilter === 'unread' }"
          class="filter-btn"
        >
          Non lus ({{ messagesStore.unreadCount }})
        </button>
        <button
          @click="currentFilter = 'starred'"
          :class="{ active: currentFilter === 'starred' }"
          class="filter-btn"
        >
          ⭐ Favoris ({{ messagesStore.starredMessages.length }})
        </button>
        <button
          @click="currentFilter = 'archived'"
          :class="{ active: currentFilter === 'archived' }"
          class="filter-btn"
        >
          📦 Archivés ({{ messagesStore.archivedMessages.length }})
        </button>
      </div>
    </div>

    <div class="messages-content">
      <div v-if="messagesStore.loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement des messages...</p>
      </div>

      <div v-else-if="filteredMessages.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>{{ emptyMessage }}</h3>
        <p>{{ emptySubMessage }}</p>
        <router-link to="/dashboard" class="btn-primary">
          🏠 Retour au dashboard
        </router-link>
      </div>

      <div v-else class="messages-list">
        <div
          v-for="message in filteredMessages"
          :key="message.id"
          class="message-card"
          :class="{ unread: !message.is_read, flagged: message.is_flagged }"
        >
          <div class="message-header-card">
            <div class="message-meta">
              <span class="message-date">{{ formatDate(message.created_at) }}</span>
              <span v-if="!message.is_read" class="badge-new">Nouveau</span>
              <span v-if="message.is_flagged" class="badge-flagged" title="Message suspect">⚠️</span>
            </div>
            <div class="message-actions">
              <button
                @click="toggleStar(message.id)"
                class="action-btn"
                :class="{ starred: message.is_starred }"
                title="Favori"
              >
                {{ message.is_starred ? '⭐' : '☆' }}
              </button>
              <button
                @click="blockMessageSender(message)"
                class="action-btn block"
                title="Bloquer l'expéditeur"
              >
                🚫
              </button>
              <button
                @click="toggleArchive(message.id)"
                class="action-btn"
                :title="message.is_archived ? 'Désarchiver' : 'Archiver'"
              >
                {{ message.is_archived ? '📤' : '📦' }}
              </button>
              <button
                @click="openReportModal(message)"
                class="action-btn report"
                title="Signaler"
              >
                🚨
              </button>
              <button
                @click="deleteMessage(message.id)"
                class="action-btn delete"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="message-content" @click="markAsRead(message.id)">
            <p>{{ message.content }}</p>
          </div>

          <div class="message-footer">
            <button class="btn-reply" @click="replyTo(message)">
              💬 Répondre
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de réponse -->
    <div v-if="replyingTo" class="modal-overlay" @click="closeReplyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>💬 Répondre au message</h3>
          <button @click="closeReplyModal" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="original-message">
            <strong>Message original :</strong>
            <p>{{ replyingTo.content }}</p>
          </div>

          <textarea
            v-model="replyContent"
            placeholder="Ta réponse..."
            rows="4"
          ></textarea>

          <label class="checkbox-label">
            <input type="checkbox" v-model="replyIsPublic" />
            <span>Rendre cette réponse publique sur mon profil</span>
          </label>
        </div>

        <div class="modal-footer">
          <button @click="closeReplyModal" class="btn-secondary">Annuler</button>
          <button @click="sendReply" class="btn-primary" :disabled="!replyContent.trim()">
            Envoyer la réponse
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de signalement -->
    <div v-if="reportingMessage" class="modal-overlay" @click="closeReportModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🚨 Signaler ce message</h3>
          <button @click="closeReportModal" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="warning-box">
            <p>⚠️ Signale uniquement les messages qui :</p>
            <ul>
              <li>Contiennent du harcèlement ou des menaces</li>
              <li>Sont offensants ou discriminatoires</li>
              <li>Contiennent du spam</li>
              <li>Violent nos conditions d'utilisation</li>
            </ul>
          </div>

          <div class="original-message">
            <strong>Message signalé :</strong>
            <p>{{ reportingMessage.content }}</p>
          </div>

          <div class="form-group">
            <label>Raison du signalement *</label>
            <textarea
              v-model="reportReason"
              placeholder="Explique pourquoi tu signales ce message..."
              rows="4"
              required
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeReportModal" class="btn-secondary">Annuler</button>
          <button @click="submitReport" class="btn-danger" :disabled="!reportReason.trim()">
            Signaler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessagesStore } from '@/stores/messages'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { moderationService } from '@/services/moderation'

const messagesStore = useMessagesStore()
const auth = useAuthStore()

const currentFilter = ref('all')
const replyingTo = ref(null)
const replyContent = ref('')
const replyIsPublic = ref(false)
const reportingMessage = ref(null)
const reportReason = ref('')

onMounted(async () => {
  await messagesStore.fetchMessages()
})

const filteredMessages = computed(() => {
  switch (currentFilter.value) {
    case 'unread':
      return messagesStore.messages.filter(m => !m.is_read && !m.is_archived)
    case 'starred':
      return messagesStore.starredMessages.filter(m => !m.is_archived)
    case 'archived':
      return messagesStore.archivedMessages
    default:
      return messagesStore.activeMessages
  }
})

const emptyMessage = computed(() => {
  switch (currentFilter.value) {
    case 'unread':
      return 'Aucun message non lu'
    case 'starred':
      return 'Aucun favori'
    case 'archived':
      return 'Aucun message archivé'
    default:
      return 'Aucun message reçu'
  }
})

const emptySubMessage = computed(() => {
  if (currentFilter.value === 'all') {
    return 'Partage ton lien pour recevoir des messages anonymes !'
  }
  return ''
})

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

async function markAsRead(messageId) {
  await messagesStore.markAsRead(messageId)
}

async function toggleStar(messageId) {
  await messagesStore.toggleStar(messageId)
}

async function toggleArchive(messageId) {
  await messagesStore.toggleArchive(messageId)
}

async function deleteMessage(messageId) {
  if (confirm('Supprimer ce message définitivement ?')) {
    await messagesStore.deleteMessage(messageId)
  }
}

function replyTo(message) {
  replyingTo.value = message
  replyContent.value = ''
  replyIsPublic.value = false

  if (!message.is_read) {
    markAsRead(message.id)
  }
}

async function sendReply() {
  if (!replyContent.value.trim() || !replyingTo.value) return

  try {
    const { error } = await supabase
      .from('replies')
      .insert([{
        message_id: replyingTo.value.id,
        user_id: auth.user.id,
        content: replyContent.value.trim(),
        is_public: replyIsPublic.value
      }])

    if (error) throw error

    await supabase
      .from('messages')
      .update({ is_replied: true })
      .eq('id', replyingTo.value.id)

    alert('✅ Réponse envoyée !')
    closeReplyModal()
    await messagesStore.fetchMessages()
  } catch (error) {
    console.error('Erreur envoi réponse:', error)
    alert('❌ Erreur lors de l\'envoi')
  }
}

function closeReplyModal() {
  replyingTo.value = null
  replyContent.value = ''
  replyIsPublic.value = false
}

// Fonctions de signalement
function openReportModal(message) {
  reportingMessage.value = message
  reportReason.value = ''
}

function closeReportModal() {
  reportingMessage.value = null
  reportReason.value = ''
}

async function submitReport() {
  if (!reportReason.value.trim()) {
    alert('Merci de préciser la raison du signalement')
    return
  }

  const result = await moderationService.reportMessage(
    reportingMessage.value.id,
    reportReason.value
  )

  if (result.success) {
    alert('✅ Message signalé. Nous allons l\'examiner.')

    // Proposer de bloquer l'expéditeur
    if (confirm('Veux-tu aussi bloquer cet expéditeur pour qu\'il ne puisse plus t\'envoyer de messages ?')) {
      await blockMessageSender(reportingMessage.value)
    }

    closeReportModal()
  } else {
    alert('❌ Erreur lors du signalement')
  }
}

async function blockMessageSender(message) {
  if (!message.sender_ip && !message.sender_fingerprint) {
    alert('Impossible de bloquer cet expéditeur (données manquantes)')
    return
  }

  const result = await moderationService.blockSender(
    auth.user.id,
    message.sender_ip,
    message.sender_fingerprint,
    'Bloqué depuis les messages',
    null // Blocage permanent
  )

  if (result.success) {
    alert('✅ Expéditeur bloqué avec succès. Il ne pourra plus t\'envoyer de messages.')
  } else {
    alert('❌ Erreur lors du blocage')
  }
}
</script>

<style scoped>
.messages-container {
  min-height: 100vh;
  background: #f7fafc;
}

.messages-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.messages-nav h2 {
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
  border-color: white;
}

.spacer {
  width: 120px;
}

.messages-header {
  background: white;
  padding: 30px 40px;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-content h1 {
  font-size: 28px;
  color: #2d3748;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat {
  font-size: 14px;
  color: #718096;
}

.stat.unread {
  color: #667eea;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #cbd5e0;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.messages-content {
  padding: 30px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  color: #2d3748;
  margin-bottom: 10px;
}

.empty-state p {
  color: #718096;
  margin-bottom: 30px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  border: 2px solid transparent;
}

.message-card.unread {
  border-color: #667eea;
  background: #f7faff;
}

.message-card.flagged {
  border-color: #f59e0b;
  background: #fffbeb;
}

.message-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-date {
  font-size: 13px;
  color: #a0aec0;
}

.badge-new {
  background: #667eea;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.badge-flagged {
  background: #fbbf24;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.message-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f7fafc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.action-btn.starred {
  background: #fef5e7;
}

.action-btn.block:hover {
  background: #fff5f5;
  color: #c53030;
}

.action-btn.report:hover {
  background: #fff5f5;
  color: #e53e3e;
}

.action-btn.delete:hover {
  background: #fee;
  color: #c33;
}

.message-content {
  padding: 15px;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 15px;
  cursor: pointer;
}

.message-content p {
  color: #2d3748;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-reply {
  padding: 10px 20px;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reply:hover {
  background: #667eea;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 25px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 20px;
  color: #2d3748;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f7fafc;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  color: #718096;
}

.close-btn:hover {
  background: #e2e8f0;
}

.modal-body {
  padding: 25px;
}

.original-message {
  background: #f7fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 3px solid #667eea;
}

.original-message strong {
  color: #4a5568;
  font-size: 13px;
  display: block;
  margin-bottom: 8px;
}

.original-message p {
  color: #2d3748;
  margin: 0;
  font-style: italic;
}

.modal-body textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 15px;
}

.modal-body textarea:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 14px;
  color: #4a5568;
}

.warning-box {
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.warning-box p {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 10px;
}

.warning-box ul {
  margin-left: 20px;
  color: #78350f;
}

.warning-box li {
  margin-bottom: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f7fafc;
}

.btn-danger {
  padding: 12px 24px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background: #c53030;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .messages-nav {
    padding: 15px 20px;
  }

  .messages-header {
    padding: 20px;
  }

  .messages-content {
    padding: 20px;
  }

  .message-actions {
    flex-wrap: wrap;
  }

  .modal-content {
    margin: 10px;
  }
}
</style>
