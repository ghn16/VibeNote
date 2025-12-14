<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Reçois des messages anonymes
          <span class="gradient-text">en toute simplicité</span>
        </h1>
        <p class="hero-subtitle">
          Crée ton lien unique, partage-le sur tes réseaux et découvre ce que les gens pensent vraiment de toi. 100% anonyme. 100% fun.
        </p>

        <div class="cta-buttons">
          <router-link to="/signup" class="btn-primary-large">
            🚀 Créer mon lien gratuitement
          </router-link>
          <a href="#how-it-works" class="btn-secondary-large">
            Comment ça marche ?
          </a>
        </div>

        <div class="social-proof">
          <p>✨ Déjà <strong>10,000+</strong> utilisateurs nous font confiance</p>
        </div>
      </div>

      <div class="hero-visual">
        <div class="phone-mockup">
          <div class="phone-screen">
            <div class="mock-profile">
              <div class="mock-avatar">JD</div>
              <h3>John Doe</h3>
              <p>Envoie-moi un message anonyme</p>
              <div class="mock-textarea">Écris quelque chose...</div>
              <div class="mock-button">Envoyer</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="how-it-works">
      <h2 class="section-title">Comment ça marche ?</h2>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🔗</div>
          <h3>1. Crée ton lien</h3>
          <p>Inscris-toi en 30 secondes et obtiens ton lien unique personnalisé</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>2. Partage-le</h3>
          <p>Diffuse ton lien sur Instagram, TikTok, Twitter ou WhatsApp</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <h3>3. Reçois des messages</h3>
          <p>Découvre ce que les gens pensent vraiment. Anonymement.</p>
        </div>
      </div>
    </section>

    <!-- Use Cases Section -->
    <section class="use-cases">
      <h2 class="section-title">Parfait pour...</h2>

      <div class="use-cases-grid">
        <div class="use-case">
          <span class="use-case-emoji">🎨</span>
          <h4>Créateurs de contenu</h4>
          <p>Reçois des feedbacks honnêtes de ta communauté</p>
        </div>

        <div class="use-case">
          <span class="use-case-emoji">💑</span>
          <h4>Couples & Amis</h4>
          <p>Découvrez ce que vous pensez l'un de l'autre</p>
        </div>

        <div class="use-case">
          <span class="use-case-emoji">🎓</span>
          <h4>Étudiants</h4>
          <p>Questions, confessions et messages entre camarades</p>
        </div>

        <div class="use-case">
          <span class="use-case-emoji">👥</span>
          <h4>Communautés</h4>
          <p>Crée une connexion authentique avec ton audience</p>
        </div>
      </div>
    </section>

    <!-- CTA Final -->
    <section class="cta-final">
      <h2>Prêt à découvrir ce qu'on pense de toi ?</h2>
      <p>Rejoins des milliers d'utilisateurs qui utilisent VibeNote</p>
      <router-link to="/signup" class="btn-primary-large">
        Commencer gratuitement →
      </router-link>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2024 VibeNote. Tous droits réservés.</p>
    </footer>
  </div>
</template>

<script setup>
// Pas de logique nécessaire pour le moment
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: white;
}

.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 80px 60px;
  background: linear-gradient(135deg, #f7f9fc 0%, #ffffff 100%);
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 56px;
  line-height: 1.2;
  color: #1a202c;
  margin-bottom: 24px;
  font-weight: 800;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 20px;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 40px;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-primary-large {
  padding: 18px 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-secondary-large {
  padding: 18px 36px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.btn-secondary-large:hover {
  background: #f7f9fc;
}

.social-proof {
  color: #718096;
  font-size: 16px;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-mockup {
  width: 300px;
  height: 600px;
  background: #1a202c;
  border-radius: 40px;
  padding: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.phone-mockup::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 25px;
  background: #1a202c;
  border-radius: 0 0 20px 20px;
  z-index: 2;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-profile {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 85%;
  text-align: center;
}

.mock-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  margin: 0 auto 15px;
}

.mock-profile h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #1a202c;
}

.mock-profile p {
  color: #718096;
  font-size: 14px;
  margin-bottom: 20px;
}

.mock-textarea {
  background: #f7fafc;
  padding: 15px;
  border-radius: 8px;
  color: #a0aec0;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: left;
}

.mock-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
}

.features {
  padding: 100px 60px;
  background: white;
}

.section-title {
  font-size: 42px;
  text-align: center;
  margin-bottom: 60px;
  color: #1a202c;
  font-weight: 800;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 40px;
  border-radius: 16px;
  background: #f7f9fc;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #1a202c;
}

.feature-card p {
  color: #4a5568;
  line-height: 1.6;
}

.use-cases {
  padding: 100px 60px;
  background: linear-gradient(135deg, #f7f9fc 0%, #ffffff 100%);
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.use-case {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.use-case:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.use-case-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}

.use-case h4 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #1a202c;
}

.use-case p {
  color: #718096;
  font-size: 14px;
}

.cta-final {
  padding: 100px 60px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cta-final h2 {
  font-size: 42px;
  margin-bottom: 20px;
  font-weight: 800;
}

.cta-final p {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.footer {
  padding: 40px;
  text-align: center;
  background: #1a202c;
  color: #a0aec0;
}

@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-visual {
    display: none;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .use-cases-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-title {
    font-size: 42px;
  }
}

@media (max-width: 768px) {
  .use-cases-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
  }
}
</style>
