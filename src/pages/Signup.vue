<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Créer un compte</h1>

      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="johndoe"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="john@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="isLoading" class="btn-primary">
          {{ isLoading ? 'Chargement...' : 'S\'inscrire' }}
        </button>
      </form>

      <p class="auth-link">
        Déjà un compte ?
        <router-link to="/login">Se connecter</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleSignup() {
  error.value = ''
  isLoading.value = true

  const result = await auth.signup(email.value, password.value, username.value)

  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error
  }

  isLoading.value = false
}
</script>
