<template>
  <div class="public-profile-container">
    <nav class="profile-nav">
      <router-link to="/search" class="back-btn">
        ← Retour à la recherche
      </router-link>
      <h2>Profil Public</h2>
      <div class="spacer"></div>
    </nav>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement du profil...</p>
    </div>

    <div v-else-if="!profile" class="error-state">
      <div class="error-icon">😕</div>
      <h2>Profil introuvable</h2>
      <p>Ce profil n'existe pas ou a été supprimé</p>
      <router-link to="/search" class="btn-primary">
        🔍 Rechercher des utilisateurs
      </router-link>
    </div>

    <div v-else class="profile-content">
      <div class="profile-header">
        <div class="profile-avatar-large">
          {{ getInitials(profile.display_name || profile.username) }}
        </div>

        <h1 class="profile-name">{{ profile.display_name || profile.username }}</h1>
        <p class="profile-username">@{{ profile.username }}</p>

        <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>

        <div class="profile-stats">
          <div class="stat-item">
            <strong>{{ publicReplies.length }}</strong>
            <span>Réponses</span>
          </div>
          <div class="stat-item">
            <strong>{{ totalReactions }}</strong>
            <span>Réactions</span>
          </div>
        </div>

        <button @click="goToSendMessage" class="btn-send-message">
          💬 Envoyer un message anonyme
        </button>
      </div>

      <div class="replies-section">
        <h2 class="section-title">📝 Réponses publiques</h2>

        <div v-if="publicReplies.length === 0" class="empty-replies">
          <div class="empty-icon">📭</div>
          <p>Aucune réponse publique pour le moment</p>
        </div>

        <div v-else class="replies-list">
          <div
            v-for="reply in publicReplies"
            :key="reply.id"
            class="reply-card"
            :id="`reply-${reply.id}`" >
            <div class="original-message">
              <p class="original-label">📩 Question anonyme :</p>
              <p class="original-text">
                "{{ reply.original_message_data?.content || 'Message supprimé' }}"
              </p>
            </div>

            <div class="reply-content">
              <p class="reply-text">{{ reply.content }}</p>
              <span class="reply-date">{{ formatDate(reply.created_at) }}</span>
            </div>

            <div class="reply-actions">
              <button
                @click="toggleReaction(reply.id, 'love')"
                class="reaction-btn"
                :class="{ active: reply.user_reaction === 'love' }"
                :disabled="!currentUser"
                title="J'adore"
              >
                ❤️ {{ reply.reactions?.love || 0 }}
              </button>
              <button
                @click="toggleReaction(reply.id, 'like')"
                class="reaction-btn"
                :class="{ active: reply.user_reaction === 'like' }"
                :disabled="!currentUser"
                title="J'aime"
              >
                👍 {{ reply.reactions?.like || 0 }}
              </button>
              <button
                @click="toggleReaction(reply.id, 'fire')"
                class="reaction-btn"
                :class="{ active: reply.user_reaction === 'fire' }"
                :disabled="!currentUser"
                title="C'est chaud"
              >
                🔥 {{ reply.reactions?.fire || 0 }}
              </button>
              <button
                @click="toggleFavorite(reply.id)"
                class="favorite-btn"
                :class="{ active: reply.is_favorited }"
                :disabled="!currentUser"
                title="Ajouter aux favoris"
              >
                {{ reply.is_favorited ? '⭐' : '☆' }}
              </button>

              <button
                @click="shareReply(reply.id)"
                class="share-btn"
                title="Partager cette réponse sur les réseaux (Texte)"
              >
                🔗 Partager
              </button>

              <button
                @click="exportAsImage(reply.id)"
                class="export-image-btn"
                title="Exporter la réponse en image PNG"
              >
                🖼️ Exporter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import html2canvas from 'html2canvas' // ✅ Importation de html2canvas

const route = useRoute()
const router = useRouter()

const profile = ref(null)
const publicReplies = ref([])
const loading = ref(true)
const currentUser = ref(null)

const totalReactions = computed(() => {
  return publicReplies.value.reduce((total, reply) => {
    return total + (reply.reactions?.love || 0) +
           (reply.reactions?.like || 0) +
           (reply.reactions?.fire || 0)
  }, 0)
})

