<script setup>
import { ref, onMounted } from 'vue'
import QrcodeVue from 'qrcode.vue'

// --- KONFIGURATION ---
const BACKEND_URL = "https://ghostshare-aa6g.onrender.com";

// --- STATE ---
// Standardmäßig auf TRUE (Dark Mode an)
const isDarkMode = ref(true)

const isDragOver = ref(false)
const isUploading = ref(false)
const uploadSuccess = ref(false)
const downloadLink = ref("")
const shareLink = ref("")
const errorMessage = ref("")
const selectedDuration = ref(60)
const fileInput = ref(null)

const isDownloadMode = ref(false)
const receivedFilename = ref("")
const receivedFileUrl = ref("")
const isImage = ref(false)

// --- LIFECYCLE & SPEICHER-LOGIK ---
onMounted(() => {
  // 1. Theme Check: Hat der Nutzer schon mal was eingestellt?
  const savedTheme = localStorage.getItem('ghostshare-theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = true
  }

  // 2. Empfänger-Check (QR-Code Logik)
  const urlParams = new URLSearchParams(window.location.search)
  const fileParam = urlParams.get('f')

  if (fileParam) {
    isDownloadMode.value = true
    receivedFilename.value = fileParam
    receivedFileUrl.value = `${BACKEND_URL}/api/files/download/${fileParam}`

    const ext = fileParam.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      isImage.value = true
    }
  }
})

// --- FUNKTIONEN ---

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  // Speichern der Auswahl im Browser
  localStorage.setItem('ghostshare-theme', isDarkMode.value ? 'dark' : 'light')
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
      if (response.status === 413) throw new Error("Datei zu groß (>150MB)");
      throw new Error("Upload fehlgeschlagen");
    }

    const data = await response.json()
    downloadLink.value = `${BACKEND_URL}/api/files/download/${data.filename}`
    shareLink.value = `${window.location.origin}/?f=${data.filename}`
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
  navigator.clipboard.writeText(shareLink.value)
  alert("Link kopiert!")
}

function triggerDownload() {
  window.open(downloadLink.value || receivedFileUrl.value, '_blank')
}
</script>

<template>
  <div class="app-container" :class="{ 'dark': isDarkMode }">
    <div class="layout-wrapper">

      <aside class="sidebar">
        <div class="brand">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75v5.25c0 1.243.975 2.25 2.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-1.5h3v1.5a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-5.25c0-5.385-4.365-9.75-9.75-9.75zM9 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="brand-text">
            <div class="brand-title">GhostShare</div>
            <div class="brand-subtitle">TEMPORÄRER DATENTRANSFER</div>
          </div>
        </div>

        <nav class="nav-menu">
          <button class="nav-item active" v-if="!isDownloadMode" @click="window.location.href='/'">
            <span class="icon">⚡</span>
            <span class="label-text">Neuer Transfer</span>
          </button>
          <button class="nav-item" v-if="!isDownloadMode">
            <span class="icon">📂</span>
            <span class="label-text">Aktive Dateien</span>
          </button>
          <button class="nav-item" v-if="isDownloadMode" @click="window.location.href='/'">
            <span class="icon">⬅️</span>
            <span class="label-text">Eigene Datei senden</span>
          </button>
        </nav>

        <div class="theme-switch-wrapper">
          <span class="theme-label">Dark Mode</span>

          <div class="mobile-toggle-container">
            <span class="mobile-icon sun">☀️</span>
            <button class="apple-switch" :class="{ active: isDarkMode }" @click="toggleTheme">
              <div class="switch-thumb"></div>
            </button>
            <span class="mobile-icon moon">🌙</span>
          </div>
        </div>

        <div class="sidebar-footer">
          Version 2.6 • Secure
        </div>
      </aside>

      <main class="main-content">
        <div class="background-pattern"></div>

        <div class="center-content">

          <div v-if="isDownloadMode">
            <h1 class="headline">Datei empfangen</h1>
            <p class="subheadline">Diese Datei löscht sich bald automatisch.</p>

            <div class="upload-card success-card">
              <div class="success-content">
                <div v-if="isImage" class="image-preview-container">
                  <img :src="receivedFileUrl" class="image-preview" alt="Vorschau" />
                  <p style="font-size: 10px; color: #94a3b8; margin-top: 5px;">Gedrückt halten zum Speichern</p>
                </div>
                <div v-else class="file-icon-placeholder">
                  📄
                </div>

                <div class="link-box" style="margin-top: 20px;">{{ receivedFilename }}</div>

                <button class="start-btn" @click="triggerDownload">
                  Herunterladen
                </button>
              </div>
            </div>
          </div>

          <div v-else>
            <h1 class="headline" v-if="!uploadSuccess">Datei senden</h1>
            <p class="subheadline" v-if="!uploadSuccess">Sicherer Transfer. Automatische Löschung.</p>

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
                  <span class="cloud-icon" v-if="!isUploading">☁️</span>
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
                <h2 class="success-title">Bereit zum Teilen!</h2>

                <div class="qr-wrapper">
                  <qrcode-vue
                    :value="shareLink"
                    :size="180"
                    level="H"
                    :background="'#ffffff'"
                    :foreground="'#000000'"
                    class="qr-code"
                  />
                </div>
                <p style="font-size: 12px; color: #64748b; margin-bottom: 15px;">Scannen zum Öffnen</p>

                <div class="link-box">{{ shareLink }}</div>

                <button class="start-btn" @click="copyLink">Link kopieren</button>
                <button class="reset-btn" @click="uploadSuccess = false">Weitere Datei</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* --- CSS VARIABLES --- */
