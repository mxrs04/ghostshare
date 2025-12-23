<script setup>
import { ref } from 'vue'

// --- KONFIGURATION ---
const BACKEND_URL = "https://ghostshare-aa6g.onrender.com";

// --- STATE ---
const isDarkMode = ref(false) // Standard: Light Mode
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadSuccess = ref(false)
const downloadLink = ref("")
const errorMessage = ref("")
const selectedDuration = ref(60)
const fileInput = ref(null)

// --- FUNKTIONEN ---

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
}

async function onDrop(e) {
  isDragOver.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) await uploadFile(files[0])
}

function onFileSelect(e) {
  const files = e.target.files
  if (files.length > 0) uploadFile(files[0])
}

async function uploadFile(file) {
  isUploading.value = true
  errorMessage.value = ""
  uploadSuccess.value = false

  const formData = new FormData()
  formData.append("file", file)
  formData.append("minutes", selectedDuration.value)

  try {
    const response = await fetch(`${BACKEND_URL}/api/files/upload`, {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      if (response.status === 413) throw new Error("Datei zu groß (>50MB)");
      throw new Error("Upload fehlgeschlagen");
    }

    const data = await response.json()
    downloadLink.value = `${BACKEND_URL}/api/files/download/${data.filename}`
    uploadSuccess.value = true

  } catch (error) {
    console.error(error)
    errorMessage.value = error.message || "Server antwortet nicht."
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ""
  }
}

function copyLink() {
  navigator.clipboard.writeText(downloadLink.value)
  alert("Link kopiert!")
}
</script>

<template>
  <div class="app-container" :class="{ 'dark': isDarkMode }">
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
            <span class="label-text">Transfer</span>
          </button>

          <button class="nav-item" @click="toggleTheme">
            <span class="icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
            <span class="label-text">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          Version 2.1 • Secure
        </div>
      </aside>

      <main class="main-content">
        <div class="background-pattern"></div>

        <div class="center-content">
          <h1 class="headline">Datei senden</h1>
          <p class="subheadline">Sicherer Transfer. Automatische Löschung.</p>

          <div class="upload-card" v-if="!uploadSuccess">
            <div
              class="dropzone"
              :class="{ 'drag-over': isDragOver, 'uploading': isUploading }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="onDrop"
              @click="fileInput.click()"
            >
              <input type="file" ref="fileInput" style="display: none" @change="onFileSelect">
              <div class="dropzone-content">
                <span class="cloud-icon" v-if="!isUploading">
                  {{ isDarkMode ? '☁️' : '☁️' }}
                </span>
                <span class="cloud-icon spin" v-else>⏳</span>
                <p v-if="!isUploading">Klicken oder Datei ziehen</p>
                <p v-else>Wird hochgeladen...</p>
              </div>
            </div>

            <div class="settings-row">
              <span class="label">GÜLTIGKEIT:</span>
              <div class="toggle-group">
                <button class="toggle-btn" :class="{ active: selectedDuration === 10 }" @click="selectedDuration = 10">10 Min</button>
                <button class="toggle-btn" :class="{ active: selectedDuration === 60 }" @click="selectedDuration = 60">1 Std</button>
                <button class="toggle-btn" :class="{ active: selectedDuration === 1440 }" @click="selectedDuration = 1440">24 Std</button>
              </div>
            </div>

            <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

            <button class="start-btn" @click="fileInput.click()" :disabled="isUploading">
              {{ isUploading ? 'Bitte warten...' : 'Datei auswählen' }}
            </button>
          </div>

          <div class="upload-card success-card" v-else>
            <div class="success-content">
              <div class="success-icon">🎉</div>
              <h2 class="success-title">Datei ist online!</h2>
              <p class="success-desc">Der Link ist bereit zum Teilen.</p>
              <div class="link-box">{{ downloadLink }}</div>
              <button class="start-btn" @click="copyLink">Link kopieren</button>
              <button class="reset-btn" @click="uploadSuccess = false">Weitere Datei</button>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* --- CSS VARIABLES FÜR THEMES --- */
.app-container {
  /* LIGHT MODE (Standard) */
  --bg-color: #f8fafc;
  --sidebar-bg: #ffffff;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --card-bg: rgba(255, 255, 255, 0.85);
  --card-border: rgba(255, 255, 255, 0.8);
  --pattern-color: #cbd5e1;
  --accent-color: #0f172a;
  --accent-hover: #1e293b;
  --dropzone-bg: #f8fafc;
  --dropzone-border: #cbd5e1;
  --btn-text: #ffffff;
  --nav-hover: #f1f5f9;
  --nav-active-bg: #eff6ff;
  --nav-active-text: #2563eb;

  width: 100%;
  min-height: 100vh; /* WICHTIG für iPhone Scroll */
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container.dark {
  /* DARK MODE */
  --bg-color: #020617; /* Sehr dunkles Blau/Schwarz */
  --sidebar-bg: #0f172a;
  --text-main: #f1f5f9;
  --text-sub: #94a3b8;
  --card-bg: rgba(15, 23, 42, 0.7);
  --card-border: rgba(255, 255, 255, 0.1);
  --pattern-color: #1e293b; /* Dunklere Punkte */
  --accent-color: #3b82f6; /* Helles Blau als Akzent */
  --accent-hover: #2563eb;
  --dropzone-bg: #1e293b;
  --dropzone-border: #334155;
  --btn-text: #ffffff;
  --nav-hover: #1e293b;
  --nav-active-bg: #1e293b;
  --nav-active-text: #60a5fa;
}

/* --- LAYOUT --- */
.layout-wrapper {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
  transition: background-color 0.3s ease;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 280px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  padding: 32px;
  flex-shrink: 0;
  z-index: 50;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark .sidebar {
  border-right: 1px solid rgba(255,255,255,0.05);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.logo-icon {
  font-size: 24px;
  background: var(--nav-hover);
  padding: 8px;
  border-radius: 10px;
  transition: background-color 0.3s;
}

.brand-title {
  font-weight: 700;
  font-size: 16px;
  color: var(--text-main);
  transition: color 0.3s;
}

.brand-subtitle {
  font-size: 10px;
  color: var(--text-sub);
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
  color: var(--text-sub);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.nav-item.active {
  background-color: var(--nav-active-bg);
  color: var(--nav-active-text);
}

.nav-item:hover:not(.active) {
  background-color: var(--nav-hover);
  color: var(--text-main);
}

.sidebar-footer {
  font-size: 11px;
  color: var(--text-sub);
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
  /* Fix für Scrolling */
  min-height: 100vh;
  padding: 20px;
}

.background-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  /* Das Pattern nutzt jetzt die Variable */
  background-image: radial-gradient(var(--pattern-color) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  pointer-events: none;
}

.center-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 520px;
  text-align: center;
}

/* --- KARTE --- */
.headline {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 10px 0;
  letter-spacing: -0.5px;
  transition: color 0.3s;
}

.subheadline {
  font-size: 16px;
  color: var(--text-sub);
  margin-bottom: 32px;
  transition: color 0.3s;
}

.upload-card {
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--card-border);
  transition: all 0.3s ease;
}

.dropzone {
  border: 2px dashed var(--dropzone-border);
  border-radius: 16px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--dropzone-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
}

.dropzone:hover, .dropzone.drag-over {
  border-color: var(--accent-color);
  opacity: 0.8;
}

.dropzone-content {
  color: var(--text-sub);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cloud-icon {
  font-size: 40px;
}

.cloud-icon.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.toggle-group {
  background: var(--dropzone-bg);
  padding: 4px;
  border-radius: 10px;
  display: flex;
  border: 1px solid var(--dropzone-border);
}

.toggle-btn {
  background: transparent;
  border: none;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-sub);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: var(--card-bg);
  color: var(--text-main);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Spezialfall Dark Mode Toggle Active */
.dark .toggle-btn.active {
  background: #334155;
  color: #fff;
}

.start-btn {
  width: 100%;
  padding: 16px;
  background-color: var(--accent-color);
  color: var(--btn-text);
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.start-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #ef4444;
  font-size: 12px;
  margin-bottom: 16px;
  background: rgba(254, 242, 242, 0.5);
  padding: 8px;
  border-radius: 8px;
}

/* SUCCESS STATE */
.success-content {
  text-align: center;
  padding: 10px 0;
}
.success-title {
  color: var(--text-main);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}
.success-desc {
  color: var(--text-sub);
  font-size: 14px;
  margin-bottom: 24px;
}
.link-box {
  background: var(--dropzone-bg);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--dropzone-border);
  color: var(--text-main);
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  margin-bottom: 24px;
}
.reset-btn {
  margin-top: 16px;
  background: none;
  border: none;
  color: var(--text-sub);
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}
.reset-btn:hover { color: var(--text-main); }

/* --- MOBILE --- */
@media (max-width: 768px) {
  .layout-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 15px 20px;
    border-right: none;
    border-bottom: 1px solid var(--dropzone-border);
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .brand { margin-bottom: 0; }

  /* Auf Handy zeigen wir nur den Toggle, den Rest blenden wir aus Platzgründen aus oder man macht ein Hamburger Menü */
  .nav-menu button:not(:last-child), .sidebar-footer {
    display: none;
  }

  .main-content {
    /* WICHTIG FÜR SCROLLING FIX */
    height: auto;
    min-height: calc(100vh - 70px);
    align-items: flex-start; /* Oben ausrichten */
    padding-top: 40px;
    padding-bottom: 40px; /* Platz unten lassen */
  }

  .headline { font-size: 28px; }
  .upload-card { padding: 24px; }
}
</style>
