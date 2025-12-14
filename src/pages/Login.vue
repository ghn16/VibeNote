<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Se connecter</h1>

      <form @submit.prevent="handleLogin">
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
          {{ isLoading ? 'Chargement...' : 'Se connecter' }}
        </button>
      </form>

      <p class="auth-link">
        Pas encore de compte ?
        <router-link to="/signup">S'inscrire</router-link>
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

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleLogin() {
  error.value = ''
  isLoading.value = true

  const result = await auth.login(email.value, password.value)

  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error
  }

  isLoading.value = false
}
</script>

<style scoped>
/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Container général */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0B0F14;
  padding: 20px;
}

/* Card de connexion */
.auth-card {
  background: #121821;
  border-radius: 10px;
  padding: 40px 30px;
  max-width: 400px;
  width: 100%;
  border: 1px solid rgba(139, 148, 158, 0.1);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

/* Titre */
.auth-card h1 {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  color: #E6EDF3;
  margin-bottom: 30px;
}

/* Formulaire */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #8B949E;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(139, 148, 158, 0.2);
  border-radius: 8px;
  background: #0B0F14;
  color: #E6EDF3;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #2F81F7;
  box-shadow: 0 0 5px rgba(47, 129, 247, 0.3);
}

/* Message d'erreur */
.error-message {
  background: #FF5E5E1A;
  color: #FF5E5E;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 13px;
  text-align: center;
}

/* Bouton principal */
.btn-primary {
  width: 100%;
  padding: 14px;
  background: #2F81F7;
  color: #E6EDF3;
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  background: #1e5fd1;
  box-shadow: 0 0 12px rgba(47, 129, 247, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Lien d'inscription */
.auth-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #8B949E;
}

.auth-link a {
  color: #2F81F7;
  font-weight: 600;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
