<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/admin" /></ion-buttons>
        <ion-title>Manage Tables</ion-title>
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

      <div v-else class="table-grid">
        <ion-card v-for="table in tableStore.table" :key="table.id" class="table-card">
          <ion-card-content>
            <div class="tbl-header">
              <div class="tbl-code">{{ table.table_code }}</div>
              <ion-badge :color="table.status === 'available' ? 'success' : 'danger'">
                {{ table.status }}
              </ion-badge>
            </div>
            <p class="tbl-cap">Capacity: {{ table.capacity }} pax</p>
            <div class="tbl-actions">
              <ion-button fill="outline" size="small" @click="openEdit(table)">
                <ion-icon name="create-outline" slot="start" />Edit
              </ion-button>
              <ion-button fill="outline" color="danger" size="small" @click="confirmDelete(table)">
                <ion-icon name="trash-outline" slot="start" />Delete
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <div v-if="!tableStore.table?.length" class="empty-state">
          <ion-icon name="grid-outline" class="empty-icon" />
          <p>No tables added yet</p>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <ion-modal :is-open="isFormOpen" @did-dismiss="closeForm" :initial-breakpoint="0.6" :breakpoints="[0,0.6,0.9]">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editTarget ? 'Edit Table' : 'Add Table' }}</ion-title>
            <ion-buttons slot="end"><ion-button @click="closeForm">Close</ion-button></ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Table Code *</ion-label>
            <ion-input v-model="form.table_code" placeholder="e.g. T01" :disabled="!!editTarget" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Capacity *</ion-label>
            <ion-input v-model.number="form.capacity" type="number" min="1" placeholder="4" />
          </ion-item>
          <ion-item v-if="editTarget">
            <ion-label position="stacked">Status</ion-label>
            <ion-select v-model="form.status">
              <ion-select-option value="available">Available</ion-select-option>
              <ion-select-option value="occupied">Occupied</ion-select-option>
            </ion-select>
          </ion-item>
          <div v-if="formError" class="error-msg">{{ formError }}</div>
          <ion-button expand="block" @click="submitForm" :disabled="formLoading" class="ion-margin-top">
            <ion-spinner v-if="formLoading" name="crescent" slot="start" />
            {{ editTarget ? 'Save Changes' : 'Add Table' }}
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
  IonIcon, IonSpinner, IonCard, IonCardContent, IonBadge, IonItem, IonLabel, IonInput,
  IonSelect, IonSelectOption, IonModal, IonRefresher, IonRefresherContent, alertController
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import api from '@/helpers/api'

const auth = useAuthStore()
const tableStore = useTableStore()
const isLoading = ref(false)

const load = async () => {
  isLoading.value = true
  try { await tableStore.fetchTable() }
  catch (e) { console.error(e) }
  finally { isLoading.value = false }
}
onMounted(load)
const doRefresh = async (e: any) => { await load(); e.target.complete() }

// Form
const isFormOpen = ref(false)
const editTarget = ref<any>(null)
const formLoading = ref(false)
const formError = ref('')
const form = ref({ table_code: '', capacity: 4, status: 'available' })

const openAdd = () => {
  editTarget.value = null
  form.value = { table_code: '', capacity: 4, status: 'available' }
  isFormOpen.value = true
}
const openEdit = (table: any) => {
  editTarget.value = table
  form.value = { table_code: table.table_code, capacity: table.capacity, status: table.status }
  isFormOpen.value = true
}
const closeForm = () => { isFormOpen.value = false; formError.value = '' }

const submitForm = async () => {
  if (!form.value.table_code || !form.value.capacity) { formError.value = 'All fields required'; return }
  formLoading.value = true; formError.value = ''
  const headers = { Authorization: `Bearer ${auth.token}` }
  try {
    if (editTarget.value) {
      await tableStore.updateTable(form.value.table_code, { capacity: form.value.capacity, status: form.value.status })
    } else {
      await tableStore.createTable({ table_code: form.value.table_code, capacity: form.value.capacity })
    }
    closeForm(); await load()
  } catch (e: any) { formError.value = e.response?.data?.detail ?? 'Error saving table.' }
  finally { formLoading.value = false }
}

const confirmDelete = async (table: any) => {
  const alert = await alertController.create({
    header: 'Delete Table',
    message: `Delete table "${table.table_code}"?`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete', role: 'destructive', handler: async () => {
          await api.delete(`/table/${table.table_code}`, { headers: { Authorization: `Bearer ${auth.token}` } })
          await load()
        }
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
.loading-center { display: flex; justify-content: center; padding: 60px; }
.table-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.table-card { border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.07); margin: 0; }
.tbl-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.tbl-code { font-size: 22px; font-weight: 900; color: var(--ion-color-primary); }
.tbl-cap { font-size: 13px; color: var(--ion-color-medium); margin: 0 0 10px; }
.tbl-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.empty-state { grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; padding: 60px; color: var(--ion-color-medium); gap: 8px; text-align: center; }
.empty-icon { font-size: 56px; opacity: .35; }
.error-msg { color: var(--ion-color-danger); font-size: 13px; margin: 8px 0; padding: 10px; background: rgba(239,68,68,.1); border-radius: 8px; }
</style>
