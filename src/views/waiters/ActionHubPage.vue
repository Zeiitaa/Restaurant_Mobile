<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <div class="toolbar-brand">
            <ion-icon name="restaurant-menu" style="margin-right:6px" />
            RestoKita
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleSignOut">
            <ion-icon name="log-out-outline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">

      <div class="hub-greeting">
        <h2 class="hub-title">Service Hub</h2>
        <p class="hub-sub">Select a primary task to continue</p>
      </div>

      <!-- Action Cards -->
      <div class="action-grid">

        <div class="action-card action-card--primary" @click="navigateTo('new-order')">
          <div class="action-icon-wrap action-icon-wrap--white">
            <ion-icon name="add-circle" style="font-size:48px;color:#fff" />
          </div>
          <h3 class="action-title action-title--white">Create New Order</h3>
          <p class="action-desc action-desc--white">Start a new table service</p>
        </div>

        <div class="action-card action-card--light" @click="navigateTo('ongoing')">
          <div class="action-icon-wrap action-icon-wrap--amber">
            <ion-icon name="flame" style="font-size:48px;color:#d97706" />
          </div>
          <h3 class="action-title">Ongoing Orders</h3>
          <p class="action-desc">Monitor kitchen progress</p>
        </div>

        <div class="action-card action-card--light" @click="navigateTo('payment')">
          <div class="action-icon-wrap action-icon-wrap--green">
            <ion-icon name="wallet" style="font-size:48px;color:#059669" />
          </div>
          <h3 class="action-title">Complete Payment</h3>
          <p class="action-desc">Checkout and finalize</p>
        </div>

      </div>

      <!-- Staff Info -->
      <ion-card class="staff-card">
        <ion-card-content>
          <div class="staff-row">
            <div class="staff-avatar">
              <ion-icon name="person" style="font-size:20px;color:#94a3b8" />
              <div class="staff-online-dot"></div>
            </div>
            <div>
              <p class="staff-label">Active Staff</p>
              <p class="staff-name">{{ auth.profile?.username }}</p>
            </div>
            <div class="staff-divider"></div>
            <div class="staff-right">
              <p class="staff-label">Session Time</p>
              <p class="staff-time">{{ formattedSessionTime }}</p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonCard, IonCardContent, alertController
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const auth = useAuthStore()
const activeSeconds = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const formattedSessionTime = computed(() => {
  const h = Math.floor(activeSeconds.value / 3600).toString().padStart(2, '0')
  const m = Math.floor((activeSeconds.value % 3600) / 60).toString().padStart(2, '0')
  const s = (activeSeconds.value % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

onMounted(() => { timerInterval = setInterval(() => activeSeconds.value++, 1000) })
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

const navigateTo = (dest: string) => {
  if (dest === 'new-order') router.push('/waiters/table')
  if (dest === 'ongoing') router.push('/waiters/ongoing-order')
  if (dest === 'payment') router.push('/waiters/payment')
}

const handleSignOut = async () => {
  const alert = await alertController.create({
    header: 'Sign Out',
    message: 'Are you sure you want to sign out?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Sign Out', handler: () => auth.logout() }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
.toolbar-brand { display: flex; align-items: center; font-weight: 700; font-size: 18px; }
.hub-greeting { text-align: center; margin: 28px 0 24px; }
.hub-title { font-size: 26px; font-weight: 800; margin: 0 0 6px; color: var(--ion-color-dark); }
.hub-sub { font-size: 14px; color: var(--ion-color-medium); margin: 0; }

.action-grid { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }

.action-card {
  border-radius: 20px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
  min-height: 160px;
  justify-content: center;
  gap: 10px;
}
.action-card:active { transform: scale(0.97); }
.action-card--primary { background: var(--ion-color-primary); box-shadow: 0 8px 24px rgba(79,70,229,.3); }
.action-card--light { background: #fff; border: 1.5px solid #e2e8f0; box-shadow: 0 2px 12px rgba(0,0,0,.06); }

.action-icon-wrap { width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
.action-icon-wrap--white { background: rgba(255,255,255,.2); }
.action-icon-wrap--amber { background: #fef3c7; }
.action-icon-wrap--green { background: #d1fae5; }

.action-title { font-size: 18px; font-weight: 800; margin: 0; }
.action-title--white { color: #fff; }
.action-desc { font-size: 13px; margin: 0; }
.action-desc--white { color: rgba(255,255,255,.8); }

.staff-card { border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.06); margin: 0; }
.staff-row { display: flex; align-items: center; gap: 14px; }
.staff-avatar { position: relative; width: 42px; height: 42px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.staff-online-dot { position: absolute; bottom: 1px; right: 1px; width: 10px; height: 10px; background: #10b981; border: 2px solid #fff; border-radius: 50%; }
.staff-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--ion-color-medium); margin: 0 0 2px; }
.staff-name { font-size: 15px; font-weight: 700; margin: 0; }
.staff-divider { width: 1px; height: 36px; background: #e2e8f0; flex-shrink: 0; }
.staff-right { margin-left: auto; text-align: right; }
.staff-time { font-size: 15px; font-weight: 700; font-family: monospace; margin: 0; }

@media (prefers-color-scheme: dark) {
  .action-card--light { background: #1e293b; border-color: #334155; }
  .hub-title { color: #f1f5f9; }
}
</style>
