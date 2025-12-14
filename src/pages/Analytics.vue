<template>
  <div class="analytics-container">
    <!-- Navigation -->
    <nav class="analytics-nav">
      <router-link to="/dashboard" class="back-btn">
        ← Retour
      </router-link>
      <h2>VibeNote</h2>
      <div class="spacer"></div>
    </nav>

    <div class="analytics-content">
      <h1>📊 Mes Statistiques</h1>
      <p class="subtitle">Analyse de ton activité VibeNote</p>

      <div v-if="analyticsStore.loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else>
        <!-- Stats principales -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👁️</div>
            <div class="stat-details">
              <h3>{{ stats.profile_views || 0 }}</h3>
              <p>Vues du profil</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📬</div>
            <div class="stat-details">
              <h3>{{ stats.total_messages || 0 }}</h3>
              <p>Messages reçus</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💬</div>
            <div class="stat-details">
              <h3>{{ stats.total_replies || 0 }}</h3>
              <p>Réponses envoyées</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-details">
              <h3>{{ stats.starred_messages || 0 }}</h3>
              <p>Messages favoris</p>
            </div>
          </div>
        </div>

        <!-- Graphique des messages -->
        <div class="chart-card">
          <h3>📈 Messages reçus (30 derniers jours)</h3>

          <div v-if="analyticsStore.messagesByDay.length === 0" class="empty-chart">
            <p>Aucun message dans les 30 derniers jours</p>
          </div>

          <div v-else>
            <div class="chart">
              <div
                v-for="(day, index) in analyticsStore.messagesByDay"
                :key="index"
                class="chart-bar"
                :style="{ height: (day.count / maxCount * 100) + '%' }"
                :title="`${day.date}: ${day.count} message${day.count > 1 ? 's' : ''}`"
              >
                <span class="bar-label">{{ day.count }}</span>
              </div>
            </div>
            <div class="chart-labels">
              <span v-for="(day, index) in displayedLabels" :key="index">
                {{ day }}
              </span>
            </div>
          </div>
        </div>

        <!-- Analyse de sentiment -->
        <div class="sentiment-card">
          <h3>😊 Analyse de sentiment</h3>
          <div class="sentiment-bars">
            <div class="sentiment-item">
              <span class="sentiment-label">
                <span class="sentiment-emoji">😊</span>
                Positifs
              </span>
              <div class="sentiment-bar-bg">
                <div
                  class="sentiment-bar positive"
                  :style="{ width: sentimentPercent.positive + '%' }"
                ></div>
              </div>
              <span class="sentiment-count">{{ sentiment.positive }}</span>
            </div>

            <div class="sentiment-item">
              <span class="sentiment-label">
                <span class="sentiment-emoji">😐</span>
                Neutres
              </span>
              <div class="sentiment-bar-bg">
                <div
                  class="sentiment-bar neutral"
                  :style="{ width: sentimentPercent.neutral + '%' }"
                ></div>
              </div>
              <span class="sentiment-count">{{ sentiment.neutral }}</span>
            </div>

            <div class="sentiment-item">
              <span class="sentiment-label">
                <span class="sentiment-emoji">😢</span>
                Négatifs
              </span>
              <div class="sentiment-bar-bg">
                <div
                  class="sentiment-bar negative"
                  :style="{ width: sentimentPercent.negative + '%' }"
                ></div>
              </div>
              <span class="sentiment-count">{{ sentiment.negative }}</span>
            </div>
          </div>
        </div>

        <!-- Meilleurs moments -->
        <div class="insights-card">
          <h3>💡 Insights</h3>
          <div class="insights-list">
            <div class="insight-item">
              <span class="insight-icon">🔥</span>
              <div>
                <strong>Jour le plus actif</strong>
                <p>{{ busiestDay.date }} avec {{ busiestDay.count }} messages</p>
              </div>
            </div>

            <div class="insight-item">
              <span class="insight-icon">📊</span>
              <div>
                <strong>Moyenne quotidienne</strong>
                <p>{{ averagePerDay }} messages par jour</p>
              </div>
            </div>

            <div class="insight-item">
              <span class="insight-icon">🎯</span>
              <div>
                <strong>Taux de réponse</strong>
                <p>{{ replyRate }}% des messages reçus</p>
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
import { useAnalyticsStore } from '@/stores/analytics'
import { useMessagesStore } from '@/stores/messages'

const auth = useAuthStore()
const analyticsStore = useAnalyticsStore()
const messagesStore = useMessagesStore()

const stats = computed(() => analyticsStore.stats || {})

const maxCount = computed(() => {
  if (analyticsStore.messagesByDay.length === 0) return 1
  return Math.max(...analyticsStore.messagesByDay.map(d => d.count))
})

const sentiment = computed(() => {
  return analyticsStore.analyzeSentiment(messagesStore.messages)
})

