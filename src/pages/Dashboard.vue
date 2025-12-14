<template>
  <div class="dashboard-container">
    <!-- Navigation -->
    <nav class="dashboard-nav">
      <div class="nav-brand">
        <h2>VibeNote</h2>
      </div>

      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link">  Accueil </router-link>
        <router-link to="/messages" class="nav-link">
           Messages
          <span v-if="messagesStore.unreadCount > 0" class="badge">
            {{ messagesStore.unreadCount }}
          </span>
        </router-link>
        <router-link to="/analytics" class="nav-link"> Stats </router-link>
        <router-link to="/my-link" class="nav-link"> Mon Lien </router-link>
        <router-link to="/analytics" class="nav-link"> Stats </router-link>
        <router-link to="/settings" class="nav-link"> Sécurité </router-link>
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
      <!-- Carte de bienvenue -->
      <div class="welcome-card">
        <div class="welcome-content">
          <div>
            <h1>Bienvenue, {{ username }} ! 👋</h1>
            <p class="subtitle">Voici ton tableau de bord VibeNote</p>
          </div>
          <div v-if="auth.user?.profile?.is_premium" class="premium-badge">✨ Premium</div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="stats-grid">
        <div class="stat-card" @click="$router.push('/messages')">
          <div class="stat-icon">📬</div>
          <div class="stat-info">
            <h3>{{ messagesStore.messages.length }}</h3>
            <p>Messages reçus</p>
          </div>
          <div class="stat-trend">
            <span class="trend-up">↗ +{{ recentMessagesCount }}</span>
            <span class="trend-label">cette semaine</span>
          </div>
        </div>

        <div class="stat-card highlight" @click="$router.push('/messages?filter=unread')">
          <div class="stat-icon">✨</div>
          <div class="stat-info">
            <h3>{{ messagesStore.unreadCount }}</h3>
            <p>Non lus</p>
          </div>
          <button v-if="messagesStore.unreadCount > 0" class="stat-action">
            Lire maintenant →
          </button>
        </div>

        <div class="stat-card" @click="$router.push('/messages?filter=starred')">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <h3>{{ messagesStore.starredMessages.length }}</h3>
            <p>Favoris</p>
          </div>
        </div>

        <div class="stat-card" @click="$router.push('/analytics')">
          <div class="stat-icon">👁️</div>
          <div class="stat-info">
            <h3>{{ auth.user?.profile?.profile_views || 0 }}</h3>
            <p>Vues du profil</p>
          </div>
          <div class="stat-trend">
            <span class="trend-up">↗ Voir détails</span>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <h3>⚡ Actions rapides</h3>
        <div class="actions-grid">
          <router-link to="/my-link" class="action-card">
            <div class="action-icon">🎨</div>
            <div class="action-content">
              <strong>Personnaliser mon profil</strong>
              <p>Change ton thème, bio et plus</p>
            </div>
          </router-link>

          <button @click="copyLink" class="action-card">
            <div class="action-icon">🔗</div>
            <div class="action-content">
              <strong>{{ copied ? "✅ Copié !" : "Copier mon lien" }}</strong>
              <p>Partage-le sur tes réseaux</p>
            </div>
          </button>

          <router-link to="/analytics" class="action-card">
            <div class="action-icon">📊</div>
            <div class="action-content">
              <strong>Voir mes statistiques</strong>
              <p>Analytics et insights</p>
            </div>
          </router-link>

          <router-link to="/settings" class="action-card">
            <div class="action-icon">🛡️</div>
            <div class="action-content">
              <strong>Gérer la sécurité</strong>
              <p>Blocages et confidentialité</p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Section lien unique -->
      <div class="link-section">
        <div class="link-header">
          <h3>🔗 Mon lien unique</h3>
          <button @click="toggleSoundNotif" class="btn-sound">
            {{ notificationsStore.soundEnabled ? "🔊" : "🔇" }}
          </button>
        </div>

        <div class="link-display-box">
          <input :value="uniqueLink" readonly class="link-input" ref="linkInput" />
          <button @click="copyLink" class="btn-copy">
            {{ copied ? "✅ Copié" : "📋 Copier" }}
          </button>
        </div>

        <p class="link-hint">
          <span class="hint-icon">💡</span>
          Partage ce lien pour recevoir des messages anonymes !
        </p>

        <!-- Boutons de partage social -->
        <div class="social-share">
          <a :href="whatsappShare" target="_blank" class="share-btn whatsapp">
            <span class="share-icon">📱</span>
            WhatsApp
          </a>
          <a :href="twitterShare" target="_blank" class="share-btn twitter">
            <span class="share-icon">🐦</span>
            Twitter
          </a>
          <a :href="facebookShare" target="_blank" class="share-btn facebook">
            <span class="share-icon">👥</span>
            Facebook
          </a>
          <button @click="shareNative" class="share-btn native">
            <span class="share-icon">📤</span>
            Partager
          </button>
        </div>
      </div>

      <!-- Messages récents -->
      <div class="recent-section">
        <div class="section-header">
          <h3>📨 Messages récents</h3>
          <router-link to="/messages" class="link-see-all">
            Voir tout ({{ messagesStore.messages.length }}) →
          </router-link>
        </div>

        <div v-if="recentMessages.length === 0" class="empty-messages">
          <div class="empty-icon">📭</div>
          <p>Aucun message pour le moment</p>
          <button @click="copyLink" class="btn-share-empty">📤 Partager mon lien</button>
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
                <span v-if="message.is_starred" class="mini-badge starred">⭐</span>
                <span v-if="message.is_flagged" class="mini-badge warning">⚠️</span>
              </div>
            </div>
            <p class="mini-content">{{ truncate(message.content, 120) }}</p>
            <div class="mini-footer">
              <button @click.stop="quickReply(message)" class="btn-quick-reply">💬 Répondre</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Insights et conseils -->
      <div class="insights-section">
        <h3>💡 Conseils & Insights</h3>
        <div class="insights-grid">
          <div class="insight-card" v-if="messagesStore.unreadCount > 5">
            <div class="insight-icon">📬</div>
            <div class="insight-content">
              <strong>Tu as {{ messagesStore.unreadCount }} messages non lus</strong>
              <p>Prends le temps de les lire et d'y répondre !</p>
              <router-link to="/messages" class="insight-link">Voir les messages →</router-link>
            </div>
          </div>

          <div class="insight-card" v-if="auth.user?.profile?.profile_views > 50">
            <div class="insight-icon">🔥</div>
            <div class="insight-content">
              <strong>Ton profil est populaire !</strong>
              <p>{{ auth.user.profile.profile_views }} vues. Continue à partager ton lien.</p>
            </div>
          </div>

          <div class="insight-card" v-if="messagesStore.messages.length === 0">
            <div class="insight-icon">🚀</div>
            <div class="insight-content">
              <strong>Commence ton aventure !</strong>
              <p>Partage ton lien sur tes réseaux sociaux pour recevoir tes premiers messages.</p>
              <button @click="copyLink" class="insight-link">📋 Copier mon lien</button>
            </div>
          </div>

          <div class="insight-card tip">
            <div class="insight-icon">✨</div>
            <div class="insight-content">
              <strong>Astuce du jour</strong>
              <p>{{ dailyTip }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations du compte -->
      <div class="account-section">
        <h3>👤 Mon compte</h3>
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
                <router-link to="/pricing">⬆️ Upgrade</router-link>
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

// Liens de partage social
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

// Astuce du jour
const dailyTips = [
  "Personnalise ton profil avec un thème unique pour te démarquer !",
  "Réponds publiquement à certains messages pour créer de l'engagement.",
  "Active les notifications pour ne jamais manquer un message.",
  "Partage ton lien dans ta bio Instagram pour plus de visibilité.",
  "Utilise les templates de questions pour encourager l'interaction.",
  "Archive les anciens messages pour garder une boîte de réception propre.",
  "Marque tes messages préférés en favoris pour les retrouver facilement.",
];

const dailyTip = computed(() => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return dailyTips[dayOfYear % dailyTips.length];
});

