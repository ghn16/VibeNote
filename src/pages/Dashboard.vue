<template>
  <div class="dashboard-wrapper">
    <!-- ================= NAVIGATION HORIZONTALE ================= -->
    <nav class="dashboard-nav">
      <div class="nav-brand">
        <h2>VibeNote</h2>
      </div>

      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Accueil</span>
        </router-link>

        <router-link to="/messages" class="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span>Messages</span>
          <span v-if="messagesStore.unreadCount > 0" class="badge">
            {{ messagesStore.unreadCount }}
          </span>
        </router-link>

        <router-link to="/search" class="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span>Rechercher</span>
        </router-link>

        <router-link to="/public-replies" class="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span>Mon Profil</span>
          <span v-if="messagesStore.publicReplies?.length > 0" class="badge badge-success">
            {{ messagesStore.publicReplies.length }}
          </span>
        </router-link>

        <router-link to="/analytics" class="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span>Stats</span>
        </router-link>

        <router-link to="/settings" class="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>Paramètres</span>
        </router-link>

        <router-link
          v-if="auth.user?.profile?.role === 'admin'"
          to="/admin"
          class="nav-link admin-link"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          <span>Admin</span>
        </router-link>
      </div>

      <div class="nav-actions">
        <button class="notification-btn" @click="$router.push('/messages')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span v-if="messagesStore.unreadCount > 0" class="notification-dot"></span>
        </button>

        <button @click="handleLogout" class="btn-logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="logout-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </nav>

    <!-- ================= LAYOUT PRINCIPAL ================= -->
    <div class="dashboard-layout">
      <!-- ================= FEED CENTRAL ================= -->
      <main class="dashboard-feed">
        <!-- Bienvenue -->
        <section class="welcome-card">
          <div>
            <h1>Bonjour, {{ username }} 👋</h1>
            <p class="subtitle">Voici ce qui se passe sur ton compte</p>
          </div>
          <span v-if="auth.user?.profile?.is_premium" class="premium-badge">✨ Premium</span>
        </section>

        <!-- Barre de recherche -->
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher des messages ou réponses..."
          />
        </div>

        <!-- Actions rapides -->
        <section class="quick-actions-grid">
          <button class="action-btn" @click="$router.push('/messages')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <div>
              <strong>Voir messages</strong>
              <span>Consulter ma boîte</span>
            </div>
          </button>

          <button class="action-btn" @click="copyLink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            <div>
              <strong>{{ copied ? 'Copié !' : 'Copier lien' }}</strong>
              <span>Partager mon profil</span>
            </div>
          </button>

          <button class="action-btn" @click="$router.push('/public-replies')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <div>
              <strong>Profil public</strong>
              <span>Gérer mes réponses</span>
            </div>
          </button>

          <button class="action-btn" @click="$router.push('/analytics')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <div>
              <strong>Analytics</strong>
              <span>Voir les stats</span>
            </div>
          </button>
        </section>

        <!-- Tabs -->
        <div class="feed-tabs">
          <button
            :class="['tab', { active: activeTab === 'messages' }]"
            @click="activeTab = 'messages'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Messages récents
          </button>
          <button
            :class="['tab', { active: activeTab === 'replies' }]"
            @click="activeTab = 'replies'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Réponses publiques
          </button>
        </div>

        <!-- Feed Messages -->
        <section v-if="activeTab === 'messages'" class="feed-section">
          <div v-if="filteredMessages.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="empty-icon">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <p>Aucun message trouvé</p>
            <button class="btn-empty" @click="copyLink">
              Partager mon lien
            </button>
          </div>

          <div v-else class="messages-list">
            <div
              v-for="msg in filteredMessages"
              :key="msg.id"
              :class="['message-card', { unread: !msg.is_read }]"
              @click="goToMessage(msg.id)"
            >
              <div class="message-header">
                <span class="message-date">{{ formatDate(msg.created_at) }}</span>
                <div class="message-badges">
                  <span v-if="!msg.is_read" class="badge-new">Nouveau</span>
                  <svg v-if="msg.is_starred" viewBox="0 0 24 24" fill="gold" stroke="gold" width="14" height="14">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>

              <p class="message-content">{{ truncate(msg.content, 120) }}</p>

              <div class="message-footer">
                <button class="btn-reply" @click.stop="quickReply(msg)">Répondre</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Feed Réponses -->
        <section v-if="activeTab === 'replies'" class="feed-section">
          <div v-if="filteredReplies.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="empty-icon">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <p>Aucune réponse publique</p>
            <p class="empty-hint">Répondez à des messages en mode "Public" pour commencer</p>
          </div>

          <div v-else class="replies-list">
            <div
              v-for="reply in filteredReplies"
              :key="reply.id"
              class="reply-card"
            >
              <p class="reply-content">{{ truncate(reply.content, 150) }}</p>

              <div class="reply-stats">
                <span class="stat-item">
                  <svg viewBox="0 0 24 24" fill="#ff5e5e" stroke="#ff5e5e" width="16" height="16">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {{ reply.reactions?.love || 0 }}
                </span>
                <span class="stat-item">
                  <svg viewBox="0 0 24 24" fill="#2f81f7" stroke="#2f81f7" width="16" height="16">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                  </svg>
                  {{ reply.reactions?.like || 0 }}
                </span>
                <span class="stat-item">
                  <svg viewBox="0 0 24 24" fill="#ff9500" stroke="#ff9500" width="16" height="16">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
                  </svg>
                  {{ reply.reactions?.fire || 0 }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- ================= SIDEBAR DROITE ================= -->
      <aside class="sidebar-right">
        <!-- Stats -->
        <div class="stats-card">
          <h3>📊 Statistiques</h3>

          <div class="stats-grid-compact">
            <div class="stat-item-compact">
              <strong>{{ messagesStore.messages.length }}</strong>
              <span>Messages</span>
            </div>
            <div class="stat-item-compact highlight">
              <strong>{{ messagesStore.unreadCount }}</strong>
              <span>Non lus</span>
            </div>
            <div class="stat-item-compact">
              <strong>{{ messagesStore.publicReplies?.length || 0 }}</strong>
              <span>Réponses</span>
            </div>
            <div class="stat-item-compact">
              <strong>{{ messagesStore.starredMessages.length }}</strong>
              <span>Favoris</span>
            </div>
          </div>
        </div>

        <!-- Réactions publiques -->
        <div class="reactions-card">
          <h3>❤️ Réactions</h3>

          <div class="reactions-list">
            <div class="reaction-item">
              <svg viewBox="0 0 24 24" fill="#ff5e5e" stroke="#ff5e5e" width="18" height="18">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <div>
                <strong>{{ totalLoveReactions }}</strong>
                <span>Love</span>
              </div>
            </div>
            <div class="reaction-item">
              <svg viewBox="0 0 24 24" fill="#2f81f7" stroke="#2f81f7" width="18" height="18">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
              </svg>
              <div>
                <strong>{{ totalLikeReactions }}</strong>
                <span>Like</span>
              </div>
            </div>
            <div class="reaction-item">
              <svg viewBox="0 0 24 24" fill="#ff9500" stroke="#ff9500" width="18" height="18">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
              </svg>
              <div>
                <strong>{{ totalFireReactions }}</strong>
                <span>Fire</span>
              </div>
            </div>
            <div class="reaction-item">
              <svg viewBox="0 0 24 24" fill="#ffd700" stroke="#ffd700" width="18" height="18">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div>
                <strong>{{ totalFavorites }}</strong>
                <span>Favoris</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lien public -->
        <div class="link-card">
          <h3>🔗 Ton lien unique</h3>

          <div class="link-box">
            <input :value="uniqueLink" readonly />
            <button @click="copyLink" class="btn-icon">
              <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span v-else>✓</span>
            </button>
          </div>

          <button @click="shareNative" class="btn-share">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            Partager
          </button>
        </div>

        <!-- Compte info -->
        <div class="account-card">
          <h3>👤 Compte</h3>

          <div class="account-info">
            <div class="account-item">
              <span class="label">Email</span>
              <span class="value">{{ auth.user?.email }}</span>
            </div>
            <div class="account-item">
              <span class="label">Membre depuis</span>
              <span class="value">{{ formattedDate }}</span>
            </div>
            <div class="account-item">
              <span class="label">Plan</span>
              <span :class="['value', { premium: auth.user?.profile?.is_premium }]">
                {{ auth.user?.profile?.subscription_plan || 'Gratuit' }}
                {{ auth.user?.profile?.is_premium ? '✨' : '' }}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { useMessagesStore } from "@/stores/messages"
import { useNotificationsStore } from "@/stores/notifications"

const router = useRouter()
const auth = useAuthStore()
const messagesStore = useMessagesStore()
const notificationsStore = useNotificationsStore()

const searchQuery = ref('')
const copied = ref(false)
const activeTab = ref('messages')
let isMounted = false

const username = computed(() => auth.user?.profile?.display_name || auth.user?.profile?.username || "Utilisateur")

const uniqueLink = computed(() => {
  const link = auth.user?.profile?.unique_link
  return link ? `${window.location.origin}/${link}` : "Chargement..."
})

const filteredMessages = computed(() => {
  const messages = messagesStore.messages.slice(0, 5)
  if (!searchQuery.value.trim()) return messages

  return messages.filter(m =>
    m.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredReplies = computed(() => {
  const replies = messagesStore.publicReplies || []
  if (!searchQuery.value.trim()) return replies.slice(0, 5)

  return replies.filter(r =>
    r.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).slice(0, 5)
})

const totalLoveReactions = computed(() => {
  return (messagesStore.publicReplies || []).reduce((total, reply) => {
    return total + (reply.reactions?.love || 0)
  }, 0)
})

const totalLikeReactions = computed(() => {
  return (messagesStore.publicReplies || []).reduce((total, reply) => {
    return total + (reply.reactions?.like || 0)
  }, 0)
})

const totalFireReactions = computed(() => {
  return (messagesStore.publicReplies || []).reduce((total, reply) => {
    return total + (reply.reactions?.fire || 0)
  }, 0)
})

const totalFavorites = computed(() => {
  return (messagesStore.publicReplies || []).reduce((total, reply) => {
    return total + (reply.favorites_count || 0)
  }, 0)
})

const formattedDate = computed(() => {
  if (!auth.user?.profile?.created_at) return "N/A"
  const date = new Date(auth.user.profile.created_at)
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
})

onMounted(async () => {
  isMounted = true

  try {
    await messagesStore.fetchMessages()
    await messagesStore.loadPublicReplies()

    if (isMounted) {
      notificationsStore.loadPreferences()
      notificationsStore.initRealtime(auth.user.id)
      await notificationsStore.requestNotificationPermission()
      notificationsStore.unreadCount = messagesStore.unreadCount
    }
  } catch (error) {
    console.error('Erreur initialisation dashboard:', error)
  }
})

onBeforeUnmount(async () => {
  isMounted = false
  await notificationsStore.cleanup()
})

async function handleLogout() {
  await notificationsStore.cleanup()
  const result = await auth.logout()
  if (result.success) {
    router.push("/login")
  }
}

function copyLink() {
  navigator.clipboard.writeText(uniqueLink.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

async function shareNative() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Mon profil VibeNote",
        text: "Envoie-moi un message anonyme !",
        url: uniqueLink.value,
      })
    } catch (err) {
      console.log("Partage annulé")
    }
  } else {
    copyLink()
  }
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

function truncate(text, length) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + "..."
}

function goToMessage(messageId) {
  router.push(`/messages#${messageId}`)
}

function quickReply(message) {
  router.push({
    path: "/messages",
    query: { reply: message.id },
  })
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-wrapper {
  min-height: 100vh;
  background: #0B0F14;
  color: #E6EDF3;
}

/* ============ NAVIGATION HORIZONTALE ============ */
.dashboard-nav {
  background: #121821;
  border-bottom: 1px solid rgba(139, 148, 158, 0.1);
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.nav-brand h2 {
  font-size: 20px;
  color: #E6EDF3;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 4px;
  align-items: center;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #8B949E;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}

.nav-link:hover {
  background: rgba(47, 129, 247, 0.1);
  color: #E6EDF3;
}

.nav-link.router-link-active {
  background: rgba(47, 129, 247, 0.15);
  color: #2F81F7;
}

.nav-link.admin-link {
  background: rgba(63, 185, 80, 0.1);
  color: #3FB950;
  border: 1px solid rgba(63, 185, 80, 0.2);
}

.badge {
  background: #2F81F7;
  color: #E6EDF3;
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.badge-success {
  background: #3FB950;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-btn {
  position: relative;
  background: transparent;
  border: 1px solid rgba(139, 148, 158, 0.3);
  border-radius: 6px;
  padding: 8px 10px;
  color: #8B949E;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.notification-btn:hover {
  border-color: #2F81F7;
  color: #2F81F7;
}

.notification-btn svg {
  width: 20px;
  height: 20px;
}

.notification-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #2F81F7;
  border-radius: 50%;
}

.logout-icon {
  width: 18px;
  height: 18px;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: transparent;
  border: 1px solid rgba(139, 148, 158, 0.3);
  border-radius: 6px;
  color: #8B949E;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  border-color: #2F81F7;
  color: #2F81F7;
}

/* ============ LAYOUT PRINCIPAL ============ */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 40px;
}

/* ============ FEED CENTRAL ============ */
.dashboard-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-card {
  background: #121821;
  border: 1px solid rgba(139, 148, 158, 0.1);
  border-radius: 12px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-card h1 {
  font-size: 26px;
  color: #E6EDF3;
  font-weight: 700;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 15px;
  color: #8B949E;
}

.premium-badge {
  background: rgba(63, 185, 80, 0.15);
  border: 1px solid rgba(63, 185, 80, 0.3);
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #3FB950;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #121821;
  border: 1px solid rgba(139, 148, 158, 0.2);
  border-radius: 10px;
  padding: 12px 16px;
}

.search-box svg {
  width: 18px;
  height: 18px;
  color: #8B949E;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #E6EDF3;
  font-size: 14px;
}

.search-box input::placeholder {
  color: #8B949E;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.action-btn {
  background: #121821;
  border: 1px solid rgba(139, 148, 158, 0.1);
  border-radius: 10px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: #E6EDF3;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.action-btn:hover {
  border-color: rgba(47, 129, 247, 0.3);
  background: rgba(47, 129, 247, 0.05);
  transform: translateY(-2px);
}

.action-btn svg {
  width: 22px;
  height: 22px;
  color: #2F81F7;
  flex-shrink: 0;
}

.action-btn strong {
  display: block;
  font-size: 15px;
  margin-bottom: 2px;
}

.action-btn span {
  font-size: 13px;
  color: #8B949E;
}

.feed-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid rgba(139, 148, 158, 0.1);
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 12px 16px;
  color: #8B949E;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab svg {
  width: 18px;
  height: 18px;
}

.tab:hover {
  color: #E6EDF3;
}

.tab.active {
  color: #2F81F7;
  border-bottom-color: #2F81F7;
}

.feed-section {
  background: #121821;
  border: 1px solid rgba(139, 148, 158, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.messages-list, .replies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card, .reply-card {
  background: rgba(11, 15, 20, 0.5);
  border: 1px solid rgba(139, 148, 158, 0.1);
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
  cursor: pointer;
}

.message-card:hover, .reply-card:hover {
  border-color: rgba(47, 129, 247, 0.3);
}

.message-card.unread {
  border-left: 3px solid #2F81F7;
  background: rgba(47, 129, 247, 0.05);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.message-date {
  font-size: 12px;
  color: #8B949E;
}

.message-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-new {
  background: #2F81F7;
  color: #E6EDF3;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.message-content, .reply-content {
  color: #E6EDF3;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-reply {
  padding: 6px 14px;
  background: rgba(47, 129, 247, 0.1);
  border: 1px solid rgba(47, 129, 247, 0.3);
  border-radius: 6px;
  color: #2F81F7;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reply:hover {
  background: #2F81F7;
  color: #E6EDF3;
}

.reply-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #E6EDF3;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #8B949E;
}

.empty-icon {
  width: 48px;
  height: 48px;
}

.empty-hint {
  font-size: 13px;
  opacity: 0.8;
}

.btn-empty {
  margin-top: 8px;
  padding: 8px 16px;
  background: #2F81F7;
  border: none;
  border-radius: 6px;
  color: #E6EDF3;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-empty:hover {
  background: #1e5fd1;
}

/* ============ SIDEBAR DROITE ============ */
.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: fit-content;
  position: sticky;
  top: 90px;
}

.stats-card, .reactions-card, .link-card, .account-card {
  background: #121821;
  border: 1px solid rgba(139, 148, 158, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.stats-card h3, .reactions-card h3, .link-card h3, .account-card h3 {
  font-size: 15px;
  color: #E6EDF3;
  margin-bottom: 14px;
  font-weight: 600;
}

.stats-grid-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item-compact {
  background: rgba(139, 148, 158, 0.05);
  border: 1px solid rgba(139, 148, 158, 0.1);
  border-radius: 8px;
  padding: 14px;
  text-align: center;
}

.stat-item-compact.highlight {
  background: rgba(47, 129, 247, 0.1);
  border-color: rgba(47, 129, 247, 0.3);
}

.stat-item-compact strong {
  display: block;
  font-size: 20px;
  color: #E6EDF3;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-item-compact span {
  font-size: 12px;
  color: #8B949E;
}

.reactions-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.reaction-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(139, 148, 158, 0.05);
  border-radius: 8px;
}

.reaction-item strong {
  display: block;
  font-size: 16px;
  color: #E6EDF3;
}

.reaction-item span {
  font-size: 11px;
  color: #8B949E;
}

.link-box {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.link-box input {
  flex: 1;
  background: rgba(11, 15, 20, 0.5);
  border: 1px solid rgba(139, 148, 158, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  color: #E6EDF3;
  font-size: 13px;
}

.btn-icon {
  background: #2F81F7;
  border: none;
  border-radius: 8px;
  padding: 10px 12px;
  color: #E6EDF3;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.btn-icon:hover {
  background: #1e5fd1;
}

.btn-share {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(47, 129, 247, 0.1);
  border: 1px solid rgba(47, 129, 247, 0.3);
  border-radius: 8px;
  padding: 10px;
  color: #2F81F7;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-share:hover {
  background: #2F81F7;
  color: #E6EDF3;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-item .label {
  font-size: 12px;
  color: #8B949E;
}

.account-item .value {
  font-size: 14px;
  color: #E6EDF3;
  font-weight: 500;
}

.account-item .value.premium {
  color: #3FB950;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 1200px) {
  .dashboard-nav {
    padding: 16px 24px;
  }

  .dashboard-layout {
    padding: 24px;
    gap: 20px;
  }
}

@media (max-width: 968px) {
  .dashboard-nav {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 16px;
  }

  .nav-links {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    justify-content: flex-start;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }

  .nav-links::-webkit-scrollbar {
    height: 4px;
  }

  .nav-links::-webkit-scrollbar-thumb {
    background: rgba(139, 148, 158, 0.3);
    border-radius: 2px;
  }

  .nav-link {
    font-size: 13px;
    padding: 6px 12px;
    flex-shrink: 0;
  }

  .nav-actions {
    width: 100%;
    justify-content: space-between;
  }

  .dashboard-layout {
    grid-template-columns: 1fr;
    padding: 20px 16px;
  }

  .sidebar-right {
    position: static;
  }

  .welcome-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 20px;
  }
}

@media (max-width: 640px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid-compact {
    grid-template-columns: 1fr;
  }

  .reactions-list {
    grid-template-columns: 1fr;
  }

  .welcome-card h1 {
    font-size: 22px;
  }

  .subtitle {
    font-size: 14px;
  }

  .nav-brand h2 {
    font-size: 18px;
  }

  .btn-logout span {
    display: none;
  }
}
</style>
