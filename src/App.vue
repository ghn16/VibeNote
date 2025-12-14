<template>
  <div id="app">
    <router-view v-if="!auth.loading" />
    <div v-else class="loading-container">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.init()
})
</script>

<style>
/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

/* ===== Auth Pages ===== */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
}

.auth-card h1 {
  font-size: 28px;
  color: #2d3748;
  text-align: center;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
}

.auth-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #718096;
}

.auth-link a {
  color: #667eea;
  font-weight: 600;
}

.auth-link a:hover {
  text-decoration: underline;
}

/* ===== Dashboard ===== */
.dashboard-container {
  min-height: 100vh;
  background: white;
}

.dashboard-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.dashboard-nav h2 {
  font-size: 24px;
}

.btn-logout {
  padding: 10px 24px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: white;
  color: #667eea;
}

.dashboard-content {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.welcome-card h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 18px;
  opacity: 0.9;
}

.info-card {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.info-card h3 {
  font-size: 20px;
  color: #2d3748;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #718096;
  font-weight: 500;
}

.info-item .value {
  color: #2d3748;
  font-weight: 600;
}

/* ===== Loading ===== */
.loading-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

</style>