.app-container {
  /* Light Mode */
  --bg-color: #f8fafc;
  --sidebar-bg: #ffffff;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --card-bg: rgba(255, 255, 255, 0.9);
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
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container.dark {
  /* Dark Mode */
  --bg-color: #020617;
  --sidebar-bg: #0f172a;
  --text-main: #f1f5f9;
  --text-sub: #94a3b8;
  --card-bg: rgba(15, 23, 42, 0.7);
  --card-border: rgba(255, 255, 255, 0.1);
  --pattern-color: #1e293b;
  --accent-color: #3b82f6;
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
  transition: background-color 0.3s ease;
}

.dark .sidebar { border-right: 1px solid rgba(255,255,255,0.05); }

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

/* LOGO ICON ANPASSUNG FÜR SVG */
.logo-icon {
  display: flex; /* Zentriert das SVG */
  align-items: center;
  justify-content: center;
  background: var(--nav-hover);
  padding: 8px;
  border-radius: 10px;
  color: var(--text-main); /* SVG nimmt diese Farbe an */
  transition: background-color 0.3s, color 0.3s;
}

.brand-title {
  font-weight: 700;
  font-size: 16px;
  color: var(--text-main);
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

/* --- THEME TOGGLE & ICONS --- */
.theme-switch-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-top: 20px;
  background-color: var(--nav-hover);
  border-radius: 12px;
}

.theme-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.mobile-toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-icon {
  display: none;
  font-size: 16px;
}

.apple-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #cbd5e1;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 0;
}

.apple-switch.active { background-color: #34c759; }

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.apple-switch.active .switch-thumb { transform: translateX(20px); }

.sidebar-footer {
  font-size: 11px;
  color: var(--text-sub);
  text-align: center;
  margin-top: 24px;
}

/* --- MAIN CONTENT & HINTERGRUND --- */
.main-content {
  flex-grow: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  overflow-y: auto;
}

.background-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
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
  padding-bottom: 40px;
}

.headline {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 10px 0;
  letter-spacing: -0.5px;
}

.subheadline {
  font-size: 16px;
  color: var(--text-sub);
  margin-bottom: 32px;
}

/* --- UPLOAD CARD --- */
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

.cloud-icon { font-size: 40px; }
.cloud-icon.spin { animation: spin 1s linear infinite; }
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
.dark .toggle-btn.active { background: #334155; color: #fff; }

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

.start-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.error-msg {
  color: #ef4444;
  font-size: 12px;
  margin-bottom: 16px;
  background: rgba(254, 242, 242, 0.5);
  padding: 8px;
  border-radius: 8px;
}

/* SUCCESS / RECEIVER STYLES */
.success-content { text-align: center; padding: 10px 0; }
.success-title {
  color: var(--text-main);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
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
  overflow-wrap: break-word;
}
.qr-wrapper {
  background: white;
  padding: 16px;
  border-radius: 16px;
  display: inline-block;
  margin-bottom: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.image-preview-container {
  margin-bottom: 20px;
}
.image-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.file-icon-placeholder {
  font-size: 60px;
  margin-bottom: 20px;
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

/* --- MOBILE OPTIMIERUNG --- */
@media (max-width: 768px) {
  .layout-wrapper {
    flex-direction: column;
    height: auto;
    overflow-y: visible;
  }

  .sidebar {
    width: 100%;
    padding: 15px 20px;
    border-right: none;
    border-bottom: 1px solid var(--dropzone-border);
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
  }

  .brand { margin-bottom: 0; }
  .nav-menu { display: none; }
  .sidebar-footer { display: none; }

  .theme-switch-wrapper {
    margin-top: 0;
    padding: 0;
    background: transparent;
  }
  .theme-label { display: none; }

  .mobile-icon {
    display: inline-block;
  }

  .main-content {
    height: auto;
    min-height: calc(100vh - 70px);
    overflow-y: visible;
    align-items: flex-start;
    padding-top: 40px;
  }

  .headline { font-size: 28px; }
  .upload-card { padding: 24px; }
}
</style>
