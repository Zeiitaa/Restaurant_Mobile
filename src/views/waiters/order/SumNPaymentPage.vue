<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/waiters/payment" />
        </ion-buttons>
        <ion-title>Order Summary & Payment</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">

      <div v-if="isLoading" class="loading-center">
        <ion-spinner name="crescent" color="primary" />
        <p>Loading order details...</p>
      </div>

      <template v-else-if="orderData">

        <div class="order-meta">
          <p class="meta-table">Table {{ tableNumber }}</p>
          <p class="meta-order">Order #{{ orderNumber }}</p>
        </div>

        <!-- Order Items -->
        <ion-card class="section-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="receipt" style="margin-right:6px;vertical-align:middle" />
              Order Items
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="full">
              <ion-item v-for="item in orderData.details" :key="item.id">
                <ion-label>
                  <h3>{{ item.menu?.name }}</h3>
                  <p v-if="item.notes">{{ item.notes }}</p>
                </ion-label>
                <ion-note slot="end" class="item-qty-note">×{{ item.quantity }}</ion-note>
                <ion-note slot="end" class="item-price-note">{{ formatPrice(item.subtotal) }}</ion-note>
              </ion-item>
            </ion-list>

            <div class="summary-rows">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ formatPrice(subtotal) }}</span>
              </div>
              <div v-if="orderData.discount > 0" class="summary-row summary-row--discount">
                <span>Discount ({{ orderData.discount }}%)</span>
                <span>-{{ formatPrice(discountAmount) }}</span>
              </div>
              <div class="summary-row">
                <span>Tax (10%)</span>
                <span>{{ formatPrice(tax) }}</span>
              </div>
              <div class="summary-row summary-row--grand">
                <span>Grand Total</span>
                <span>{{ formatPrice(grandTotal) }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Payment Method -->
        <ion-card class="section-card">
          <ion-card-header>
            <ion-card-title>Payment Method</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-segment v-model="paymentMethod">
              <ion-segment-button value="cash">
                <ion-icon name="cash" />
                <ion-label>Cash</ion-label>
              </ion-segment-button>
              <ion-segment-button value="qris">
                <ion-icon name="qr-code" />
                <ion-label>QRIS</ion-label>
              </ion-segment-button>
            </ion-segment>

            <!-- Cash input -->
            <div v-if="paymentMethod === 'cash'" class="cash-section">
              <ion-item>
                <ion-label position="stacked">Amount Received (Rp)</ion-label>
                <ion-input v-model.number="receivedAmount" type="number" :placeholder="grandTotal.toString()" />
              </ion-item>
              <div v-if="receivedAmount > 0" class="change-row">
                <span>Change:</span>
                <span class="change-amount">{{ formatPrice(Math.max(0, receivedAmount - grandTotal)) }}</span>
              </div>
            </div>

            <!-- QRIS -->
            <div v-if="paymentMethod === 'qris' && qrCodeUrl" class="qr-section">
              <img :src="qrCodeUrl" alt="QRIS" class="qr-img" />
              <p class="qr-hint">Scan QR code using e-wallet</p>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-button
          expand="block"
          color="primary"
          @click="confirmPayment"
          :disabled="isProcessing"
          class="confirm-btn"
        >
          <ion-spinner v-if="isProcessing" name="crescent" slot="start" />
          <span v-else>{{ paymentMethod === 'qris' && !qrCodeUrl ? 'Generate QR' : 'Confirm Payment' }}</span>
        </ion-button>

        <ion-button expand="block" fill="outline" color="medium" @click="cancelOrder" class="cancel-btn">
          Cancel
        </ion-button>

      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem,
  IonLabel, IonNote, IonButton, IonIcon, IonSegment, IonSegmentButton, IonInput
} from '@ionic/vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import api from '@/helpers/api'
import router from '@/router'

const route = useRoute()
const auth = useAuthStore()
const tableStore = useTableStore()

const orderId = ref(route.params.id as string)
const tableNumber = ref('--')
const orderNumber = ref('--')
const paymentMethod = ref('cash')
const orderData = ref<any>(null)
const isLoading = ref(false)
const isProcessing = ref(false)
const receivedAmount = ref(0)
const qrCodeUrl = ref('')

