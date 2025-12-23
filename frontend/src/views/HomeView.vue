<script setup>
import { ref } from 'vue'

const isDragOver = ref(false)

function onDrop(e) {
  isDragOver.value = false
  // Datei-Logik hier
  console.log(e.dataTransfer.files)
}
</script>

<template>
  <div class="layout-wrapper">

    <aside class="sidebar">
      <div class="brand">
        <div class="logo-icon">👻</div>
        <div class="brand-text">
          <div class="brand-title">GhostShare</div>
          <div class="brand-subtitle">EPHEMERAL TRANSFER</div>
        </div>
      </div>

      <nav class="nav-menu">
        <button class="nav-item active">
          <span class="icon">⚡</span>
          <span class="label-text">Neuer Transfer</span>
        </button>
        <button class="nav-item">
          <span class="icon">📂</span>
          <span class="label-text">Aktive Dateien</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        Version 2.0 • Secure
      </div>
    </aside>

    <main class="main-content">
      <div class="background-pattern"></div>

      <div class="center-content">
        <h1 class="headline">Datei senden</h1>
        <p class="subheadline">Sicherer Transfer. Automatische Löschung.</p>

        <div class="upload-card">
          <div
            class="dropzone"
            :class="{ 'drag-over': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="onDrop"
          >
            <div class="dropzone-content">
              <span class="cloud-icon">☁️</span>
              <p>Klicken oder Datei ziehen</p>
            </div>
          </div>

          <div class="settings-row">
            <span class="label">GÜLTIGKEIT:</span>
            <div class="toggle-group">
              <button class="toggle-btn">10 Min</button>
              <button class="toggle-btn active">1 Std</button>
              <button class="toggle-btn">24 Std</button>
            </div>
          </div>

          <button class="start-btn">Transfer starten</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* --- LAYOUT --- */
.layout-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 280px;
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  padding: 32px;
  flex-shrink: 0;
  z-index: 50;
  transition: all 0.3s ease;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.logo-icon {
  font-size: 24px;
  background: #f1f5f9;
  padding: 8px;
  border-radius: 10px;
}

.brand-title {
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}

.brand-subtitle {
  font-size: 10px;
  color: #64748b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: 2px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  /* DUNKLES GRAU statt helles Grau für bessere Lesbarkeit */
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #2563eb;
}

.nav-item:hover:not(.active) {
  background-color: #f8fafc;
  color: #0f172a;
}

.sidebar-footer {
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  margin-top: auto;
}

/* --- MAIN CONTENT & HINTERGRUND --- */
.main-content {
  flex-grow: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f8fafc; /* Heller Hintergrund */
}

.background-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;

  /* BALANCE: Nicht zu dunkel, nicht zu hell (#cbd5e1 ist Slate-300) */
  background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
  background-size: 24px 24px;

  /* Vignette bleibt, damit der Fokus mittig ist */
  mask-image: radial-gradient(circle at center, black 50%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle at center, black 50%, transparent 100%);
}

.center-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 520px;
  padding: 20px;
  text-align: center;
}

/* --- KARTE --- */
.headline {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px 0;
  letter-spacing: -0.5px;
}

.subheadline {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 32px;
}

.upload-card {
  /* FAST UNDURCHSICHTIG (0.95), damit der Text lesbar bleibt */
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 32px;
  border-radius: 24px;
  box-shadow:
    0 10px 30px -5px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
}

.dropzone:hover, .dropzone.drag-over {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.dropzone-content {
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cloud-icon {
  font-size: 40px;
  color: #94a3b8;
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.toggle-group {
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  display: flex;
  border: 1px solid #e2e8f0;
}

.toggle-btn {
  background: transparent;
  border: none;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
}

.toggle-btn.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.05);
}

.start-btn {
  width: 100%;
  padding: 16px;
  background-color: #0f172a;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.start-btn:hover {
  background-color: #1e293b;
  transform: translateY(-1px);
}

/* --- MOBILE --- */
@media (max-width: 768px) {
  .layout-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    padding: 15px 20px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    margin-bottom: 0;
  }

  .nav-menu, .sidebar-footer {
    display: none;
  }

  .main-content {
    height: calc(100vh - 70px);
    align-items: flex-start;
    padding-top: 40px;
  }

  .headline {
    font-size: 28px;
  }

  .upload-card {
    padding: 24px;
  }
}
</style>
