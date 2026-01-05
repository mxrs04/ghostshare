<script setup>
import { ref, onMounted } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { upload } from '@vercel/blob/client';

// --- KONFIGURATION ---
// Da Frontend (GitHub) und Backend (Vercel) getrennt sind, brauchen wir die volle URL:
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
      // HIER GEÄNDERT: BACKEND_URL hinzugefügt
      const res = await fetch(`${BACKEND_URL}/api/download?f=${encodeURIComponent(fileParam)}`);
      if (!res.ok) throw new Error("Datei nicht gefunden");
      const data = await res.json();

      receivedFileUrl.value = data.url;

      const ext = data.filename.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) isImage.value = true;
      if (['mp4', 'mov', 'webm'].includes(ext)) isVideo.value = true;

    } catch (e) {
      errorMessage.value = "Datei existiert nicht mehr.";
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

// --- DER UPLOAD (ANGEPASST FÜR EXTERNES BACKEND) ---
async function uploadFile(file) {
  isUploading.value = true
  errorMessage.value = ""
  uploadSuccess.value = false

  try {
    // 1. Upload direkt zu Vercel Blob
    const newBlob = await upload(file.name, file, {
      access: 'public',
      // HIER GEÄNDERT: Volle URL zum Vercel Backend
      handleUploadUrl: `${BACKEND_URL}/api/blob-upload`,
      addRandomSuffix: true
    });

    // 2. Metadaten speichern
    // HIER GEÄNDERT: Volle URL zum Vercel Backend
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
    shareLink.value = `${window.location.origin}/?f=${encodeURIComponent(file.name)}`
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
