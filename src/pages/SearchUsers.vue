<template>
  <div class="search-container">
    <!-- Navigation -->
    <nav class="search-nav">
      <router-link to="/dashboard" class="back-btn">
        ← Retour
      </router-link>
      <h2>🔍 Rechercher</h2>
      <div class="spacer"></div>
    </nav>

    <div class="search-content">
      <!-- Barre de recherche -->
      <div class="search-box">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Rechercher par @pseudo ou nom d'utilisateur..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-btn"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Résultats de recherche -->
      <div v-if="searching" class="loading">
        <div class="spinner"></div>
        <p>Recherche en cours...</p>
      </div>

      <div v-else-if="searchQuery && searchResults.length === 0" class="empty-state">
        <div class="empty-icon">😕</div>
        <h3>Aucun utilisateur trouvé</h3>
        <p>Essaie avec un autre nom ou pseudo</p>
      </div>

      <div v-else-if="searchResults.length > 0" class="results-section">
        <h3 class="results-title">
          {{ searchResults.length }} résultat{{ searchResults.length > 1 ? 's' : '' }}
        </h3>

        <div class="users-grid">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="user-card"
            @click="goToProfile(user.username)"
          >
            <div class="user-avatar">
              {{ getInitials(user.display_name || user.username) }}
            </div>

            <div class="user-info">
              <h4 class="user-name">{{ user.display_name || user.username }}</h4>
              <p class="user-username">@{{ user.username }}</p>
              <p v-if="user.bio" class="user-bio">{{ truncateBio(user.bio) }}</p>
            </div>

            <div class="user-stats">
              <span class="stat">
                <strong>{{ user.replies_count || 0 }}</strong> réponses
              </span>
            </div>

            <button class="btn-view-profile">
              Voir le profil →
            </button>
          </div>
        </div>
      </div>

      <!-- Utilisateurs suggérés -->
      <div v-else class="suggestions-section">
        <h3 class="section-title">👥 Utilisateurs actifs</h3>

        <div v-if="loadingSuggestions" class="loading">
          <div class="spinner"></div>
        </div>

        <div v-else class="users-grid">
          <div
            v-for="user in suggestedUsers"
            :key="user.id"
            class="user-card"
            @click="goToProfile(user.username)"
          >
            <div class="user-avatar">
              {{ getInitials(user.display_name || user.username) }}
            </div>

            <div class="user-info">
              <h4 class="user-name">{{ user.display_name || user.username }}</h4>
              <p class="user-username">@{{ user.username }}</p>
              <p v-if="user.bio" class="user-bio">{{ truncateBio(user.bio) }}</p>
            </div>

            <div class="user-stats">
              <span class="stat">
                <strong>{{ user.replies_count || 0 }}</strong> réponses
              </span>
            </div>

            <button class="btn-view-profile">
              Voir le profil →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const router = useRouter()

const searchQuery = ref('')
const searchResults = ref([])
const suggestedUsers = ref([])
const searching = ref(false)
const loadingSuggestions = ref(false)

let searchTimeout = null

onMounted(async () => {
  await loadSuggestedUsers()
})

async function loadSuggestedUsers() {
  try {
    loadingSuggestions.value = true

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) throw error

    // Charger le nombre de réponses publiques pour chaque utilisateur
    const usersWithStats = await Promise.all(
      (data || []).map(async (user) => {
        const { count } = await supabase
          .from('replies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_public', true)

        return { ...user, replies_count: count || 0 }
      })
    )

    // Trier par nombre de réponses
    suggestedUsers.value = usersWithStats
      .filter(u => u.replies_count > 0)
      .sort((a, b) => b.replies_count - a.replies_count)

  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error)
  } finally {
    loadingSuggestions.value = false
  }
}

function handleSearch() {
  clearTimeout(searchTimeout)

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searching.value = true

  searchTimeout = setTimeout(async () => {
    await performSearch()
  }, 500)
}

async function performSearch() {
  try {
    const query = searchQuery.value.trim().toLowerCase()

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20)

    if (error) throw error

    // Charger les stats
    const usersWithStats = await Promise.all(
      (data || []).map(async (user) => {
        const { count } = await supabase
          .from('replies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_public', true)

        return { ...user, replies_count: count || 0 }
      })
    )

    searchResults.value = usersWithStats

  } catch (error) {
    console.error('Erreur recherche:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function truncateBio(bio) {
  if (!bio) return ''
  return bio.length > 80 ? bio.slice(0, 80) + '...' : bio
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

function goToProfile(username) {
  router.push(`/profile/${username}`)
}
</script>

<style scoped>
.search-container {
  min-height: 100vh;
  background: #0B0F14;
}

.search-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-nav h2 {
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

.search-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.search-box {
  margin-bottom: 40px;
}

.search-input-wrapper {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 18px 60px;
  background: #121521;
  border: 2px solid #1E2230;
  border-radius: 16px;
  font-size: 16px;
  color: #E6EDF3;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: #1A1F26;
}

.search-input::placeholder {
  color: #718096;
}

.clear-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: #1E2230;
  border-radius: 50%;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #2F1F0F;
  color: #E6EDF3;
}

.results-title,
.section-title {
  font-size: 20px;
  color: #E6EDF3;
  margin-bottom: 25px;
  padding-left: 5px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.user-card {
  background: #121521;
  border-radius: 16px;
  padding: 25px;
  border: 2px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 auto;
}

.user-info {
  text-align: center;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
  color: #E6EDF3;
  margin: 0 0 5px 0;
}

.user-username {
  font-size: 14px;
  color: #667eea;
  margin: 0 0 10px 0;
}

.user-bio {
  font-size: 13px;
  color: #718096;
  line-height: 1.5;
  margin: 0;
}

.user-stats {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  border-top: 1px solid #1E2230;
  border-bottom: 1px solid #1E2230;
}

.stat {
  font-size: 13px;
  color: #718096;
}

.stat strong {
  color: #E6EDF3;
  font-weight: 700;
}

.btn-view-profile {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-profile:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.5);
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #1E2230;
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
  color: #718096;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  color: #E6EDF3;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .search-nav {
    padding: 15px 20px;
  }

  .search-content {
    padding: 20px;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }

  .search-input {
    padding: 15px 50px;
    font-size: 14px;
  }
}
</style>
