<script setup>
import { ref, onMounted } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { upload } from '@vercel/blob/client';

// --- KONFIGURATION ---
const BACKEND_URL = "https://ghostshare-gamma.vercel.app";

// --- STATE ---
const isDarkMode = ref(true)
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadSuccess = ref(false)
const shareLink = ref("")
const errorMessage = ref("")
const selectedDuration = ref(60)
const fileInput = ref(null)

// Download Mode State
const isDownloadMode = ref(false)
const receivedFilename = ref("")
const receivedFileUrl = ref("")
const isImage = ref(false)
const isVideo = ref(false)

// --- LIFECYCLE ---
onMounted(async () => {
  const savedTheme = localStorage.getItem('ghostshare-theme')
  if (savedTheme) isDarkMode.value = savedTheme === 'dark'

  const urlParams = new URLSearchParams(window.location.search)
  const fileParam = urlParams.get('f')

  if (fileParam) {
    isDownloadMode.value = true
    receivedFilename.value = fileParam

    try {
      const res = await fetch(`${BACKEND_URL}/api/download?f=${encodeURIComponent(fileParam)}`);
      if (!res.ok) throw new Error("Datei nicht gefunden");
      const data = await res.json();

      receivedFileUrl.value = data.url;

      const ext = data.filename.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) isImage.value = true;
      if (['mp4', 'mov', 'webm'].includes(ext)) isVideo.value = true;

    } catch (e) {
      errorMessage.value = "Datei existiert nicht mehr oder Link ist abgelaufen.";
    }
  }
})

// --- FUNKTIONEN ---
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
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

  try {
    // 1. Upload
    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: `${BACKEND_URL}/api/blob-upload`,
      addRandomSuffix: true
    });

    // 2. Metadaten speichern
    const response = await fetch(`${BACKEND_URL}/api/upload-meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: newBlob.url,
        filename: file.name,
        minutes: selectedDuration.value
      })
    });

    if (!response.ok) throw new Error("Speichern fehlgeschlagen");

    // 3. Erfolg
    shareLink.value = `${window.location.origin}${window.location.pathname}?f=${encodeURIComponent(file.name)}`
    uploadSuccess.value = true

  } catch (error) {
    console.error(error)
    errorMessage.value = "Upload fehlgeschlagen: " + error.message
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
  window.open(receivedFileUrl.value, '_blank')
}
</script>

<template>
  <div class="main-wrapper" :class="{ 'dark-mode': isDarkMode }">
    <div class="app-container">

      <header>
        <div class="logo">👻 GhostShare</div>
        <button class="theme-btn" @click="toggleTheme">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
      </header>

      <main>

        <div v-if="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>

        <div v-if="isDownloadMode" class="card">
          <h2>Datei empfangen</h2>
          <p class="filename">{{ receivedFilename }}</p>

          <div v-if="receivedFileUrl" class="preview-area">
            <img v-if="isImage" :src="receivedFileUrl" alt="Preview" class="preview-img" />
            <video v-if="isVideo" :src="receivedFileUrl" controls class="preview-video"></video>

            <button @click="triggerDownload" class="primary-btn download-btn">
              ⬇️ Herunterladen
            </button>
          </div>
          <div v-else class="loading-spinner">
            Lade Datei...
          </div>

          <a href="/" class="back-link">Eigene Datei hochladen</a>
        </div>

        <div v-else-if="uploadSuccess" class="card success-card">
          <h2>Fertig! 🚀</h2>
          <p>Deine Datei ist bereit.</p>

          <div class="qr-wrapper">
            <QrcodeVue :value="shareLink" :size="200" level="H" />
          </div>

          <div class="link-box">
            <input type="text" :value="shareLink" readonly />
            <button @click="copyLink">Kopieren</button>
          </div>

          <button @click="uploadSuccess = false" class="secondary-btn">Neue Datei</button>
        </div>

        <div v-else class="upload-area">

          <div v-if="isUploading" class="loading-overlay">
            <div class="spinner"></div>
            <p>Geisterstunde... (Upload läuft)</p>
          </div>

          <div
            class="dropzone"
            :class="{ 'active': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="onDrop"
            @click="$refs.fileInput.click()"
          >
            <div class="icon">☁️</div>
            <h3>Datei hier ablegen</h3>
            <p>oder klicken zum Auswählen</p>
            <input ref="fileInput" type="file" hidden @change="onFileSelect">
          </div>

          <div class="settings">
            <label>Löschen nach:</label>
            <select v-model="selectedDuration">
              <option :value="5">5 Minuten</option>
              <option :value="30">30 Minuten</option>
              <option :value="60">1 Stunde</option>
              <option :value="1440">24 Stunden</option>
            </select>
          </div>

        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
/* GENERAL LAYOUT */
.main-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
  color: #334155;
  transition: background 0.3s, color 0.3s;
}

.main-wrapper.dark-mode {
  background-color: #0f172a;
  color: #f1f5f9;
}

.app-container {
  width: 100%;
  max-width: 450px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* HEADER */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.theme-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* CARDS & ZONES */
.card, .dropzone {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dark-mode .card,
.dark-mode .dropzone {
  background: rgba(30, 41, 59, 0.7);
  box-shadow: none;
  border: 1px solid #334155;
}

/* DROPZONE */
.dropzone {
  border: 2px dashed #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.dropzone:hover, .dropzone.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

/* INPUTS */
.settings {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

/* SUCCESS STATE */
.link-box {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.link-box input {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #fff;
}

.link-box button {
  padding: 0 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.qr-wrapper {
  background: white;
  padding: 15px;
  border-radius: 10px;
  display: inline-block;
  margin: 10px 0;
}

/* PREVIEW */
.preview-img, .preview-video {
  max-width: 100%;
  border-radius: 10px;
  margin: 15px 0;
}

.primary-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
}

.back-link {
  display: block;
  margin-top: 15px;
  color: #6366f1;
  text-decoration: none;
}

/* SPINNER */
.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 20px;
}
.dark-mode .loading-overlay {
  background: rgba(15, 23, 42, 0.9);
}

.error-box {
  background: #fee2e2;
  color: #991b1b;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  text-align: center;
}
</style>