// ------------------------------------------------------------------
// LOGIQUE DE CHARGEMENT UNIFIÉE ET OPTIMISÉE
// ------------------------------------------------------------------

async function fetchUserProfileData(username) {
    if (!username) return

    loading.value = true
    profile.value = null
    publicReplies.value = []

    try {
        await loadCurrentUser()

        const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('*, public_replies_raw:replies!user_id(id, content, created_at, is_public, original_message_data:message_id(content))')
            .eq('username', username)
            .single()

        if (error || !profileData) {
            if (error && error.code === 'PGRST116') {
                profile.value = null;
                return
            }
            throw error
        }

        profile.value = profileData

        const publicOnlyReplies = profileData.public_replies_raw
            .filter(r => r.is_public)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

        if (publicOnlyReplies.length === 0) {
            publicReplies.value = []
            return
        }

        const replyIds = publicOnlyReplies.map(r => r.id)

        const repliesWithStats = await fetchRepliesStats(publicOnlyReplies, replyIds)

        if (currentUser.value) {
            await applyUserReactionStatus(repliesWithStats, replyIds)
        }

        publicReplies.value = repliesWithStats

    } catch (error) {
        console.error('Erreur chargement profil public:', error)
        profile.value = null
    } finally {
        loading.value = false
    }
}


// ------------------------------------------------
// WATCHER & OPTIMISATION (Inchangé)
// ------------------------------------------------
watch(
    () => route.params.username,
    (newUsername) => {
        fetchUserProfileData(newUsername)
    },
    { immediate: true }
)

async function fetchRepliesStats(replies, replyIds) {
    if (replyIds.length === 0) return replies

    const [{ data: reactions }, { data: favorites }] = await Promise.all([
        supabase
            .from('reply_reactions')
            .select('reply_id, reaction_type')
            .in('reply_id', replyIds),
        supabase
            .from('reply_favorites')
            .select('reply_id')
            .in('reply_id', replyIds)
    ])

    const reactionCountsMap = {}
    const favoriteCountsMap = {}

    reactions?.forEach(r => {
        reactionCountsMap[r.reply_id] = reactionCountsMap[r.reply_id] || { love: 0, like: 0, fire: 0 }
        reactionCountsMap[r.reply_id][r.reaction_type]++
    })

    favorites?.forEach(f => {
        favoriteCountsMap[f.reply_id] = (favoriteCountsMap[f.reply_id] || 0) + 1
    })

    return replies.map(reply => ({
        ...reply,
        reactions: reactionCountsMap[reply.id] || { love: 0, like: 0, fire: 0 },
        favorites_count: favoriteCountsMap[reply.id] || 0,
        user_reaction: null,
        is_favorited: false,
    }))
}

async function applyUserReactionStatus(replies, replyIds) {
    if (!currentUser.value) return

    const [{ data: userReactions }, { data: userFavorites }] = await Promise.all([
        supabase
            .from('reply_reactions')
            .select('reply_id, reaction_type')
            .eq('user_id', currentUser.value.id)
            .in('reply_id', replyIds),
        supabase
            .from('reply_favorites')
            .select('reply_id')
            .eq('user_id', currentUser.value.id)
            .in('reply_id', replyIds)
    ])

    const userReactionsMap = {}
    userReactions?.forEach(r => {
        userReactionsMap[r.reply_id] = r.reaction_type
    })

    const userFavoritesSet = new Set(userFavorites?.map(f => f.reply_id) || [])

    replies.forEach(reply => {
        reply.user_reaction = userReactionsMap[reply.id] || null
        reply.is_favorited = userFavoritesSet.has(reply.id)
    })
}

// ------------------------------------------------
// ✅ FONCTIONNALITÉS DE PARTAGE (Texte & Image)
// ------------------------------------------------

// 🖼️ 1. Exportation en image (avec html2canvas)
async function exportAsImage(replyId) {
    const replyElement = document.getElementById(`reply-${replyId}`);

    if (!replyElement) {
      alert("Erreur: Élément de réponse non trouvé pour l'exportation.");
      return;
    }

    try {
      const canvas = await html2canvas(replyElement, {
          backgroundColor: '#1A1A2E', // Couleur de fond par défaut du composant
          scale: 2 // Améliore la qualité
      });

      const imageURL = canvas.toDataURL("image/png");

      // Créer un lien temporaire pour forcer le téléchargement
      const link = document.createElement('a');
      link.download = `VibeNote_Reponse_${replyId}.png`;
      link.href = imageURL;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Image de la réponse téléchargée !");

    } catch (error) {
      console.error('Erreur exportation image:', error);
      alert("Échec de l'exportation en image. Assurez-vous que l'élément est visible.");
    }
}


