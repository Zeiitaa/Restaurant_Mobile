<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/waiters/table" />
        </ion-buttons>
        <ion-title>Menu • Table #{{ tableCode || '--' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="sendToKitchen" :disabled="cartStore.cartCount === 0">
            <ion-icon name="cart" slot="icon-only" />
            <ion-badge v-if="cartStore.cartCount > 0" color="danger" class="cart-badge">
              {{ cartStore.cartCount }}
            </ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchQuery" placeholder="Search menu..." :debounce="300" />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">

      <!-- Category Chips -->
      <div class="category-scroll">
        <ion-chip
          v-for="cat in categories"
          :key="cat.name"
          :color="activeCategory === cat.name ? 'primary' : 'light'"
          :outline="activeCategory !== cat.name"
          @click="activeCategory = cat.name"
          class="category-chip"
        >
          <ion-icon :name="cat.icon" />
          <ion-label>{{ cat.name }}</ion-label>
        </ion-chip>
      </div>

      <!-- Menu Grid -->
      <div v-if="isLoading" class="loading-center">
        <ion-spinner name="crescent" color="primary" />
      </div>

      <div v-else class="menu-grid ion-padding">
        <div
          v-for="item in filteredMenu"
          :key="item.id"
          class="menu-item-card"
          @click="openModal(item)"
        >
          <img :src="getImageUrl(item.image)" :alt="item.name" class="menu-img" />
          <div class="menu-item-body">
            <p class="menu-item-name">{{ item.name }}</p>
            <p class="menu-item-price">{{ formatPrice(item.price) }}</p>
          </div>
        </div>

        <div v-if="filteredMenu.length === 0" class="empty-state">
          <ion-icon name="search-outline" class="empty-icon" />
          <p>No items found</p>
        </div>
      </div>

      <!-- Item Detail Modal -->
      <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal" :initial-breakpoint="0.75" :breakpoints="[0,0.75,1]">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ selectedItem?.name }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">
                <ion-icon name="close" slot="icon-only" />
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" v-if="selectedItem">
          <img :src="getImageUrl(selectedItem.image)" :alt="selectedItem.name" class="modal-img" />
          <h2 class="modal-item-name">{{ selectedItem.name }}</h2>
          <p class="modal-item-price">{{ formatPrice(selectedItem.price) }}</p>
          <p class="modal-item-desc">{{ selectedItem.description || 'No description available.' }}</p>

          <div class="order-type-row">
            <ion-segment v-model="orderType">
              <ion-segment-button value="dine-in">
                <ion-label>Dine In</ion-label>
              </ion-segment-button>
              <ion-segment-button value="takeaway">
                <ion-label>Takeaway</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>

          <div class="notes-wrap">
            <ion-item>
              <ion-label position="stacked">Notes</ion-label>
              <ion-input v-model="itemNotes" placeholder="e.g. no spicy" />
            </ion-item>
          </div>

          <div class="qty-row">
            <ion-button fill="outline" @click="qty > 1 ? qty-- : null" size="small">
              <ion-icon name="remove" slot="icon-only" />
            </ion-button>
            <span class="qty-num">{{ qty }}</span>
            <ion-button fill="outline" @click="qty++" size="small">
              <ion-icon name="add" slot="icon-only" />
            </ion-button>
          </div>

          <ion-button expand="block" @click="handleAddToCart" class="add-btn">
            Add to Order — {{ formatPrice(selectedItem.price * qty) }}
          </ion-button>
        </ion-content>
      </ion-modal>

      <!-- Guest Modal -->
      <ion-modal :is-open="isGuestModalOpen" @did-dismiss="isGuestModalOpen = false" :initial-breakpoint="0.6" :breakpoints="[0,0.6,0.9]">
        <ion-header>
          <ion-toolbar>
            <ion-title>Guest Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isGuestModalOpen = false">
                <ion-icon name="close" slot="icon-only" />
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Guest Name *</ion-label>
            <ion-input v-model="guestName" placeholder="Who's ordering?" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Discount (%)</ion-label>
            <ion-input v-model.number="discount" type="number" min="0" max="100" placeholder="0" />
          </ion-item>

          <div v-if="orderError" class="error-msg">{{ orderError }}</div>

          <ion-button expand="block" @click="confirmOrder" :disabled="!guestName || isLoading" class="ion-margin-top">
            <ion-spinner v-if="isLoading" name="crescent" slot="start" />
            Confirm Order
          </ion-button>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonBadge, IonSearchbar, IonChip, IonLabel, IonSpinner, IonModal, IonSegment,
  IonSegmentButton, IonItem, IonInput
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useCategoryStore } from '@/stores/category'
import { useCartStore } from '@/stores/cart'
import { useTableStore } from '@/stores/table'
import { useRoute } from 'vue-router'
import router from '@/router'

const auth = useAuthStore()
const menuStore = useMenuStore()
const categoryStore = useCategoryStore()
const cartStore = useCartStore()
const tableStore = useTableStore()
const route = useRoute()

const tableCode = ref((route.params.tableCode as string) || '')
const tableId = ref<number | null>(null)
const searchQuery = ref('')
const activeCategory = ref('All')
const isLoading = ref(false)