const sentimentTotal = computed(() => {
  return sentiment.value.positive + sentiment.value.neutral + sentiment.value.negative || 1
})

const sentimentPercent = computed(() => ({
  positive: (sentiment.value.positive / sentimentTotal.value) * 100,
  neutral: (sentiment.value.neutral / sentimentTotal.value) * 100,
  negative: (sentiment.value.negative / sentimentTotal.value) * 100
}))

const displayedLabels = computed(() => {
  if (analyticsStore.messagesByDay.length === 0) return []

  // Afficher max 10 labels pour éviter l'encombrement
  const step = Math.ceil(analyticsStore.messagesByDay.length / 10)
  return analyticsStore.messagesByDay
    .filter((_, index) => index % step === 0)
    .map(day => day.date.split('/')[0] + '/' + day.date.split('/')[1])
})

const busiestDay = computed(() => {
  if (analyticsStore.messagesByDay.length === 0) {
    return { date: 'N/A', count: 0 }
  }
  return analyticsStore.messagesByDay.reduce((max, day) =>
    day.count > max.count ? day : max
  )
})

const averagePerDay = computed(() => {
  if (analyticsStore.messagesByDay.length === 0) return 0
  const total = analyticsStore.messagesByDay.reduce((sum, day) => sum + day.count, 0)
  return Math.round(total / analyticsStore.messagesByDay.length * 10) / 10
})

const replyRate = computed(() => {
  const total = stats.value.total_messages || 0
  const replies = stats.value.total_replies || 0
  if (total === 0) return 0
  return Math.round((replies / total) * 100)
})

onMounted(async () => {
  await analyticsStore.fetchStats(auth.user.id)
  await analyticsStore.fetchMessagesByDay(auth.user.id, 30)
  await messagesStore.fetchMessages()
})
</script>

<style scoped>
 /* ===============================
   ANALYTICS — Dark Secure Theme
   =============================== */

.analytics-container {
  min-height: 100vh;
  background: #0B0F14;
  color: #E6EDF3;
}

/* Navigation */
.analytics-nav {
  background: #121821;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(139, 148, 158, 0.1);
}

.analytics-nav h2 {
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
.analytics-content {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.analytics-content h1 {
  font-size: 30px;
  margin-bottom: 8px;
}

.subtitle {
  color: #8B949E;
  margin-bottom: 30px;
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 46px;
  height: 46px;
  border: 3px solid rgba(139, 148, 158, 0.2);
  border-top-color: #2F81F7;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.stat-details h3 {
  font-size: 28px;
  margin-bottom: 5px;
}

.stat-details p {
  color: #8B949E;
  font-size: 14px;
}

/* Chart */
.chart-card {
  background: #121821;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(139, 148, 158, 0.1);
  margin-bottom: 30px;
}

.chart-card h3 {
  margin-bottom: 20px;
}

.chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 200px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(139, 148, 158, 0.15);
}

.empty-chart {
  text-align: center;
  padding: 60px 20px;
  color: #8B949E;
}

.chart-bar {
  flex: 1;
  background: #2F81F7;
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  max-width: 36px;
  opacity: 0.85;
  transition: opacity 0.2s;
}

.chart-bar:hover {
  opacity: 1;
}

.bar-label {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: #8B949E;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  font-size: 12px;
  color: #8B949E;
}

/* Sentiment */
.sentiment-card {
  background: #121821;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(139, 148, 158, 0.1);
  margin-bottom: 30px;
}

.sentiment-card h3 {
  margin-bottom: 20px;
}

.sentiment-bars {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sentiment-item {
  display: grid;
  grid-template-columns: 150px 1fr 60px;
  align-items: center;
  gap: 15px;
}

.sentiment-label {
  font-weight: 500;
}

.sentiment-bar-bg {
  background: #0B0F14;
  height: 26px;
  border-radius: 13px;
  overflow: hidden;
  border: 1px solid rgba(139, 148, 158, 0.15);
}

.sentiment-bar {
  height: 100%;
  transition: width 0.4s ease;
}

.sentiment-bar.positive {
  background: #3FB950;
}

.sentiment-bar.neutral {
  background: rgba(139, 148, 158, 0.6);
}

.sentiment-bar.negative {
  background: #da3633;
}

.sentiment-count {
  text-align: right;
  font-weight: 600;
}

/* Insights */
.insights-card {
  background: #121821;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(139, 148, 158, 0.1);
}

.insights-card h3 {
  margin-bottom: 20px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.insight-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #0B0F14;
  border-radius: 8px;
  border: 1px solid rgba(139, 148, 158, 0.1);
}

.insight-item strong {
  display: block;
  margin-bottom: 5px;
}

.insight-item p {
  color: #8B949E;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .analytics-content {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .sentiment-item {
    grid-template-columns: 1fr;
  }

  .sentiment-count {
    text-align: left;
  }
}


</style>
