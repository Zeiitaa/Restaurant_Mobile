<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button default-href="/admin" /></ion-buttons>
        <ion-title>Manage Categories</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAdd">
            <ion-icon name="add" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div v-if="isLoading" class="loading-center"><ion-spinner name="crescent" color="primary" /></div>

      <div v-else class="cat-list">
        <ion-card v-for="cat in categoryStore.category" :key="cat.id" class="cat-card">
          <ion-card-content>
            <div class="cat-row">
              <div class="cat-icon-wrap">
                <ion-icon :name="getCatIcon(cat.name)" color="primary" class="cat-icon" />
              </div>
              <div class="cat-info">
                <p class="cat-name">{{ cat.name }}</p>
                <p class="cat-count">{{ getMenuCount(cat.id) }} items</p>
              </div>
              <div class="cat-actions">
                <ion-button fill="clear" color="primary" @click="openEdit(cat)">
                  <ion-icon name="create-outline" slot="icon-only" />
                </ion-button>
                <ion-button fill="clear" color="danger" @click="confirmDelete(cat)">
                  <ion-icon name="trash-outline" slot="icon-only" />
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <div v-if="!categoryStore.category?.length" class="empty-state">
          <ion-icon name="pricetag-outline" class="empty-icon" />
          <p>No categories added yet</p>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <ion-modal :is-open="isFormOpen" @did-dismiss="closeForm" :initial-breakpoint="0.5" :breakpoints="[0,0.5,0.8]">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editTarget ? 'Edit Category' : 'Add Category' }}</ion-title>
            <ion-buttons slot="end"><ion-button @click="closeForm">Close</ion-button></ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Category Name *</ion-label>
            <ion-input v-model="form.name" placeholder="e.g. Food, Drinks" />
          </ion-item>
          <div v-if="formError" class="error-msg">{{ formError }}</div>
          <ion-button expand="block" @click="submitForm" :disabled="formLoading" class="ion-margin-top">
            <ion-spinner v-if="formLoading" name="crescent" slot="start" />
            {{ editTarget ? 'Save Changes' : 'Add Category' }}
          </ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton,
  IonIcon, IonSpinner, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonModal,
  IonRefresher, IonRefresherContent, alertController
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoryStore } from '@/stores/category'
import { useMenuStore } from '@/stores/menu'

const auth = useAuthStore()
const categoryStore = useCategoryStore()
const menuStore = useMenuStore()
const isLoading = ref(false)

const getCatIcon = (name: string) => {
  const m: Record<string, string> = { Food: 'restaurant', Makanan: 'restaurant', Drink: 'wine', Minuman: 'wine', Dessert: 'ice-cream', Snack: 'pizza' }
  return m[name] || 'pricetag'
}
const getMenuCount = (catId: number) =>
  (menuStore.menu ?? []).filter((m: any) => m.category_id === catId || m.category?.id === catId).length

const load = async () => {
  isLoading.value = true
  try { await Promise.all([categoryStore.fetchCategory(), menuStore.fetchMenu()]) }
  catch (e) { console.error(e) }
  finally { isLoading.value = false }
}
onMounted(load)
const doRefresh = async (e: any) => { await load(); e.target.complete() }

const isFormOpen = ref(false)
const editTarget = ref<any>(null)
const formLoading = ref(false)
const formError = ref('')
const form = ref({ name: '' })

const openAdd = () => { editTarget.value = null; form.value = { name: '' }; isFormOpen.value = true }
const openEdit = (cat: any) => { editTarget.value = cat; form.value = { name: cat.name }; isFormOpen.value = true }
const closeForm = () => { isFormOpen.value = false; formError.value = '' }

const submitForm = async () => {
  if (!form.value.name) { formError.value = 'Category name is required'; return }
  formLoading.value = true; formError.value = ''
  try {
    if (editTarget.value) {
      await categoryStore.updateCategory(editTarget.value.id, form.value)
    } else {
      await categoryStore.createCategory(form.value)
    }
    closeForm(); await categoryStore.fetchCategory()
  } catch (e: any) { formError.value = e.response?.data?.detail ?? 'Error saving category.' }
  finally { formLoading.value = false }
}

const confirmDelete = async (cat: any) => {
  const alert = await alertController.create({
    header: 'Delete Category',
    message: `Delete "${cat.name}"? This may affect menu items.`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete', role: 'destructive', handler: async () => {
          const api = (await import('@/helpers/api')).default
          await api.delete(`/category/${cat.id}`, { headers: { Authorization: `Bearer ${auth.token}` } })
          await categoryStore.fetchCategory()
        }
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
.loading-center { display: flex; justify-content: center; padding: 60px; }
.cat-list { display: flex; flex-direction: column; gap: 10px; }
.cat-card { border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.07); margin: 0; }
.cat-row { display: flex; align-items: center; gap: 12px; }
.cat-icon-wrap { width: 48px; height: 48px; border-radius: 14px; background: var(--ion-color-primary-tint); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cat-icon { font-size: 24px; }
.cat-info { flex: 1; }
.cat-name { font-size: 16px; font-weight: 700; margin: 0 0 2px; }
.cat-count { font-size: 12px; color: var(--ion-color-medium); margin: 0; }
.cat-actions { display: flex; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: var(--ion-color-medium); gap: 8px; text-align: center; }
.empty-icon { font-size: 56px; opacity: .35; }
.error-msg { color: var(--ion-color-danger); font-size: 13px; margin: 8px 0; padding: 10px; background: rgba(239,68,68,.1); border-radius: 8px; }
</style>
