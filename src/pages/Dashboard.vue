<template>
  <div class="dashboard-container">
    <!-- Navigation -->
    <nav class="dashboard-nav">
      <div class="nav-brand">
        <h2>VibeNote</h2>
      </div>

      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link">Accueil</router-link>
        <router-link to="/messages" class="nav-link">
          Messages
          <span v-if="messagesStore.unreadCount > 0" class="badge">
            {{ messagesStore.unreadCount }}
          </span>
        </router-link>
        <router-link to="/my-link" class="nav-link">Mon Lien</router-link>
        <router-link to="/analytics" class="nav-link">Statistiques</router-link>
        <router-link to="/settings" class="nav-link">Paramètres</router-link>
        <router-link
          v-if="auth.user?.profile?.role === 'admin'"
          to="/admin"
          class="nav-link admin-link"
        >
          Admin
        </router-link>
      </div>

      <div class="nav-actions">
        <NotificationBell @click="$router.push('/messages')" />
        <button @click="handleLogout" class="btn-logout">Déconnexion</button>
      </div>
    </nav>

    <!-- Contenu principal -->
    <div class="dashboard-content">
      <!-- En-tête -->
      <div class="welcome-card">
        <div class="welcome-content">
          <div>
            <h1>Bonjour, {{ username }}</h1>
            <p class="subtitle">Gérez vos messages anonymes en toute sécurité</p>
          </div>
          <div v-if="auth.user?.profile?.is_premium" class="premium-badge">Premium</div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card" @click="$router.push('/messages')">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ messagesStore.messages.length }}</h3>
            <p>Messages reçus</p>
          </div>
          <div class="stat-trend" v-if="recentMessagesCount > 0">
            <span class="trend-up">+{{ recentMessagesCount }} cette semaine</span>
          </div>
        </div>

        <div class="stat-card highlight" @click="$router.push('/messages?filter=unread')">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ messagesStore.unreadCount }}</h3>
            <p>Non lus</p>
          </div>
          <button v-if="messagesStore.unreadCount > 0" class="stat-action">
            Lire maintenant
          </button>
        </div>

        <div class="stat-card" @click="$router.push('/messages?filter=starred')">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ messagesStore.starredMessages.length }}</h3>
            <p>Favoris</p>
          </div>
        </div>

        <div class="stat-card" @click="$router.push('/analytics')">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ auth.user?.profile?.profile_views || 0 }}</h3>
            <p>Vues du profil</p>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <h3>Actions rapides</h3>
        <div class="actions-grid">
          <router-link to="/messages" class="action-card">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="action-content">
              <strong>Mes messages</strong>
              <p>Consulter mes messages</p>
            </div>
          </router-link>

          <router-link to="/my-link" class="action-card">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
              </svg>
            </div>
            <div class="action-content">
              <strong>Personnaliser</strong>
              <p>Modifier mon profil</p>
            </div>
          </router-link>

          <router-link to="/analytics" class="action-card">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div class="action-content">
              <strong>Statistiques</strong>
              <p>Voir mes analytics</p>
            </div>
          </router-link>

          <router-link to="/settings" class="action-card">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div class="action-content">
              <strong>Paramètres</strong>
              <p>Sécurité et confidentialité</p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Lien unique -->
      <div class="link-section">
        <div class="link-header">
          <h3>Votre lien unique</h3>
          <button @click="toggleSoundNotif" class="btn-sound" :title="notificationsStore.soundEnabled ? 'Désactiver le son' : 'Activer le son'">
            <svg v-if="notificationsStore.soundEnabled" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
        </div>

        <div class="link-display-box">
          <input :value="uniqueLink" readonly class="link-input" ref="linkInput" />
          <button @click="copyLink" class="btn-copy">
            {{ copied ? "Copié !" : "Copier" }}
          </button>
        </div>

        <p class="link-hint">Partagez ce lien pour recevoir des messages anonymes</p>

        <div class="social-share">
          <a :href="whatsappShare" target="_blank" class="share-btn whatsapp">
            WhatsApp
          </a>
          <a :href="twitterShare" target="_blank" class="share-btn twitter">
            Twitter
          </a>
          <a :href="facebookShare" target="_blank" class="share-btn facebook">
            Facebook
          </a>
          <button @click="shareNative" class="share-btn native">
            Partager
          </button>
        </div>
      </div>

      <!-- Messages récents -->
      <div class="recent-section">
        <div class="section-header">
          <h3>Messages récents</h3>
          <router-link to="/messages" class="link-see-all">
            Voir tout ({{ messagesStore.messages.length }})
          </router-link>
        </div>

        <div v-if="recentMessages.length === 0" class="empty-messages">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
          </div>
          <p>Aucun message pour le moment</p>
          <button @click="copyLink" class="btn-share-empty">Partager mon lien</button>
        </div>

        <div v-else class="recent-messages-list">
          <div
            v-for="message in recentMessages"
            :key="message.id"
            class="mini-message"
            :class="{ unread: !message.is_read, flagged: message.is_flagged }"
            @click="goToMessage(message.id)"
          >
            <div class="mini-message-header">
              <span class="mini-date">{{ formatDate(message.created_at) }}</span>
              <div class="mini-badges">
                <span v-if="!message.is_read" class="mini-badge new">Nouveau</span>
                <span v-if="message.is_starred" class="mini-badge starred">Favori</span>
                <span v-if="message.is_flagged" class="mini-badge warning">Signalé</span>
              </div>
            </div>
            <p class="mini-content">{{ truncate(message.content, 120) }}</p>
            <div class="mini-footer">
              <button @click.stop="quickReply(message)" class="btn-quick-reply">Répondre</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations du compte -->
      <div class="account-section">
        <h3>Informations du compte</h3>
        <div class="account-grid">
          <div class="account-item">
            <span class="account-label">Email</span>
            <span class="account-value">{{ auth.user?.email }}</span>
          </div>
          <div class="account-item">
            <span class="account-label">Nom d'utilisateur</span>
            <span class="account-value">@{{ username }}</span>
          </div>
          <div class="account-item">
            <span class="account-label">Membre depuis</span>
            <span class="account-value">{{ formattedDate }}</span>
          </div>
          <div class="account-item">
            <span class="account-label">Plan</span>
            <span class="account-value">
              {{ auth.user?.profile?.subscription_plan || "Gratuit" }}
              <span v-if="!auth.user?.profile?.is_premium" class="upgrade-link">
                <router-link to="/pricing">Améliorer</router-link>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMessagesStore } from "@/stores/messages";
