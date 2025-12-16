import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    messages: [],
    publicReplies: [],
    loading: false
  }),

  getters: {
    unreadCount: (state) => state.messages.filter(m => !m.is_read).length,

    starredMessages: (state) => state.messages.filter(m => m.is_starred),

    archivedMessages: (state) => state.messages.filter(m => m.is_archived),

    activeMessages: (state) => state.messages.filter(m => !m.is_archived)
  },

  actions: {
    // =====================================================
    // CHARGER LES MESSAGES
    // =====================================================
    async fetchMessages() {
      try {
        this.loading = true
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        this.messages = data || []
      } catch (error) {
        console.error('Erreur chargement messages:', error)
      } finally {
        this.loading = false
      }
    },
   // Fichier: messages.js

// ... (code précédent) ...
// =====================================================
// CHARGER LES RÉPONSES PUBLIQUES
// =====================================================
async loadPublicReplies() {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Récupérer les réponses publiques avec les messages originaux
    const { data, error } = await supabase
      .from('replies')
      .select(`
        *,
        message:messages(content)
      `)
      .eq('user_id', user.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Formatter les données
    this.publicReplies = (data || []).map(reply => ({
      ...reply,
      original_message: reply.message?.content || 'Message supprimé',
      reactions: reply.reactions || { love: 0, like: 0, fire: 0 },
      favorites_count: reply.favorites_count || 0
    }))

    // Charger les réactions de l'utilisateur actuel
    await this.loadUserReactions(user.id)

  } catch (error) {
    console.error('Erreur chargement réponses publiques:', error)
  }
},
// ... (code suivant) ...
    // =====================================================
    // CHARGER LES RÉACTIONS DE L'UTILISATEUR
    // =====================================================
    async loadUserReactions(userId) {
      try {
        if (!userId || this.publicReplies.length === 0) return

        const replyIds = this.publicReplies.map(r => r.id)

        // Charger les réactions
        const { data: reactions } = await supabase
          .from('reply_reactions')
          .select('reply_id, reaction_type')
          .eq('user_id', userId)
          .in('reply_id', replyIds)

        // Charger les favoris
        const { data: favorites } = await supabase
          .from('reply_favorites')
          .select('reply_id')
          .eq('user_id', userId)
          .in('reply_id', replyIds)

        // Mapper les réactions
        const reactionsMap = {}
        reactions?.forEach(r => {
          reactionsMap[r.reply_id] = r.reaction_type
        })

        // Mapper les favoris
        const favoritesSet = new Set(favorites?.map(f => f.reply_id) || [])

        // Mettre à jour les réponses
        this.publicReplies.forEach(reply => {
          reply.user_reaction = reactionsMap[reply.id] || null
          reply.is_favorited = favoritesSet.has(reply.id)
        })

      } catch (error) {
        console.error('Erreur chargement réactions utilisateur:', error)
      }
    },

    // =====================================================
    // MARQUER COMME LU / NON LU
    // =====================================================
    async markAsRead(messageId) {
      try {
        const message = this.messages.find(m => m.id === messageId)
        if (!message) return

        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', messageId)

        if (error) throw error

        message.is_read = true
      } catch (error) {
        console.error('Erreur mark as read:', error)
      }
    },

    // =====================================================
    // TOGGLE ÉTOILE (FAVORI)
    // =====================================================
    async toggleStar(messageId) {
      try {
        const message = this.messages.find(m => m.id === messageId)
        if (!message) return

        const newValue = !message.is_starred

        const { error } = await supabase
          .from('messages')
          .update({ is_starred: newValue })
          .eq('id', messageId)

        if (error) throw error

        message.is_starred = newValue
      } catch (error) {
        console.error('Erreur toggle star:', error)
      }
    },

    // =====================================================
    // TOGGLE ARCHIVE
    // =====================================================
    async toggleArchive(messageId) {
      try {
        const message = this.messages.find(m => m.id === messageId)
        if (!message) return

        const newValue = !message.is_archived

        const { error } = await supabase
          .from('messages')
          .update({ is_archived: newValue })
          .eq('id', messageId)

        if (error) throw error

        message.is_archived = newValue
      } catch (error) {
        console.error('Erreur toggle archive:', error)
      }
    },

    // =====================================================
    // SUPPRIMER UN MESSAGE
    // =====================================================
    async deleteMessage(messageId) {
      try {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', messageId)

        if (error) throw error

        this.messages = this.messages.filter(m => m.id !== messageId)
      } catch (error) {
        console.error('Erreur suppression message:', error)
      }
    },

    // =====================================================
    // ENVOYER UN MESSAGE ANONYME
    // =====================================================
    async sendAnonymousMessage(uniqueLink, content) {
      try {
        // Récupérer l'ID du destinataire
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('unique_link', uniqueLink)
          .single()

        if (profileError) throw profileError

        // Créer le message
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            recipient_id: profile.id,
            content: content,
            is_read: false
          })

        if (messageError) throw messageError

        return { success: true }

      } catch (error) {
        console.error('Erreur envoi message:', error)
        return { success: false, error: error.message }
      }
    },

    // =====================================================
    // RÉPONDRE À UN MESSAGE
    // =====================================================
    async replyToMessage(messageId, content, isPublic = false) {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Non authentifié' }

        // Créer la réponse
        const { data: reply, error: replyError } = await supabase
          .from('replies')
          .insert({
            message_id: messageId,
            user_id: user.id,
            content: content,
            is_public: isPublic
          })
          .select()
          .single()

        if (replyError) throw replyError

        // Marquer le message comme répondu
        await supabase
          .from('messages')
          .update({ is_replied: true })
          .eq('id', messageId)

        // Si publique, recharger les réponses publiques
        if (isPublic) {
          await this.loadPublicReplies()
        }

        // Recharger les messages
        await this.fetchMessages()

        return { success: true }

      } catch (error) {
        console.error('Erreur envoi réponse:', error)
        return { success: false, error: error.message }
      }
    },

    // =====================================================
    // TOGGLE RÉACTION (Love, Like, Fire)
    // =====================================================
    async toggleReaction(replyId, reactionType) {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          console.warn('Utilisateur non connecté')
          return
        }

        const reply = this.publicReplies.find(r => r.id === replyId)
        if (!reply) return

        // Vérifier si l'utilisateur a déjà une réaction (sans .single())
        const { data: existingReactions, error: fetchError } = await supabase
          .from('reply_reactions')
          .select('id, reaction_type')
          .eq('reply_id', replyId)
          .eq('user_id', user.id)

        if (fetchError) {
          console.error('Erreur récupération réaction:', fetchError)
          return
        }

        const existing = existingReactions && existingReactions.length > 0 ? existingReactions[0] : null

        if (existing) {
          if (existing.reaction_type === reactionType) {
            // Retirer la réaction
            const { error: deleteError } = await supabase
              .from('reply_reactions')
              .delete()
              .eq('id', existing.id)

            if (deleteError) {
              console.error('Erreur suppression réaction:', deleteError)
              return
            }

            reply.user_reaction = null
          } else {
            // Changer la réaction
            const { error: updateError } = await supabase
              .from('reply_reactions')
              .update({ reaction_type: reactionType })
              .eq('id', existing.id)

            if (updateError) {
              console.error('Erreur mise à jour réaction:', updateError)
              return
            }

            reply.user_reaction = reactionType
          }
        } else {
          // Ajouter la réaction
          const { error: insertError } = await supabase
            .from('reply_reactions')
            .insert({
              reply_id: replyId,
              user_id: user.id,
              reaction_type: reactionType
            })

          if (insertError) {
            console.error('Erreur insertion réaction:', insertError)
            return
          }

          reply.user_reaction = reactionType
        }

        // Recharger pour avoir les compteurs à jour
        await this.loadPublicReplies()

      } catch (error) {
        console.error('Erreur toggle reaction:', error)
      }
    },

    // =====================================================
    // TOGGLE FAVORI
    // =====================================================
    async toggleFavorite(replyId) {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          console.warn('Utilisateur non connecté')
          return
        }

        const reply = this.publicReplies.find(r => r.id === replyId)
        if (!reply) return

        // Vérifier si déjà en favori (sans .single())
        const { data: existingFavorites, error: fetchError } = await supabase
          .from('reply_favorites')
          .select('id')
          .eq('reply_id', replyId)
          .eq('user_id', user.id)

        if (fetchError) {
          console.error('Erreur récupération favori:', fetchError)
          return
        }

        const existing = existingFavorites && existingFavorites.length > 0 ? existingFavorites[0] : null

        if (existing) {
          // Retirer des favoris
          const { error: deleteError } = await supabase
            .from('reply_favorites')
            .delete()
            .eq('id', existing.id)

          if (deleteError) {
            console.error('Erreur suppression favori:', deleteError)
            return
          }

          reply.is_favorited = false
        } else {
          // Ajouter aux favoris
          const { error: insertError } = await supabase
            .from('reply_favorites')
            .insert({
              reply_id: replyId,
              user_id: user.id
            })

          if (insertError) {
            console.error('Erreur insertion favori:', insertError)
            return
          }

          reply.is_favorited = true
        }

        // Recharger pour avoir les compteurs à jour
        await this.loadPublicReplies()

      } catch (error) {
        console.error('Erreur toggle favorite:', error)
      }
    }
  }
})
