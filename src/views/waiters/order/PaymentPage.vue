<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/waiters" />
        </ion-buttons>
        <ion-title>Pending Payments</ion-title>
        <ion-buttons slot="end">
          <ion-badge color="success" style="margin-right:12px;padding:4px 8px;border-radius:8px;">
            {{ totalUnpaidCount }} unpaid
          </ion-badge>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchQuery" placeholder="Search table or guest..." :debounce="300" />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">

      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div v-if="isLoading" class="loading-center">
        <ion-spinner name="crescent" color="primary" />
      </div>

      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <ion-icon name="search-outline" class="empty-icon" />
        <h3>No results</h3>
        <p>No pending payments{{ searchQuery ? ` matching "${searchQuery}"` : '' }}.</p>
      </div>

      <div v-else class="payment-list">
        <ion-card v-for="order in filteredOrders" :key="order.id" class="payment-card">
          <ion-card-content>
            <div class="pc-header">
              <div class="table-badge">{{ order.table }}</div>
              <div class="pc-info">
                <p class="pc-location">{{ order.location }}</p>
                <p class="pc-guest">{{ order.waitress }}</p>
              </div>
              <ion-badge color="warning">{{ order.status }}</ion-badge>
            </div>

            <div class="pc-total">
              <span class="pc-total-label">Total</span>
              <span class="pc-total-amount">{{ formatPrice(order.total) }}</span>
            </div>

            <ion-button expand="block" @click="processPayment(order)" color="primary" class="pay-btn">
              <ion-icon name="card" slot="start" />
              Process Payment
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonBadge, IonSpinner, IonCard, IonCardContent, IonButton, IonIcon,
  IonSearchbar, IonRefresher, IonRefresherContent
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import api from '@/helpers/api'
import router from '@/router'

const auth = useAuthStore()
const tableStore = useTableStore()
const pendingOrders = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const filteredOrders = computed(() => {
  if (!searchQuery.value) return pendingOrders.value
  const q = searchQuery.value.toLowerCase()
  return pendingOrders.value.filter((o: any) =>
    o.table.toString().toLowerCase().includes(q) ||
    o.waitress.toLowerCase().includes(q)
  )
})

const totalUnpaidCount = computed(() => pendingOrders.value.length)

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0)

const fetchPendingPayments = async () => {
  isLoading.value = true
  try {
    if (!tableStore.table) await tableStore.fetchTable()
    const res = await api.get('/orders/served', {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    pendingOrders.value = res.data.map((order: any) => {
      const tableObj = tableStore.table?.find((t: any) => t.id === order.table_id)
      return {
        id: order.id,
        table: tableObj ? tableObj.table_code : order.table_id,
        location: tableObj ? `Seats ${tableObj.capacity}` : 'Indoor',
        waitress: order.guest_name || 'Guest',
        status: order.payment_status.toUpperCase(),
        total: order.total_amount
      }
    })
  } catch (e) { console.error(e) }
  finally { isLoading.value = false }
}

onMounted(fetchPendingPayments)

const doRefresh = async (event: any) => {
  await fetchPendingPayments()
  event.target.complete()
}

const processPayment = (order: any) => {
  router.push({ name: 'waiters-payment-detail', params: { id: order.id } })
}
</script>

<style scoped>
.loading-center { display: flex; justify-content: center; padding: 60px; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; text-align: center; gap: 10px; color: var(--ion-color-medium); }
.empty-icon { font-size: 64px; opacity: .4; }
.empty-state h3 { font-size: 18px; font-weight: 700; margin: 0; }
.empty-state p { font-size: 14px; margin: 0; }
.payment-list { display: flex; flex-direction: column; gap: 14px; }
.payment-card { border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.08); margin: 0; }
.pc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.table-badge { width: 52px; height: 52px; border-radius: 14px; background: var(--ion-color-light); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: var(--ion-color-primary); flex-shrink: 0; }
.pc-info { flex: 1; }
.pc-location { font-size: 14px; font-weight: 700; margin: 0 0 2px; }
.pc-guest { font-size: 12px; color: var(--ion-color-medium); margin: 0; }
.pc-total { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-top: 1px solid var(--ion-color-light); border-bottom: 1px solid var(--ion-color-light); margin-bottom: 12px; }
.pc-total-label { font-size: 13px; color: var(--ion-color-medium); font-weight: 500; }
.pc-total-amount { font-size: 20px; font-weight: 800; color: var(--ion-color-primary); }
.pay-btn { --border-radius: 12px; font-weight: 700; }
</style>