// 🔗 2. Partage de texte (avec fallback)
async function shareReply(replyId) {
  const reply = publicReplies.value.find(r => r.id === replyId);
  if (!reply) return;

  const questionContent = reply.original_message_data?.content || 'Question supprimée';
  const replyContent = reply.content;
  const profileUsername = profile.value.username;

  const shareText = `
    🔥 Réponse Publique de @${profileUsername} (VibeNote)
    Q: ${questionContent}
    R: ${replyContent}
    Voir le profil et poser une question anonyme : ${window.location.origin}/${profileUsername}
  `;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Réponse de ${profileUsername} sur VibeNote`,
        text: shareText,
        url: `${window.location.origin}/${profileUsername}`
      });
      console.log('Partage réussi');
    } catch (error) {
      fallbackShare(shareText);
    }
  } else {
    fallbackShare(shareText);
  }
}

// Fonction de secours pour copier le texte
function fallbackShare(text) {
  const cleanText = text.trim().replace(/\n\s*\n/g, '\n\n');
  navigator.clipboard.writeText(cleanText).then(() => {
    alert("Texte copié dans le presse-papiers ! Collez-le sur votre réseau social.");
  }).catch(err => {
    console.error('Erreur de copie:', err);
    alert("Impossible de copier. Veuillez copier manuellement:\n\n" + cleanText);
  });
}

// ------------------------------------------------
// FONCTIONS UTILITAIRES (Inchangées)
// ------------------------------------------------

async function loadCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    currentUser.value = user
  } catch (error) {
    console.error('Erreur chargement utilisateur:', error)
  }
}

async function toggleReaction(replyId, reactionType) {
  if (!currentUser.value) {
    alert('Connectez-vous pour réagir')
    return
  }

  const reply = publicReplies.value.find(r => r.id === replyId)
  if (!reply) return

  try {
    const { data: existing } = await supabase
      .from('reply_reactions')
      .select('id, reaction_type')
      .eq('reply_id', replyId)
      .eq('user_id', currentUser.value.id)
      .maybeSingle()

    if (existing) {
      if (existing.reaction_type === reactionType) {
        await supabase.from('reply_reactions').delete().eq('id', existing.id)
        reply.reactions[reactionType]--
        reply.user_reaction = null
      } else {
        reply.reactions[existing.reaction_type]--
        reply.reactions[reactionType]++
        await supabase.from('reply_reactions').update({ reaction_type: reactionType }).eq('id', existing.id)
        reply.user_reaction = reactionType
      }
    } else {
      await supabase.from('reply_reactions').insert({ reply_id: replyId, user_id: currentUser.value.id, reaction_type: reactionType })
      reply.reactions[reactionType]++
      reply.user_reaction = reactionType
    }
  } catch (error) {
    console.error('Erreur toggle reaction:', error)
  }
}

async function toggleFavorite(replyId) {
  if (!currentUser.value) {
    alert('Connectez-vous pour ajouter aux favoris')
    return
  }

  const reply = publicReplies.value.find(r => r.id === replyId)
  if (!reply) return

  try {
    const { data: existing } = await supabase
      .from('reply_favorites')
      .select('id')
      .eq('reply_id', replyId)
      .eq('user_id', currentUser.value.id)
      .maybeSingle()

    if (existing) {
      await supabase.from('reply_favorites').delete().eq('id', existing.id)
      reply.favorites_count--
      reply.is_favorited = false
    } else {
      await supabase.from('reply_favorites').insert({ reply_id: replyId, user_id: currentUser.value.id })
      reply.favorites_count++
      reply.is_favorited = true
    }
  } catch (error) {
    console.error('Erreur toggle favorite:', error)
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

function goToSendMessage() {
  router.push(`/${profile.value.username}`)
}
</script>
<style scoped>
.public-profile-container {
  min-height: 100vh;
  background: #0B0F14;
}

.profile-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-nav h2 {
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
  width: 150px;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  color: #718096;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #1E2230;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 100px 20px;
  color: #718096;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.error-state h2 {
  font-size: 28px;
  color: #E6EDF3;
  margin-bottom: 10px;
}

.btn-primary {
  display: inline-block;
  margin-top: 30px;
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.profile-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 50px 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 60px;
  background: #121521;
  border-radius: 20px;
  padding: 50px 30px;
}

.profile-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin: 0 auto 25px;
  border: 5px solid rgba(102, 126, 234, 0.2);
}

.profile-name {
  font-size: 32px;
  color: #E6EDF3;
  margin-bottom: 8px;
}

.profile-username {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 20px;
}

.profile-bio {
  font-size: 16px;
  color: #A0AEC0;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 30px;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin: 30px 0;
  padding: 25px 0;
  border-top: 1px solid #1E2230;
  border-bottom: 1px solid #1E2230;
}

.stat-item {
  text-align: center;
}

.stat-item strong {
  display: block;
  font-size: 28px;
  color: #E6EDF3;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-item span {
  font-size: 14px;
  color: #718096;
}

.btn-send-message {
  margin-top: 25px;
  padding: 15px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-send-message:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* =========================================
   STYLES DES RÉPONSES ET ACTIONS
   ========================================= */

.replies-section {
  margin-top: 40px;
}

.section-title {
  font-size: 24px;
  color: #E6EDF3;
  margin-bottom: 30px;
  text-align: center;
}

.empty-replies {
  text-align: center;
  padding: 80px 20px;
  background: #121521;
  border-radius: 16px;
  color: #718096;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.empty-replies p {
  font-size: 16px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reply-card {
  background: #121521;
  border-radius: 16px;
  padding: 25px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.reply-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

/* Message original (Question) */
.original-message {
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.original-label {
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.original-text {
  font-size: 14px;
  color: #A0AEC0;
  font-style: italic;
  line-height: 1.6;
  margin: 0;
}

.reply-content {
  margin-bottom: 20px;
}

.reply-text {
  font-size: 16px;
  color: #E6EDF3;
  line-height: 1.7;
  margin-bottom: 12px;
}

.reply-date {
  font-size: 13px;
  color: #718096;
}

.reply-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 15px;
  border-top: 1px solid #1E2230;
}

/* Boutons de réaction et favori */
.reaction-btn,
.favorite-btn {
  padding: 10px 18px;
  background: rgba(139, 148, 158, 0.1);
  border: 1px solid rgba(139, 148, 158, 0.2);
  border-radius: 20px;
  color: #8B949E;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.reaction-btn:hover:not(:disabled),
.favorite-btn:hover:not(:disabled) {
  background: rgba(139, 148, 158, 0.2);
  transform: translateY(-2px);
}

.reaction-btn:disabled,
.favorite-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.reaction-btn.active:nth-child(1) {
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(220, 38, 38, 0.3);
  color: #DC2626;
}

.reaction-btn.active:nth-child(2) {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(37, 99, 235, 0.3);
  color: #2563EB;
}

.reaction-btn.active:nth-child(3) {
  background: rgba(234, 88, 12, 0.15);
  border-color: rgba(234, 88, 12, 0.3);
  color: #EA580C;
}

.favorite-btn.active {
  background: rgba(234, 179, 8, 0.15);
  border-color: rgba(234, 179, 8, 0.3);
  color: #EAB308;
}

/* Boutons de Partage (Texte et Image) */
.share-btn,
.export-image-btn {
    padding: 10px 18px;
    background: transparent;
    border: 1px solid #667eea;
    border-radius: 20px;
    color: #667eea;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}

.share-btn:hover,
.export-image-btn:hover {
    background: #667eea;
    color: white;
    box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
  .profile-nav {
    padding: 15px 20px;
  }

  .profile-content {
    padding: 30px 15px;
  }

  .profile-header {
    padding: 40px 20px;
  }

  .profile-avatar-large {
    width: 100px;
    height: 100px;
    font-size: 40px;
  }

  .profile-name {
    font-size: 26px;
  }

  .profile-stats {
    gap: 30px;
  }

  .reply-card {
    padding: 20px;
  }

  .reply-actions {
    gap: 8px;
  }

  .reaction-btn,
  .favorite-btn,
  .share-btn,
  .export-image-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
}
</style>