const fetchOrderDetail = async () => {
  isLoading.value = true
  try {
    if (!tableStore.table) await tableStore.fetchTable()
    const res = await api.get(`/orders/${orderId.value}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    orderData.value = res.data
    const tableObj = tableStore.table?.find((t: any) => t.id === res.data.table_id)
    tableNumber.value = tableObj ? tableObj.table_code : res.data.table_id
    orderNumber.value = res.data.id.toString()
  } catch (e) { router.push('/waiters/payment') }
  finally { isLoading.value = false }
}

onMounted(() => { if (orderId.value) fetchOrderDetail() })

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0)

const subtotal = computed(() =>
  orderData.value?.details.reduce((s: number, i: any) => s + i.subtotal, 0) ?? 0
)
const discountAmount = computed(() => {
  if (!orderData.value) return 0
  return Math.round(subtotal.value * (orderData.value.discount || 0) / 100)
})
const afterDiscount = computed(() => subtotal.value - discountAmount.value)
const tax = computed(() => orderData.value ? orderData.value.total_amount - afterDiscount.value : 0)
const grandTotal = computed(() => orderData.value?.total_amount ?? 0)

const confirmPayment = async () => {
  if (paymentMethod.value === 'qris' && !qrCodeUrl.value) {
    await generateQRIS(); return
  }
  isProcessing.value = true
  try {
    await api.patch(`/orders/${orderId.value}/status`, {
      payment_status: 'paid',
      method: paymentMethod.value,
      amount_paid: paymentMethod.value === 'cash' ? receivedAmount.value : grandTotal.value
    }, { headers: { Authorization: `Bearer ${auth.token}` } })

    const tableObj = tableStore.table?.find((t: any) => t.id === orderData.value.table_id)
    if (tableObj) {
      await api.patch(`/table/${tableObj.table_code}`, { status: 'available' }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
    }
    router.push('/waiters/payment')
  } catch (e) { console.error(e) }
  finally { isProcessing.value = false }
}

const generateQRIS = async () => {
  isProcessing.value = true
  try {
    const res = await api.post(`/orders/${orderId.value}/generate-qris`, {}, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    qrCodeUrl.value = res.data.qr_image_url
  } catch (e) { console.error(e) }
  finally { isProcessing.value = false }
}

const cancelOrder = () => router.push('/waiters/payment')
</script>

<style scoped>
.loading-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 60px; color: var(--ion-color-medium); }
.order-meta { margin-bottom: 16px; }
.meta-table { font-size: 22px; font-weight: 800; margin: 0 0 2px; }
.meta-order { font-size: 14px; color: var(--ion-color-medium); margin: 0; }
.section-card { border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.08); margin: 0 0 14px; }
.item-qty-note { font-weight: 600; color: var(--ion-color-medium); margin-right: 8px; }
.item-price-note { font-weight: 700; color: var(--ion-color-dark); }
.summary-rows { margin-top: 14px; border-top: 1px solid var(--ion-color-light); padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.summary-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--ion-color-medium); }
.summary-row--discount { color: var(--ion-color-danger); }
.summary-row--grand { font-size: 17px; font-weight: 800; color: var(--ion-color-primary); border-top: 1px solid var(--ion-color-light); padding-top: 10px; margin-top: 4px; }
.cash-section { margin-top: 14px; }
.change-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; font-size: 14px; }
.change-amount { font-weight: 700; color: var(--ion-color-tertiary); font-size: 16px; }
.qr-section { display: flex; flex-direction: column; align-items: center; padding: 16px 0; }
.qr-img { width: 200px; height: 200px; border-radius: 12px; }
.qr-hint { font-size: 13px; color: var(--ion-color-medium); margin: 8px 0 0; }
.confirm-btn { --border-radius: 12px; margin-top: 8px; font-weight: 700; height: 52px; }
.cancel-btn { --border-radius: 12px; margin-top: 8px; font-weight: 600; }
</style>
