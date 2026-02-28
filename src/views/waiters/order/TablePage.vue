<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/waiters" />
        </ion-buttons>
        <ion-title>Select a Table</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">

      <div v-if="isLoading" class="loading-center">
        <ion-spinner name="crescent" color="primary" />
        <p>Loading tables...</p>
      </div>

      <div v-else-if="tableStore.tableAvailable.length === 0" class="empty-state">
        <ion-icon name="grid-outline" class="empty-icon" />
        <h3>No Tables Available</h3>
        <p>All tables are currently booked.</p>
      </div>

      <div v-else class="table-grid">
        <div
          v-for="table in tableStore.tableAvailable"
          :key="table.id"
          :class="['table-card', table.status === 'available' ? 'table-card--available' : 'table-card--booked']"
          @click="selectTable(table)"
        >
          <span class="table-code">{{ table.table_code }}</span>
          <div class="table-seats">
            <ion-icon name="people" class="seats-icon" />
            <span>{{ table.capacity }} Seats</span>
          </div>
          <div :class="['table-status', table.status === 'available' ? 'table-status--available' : 'table-status--booked']">
            <span class="status-dot" />
            {{ table.status === 'available' ? 'Available' : 'Booked' }}
          </div>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon, IonSpinner
} from '@ionic/vue'
import { useTableStore } from '@/stores/table'
import router from '@/router'

const tableStore = useTableStore()
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  await tableStore.fetchTableAvailable()
  isLoading.value = false
})

const selectTable = (table: any) => {
  if (table.status === 'booked') return
  router.push({ name: 'waiters-menu', params: { tableCode: table.table_code } })
}
</script>

<style scoped>
.loading-center { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60%; gap: 14px; color: var(--ion-color-medium); }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60%; text-align: center; color: var(--ion-color-medium); }
.empty-icon { font-size: 64px; margin-bottom: 16px; opacity: .4; }
.empty-state h3 { font-size: 18px; font-weight: 700; margin: 0 0 6px; }
.empty-state p { font-size: 14px; margin: 0; }

.table-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.table-card {
  border-radius: 18px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
  min-height: 130px;
  justify-content: center;
}
.table-card:active { transform: scale(0.96); }
.table-card--available { background: #fff; border: 2px solid var(--ion-color-primary); box-shadow: 0 4px 16px rgba(79,70,229,.12); }
.table-card--booked { background: #f8fafc; border: 2px solid #e2e8f0; opacity: .6; cursor: not-allowed; }
.table-code { font-size: 28px; font-weight: 800; color: var(--ion-color-primary); }
.table-card--booked .table-code { color: #94a3b8; }
.table-seats { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--ion-color-medium); text-transform: uppercase; letter-spacing: .05em; }
.seats-icon { font-size: 15px; }
.table-status { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.table-status--available { color: var(--ion-color-primary); }
.table-status--booked { color: #94a3b8; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.table-status--available .status-dot { animation: pulse 1.2s infinite; }

@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }

@media (prefers-color-scheme: dark) {
  .table-card--available { background: #1e293b; border-color: var(--ion-color-primary); }
  .table-card--booked { background: #1e293b; }
}
</style>
