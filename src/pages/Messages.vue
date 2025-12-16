<template>
  <div class="messages-container">
    <!-- Navigation -->
    <nav class="messages-nav">
      <router-link to="/dashboard" class="back-btn">← Retour</router-link>
      <h2>VibeNote</h2>
      <div class="spacer"></div>
    </nav>

    <div class="messages-header">
      <div class="header-content">
        <h1>Messages</h1>
        <div class="stats">
          <span class="stat"><strong>{{ messagesStore.messages.length }}</strong> total</span>
          <span class="stat unread" v-if="messagesStore.unreadCount > 0">
            <strong>{{ messagesStore.unreadCount }}</strong> non lu{{ messagesStore.unreadCount > 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <div class="filters">
        <button @click="currentFilter = 'all'" :class="{ active: currentFilter === 'all' }" class="filter-btn">
          Tous
        </button>
        <button @click="currentFilter = 'unread'" :class="{ active: currentFilter === 'unread' }" class="filter-btn">
          Non lus
          <span v-if="messagesStore.unreadCount > 0" class="filter-badge">{{ messagesStore.unreadCount }}</span>
        </button>
        <button @click="currentFilter = 'starred'" :class="{ active: currentFilter === 'starred' }" class="filter-btn">
          Favoris
          <span v-if="messagesStore.starredMessages.length > 0" class="filter-badge">{{ messagesStore.starredMessages.length }}</span>
        </button>
        <button @click="currentFilter = 'archived'" :class="{ active: currentFilter === 'archived' }" class="filter-btn">
          Archivés
        </button>
      </div>
    </div>

    <div class="messages-content">
      <div v-if="messagesStore.loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <div v-else-if="filteredMessages.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <h3>{{ emptyMessage }}</h3>
        <p>{{ emptySubMessage }}</p>
        <router-link to="/dashboard" class="btn-primary">Retour au dashboard</router-link>
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
              <span class="message-date">{{ getRelativeTime(message) }}</span>
              <span v-if="!message.is_read" class="badge-new">Nouveau</span>
              <span v-if="message.is_starred" class="badge-star">★</span>
              <span v-if="message.is_flagged" class="badge-flagged">Signalé</span>
            </div>

            <!-- Menu kebab (3 points) -->
            <div class="message-actions-wrapper">
              <button
                @click.stop="toggleActionsMenu(message.id)"
                class="kebab-btn"
                :class="{ active: openMenuId === message.id }"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="12" cy="19" r="2"/>
                </svg>
              </button>

              <!-- Menu déroulant -->
              <div v-if="openMenuId === message.id" class="actions-menu">
                <button @click.stop="toggleStar(message.id); closeMenu()" class="menu-item">
                  <svg viewBox="0 0 24 24" :fill="message.is_starred ? 'currentColor' : 'none'" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  {{ message.is_starred ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
                </button>

                <button @click.stop="toggleArchive(message.id); closeMenu()" class="menu-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                  </svg>
                  {{ message.is_archived ? 'Désarchiver' : 'Archiver' }}
                </button>

                <button @click.stop="blockMessageSender(message); closeMenu()" class="menu-item danger">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                  Bloquer l'expéditeur
                </button>

                <button @click.stop="openReportModal(message); closeMenu()" class="menu-item danger">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  Signaler
                </button>

                <button @click.stop="deleteMessage(message.id); closeMenu()" class="menu-item danger">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          <div class="message-content" @click="markAsRead(message.id)">
            <p>{{ message.content }}</p>
          </div>

          <div class="message-footer">
            <button class="btn-reply" @click="replyTo(message)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
              </svg>
              Répondre
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de réponse -->
    <div v-if="replyingTo" class="modal-overlay" @click="closeReplyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Répondre au message</h3>
          <button @click="closeReplyModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="original-message">
            <strong>Message original :</strong>
            <p>{{ replyingTo.content }}</p>
          </div>

          <textarea v-model="replyContent" placeholder="Ta réponse..." rows="4"></textarea>

          <label class="checkbox-label">
            <input type="checkbox" v-model="replyIsPublic" />
            <span>Rendre cette réponse publique sur mon profil</span>
          </label>
        </div>

        <div class="modal-footer">
          <button @click="closeReplyModal" class="btn-secondary">Annuler</button>
          <button @click="sendReply" class="btn-primary" :disabled="!replyContent.trim()">
            Envoyer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de signalement -->
    <div v-if="reportingMessage" class="modal-overlay" @click="closeReportModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Signaler ce message</h3>
          <button @click="closeReportModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
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
            <textarea v-model="reportReason" placeholder="Explique pourquoi tu signales ce message..." rows="4" required></textarea>
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

    <!-- Overlay pour fermer le menu au clic extérieur -->
    <div v-if="openMenuId" @click="closeMenu" class="menu-overlay"></div>
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
const openMenuId = ref(null) // ID du message dont le menu est ouvert

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
    case 'unread': return 'Aucun message non lu'
    case 'starred': return 'Aucun favori'
    case 'archived': return 'Aucun message archivé'
    default: return 'Aucun message reçu'
  }
})

const emptySubMessage = computed(() => {
  if (currentFilter.value === 'all') {
    return 'Partage ton lien pour recevoir des messages anonymes !'
  }
  return ''
})

// Menu actions
function toggleActionsMenu(messageId) {
  openMenuId.value = openMenuId.value === messageId ? null : messageId
}

function closeMenu() {
  openMenuId.value = null
}

function getRelativeTime(message) {
  const timestamp = message.created_at
  if (!timestamp) return 'Pas de date'

  const dateStr = timestamp.replace(' ', 'T')
  const messageDate = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - messageDate.getTime()

  if (diffMs < 0) return "À l'instant"

  const diffSeconds = Math.floor(diffMs / 1000)
  if (diffSeconds < 60) return "À l'instant"

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Il y a ${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return messageDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
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
  if (!message.is_read) markAsRead(message.id)
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
    if (confirm('Veux-tu aussi bloquer cet expéditeur ?')) {
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
    null
  )

  if (result.success) {
    alert('✅ Expéditeur bloqué avec succès.')
  } else {
    alert('❌ Erreur lors du blocage')
  }
}
</script>

<style scoped>
.messages-container {
  min-height: 100vh;
  background: #0B0F14;
}

.messages-nav {
  background: #121821;
  border-bottom: 1px solid rgba(139, 148, 158, 0.1);
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.messages-nav h2 {
  font-size: 20px;
  font-weight: 700;
  color: #E6EDF3;
}

.back-btn {
  color: #E6EDF3;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid rgba(139, 148, 158, 0.3);
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #2F81F7;
  color: #2F81F7;
}

.spacer {
  width: 120px;
}

.messages-header {
  background: #121821;
  padding: 24px 40px;
  border-bottom: 1px solid rgba(139, 148, 158, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-content h1 {
  font-size: 24px;
  color: #E6EDF3;
  font-weight: 700;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat {
  font-size: 13px;
  color: #8B949E;
}

.stat.unread {
  color: #2F81F7;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid rgba(139, 148, 158, 0.2);
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #8B949E;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-btn:hover {
  border-color: rgba(47, 129, 247, 0.3);
  color: #E6EDF3;
}

.filter-btn.active {
  background: rgba(47, 129, 247, 0.15);
  border-color: rgba(47, 129, 247, 0.3);
  color: #2F81F7;
}

.filter-badge {
  background: #2F81F7;
  color: #E6EDF3;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.messages-content {
  padding: 24px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-card {
  background: #121821;
  border-radius: 10px;
  padding: 18px;
  border: 1px solid rgba(139, 148, 158, 0.1);
  transition: all 0.2s;
}

.message-card:hover {
  border-color: rgba(47, 129, 247, 0.2);
}

.message-card.unread {
  border-color: rgba(47, 129, 247, 0.5);
  background: rgba(47, 129, 247, 0.05);
}

.message-card.flagged {
  border-color: rgba(255, 94, 94, 0.5);
  background: rgba(255, 94, 94, 0.05);
}

.message-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-date {
  font-size: 13px;
  color: #8B949E;
}

.badge-new {
  background: #2F81F7;
  color: #E6EDF3;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.badge-star {
  color: #FFD700;
  font-size: 14px;
}

.badge-flagged {
  background: rgba(255, 94, 94, 0.2);
  color: #FF5E5E;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

/* Menu kebab */
.message-actions-wrapper {
  position: relative;
}

.kebab-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #8B949E;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.kebab-btn svg {
  width: 20px;
  height: 20px;
}

.kebab-btn:hover,
.kebab-btn.active {
  background: rgba(139, 148, 158, 0.1);
  color: #E6EDF3;
}

.actions-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: #1E2230;
  border: 1px solid rgba(139, 148, 158, 0.2);
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: #E6EDF3;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
}

.menu-item svg {
  width: 18px;
  height: 18px;
  color: #8B949E;
  flex-shrink: 0;
}

.menu-item:hover {
  background: rgba(47, 129, 247, 0.1);
  color: #2F81F7;
}

.menu-item:hover svg {
  color: #2F81F7;
}

.menu-item.danger:hover {
  background: rgba(255, 94, 94, 0.1);
  color: #FF5E5E;
}

.menu-item.danger:hover svg {
  color: #FF5E5E;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
}

.message-content {
  padding: 14px;
  background: rgba(11, 15, 20, 0.5);
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
}

.message-content p {
  color: #E6EDF3;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 15px;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-reply {
  padding: 8px 16px;
  background: rgba(47, 129, 247, 0.1);
  border: 1px solid rgba(47, 129, 247, 0.3);
  color: #2F81F7;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-reply svg {
  width: 16px;
  height: 16px;
}

.btn-reply:hover {
  background: #2F81F7;
  color: #E6EDF3;
  box-shadow: 0 0 12px rgba(47, 129, 247, 0.2);
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #121821;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(139, 148, 158, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid rgba(139, 148, 158, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 18px;
  color: #E6EDF3;
  font-weight: 600;
  margin: 0;
}

/* Suite et complétion du CSS avec responsivité améliorée */

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #8B949E;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.close-btn:hover {
  background: rgba(139, 148, 158, 0.1);
  color: #E6EDF3;
}

.modal-body {
  padding: 20px;
}

.original-message {
  background: rgba(11, 15, 20, 0.5);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 3px solid #2F81F7;
}

.original-message strong {
  color: #2F81F7;
  font-size: 13px;
  display: block;
  margin-bottom: 8px;
}

.original-message p {
  color: #E6EDF3;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
}

.warning-box {
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.warning-box p {
  color: #FFA500;
  font-weight: 600;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.warning-box ul {
  margin: 0;
  padding-left: 20px;
  color: #E6EDF3;
  font-size: 13px;
}

.warning-box li {
  margin-bottom: 6px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #E6EDF3;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

textarea {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: rgba(11, 15, 20, 0.5);
  border: 1px solid rgba(139, 148, 158, 0.2);
  border-radius: 8px;
  padding: 12px;
  color: #E6EDF3;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #2F81F7;
  box-shadow: 0 0 0 3px rgba(47, 129, 247, 0.1);
}

textarea::placeholder {
  color: #8B949E;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  color: #E6EDF3;
  font-size: 14px;
  margin-top: 12px;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #2F81F7;
  flex-shrink: 0;
}

.checkbox-label span {
  line-height: 1.5;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid rgba(139, 148, 158, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #2F81F7;
  color: #E6EDF3;
}

.btn-primary:hover:not(:disabled) {
  background: #2666C4;
  box-shadow: 0 0 12px rgba(47, 129, 247, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #8B949E;
  border: 1px solid rgba(139, 148, 158, 0.3);
}

.btn-secondary:hover {
  border-color: #E6EDF3;
  color: #E6EDF3;
}

.btn-danger {
  background: #FF5E5E;
  color: #E6EDF3;
}

.btn-danger:hover:not(:disabled) {
  background: #E04E4E;
  box-shadow: 0 0 12px rgba(255, 94, 94, 0.3);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading state */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(47, 129, 247, 0.1);
  border-top-color: #2F81F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #8B949E;
  font-size: 14px;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #8B949E;
  opacity: 0.5;
  margin-bottom: 24px;
}

.empty-state h3 {
  color: #E6EDF3;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #8B949E;
  font-size: 14px;
  margin: 0 0 24px 0;
  max-width: 400px;
}

.empty-state .btn-primary {
  text-decoration: none;
  display: inline-block;
}

/* Responsive - Tablettes */
@media (max-width: 968px) {
  .messages-nav {
    padding: 16px 24px;
  }

  .messages-header {
    padding: 20px 24px;
  }

  .messages-content {
    padding: 20px 24px;
  }
}

/* Responsive - Mobile Large */
@media (max-width: 768px) {
  .messages-nav {
    padding: 12px 16px;
  }

  .messages-nav h2 {
    font-size: 18px;
  }

  .back-btn {
    padding: 6px 12px;
    font-size: 14px;
  }

  .spacer {
    width: auto;
    min-width: 60px;
  }

  .messages-header {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .header-content h1 {
    font-size: 22px;
  }

  .stats {
    width: 100%;
    justify-content: flex-start;
  }

  .filters {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    flex-wrap: nowrap;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }

  .filters::-webkit-scrollbar {
    height: 4px;
  }

  .filters::-webkit-scrollbar-thumb {
    background: rgba(139, 148, 158, 0.3);
    border-radius: 2px;
  }

  .filter-btn {
    font-size: 13px;
    padding: 8px 14px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .messages-content {
    padding: 16px;
  }

  .message-card {
    padding: 14px;
  }

  .message-header-card {
    flex-wrap: wrap;
    gap: 8px;
  }

  .message-meta {
    flex: 1;
    min-width: 0;
  }

  .message-date {
    font-size: 12px;
  }

  .actions-menu {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    right: auto;
    margin-top: 0;
    width: calc(100% - 32px);
    max-width: 320px;
  }

  .menu-overlay {
    background: rgba(0, 0, 0, 0.6);
  }

  .message-content p {
    font-size: 14px;
  }

  .modal-overlay {
    padding: 16px;
    align-items: flex-end;
  }

  .modal-content {
    max-height: 85vh;
    width: 100%;
    margin: 0;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 16px;
    gap: 8px;
  }

  .modal-footer .btn-primary,
  .modal-footer .btn-secondary,
  .modal-footer .btn-danger {
    flex: 1;
    min-width: 0;
  }
}

/* Responsive - Mobile Small */
@media (max-width: 480px) {
  .messages-nav {
    padding: 12px;
  }

  .messages-nav h2 {
    font-size: 16px;
  }

  .back-btn {
    padding: 6px 10px;
    font-size: 13px;
  }

  .spacer {
    display: none;
  }

  .messages-header {
    padding: 12px;
  }

  .header-content h1 {
    font-size: 20px;
  }

  .stat {
    font-size: 12px;
  }

  .filter-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .filter-badge {
    font-size: 10px;
    padding: 1px 5px;
  }

  .messages-content {
    padding: 12px;
  }

  .messages-list {
    gap: 12px;
  }

  .message-card {
    padding: 12px;
  }

  .message-date {
    font-size: 11px;
  }

  .badge-new,
  .badge-flagged {
    font-size: 10px;
    padding: 2px 6px;
  }

  .badge-star {
    font-size: 13px;
  }

  .kebab-btn {
    width: 28px;
    height: 28px;
  }

  .kebab-btn svg {
    width: 18px;
    height: 18px;
  }

  .message-content {
    padding: 12px;
  }

  .message-content p {
    font-size: 13px;
    line-height: 1.5;
  }

  .btn-reply {
    padding: 6px 12px;
    font-size: 12px;
  }

  .btn-reply svg {
    width: 14px;
    height: 14px;
  }

  .modal-overlay {
    padding: 12px;
  }

  .modal-header {
    padding: 12px;
  }

  .modal-header h3 {
    font-size: 15px;
  }

  .close-btn {
    width: 28px;
    height: 28px;
  }

  .close-btn svg {
    width: 18px;
    height: 18px;
  }

  .modal-body {
    padding: 12px;
  }

  .original-message {
    padding: 12px;
  }

  .original-message strong {
    font-size: 12px;
  }

  .original-message p {
    font-size: 13px;
  }

  .warning-box {
    padding: 12px;
  }

  .warning-box p {
    font-size: 13px;
  }

  .warning-box ul {
    font-size: 12px;
    padding-left: 18px;
  }

  .form-group label {
    font-size: 13px;
  }

  textarea {
    padding: 10px;
    font-size: 13px;
  }

  .checkbox-label {
    font-size: 13px;
  }

  .checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }

  .modal-footer {
    padding: 12px;
    flex-direction: column-reverse;
  }

  .modal-footer .btn-primary,
  .modal-footer .btn-secondary,
  .modal-footer .btn-danger {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }

  .empty-state {
    padding: 60px 16px;
  }

  .empty-icon {
    width: 60px;
    height: 60px;
  }

  .empty-state h3 {
    font-size: 18px;
  }

  .empty-state p {
    font-size: 13px;
  }

  .menu-item {
    padding: 12px;
    font-size: 13px;
  }

  .menu-item svg {
    width: 16px;
    height: 16px;
  }
}

/* Correction du débordement horizontal */
* {
  box-sizing: border-box;
}

.messages-container {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

.messages-nav,
.messages-header,
.messages-content {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.message-card {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.message-content p {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}
</style>