// Modal state
const isModalOpen = ref(false)
const isGuestModalOpen = ref(false)
const selectedItem = ref<any>(null)
const qty = ref(1)
const orderType = ref('dine-in')
const itemNotes = ref('')

// Guest info
const guestName = ref('')
const discount = ref(0)
const orderError = ref('')

onMounted(async () => {
  isLoading.value = true
  try {
    await categoryStore.fetchCategory()
    await menuStore.fetchMenu()
    if (tableCode.value) {
      const table = await tableStore.fetchTableById(tableCode.value)
      if (table) tableId.value = table.id
    }
  } catch (e) { console.error(e) }
  finally { isLoading.value = false }
})

const categories = computed(() => {
  const cats = categoryStore.category || []
  return [{ name: 'All', icon: 'grid' }, ...cats.map((c: any) => ({ ...c, icon: getCategoryIcon(c.name) }))]
})

const getCategoryIcon = (name: string) => {
  const map: Record<string, string> = {
    Food: 'restaurant', Makanan: 'restaurant', Drink: 'wine', Minuman: 'wine',
    Dessert: 'ice-cream', Snack: 'pizza'
  }
  return map[name] || 'restaurant'
}

const filteredMenu = computed(() => {
  let items = menuStore.menu || []
  if (activeCategory.value !== 'All') {
    items = items.filter((item: any) => {
      if (item.category?.name) return item.category.name === activeCategory.value
      const c = categoryStore.category?.find((c: any) => c.id === item.category_id)
      return c?.name === activeCategory.value
    })
  }
  if (searchQuery.value) {
    items = items.filter((item: any) =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  return items
})

const API_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE
const getImageUrl = (p: string) => {
  if (!p) return 'https://placehold.co/300x200?text=No+Image'
  if (p.startsWith('http')) return p
  return `${API_IMAGE_URL}${p}`
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0)

const openModal = (item: any) => {
  selectedItem.value = item
  qty.value = 1
  orderType.value = 'dine-in'
  itemNotes.value = ''
  isModalOpen.value = true
}
const closeModal = () => { isModalOpen.value = false; selectedItem.value = null }

const handleAddToCart = () => {
  cartStore.addToCart({ item: selectedItem.value, quantity: qty.value, type: orderType.value, notes: itemNotes.value })
  closeModal()
}

const sendToKitchen = () => {
  if (cartStore.items.length === 0) return
  orderError.value = ''
  isGuestModalOpen.value = true
}

const confirmOrder = async () => {
  if (!guestName.value) return
  isGuestModalOpen.value = false
  isLoading.value = true
  try {
    await cartStore.placeOrder(tableId.value || 0, auth.profile.id, guestName.value, discount.value)
    router.push('/waiters')
  } catch (e: any) {
    orderError.value = e.response?.data?.detail ?? 'Failed to send order. Please try again.'
    isGuestModalOpen.value = true
  } finally { isLoading.value = false }
}
</script>

<style scoped>
.cart-badge { position: absolute; top: 4px; right: 4px; font-size: 10px; min-width: 16px; height: 16px; }
.category-scroll { display: flex; overflow-x: auto; padding: 10px 16px; gap: 8px; scrollbar-width: none; }
.category-scroll::-webkit-scrollbar { display: none; }
.category-chip { flex-shrink: 0; }
.menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.menu-item-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,.08); cursor: pointer; transition: transform .15s; }
.menu-item-card:active { transform: scale(0.97); }
.menu-img { width: 100%; height: 120px; object-fit: cover; }
.menu-item-body { padding: 10px 12px; }
.menu-item-name { font-size: 13px; font-weight: 700; margin: 0 0 4px; color: var(--ion-color-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.menu-item-price { font-size: 12px; font-weight: 600; color: var(--ion-color-primary); margin: 0; }
.loading-center { display: flex; justify-content: center; padding: 60px; }
.empty-state { grid-column: 1/-1; text-align: center; padding: 40px; color: var(--ion-color-medium); }
.empty-icon { font-size: 48px; opacity: .4; }
.modal-img { width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 14px; }
.modal-item-name { font-size: 20px; font-weight: 800; margin: 0 0 4px; }
.modal-item-price { font-size: 18px; font-weight: 700; color: var(--ion-color-primary); margin: 0 0 8px; }
.modal-item-desc { font-size: 13px; color: var(--ion-color-medium); margin: 0 0 16px; }
.order-type-row { margin-bottom: 12px; }
.notes-wrap { margin-bottom: 12px; }
.qty-row { display: flex; align-items: center; gap: 16px; justify-content: center; margin: 16px 0; }
.qty-num { font-size: 22px; font-weight: 800; min-width: 36px; text-align: center; }
.add-btn { --border-radius: 12px; margin-top: 8px; font-weight: 700; }
.error-msg { color: var(--ion-color-danger); font-size: 13px; margin: 8px 0; padding: 10px; background: rgba(239,68,68,.1); border-radius: 8px; }

@media (prefers-color-scheme: dark) {
  .menu-item-card { background: #1e293b; }
  .menu-item-name { color: #f1f5f9; }
}
</style>