import { useNotificationsStore } from "@/stores/notifications";
import NotificationBell from "@/components/NotificationBell.vue";

const router = useRouter();
const auth = useAuthStore();
const messagesStore = useMessagesStore();
const notificationsStore = useNotificationsStore();

const linkInput = ref(null);
const copied = ref(false);

const username = computed(() => auth.user?.profile?.username || "Utilisateur");

const uniqueLink = computed(() => {
  const link = auth.user?.profile?.unique_link;
  return link ? `${window.location.origin}/${link}` : "Chargement...";
});

const recentMessages = computed(() => {
  return messagesStore.messages.slice(0, 5);
});

const recentMessagesCount = computed(() => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return messagesStore.messages.filter((m) => new Date(m.created_at) > oneWeekAgo).length;
});

const formattedDate = computed(() => {
  if (!auth.user?.profile?.created_at) return "N/A";

  const date = new Date(auth.user.profile.created_at);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const whatsappShare = computed(() => {
  return `https://wa.me/?text=Envoie-moi un message anonyme sur VibeNote ! ${uniqueLink.value}`;
});

const twitterShare = computed(() => {
  return `https://twitter.com/intent/tweet?text=Envoie-moi un message anonyme !&url=${encodeURIComponent(
    uniqueLink.value
  )}`;
});

const facebookShare = computed(() => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(uniqueLink.value)}`;
});

onMounted(async () => {
  await messagesStore.fetchMessages();
  notificationsStore.loadPreferences();
  notificationsStore.initRealtime(auth.user.id);
  await notificationsStore.requestNotificationPermission();
  notificationsStore.unreadCount = messagesStore.unreadCount;
});

onUnmounted(() => {
  notificationsStore.cleanup();
});

async function handleLogout() {
  notificationsStore.cleanup();
  const result = await auth.logout();
  if (result.success) {
    router.push("/login");
  }
}

function copyLink() {
  navigator.clipboard.writeText(uniqueLink.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

async function shareNative() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Mon profil VibeNote",
        text: "Envoie-moi un message anonyme !",
        url: uniqueLink.value,
      });
    } catch (err) {
      console.log("Partage annulé");
    }
  } else {
    copyLink();
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function truncate(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

function goToMessage(messageId) {
  router.push(`/messages#${messageId}`);
}

function quickReply(message) {
  router.push({
    path: "/messages",
    query: { reply: message.id },
  });
}

function toggleSoundNotif() {
  notificationsStore.toggleSound();
}
</script>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  min-height: 100vh;
  background: #0B0F14;
}

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
  margin: 0;
  font-weight: 700;
  color: #E6EDF3;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  color: #8B949E;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
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

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-logout {
  padding: 8px 18px;
  background: transparent;
  color: #8B949E;
  border: 1px solid rgba(139, 148, 158, 0.3);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-logout:hover {
  border-color: #2F81F7;
  color: #2F81F7;
}

.dashboard-content {
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-card {
  background: #121821;
  padding: 28px;
  border-radius: 10px;
  margin-bottom: 24px;
  border: 1px solid rgba(139, 148, 158, 0.1);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-card h1 {
  font-size: 26px;
  margin-bottom: 6px;
  font-weight: 700;
  color: #E6EDF3;
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
  font-weight: 600;
  font-size: 13px;
  color: #3FB950;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card {
  background: #121821;
  padding: 22px;
  border-radius: 10px;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid rgba(139, 148, 158, 0.1);
}

.stat-card:hover {
  border-color: rgba(47, 129, 247, 0.3);
  box-shadow: 0 0 20px rgba(47, 129, 247, 0.1);
}

.stat-card.highlight {
  background: rgba(47, 129, 247, 0.1);
  border-color: rgba(47, 129, 247, 0.3);
}

.stat-card.highlight:hover {
  box-shadow: 0 0 25px rgba(47, 129, 247, 0.2);
}

.stat-icon {
  width: 36px;
  height: 36px;
  margin-bottom: 12px;
  color: #2F81F7;
}

.stat-icon svg {
  width: 100%;
  height: 100%;
}

.stat-info h3 {
  font-size: 30px;
  margin-bottom: 4px;
  font-weight: 700;
  color: #E6EDF3;
}

.stat-info p {
  font-size: 13px;
  color: #8B949E;
}

.stat-trend {
  margin-top: 10px;
}

.trend-up {
  color: #3FB950;
  font-weight: 600;
  font-size: 12px;
}

.stat-action {
  margin-top: 12px;
  padding: 7px 14px;
  background: rgba(47, 129, 247, 0.15);
  border: 1px solid rgba(47, 129, 247, 0.3);
  color: #2F81F7;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.stat-action:hover {
  background: #2F81F7;
  color: #E6EDF3;
  box-shadow: 0 0 15px rgba(47, 129, 247, 0.3);
}

.quick-actions {
  background: #121821;
  padding: 26px;
  border-radius: 10px;
  margin-bottom: 24px;
  border: 1px solid rgba(139, 148, 158, 0.1);
}

.quick-actions h3 {
  color: #E6EDF3;
  margin-bottom: 18px;
  font-size: 17px;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(139, 148, 158, 0.05);
  border: 1px solid rgba(139, 148, 158, 0.1);
  border-radius: 8px;
    transition: all 0.2s;
  cursor: pointer;
}

.action-card:hover {
  background: rgba(47, 129, 247, 0.1);
  border-color: rgba(47, 129, 247, 0.3);
  box-shadow: 0 0 15px rgba(47, 129, 247, 0.1);
}

.action-icon {
  width: 36px;
  height: 36px;
  color: #2F81F7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon svg {
  width: 100%;
  height: 100%;
}

.action-content strong {
  display: block;
  color: #E6EDF3;
  font-size: 15px;
  margin-bottom: 2px;
}

.action-content p {
  font-size: 13px;
  color: #8B949E;
}

.link-section {
  background: #121821;
  padding: 24px;
  border-radius: 10px;
  border: 1px solid rgba(139, 148, 158, 0.1);
  margin-bottom: 24px;
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.link-header h3 {
  color: #E6EDF3;
  font-size: 16px;
  font-weight: 600;
}

.btn-sound {
  background: rgba(47, 129, 247, 0.1);
  border: 1px solid rgba(47, 129, 247, 0.3);
  color: #2F81F7;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sound:hover {
  background: #2F81F7;
  color: #E6EDF3;
  box-shadow: 0 0 12px rgba(47, 129, 247, 0.2);
}

.link-display-box {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.link-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(139, 148, 158, 0.2);
  background: #121821;
  color: #E6EDF3;
  font-size: 14px;
}

.btn-copy {
  padding: 10px 16px;
  background: #2F81F7;
  color: #E6EDF3;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #1e5fd1;
}

.link-hint {
  font-size: 13px;
  color: #8B949E;
  margin-bottom: 10px;
}

.social-share {
  display: flex;
  gap: 10px;
}

.share-btn {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #E6EDF3;
  text-decoration: none;
  transition: all 0.2s;
}

.share-btn.whatsapp { background: #25D366; }
.share-btn.whatsapp:hover { opacity: 0.85; }
.share-btn.twitter { background: #2F81F7; }
.share-btn.twitter:hover { opacity: 0.85; }
.share-btn.facebook { background: #3B5998; }
.share-btn.facebook:hover { opacity: 0.85; }
.share-btn.native { background: #8B949E; }
.share-btn.native:hover { opacity: 0.85; }

.recent-section {
  background: #121821;
  padding: 24px;
  border-radius: 10px;
  border: 1px solid rgba(139, 148, 158, 0.1);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-header h3 {
  color: #E6EDF3;
  font-size: 16px;
  font-weight: 600;
}

.link-see-all {
  font-size: 13px;
  color: #2F81F7;
  text-decoration: none;
}

.empty-messages {
  text-align: center;
  color: #8B949E;
  padding: 30px 0;
}

.empty-icon svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  color: #8B949E;
}

.btn-share-empty {
  margin-top: 12px;
  padding: 8px 16px;
  background: #2F81F7;
  color: #E6EDF3;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-share-empty:hover {
  background: #1e5fd1;
}

.mini-message {
  background: #121821;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid rgba(139, 148, 158, 0.1);
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-message.unread {
  border-color: #2F81F7;
}

.mini-message.flagged {
  border-color: #3FB950;
}

.mini-message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.mini-date {
  font-size: 12px;
  color: #8B949E;
}

.mini-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
  color: #E6EDF3;
  margin-left: 4px;
}

.mini-badge.new { background: #2F81F7; }
.mini-badge.starred { background: #3FB950; }
.mini-badge.warning { background: #FF5E5E; }

.mini-content {
  font-size: 14px;
  color: #E6EDF3;
  margin-bottom: 6px;
}

.mini-footer .btn-quick-reply {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid rgba(47, 129, 247, 0.3);
  background: rgba(47, 129, 247, 0.1);
  color: #2F81F7;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-footer .btn-quick-reply:hover {
  background: #2F81F7;
  color: #E6EDF3;
  box-shadow: 0 0 10px rgba(47, 129, 247, 0.2);
}

.account-section {
  background: #121821;
  padding: 24px;
  border-radius: 10px;
  border: 1px solid rgba(139, 148, 158, 0.1);
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.account-item {
  display: flex;
  flex-direction: column;
}

.account-label {
  font-size: 12px;
  color: #8B949E;
  margin-bottom: 4px;
}

.account-value {
  font-size: 14px;
  color: #E6EDF3;
}

.upgrade-link a {
  font-size: 12px;
  color: #2F81F7;
  text-decoration: none;
}

.upgrade-link a:hover {
  text-decoration: underline;
}

</style>
