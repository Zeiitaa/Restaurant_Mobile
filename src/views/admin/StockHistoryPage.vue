<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/admin" /></ion-buttons>
        <ion-title>Stock History</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchQuery" placeholder="Search menu item..." :debounce="300" />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div v-if="isLoading" class="loading-center"><ion-spinner name="crescent" color="primary" /></div>

      <div v-else class="stock-list">
        <ion-card v-for="item in filteredItems" :key="item.id" class="stock-card">
          <ion-card-content>
            <div class="sc-row">
              <div class="sc-main">
                <p class="sc-name">{{ item.menu.name }}</p>
                <p class="sc-date">{{ formatDate(item.date) }}</p>
              </div>
              <div class="sc-right">
                <p class="sc-qty" :class="item.quantity > 0 ? 'positive' : 'negative'">
                  added by {{ item.staff.username }}
                </p>
                <p class="sc-after">Added: {{ item.stock_after }}</p>
              </div>
            </div>
            <p class="sc-notes" v-if="item.notes">{{ item.notes }}</p>
          </ion-card-content>
        </ion-card>

        <div v-if="filteredItems.length === 0" class="empty-state">
          <ion-icon name="bar-chart-outline" class="empty-icon" />
          <p>No stock history found</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSearchbar, IonSpinner, IonCard, IonCardContent, IonRefresher, IonRefresherContent
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/helpers/api'

const auth = useAuthStore()
const stockHistory = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value) return stockHistory.value
  const q = searchQuery.value.toLowerCase()
  return stockHistory.value.filter((i: any) => i.menu_name?.toLowerCase().includes(q))
})

const formatDate = (d: string) =>
  new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const load = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/upstock/', { headers: { Authorization: `Bearer ${auth.token}` } })
    stockHistory.value = res.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (e) {
    console.error(e)
    stockHistory.value = []
  }
  finally { isLoading.value = false }
}
onMounted(load)
const doRefresh = async (e: any) => { await load(); e.target.complete() }
</script>

<style scoped>
.loading-center { display: flex; justify-content: center; padding: 60px; }
.stock-list { display: flex; flex-direction: column; gap: 10px; }
.stock-card { border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.07); margin: 0; }
.sc-row { display: flex; align-items: flex-start; justify-content: space-between; }
.sc-main { flex: 1; }
.sc-name { font-size: 15px; font-weight: 700; margin: 0 0 2px; }
.sc-date { font-size: 12px; color: var(--ion-color-medium); margin: 0; }
.sc-right { text-align: right; }
.sc-qty { font-size: 20px; font-weight: 900; margin: 0; }
.sc-qty.positive { color: var(--ion-color-success); }
.sc-qty.negative { color: var(--ion-color-danger); }
.sc-after { font-size: 12px; color: var(--ion-color-medium); margin: 2px 0 0; }
.sc-notes { font-size: 12px; color: var(--ion-color-medium); margin: 8px 0 0; font-style: italic; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: var(--ion-color-medium); gap: 8px; text-align: center; }
.empty-icon { font-size: 56px; opacity: .35; }
</style>
