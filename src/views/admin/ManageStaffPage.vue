<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/admin" /></ion-buttons>
        <ion-title>Manage Staff</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAdd">
            <ion-icon name="add" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchQuery" placeholder="Search staff..." :debounce="300" />
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div v-if="isLoading" class="loading-center"><ion-spinner name="crescent" color="primary" /></div>

      <div v-else class="staff-list">
        <ion-card v-for="member in filteredStaff" :key="member.id" class="staff-card">
          <ion-card-content>
            <div class="staff-row">
              <div class="staff-avatar">{{ (member.name || 'S').charAt(0).toUpperCase() }}</div>
              <div class="staff-info">
                <p class="staff-name">{{ member.name }}</p>
                <p class="staff-username">@{{ member.username }}</p>
                <p class="staff-phone" v-if="member.phone">{{ member.phone }}</p>
              </div>
              <ion-badge :color="member.role === 'admin' ? 'danger' : 'primary'" class="role-badge">
                {{ member.role }}
              </ion-badge>
            </div>
            <div class="staff-actions">
              <ion-button fill="outline" size="small" @click="openEdit(member)">
                <ion-icon name="create-outline" slot="start" />
                Edit
              </ion-button>
              <ion-button fill="outline" color="danger" size="small" @click="confirmDelete(member)">
                <ion-icon name="trash-outline" slot="start" />
                Delete
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <div v-if="filteredStaff.length === 0" class="empty-state">
          <ion-icon name="people-outline" class="empty-icon" />
          <p>No staff found</p>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <ion-modal :is-open="isFormOpen" @did-dismiss="closeForm">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editTarget ? 'Edit Staff' : 'Add Staff' }}</ion-title>
            <ion-buttons slot="end"><ion-button @click="closeForm">Close</ion-button></ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Username *</ion-label>
            <ion-input v-model="form.username" placeholder="username" :disabled="!!editTarget" />
          </ion-item>
          <ion-item v-if="!editTarget">
            <ion-label position="stacked">Password *</ion-label>
            <ion-input v-model="form.password" type="password" placeholder="Password" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Full Name *</ion-label>
            <ion-input v-model="form.name" placeholder="Full name" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Email *</ion-label>
            <ion-input v-model="form.email" type="email" placeholder="email@example.com" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Phone</ion-label>
            <ion-input v-model="form.phone" placeholder="08xxxxxxxxxx" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Address</ion-label>
            <ion-textarea v-model="form.address" :rows="2" placeholder="Address" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Role</ion-label>
            <ion-select v-model="form.role">
              <ion-select-option value="waiters">Waiters</ion-select-option>
              <ion-select-option value="admin">Admin</ion-select-option>
            </ion-select>
          </ion-item>
          <div v-if="formError" class="error-msg">{{ formError }}</div>
          <ion-button expand="block" @click="submitForm" :disabled="formLoading" class="ion-margin-top">
            <ion-spinner v-if="formLoading" name="crescent" slot="start" />
            {{ editTarget ? 'Save Changes' : 'Add Staff' }}
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
  IonIcon, IonSearchbar, IonSpinner, IonCard, IonCardContent, IonBadge, IonItem, IonLabel,
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonModal, IonRefresher, IonRefresherContent,
  alertController
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/helpers/api'

const auth = useAuthStore()
const staffMembers = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const filteredStaff = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return staffMembers.value.filter((m: any) =>
    (m.name?.toLowerCase().includes(q) || m.username?.toLowerCase().includes(q) || m.phone?.includes(q))
  )
})

const loadStaff = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/user/staff', { headers: { Authorization: `Bearer ${auth.token}` } })
    staffMembers.value = res.data
  } catch (e) { console.error(e) }
  finally { isLoading.value = false }
}
onMounted(loadStaff)
const doRefresh = async (e: any) => { await loadStaff(); e.target.complete() }

// Form
const isFormOpen = ref(false)
const editTarget = ref<any>(null)
const formLoading = ref(false)
const formError = ref('')
const form = ref({ username: '', password: '', name: '', email: '', phone: '', address: '', role: 'waiters' })

const openAdd = () => {
  editTarget.value = null
  form.value = { username: '', password: '', name: '', email: '', phone: '', address: '', role: 'waiters' }
  isFormOpen.value = true
}
const openEdit = (member: any) => {
  editTarget.value = member
  form.value = { username: member.username, password: '', name: member.name ?? '', email: member.email ?? '', phone: member.phone ?? '', address: member.address ?? '', role: member.role ?? 'waiters' }
  isFormOpen.value = true
}
const closeForm = () => { isFormOpen.value = false; formError.value = '' }

const submitForm = async () => {
  formLoading.value = true; formError.value = ''
  const headers = { Authorization: `Bearer ${auth.token}` }
  try {
    if (editTarget.value) {
      const { password, ...data } = form.value
      await api.put(`/user/${editTarget.value.id}`, data, { headers })
    } else {
      await api.post('/auth/register', form.value, { headers })
    }
    closeForm(); await loadStaff()
  } catch (e: any) { formError.value = e.response?.data?.detail ?? 'Error saving staff.' }
  finally { formLoading.value = false }
}

const confirmDelete = async (member: any) => {
  const alert = await alertController.create({
    header: 'Delete Staff',
    message: `Delete "${member.name}"?`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete', role: 'destructive', handler: async () => {
          await api.delete(`/user/${member.id}`, { headers: { Authorization: `Bearer ${auth.token}` } })
          await loadStaff()
        }
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
.loading-center { display: flex; justify-content: center; padding: 60px; }
.staff-list { display: flex; flex-direction: column; gap: 10px; }
.staff-card { border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.07); margin: 0; }
.staff-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.staff-avatar { width: 48px; height: 48px; border-radius: 14px; background: var(--ion-color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; flex-shrink: 0; }
.staff-info { flex: 1; }
.staff-name { font-size: 15px; font-weight: 700; margin: 0; }
.staff-username { font-size: 12px; color: var(--ion-color-medium); margin: 1px 0; }
.staff-phone { font-size: 12px; color: var(--ion-color-medium); margin: 0; }
.role-badge { text-transform: capitalize; }
.staff-actions { display: flex; gap: 8px; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: var(--ion-color-medium); gap: 8px; text-align: center; }
.empty-icon { font-size: 56px; opacity: .35; }
.error-msg { color: var(--ion-color-danger); font-size: 13px; margin: 8px 0; padding: 10px; background: rgba(239,68,68,.1); border-radius: 8px; }
</style>
