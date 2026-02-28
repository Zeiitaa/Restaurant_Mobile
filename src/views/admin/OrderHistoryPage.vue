<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button default-href="/admin" /></ion-buttons>
        <ion-title>Order History</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchQuery" placeholder="Search order, table, guest..." :debounce="300" />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Filter chips -->
      <div class="filter-row">
        <ion-chip
          v-for="f in filters"
          :key="f"
          :color="activeFilter === f ? 'primary' : 'light'"
          @click="activeFilter = f"
        >{{ f }}</ion-chip>
      </div>

      <div v-if="isLoading" class="loading-center"><ion-spinner name="crescent" color="primary" /></div>

      <div v-else class="order-list">
        <ion-card v-for="order in filteredOrders" :key="order.id" class="order-hist-card">
          <ion-card-content>
            <div class="oh-header">
              <div>
                <p class="oh-id">#{{ order.id }}</p>
                <p class="oh-date">{{ formatDate(order.date) }}</p>
              </div>
              <ion-badge :color="order.payment_status === 'paid' ? 'success' : 'warning'">
                {{ order.payment_status }}
              </ion-badge>
            </div>
            <div class="oh-meta">
              <span>Table: <strong>{{ order.table_code }}</strong></span>
              <span>Guest: <strong>{{ order.guest_name || 'Walk-in' }}</strong></span>
            </div>
            <div class="oh-footer">
              <span class="oh-total">{{ formatIDR(order.total_amount) }}</span>
              <ion-badge color="light">{{ order.payment_method }}</ion-badge>
            </div>
          </ion-card-content>
        </ion-card>

        <div v-if="filteredOrders.length === 0" class="empty-state">
          <ion-icon name="receipt-outline" class="empty-icon" />
          <p>No orders found</p>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonIcon,
  IonSearchbar, IonChip, IonSpinner, IonCard, IonCardContent, IonBadge, IonRefresher, IonRefresherContent
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import api from '@/helpers/api'

const auth = useAuthStore()
const tableStore = useTableStore()
const orders = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const activeFilter = ref('All')
const filters = ['All', 'paid', 'unpaid']

const filteredOrders = computed(() => {
  let result = orders.value
  if (activeFilter.value !== 'All') result = result.filter((o: any) => o.payment_status === activeFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((o: any) =>
      String(o.id).includes(q) || o.table_code?.toLowerCase().includes(q) || o.guest_name?.toLowerCase().includes(q)
    )
  }
  return result
})

const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val ?? 0)
const formatDate = (d: string) =>
  new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const load = async () => {
  isLoading.value = true
  try {
    if (!tableStore.table) await tableStore.fetchTable()
    const res = await api.get('/orders/', { headers: { Authorization: `Bearer ${auth.token}` } })
    orders.value = res.data.map((o: any) => {
      const t = tableStore.table?.find((tb: any) => tb.id === o.table_id)
      return { ...o, table_code: t ? t.table_code : o.table_id }
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (e) { console.error(e) }
  finally { isLoading.value = false }
}
onMounted(load)
const doRefresh = async (e: any) => { await load(); e.target.complete() }
</script>

<style scoped>
.filter-row { display: flex; gap: 8px; overflow-x: auto; padding: 10px 0; scrollbar-width: none; }
.filter-row::-webkit-scrollbar { display: none; }
.loading-center { display: flex; justify-content: center; padding: 60px; }
.order-list { display: flex; flex-direction: column; gap: 10px; }
.order-hist-card { border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.07); margin: 0; }
.oh-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.oh-id { font-size: 16px; font-weight: 800; margin: 0; }
.oh-date { font-size: 12px; color: var(--ion-color-medium); margin: 2px 0 0; }
.oh-meta { display: flex; gap: 16px; font-size: 12px; color: var(--ion-color-medium); margin-bottom: 10px; }
.oh-footer { display: flex; align-items: center; justify-content: space-between; }
.oh-total { font-size: 17px; font-weight: 800; color: var(--ion-color-primary); }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: var(--ion-color-medium); gap: 8px; text-align: center; }
.empty-icon { font-size: 56px; opacity: .35; }
</style>
