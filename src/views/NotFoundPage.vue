<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding not-found-content">
      <div class="not-found-center">
        <ion-icon name="alert-circle-outline" class="nf-icon" />
        <h1 class="nf-code">404</h1>
        <p class="nf-msg">Page not found</p>
        <ion-button @click="$router.replace('/')" class="nf-btn">
          <ion-icon name="home" slot="start" />
          Go Home
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue'
</script>

<style scoped>
.not-found-content { --background: var(--ion-color-light); }
.not-found-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px; }
.nf-icon { font-size: 100px; color: var(--ion-color-medium); opacity: .35; margin-bottom: 16px; }
.nf-code { font-size: 72px; font-weight: 900; color: var(--ion-color-primary); margin: 0; }
.nf-msg { font-size: 18px; font-weight: 600; color: var(--ion-color-medium); margin: 8px 0 32px; }
.nf-btn { --border-radius: 12px; font-weight: 700; }
</style>
