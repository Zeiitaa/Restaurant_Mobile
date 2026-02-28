<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin" />
        </ion-buttons>
        <ion-title>Manage Menu</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddModal">
            <ion-icon name="add" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchQuery" placeholder="Search menu..." :debounce="300" />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <!-- Category Chips -->
      <div class="cat-scroll ion-padding-horizontal">
        <ion-chip
          v-for="cat in filterCategories"
          :key="cat"
          :color="activeCategory === cat ? 'primary' : 'light'"
          @click="activeCategory = cat"
        >{{ cat }}</ion-chip>
      </div>

      <div v-if="isLoading" class="loading-center">
        <ion-spinner name="crescent" color="primary" />
      </div>

      <div v-else class="menu-list ion-padding">
        <ion-card v-for="item in filteredItems" :key="item.id" class="menu-item-card">
          <div class="menu-row">
            <img :src="getImageUrl(item.image)" :alt="item.name" class="menu-img" />
            <div class="menu-body">
              <p class="menu-name">{{ item.name }}</p>
              <p class="menu-price">{{ formatIDR(item.price) }}</p>
              <div class="menu-tags">
                <ion-badge :color="getStockColor(item.daily_portion)">
                  {{ getStockLabel(item.daily_portion) }}
                </ion-badge>
                <ion-badge color="light" class="cat-badge" v-if="item.category?.name">
                  {{ item.category.name }}
                </ion-badge>
              </div>
            </div>
            <div class="menu-actions">
              <ion-button fill="clear" color="primary" size="small" @click="openEditModal(item)">
                <ion-icon name="create-outline" slot="icon-only" />
              </ion-button>
              <ion-button fill="clear" color="warning" size="small" @click="openStockModal(item)">
                <ion-icon name="add-circle-outline" slot="icon-only" />
              </ion-button>
              <ion-button fill="clear" color="danger" size="small" @click="confirmDelete(item)">
                <ion-icon name="trash-outline" slot="icon-only" />
              </ion-button>
            </div>
          </div>
        </ion-card>

        <div v-if="filteredItems.length === 0" class="empty-state">
          <ion-icon name="restaurant-outline" class="empty-icon" />
          <p>No menu items found</p>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <ion-modal :is-open="isFormOpen" @did-dismiss="closeForm">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editTarget ? 'Edit Menu' : 'Add Menu' }}</ion-title>
            <ion-buttons slot="end"><ion-button @click="closeForm">Close</ion-button></ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Name *</ion-label>
            <ion-input v-model="form.name" placeholder="Menu name" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Price *</ion-label>
            <ion-input v-model.number="form.price" type="number" placeholder="0" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Description</ion-label>
            <ion-textarea v-model="form.description" :rows="3" placeholder="Description..." />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Category</ion-label>
            <ion-select v-model="form.category_id" placeholder="Select category">
              <ion-select-option v-for="cat in categoryStore.category" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Image URL</ion-label>
            <ion-input v-model="form.image" placeholder="image.jpg" />
          </ion-item>
          <div v-if="formError" class="error-msg">{{ formError }}</div>
          <ion-button expand="block" @click="submitForm" :disabled="formLoading" class="ion-margin-top">
            <ion-spinner v-if="formLoading" name="crescent" slot="start" />
            {{ editTarget ? 'Save Changes' : 'Add Menu' }}
          </ion-button>
        </ion-content>
      </ion-modal>

      <!-- Add Stock Modal -->
      <ion-modal :is-open="isStockOpen" @did-dismiss="closeStock" :initial-breakpoint="0.5" :breakpoints="[0,0.5,0.75]">
        <ion-header>
          <ion-toolbar>
            <ion-title>Add Stock — {{ stockTarget?.name }}</ion-title>
            <ion-buttons slot="end"><ion-button @click="closeStock">Close</ion-button></ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <p class="current-stock">Current: <strong>{{ stockTarget?.daily_portion ?? 0 }} portions</strong></p>
          <ion-item>
            <ion-label position="stacked">Add Quantity</ion-label>
            <ion-input v-model.number="stockQty" type="number" min="1" placeholder="e.g. 10" />
          </ion-item>
          <ion-button expand="block" @click="submitStock" :disabled="!stockQty || stockQty < 1" class="ion-margin-top">
            Add Stock
          </ion-button>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton,
  IonIcon, IonSearchbar, IonChip, IonSpinner, IonCard, IonBadge, IonList, IonItem, IonLabel,
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonModal, IonRefresher, IonRefresherContent,
  alertController
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useCategoryStore } from '@/stores/category'
import api from '@/helpers/api'

const auth = useAuthStore()
const menuStore = useMenuStore()
const categoryStore = useCategoryStore()

const isLoading = ref(false)
const searchQuery = ref('')
const activeCategory = ref('All')

const API_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE
const getImageUrl = (p: string) => {
  if (!p) return 'https://placehold.co/80x80?text=No+Image'
  if (p.startsWith('http')) return p
  return `${API_IMAGE_URL}${p}`
}
const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val ?? 0)

