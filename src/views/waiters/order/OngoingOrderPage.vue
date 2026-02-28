<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/waiters" />
        </ion-buttons>
        <ion-title>Ongoing Orders</ion-title>
        <ion-buttons slot="end">
          <ion-badge color="warning" style="margin-right:12px;padding:4px 8px;border-radius:8px;">
            {{ totalPreparingItems }} Preparing
          </ion-badge>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">

      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div v-if="isLoading" class="loading-center">
        <ion-spinner name="crescent" color="primary" />
        <p>Loading orders...</p>
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <ion-icon name="checkmark-done-circle" class="empty-icon" style="color:#10b981" />
        <h3>All caught up!</h3>
        <p>No ongoing orders at the moment.</p>
      </div>

      <div v-else class="order-list">
        <ion-card v-for="order in orders" :key="order.id" class="order-card">
          <ion-card-header>
            <div class="order-header-row">
              <div>
                <ion-card-title>Table {{ order.table }}</ion-card-title>
              </div>
              <ion-badge color="warning">{{ order.status }}</ion-badge>
            </div>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item v-for="(item, i) in order.items" :key="i" class="item-row">
                <div class="item-qty" slot="start">{{ item.qty }}</div>
                <ion-label>
                  <h3>{{ item.name }}</h3>
                  <p v-if="item.notes" class="item-notes">{{ item.notes }}</p>
                </ion-label>
                <ion-note slot="end" class="item-time">{{ item.time }}</ion-note>
              </ion-item>
            </ion-list>

            <ion-button
              expand="block"
              color="primary"
              @click="markAsServed(order.id, order.table)"
              class="served-btn"
            >
              <ion-icon name="checkmark-circle" slot="start" />
              Mark as Served
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
  IonBadge, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonNote, IonButton, IonIcon, IonRefresher, IonRefresherContent,
  alertController
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import api from '@/helpers/api'

const auth = useAuthStore()
const tableStore = useTableStore()
const orders = ref<any[]>([])
const isLoading = ref(false)

const totalPreparingItems = computed(() =>
  orders.value.reduce((t: number, o: any) => t + o.items.reduce((s: number, i: any) => s + i.qty, 0), 0)
)

const fetchOngoingOrders = async () => {
  isLoading.value = true
  try {
    if (!tableStore.table) await tableStore.fetchTable()
    const res = await api.get('/orders/preparing', {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    orders.value = res.data.map((order: any) => {
      const tableObj = tableStore.table?.find((t: any) => t.id === order.table_id)
      return {
        id: order.id,
        table: tableObj ? tableObj.table_code : order.table_id,
        status: order.order_status,
        items: order.details.map((d: any) => ({
          qty: d.quantity,
          name: d.menu?.name || 'Unknown',
          notes: d.notes,
          time: new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      }
    })
  } catch (e) { console.error(e) }
  finally { isLoading.value = false }
}

onMounted(fetchOngoingOrders)

const doRefresh = async (event: any) => {
  await fetchOngoingOrders()
  event.target.complete()
}

const markAsServed = async (orderId: number, table: string) => {
  const alert = await alertController.create({
    header: 'Confirm',
    message: `Mark all items for Table ${table} as served?`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Confirm',
        handler: async () => {
          try {
            await api.patch(`/orders/${orderId}/status`, { order_status: 'served' }, {
              headers: { Authorization: `Bearer ${auth.token}` }
            })
            await fetchOngoingOrders()
          } catch (e) { console.error(e) }
        }
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
.loading-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 60px; color: var(--ion-color-medium); }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; text-align: center; gap: 10px; color: var(--ion-color-medium); }
.empty-icon { font-size: 72px; }
.empty-state h3 { font-size: 18px; font-weight: 700; margin: 0; }
.empty-state p { font-size: 14px; margin: 0; }
.order-list { display: flex; flex-direction: column; gap: 14px; }
.order-card { border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.08); margin: 0; }
.order-header-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.item-row { --padding-start: 0; --inner-padding-end: 0; }
.item-qty { width: 28px; height: 28px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
.item-notes { font-style: italic; color: var(--ion-color-medium); font-size: 12px; }
.item-time { font-size: 11px; color: var(--ion-color-medium); }
.served-btn { --border-radius: 12px; margin-top: 12px; font-weight: 700; }
</style>