onMounted(async () => {
  await messagesStore.fetchMessages();

  // Initialiser les notifications
  notificationsStore.loadPreferences();
  notificationsStore.initRealtime(auth.user.id);
  await notificationsStore.requestNotificationPermission();

  // Sync unread count
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
  if (linkInput.value) {
    linkInput.value.select();
    document.execCommand("copy");
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
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
  background: #f7fafc;
}

.dashboard-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand h2 {
  font-size: 24px;
  margin: 0;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 10px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.3);
}

.nav-link.admin-link {
  background: rgba(255, 215, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.5);
}

.badge {
  background: #ff4757;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-logout {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: white;
  color: #667eea;
}

.dashboard-content {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-card h1 {
  font-size: 32px;
  margin-bottom: 8px;
  font-weight: 700;
}

.subtitle {
  font-size: 18px;
  opacity: 0.9;
}

.premium-badge {
  background: rgba(255, 215, 0, 0.3);
  border: 2px solid rgba(255, 215, 0, 0.6);
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.3s;
}

.stat-card:hover::before {
  transform: scaleY(1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.stat-info h3 {
  font-size: 36px;
  margin-bottom: 5px;
  font-weight: 700;
}

.stat-info p {
  font-size: 14px;
  opacity: 0.8;
}

.stat-trend {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trend-up {
  color: #48bb78;
  font-weight: 600;
  font-size: 14px;
}

.stat-card.highlight .trend-up {
  color: rgba(255, 255, 255, 0.9);
}

.trend-label {
  font-size: 12px;
  opacity: 0.7;
}

.stat-action {
  margin-top: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.stat-action:hover {
  background: white;
  color: #667eea;
}

.quick-actions {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.quick-actions h3 {
  color: #2d3748;
  margin-bottom: 20px;
  font-size: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.action-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.action-content strong {
  display: block;
  color: #2d3748;
  margin-bottom: 4px;
  font-size: 15px;
}

.action-content p {
  color: #718096;
  font-size: 13px;
  margin: 0;
}

.link-section {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.link-header h3 {
  color: #2d3748;
  font-size: 20px;
}

.btn-sound {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sound:hover {
  border-color: #667eea;
  transform: scale(1.1);
}

.link-display-box {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.link-input {
  flex: 1;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  background: #f7fafc;
  font-weight: 500;
  color: #2d3748;
}

.btn-copy {
  padding: 14px 28px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-copy:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.link-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #718096;
  margin-bottom: 20px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.hint-icon {
  font-size: 18px;
}

.social-share {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.share-btn {
  flex: 1;
  min-width: 140px;
  padding: 12px 16px;
  text-align: center;
  text-decoration: none;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.share-icon {
  font-size: 18px;
}

.share-btn.whatsapp {
  background: #25d366;
}
.share-btn.twitter {
  background: #1da1f2;
}
.share-btn.facebook {
  background: #4267b2;
}
.share-btn.native {
  background: #667eea;
}

.recent-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  color: #2d3748;
  font-size: 20px;
}

.link-see-all {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.link-see-all:hover {
  text-decoration: underline;
}

.empty-messages {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 15px;
}

.empty-messages p {
  color: #a0aec0;
  margin-bottom: 20px;
  font-size: 16px;
}

.btn-share-empty {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-share-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.recent-messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mini-message {
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #e2e8f0;
  transition: all 0.2s;
  cursor: pointer;
}

.mini-message:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateX(4px);
}

.mini-message.unread {
  background: #f0f4ff;
  border-left-color: #667eea;
}

.mini-message.flagged {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.mini-message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.mini-date {
  font-size: 12px;
  color: #a0aec0;
}

.mini-badges {
  display: flex;
  gap: 6px;
}

.mini-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.mini-badge.new {
  background: #667eea;
  color: white;
}

.mini-badge.starred {
  background: #fef5e7;
}

.mini-badge.warning {
  background: #fbbf24;
  color: white;
}

.mini-content {
  color: #2d3748;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.mini-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-quick-reply {
  padding: 8px 16px;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-quick-reply:hover {
  background: #667eea;
  color: white;
}

.insights-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.insights-section h3 {
  color: #2d3748;
  font-size: 20px;
  margin-bottom: 20px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.insight-card {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.insight-card.tip {
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
  border-color: #fbbf24;
}

.insight-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.insight-content strong {
  display: block;
  color: #2d3748;
  margin-bottom: 6px;
  font-size: 15px;
}

.insight-content p {
  color: #4a5568;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.insight-link {
  display: inline-block;
  margin-top: 10px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.insight-link:hover {
  text-decoration: underline;
}

.account-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.account-section h3 {
  color: #2d3748;
  font-size: 20px;
  margin-bottom: 20px;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.account-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 8px;
}

.account-label {
  font-size: 13px;
  color: #718096;
  font-weight: 500;
}

.account-value {
  font-size: 15px;
  color: #2d3748;
  font-weight: 600;
}

.upgrade-link {
  margin-left: 8px;
}

.upgrade-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
}

.upgrade-link a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-nav {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }

  .nav-links {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-link {
    font-size: 13px;
    padding: 8px 12px;
  }

  .nav-actions {
    width: 100%;
    justify-content: center;
  }

  .dashboard-content {
    padding: 20px;
  }

  .welcome-card {
    padding: 25px;
  }

  .welcome-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .welcome-card h1 {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .link-display-box {
    flex-direction: column;
  }

  .social-share {
    flex-direction: column;
  }

  .share-btn {
    min-width: 100%;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .account-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card,
.action-card,
.mini-message,
.insight-card {
  animation: fadeIn 0.5s ease-out;
}

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #5568d3;
}
</style>