const getStockLabel = (p: number) => {
  if (!p || p <= 0) return 'Out'
  if (p <= 5) return `Critical (${p})`
  if (p <= 15) return `Low (${p})`
  return `${p} left`
}
const getStockColor = (p: number) =>
  (!p || p <= 0) ? 'danger' : p <= 5 ? 'danger' : p <= 15 ? 'warning' : 'success'

const filterCategories = computed(() => {
  const cats = [...new Set((menuStore.menu ?? []).map((i: any) => i.category?.name).filter(Boolean))]
  return ['All', ...cats]
})
const filteredItems = computed(() => {
  let items = menuStore.menu ?? []
  if (activeCategory.value !== 'All') items = items.filter((i: any) => i.category?.name === activeCategory.value)
  if (searchQuery.value) items = items.filter((i: any) => i.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  return items
})

const load = async () => {
  isLoading.value = true
  try { await Promise.all([menuStore.fetchMenu(), categoryStore.fetchCategory()]) }
  catch (e) { console.error(e) }
  finally { isLoading.value = false }
}
onMounted(load)
const doRefresh = async (e: any) => { await load(); e.target.complete() }

// Form modal
const isFormOpen = ref(false)
const editTarget = ref<any>(null)
const formLoading = ref(false)
const formError = ref('')
const form = ref({ name: '', price: 0, description: '', category_id: null as number | null, image: '' })

const openAddModal = () => {
  editTarget.value = null
  form.value = { name: '', price: 0, description: '', category_id: null, image: '' }
  isFormOpen.value = true
}
const openEditModal = (item: any) => {
  editTarget.value = item
  form.value = { name: item.name, price: item.price, description: item.description ?? '', category_id: item.category_id ?? item.category?.id, image: item.image ?? '' }
  isFormOpen.value = true
}
const closeForm = () => { isFormOpen.value = false; formError.value = '' }

const submitForm = async () => {
  if (!form.value.name || !form.value.price) { formError.value = 'Name and price are required'; return }
  formLoading.value = true; formError.value = ''
  try {
    const headers = { Authorization: `Bearer ${auth.token}` }
    if (editTarget.value) {
      await api.patch(`/menu/${editTarget.value.id}`, form.value, { headers })
    } else {
      await api.post('/menu/', form.value, { headers })
    }
    closeForm(); await menuStore.fetchMenu()
  } catch (e: any) { formError.value = e.response?.data?.detail ?? 'Error saving menu item.' }
  finally { formLoading.value = false }
}

const confirmDelete = async (item: any) => {
  const alert = await alertController.create({
    header: 'Delete Menu',
    message: `Delete "${item.name}"?`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete', role: 'destructive', handler: async () => {
          await api.delete(`/menu/${item.id}`, { headers: { Authorization: `Bearer ${auth.token}` } })
          await menuStore.fetchMenu()
        }
      }
    ]
  })
  await alert.present()
}

// Stock modal
const isStockOpen = ref(false)
const stockTarget = ref<any>(null)
const stockQty = ref(0)
const curretnDate = new Date().toISOString() 

const openStockModal = (item: any) => { stockTarget.value = item; stockQty.value = 0; isStockOpen.value = true }
const closeStock = () => { isStockOpen.value = false }
const submitStock = async () => {
  if (!stockQty.value || !stockTarget.value) return
  try {
    await api.post(`/upstock/`, { menu_id: stockTarget.value.id, stock_after: stockQty.value, users_id: auth.profile.id, date: curretnDate }, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    closeStock(); await menuStore.fetchMenu()
  } catch (e) { console.error(e) }
}
</script>

<style scoped>
.cat-scroll { display: flex; overflow-x: auto; padding: 10px 0; gap: 8px; scrollbar-width: none; }
.cat-scroll::-webkit-scrollbar { display: none; }
.menu-list { display: flex; flex-direction: column; gap: 10px; }
.menu-item-card { border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.07); margin: 0; }
.menu-row { display: flex; align-items: center; gap: 10px; padding: 10px; }
.menu-img { width: 70px; height: 70px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
.menu-body { flex: 1; min-width: 0; }
.menu-name { font-size: 14px; font-weight: 700; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.menu-price { font-size: 13px; font-weight: 700; color: var(--ion-color-primary); margin: 0 0 4px; }
.menu-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.cat-badge { --color: #475569; }
.menu-actions { display: flex; flex-direction: column; }
.loading-center { display: flex; justify-content: center; padding: 60px; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: var(--ion-color-medium); }
.empty-icon { font-size: 56px; opacity: .35; }
.error-msg { color: var(--ion-color-danger); font-size: 13px; margin: 8px 0; padding: 10px; background: rgba(239,68,68,.1); border-radius: 8px; }
.current-stock { font-size: 14px; color: var(--ion-color-medium); padding: 12px 16px; }
</style>
