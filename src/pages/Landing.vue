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
/* ===============================
   LANDING — Dark Secure Theme
   =============================== */

.landing-page {
  min-height: 100vh;
  background: #0B0F14;
  color: #E6EDF3;
}

/* Hero */
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 80px 60px;
  background: radial-gradient(
    circle at top left,
    rgba(47, 129, 247, 0.12),
    transparent 60%
  );
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 54px;
  line-height: 1.2;
  margin-bottom: 24px;
  font-weight: 800;
}

.gradient-text {
  color: #2F81F7;
}

.hero-subtitle {
  font-size: 18px;
  color: #8B949E;
  line-height: 1.6;
  margin-bottom: 40px;
}

/* CTA */
.cta-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-primary-large {
  padding: 16px 34px;
  background: #2F81F7;
  color: #E6EDF3;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 0 1px rgba(47, 129, 247, 0.4);
}

.btn-primary-large:hover {
  background: #1e5fd1;
  box-shadow: 0 0 20px rgba(47, 129, 247, 0.4);
}

.btn-secondary-large {
  padding: 16px 34px;
  background: transparent;
  color: #E6EDF3;
  border: 1px solid rgba(139, 148, 158, 0.3);
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: border 0.2s;
}

.btn-secondary-large:hover {
  border-color: #2F81F7;
}

.social-proof {
  color: #8B949E;
  font-size: 15px;
}

/* Hero visual */
.hero-visual {
  display: flex;
  justify-content: center;
}

.phone-mockup {
  width: 300px;
  height: 600px;
  background: #121821;
  border-radius: 36px;
  padding: 14px;
  border: 1px solid rgba(139, 148, 158, 0.15);
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: #0B0F14;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-profile {
  background: #121821;
  padding: 26px;
  border-radius: 16px;
  width: 85%;
  text-align: center;
  border: 1px solid rgba(139, 148, 158, 0.15);
}

.mock-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #2F81F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin: 0 auto 15px;
}

.mock-profile h3 {
  margin-bottom: 6px;
}

.mock-profile p {
  color: #8B949E;
  font-size: 14px;
  margin-bottom: 18px;
}

.mock-textarea {
  background: #0B0F14;
  padding: 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #8B949E;
  margin-bottom: 15px;
  border: 1px solid rgba(139, 148, 158, 0.15);
}

.mock-button {
  background: #2F81F7;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
}

/* Features */
.features {
  padding: 100px 60px;
}

.section-title {
  font-size: 40px;
  text-align: center;
  margin-bottom: 60px;
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
  border-radius: 14px;
  background: #121821;
  border: 1px solid rgba(139, 148, 158, 0.15);
  transition: border 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  border-color: rgba(47, 129, 247, 0.4);
  box-shadow: 0 0 25px rgba(47, 129, 247, 0.15);
}

.feature-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  background: rgba(47, 129, 247, 0.15);
  border-radius: 12px;
}

.feature-card h3 {
  font-size: 22px;
  margin-bottom: 14px;
}

.feature-card p {
  color: #8B949E;
  line-height: 1.6;
}

/* Use cases */
.use-cases {
  padding: 100px 60px;
  background: #0E141B;
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
  background: #121821;
  border-radius: 12px;
  border: 1px solid rgba(139, 148, 158, 0.15);
  transition: border 0.2s;
}

.use-case:hover {
  border-color: rgba(47, 129, 247, 0.4);
}

.use-case h4 {
  margin-bottom: 10px;
}

.use-case p {
  color: #8B949E;
  font-size: 14px;
}

/* Final CTA */
.cta-final {
  padding: 100px 60px;
  text-align: center;
  background: radial-gradient(
    circle at center,
    rgba(47, 129, 247, 0.18),
    #0B0F14 70%
  );
}

.cta-final h2 {
  font-size: 40px;
  margin-bottom: 20px;
}

.cta-final p {
  font-size: 18px;
  margin-bottom: 40px;
  color: #8B949E;
}

/* Footer */
.footer {
  padding: 40px;
  text-align: center;
  background: #0B0F14;
  color: #8B949E;
  border-top: 1px solid rgba(139, 148, 158, 0.1);
}

/* Responsive */
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
