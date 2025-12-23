<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* 1. Alles auf Null setzen */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Keine Scrollbalken */
  background-color: #ffffff;
}

/* 2. WICHTIG: Das hier repariert dein Problem! */
#app {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important; /* Verhindert das Zentrieren der ganzen App */
  margin: 0 !important;
  padding: 0 !important;
  display: flex; /* Flexbox aktivieren */
  text-align: left; /* Standard Textausrichtung zurücksetzen */
}

/* Schriftart */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #1e293b;
}

* {
  box-sizing: border-box;
}
</style>
