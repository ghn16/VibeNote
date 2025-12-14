
import { supabase } from './supabase'

/**
 * Service de modération et sécurité
 */
export const moderationService = {
  // Charger les mots interdits
  async loadBlockedWords() {
    const { data } = await supabase
      .from('blocked_words')
      .select('word, severity')
      .eq('is_active', true)

    return data || []
  },

  // Vérifier si un message contient des mots interdits
  checkContent(content, blockedWords) {
    const lowerContent = content.toLowerCase()
    const violations = []

    for (const item of blockedWords) {
      const regex = new RegExp(`\\b${item.word}\\b`, 'i')
      if (regex.test(lowerContent)) {
        violations.push({
          word: item.word,
          severity: item.severity
        })
      }
    }

    return {
      isClean: violations.length === 0,
      violations,
      hasHighSeverity: violations.some(v => v.severity === 'high')
    }
  },

  // Vérifier si l'expéditeur est bloqué
  async isBlocked(userId, ipAddress, fingerprint) {
    // Vérifier blocage utilisateur spécifique
    if (userId) {
      const { data: userBlocks } = await supabase
        .from('blocked_senders')
        .select('*')
        .eq('user_id', userId)
        .or(`blocked_ip.eq.${ipAddress},blocked_fingerprint.eq.${fingerprint}`)
        .or('blocked_until.is.null,blocked_until.gt.now()')

      if (userBlocks && userBlocks.length > 0) {
        return { blocked: true, reason: 'blocked_by_user' }
      }
    }

    // Vérifier blocage global
    const { data: globalBlocks } = await supabase
      .from('global_blocks')
      .select('*')
      .or(`ip_address.eq.${ipAddress},fingerprint.eq.${fingerprint}`)
      .or('blocked_until.is.null,blocked_until.gt.now()')

    if (globalBlocks && globalBlocks.length > 0) {
      return { blocked: true, reason: 'globally_blocked' }
    }

    return { blocked: false }
  },

  // Vérifier le rate limiting
  async checkRateLimit(recipientId, ipAddress, fingerprint) {
    try {
      const { data, error } = await supabase
        .rpc('check_message_rate_limit', {
          p_ip: ipAddress,
          p_fingerprint: fingerprint,
          p_recipient_id: recipientId
        })

      if (error) throw error
      return data // true si ok, false si limite atteinte
    } catch (error) {
      console.error('Rate limit check error:', error)
      return true // En cas d'erreur, autoriser
    }
  },

  // Enregistrer l'envoi de message pour le rate limiting
  async recordMessageSent(recipientId, ipAddress, fingerprint) {
    await supabase
      .from('message_limits')
      .insert([{
        ip_address: ipAddress,
        fingerprint: fingerprint,
        recipient_id: recipientId
      }])
  },

  // Signaler un message
  async reportMessage(messageId, reason) {
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        message_id: messageId,
        reported_by: (await supabase.auth.getUser()).data.user?.id,
        reason: reason
      }])

    return { success: !error, error }
  },

  // Bloquer un expéditeur (IP ou fingerprint)
  async blockSender(userId, ipAddress, fingerprint, reason, duration = null) {
    const blockedUntil = duration
      ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
      : null

    const { error } = await supabase
      .from('blocked_senders')
      .insert([{
        user_id: userId,
        blocked_ip: ipAddress,
        blocked_fingerprint: fingerprint,
        reason: reason,
        blocked_until: blockedUntil
      }])

    return { success: !error, error }
  },

  // Générer un fingerprint simple du navigateur
  generateFingerprint() {
    const nav = window.navigator
    const screen = window.screen

    const fingerprint = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage
    ].join('|')

    // Hash simple
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }

    return hash.toString(36)
  },

  // Obtenir l'IP (côté client - approximatif)
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }
}
