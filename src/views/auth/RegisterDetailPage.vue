<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="auth-bg">

        <div class="brand-header">
          <div class="brand-icon">
            <ion-icon name="restaurant" style="font-size:24px;color:#fff" />
          </div>
          <h1 class="brand-title">RestoKita</h1>
        </div>

        <div class="card">
          <div class="card-head">
            <h2 class="card-title">Finishing Your Account</h2>
            <p class="card-subtitle">Complete account setup!</p>
          </div>

          <form @submit.prevent="handleRegister">

            <div class="field-group">
              <label class="field-label">Full Name</label>
              <div class="input-wrap">
                <ion-icon name="person-outline" class="input-icon" />
                <ion-input v-model="form.name" type="text" placeholder="e.g. John Doe" required class="native-input" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Phone Number</label>
              <div class="input-wrap">
                <ion-icon name="call-outline" class="input-icon" />
                <ion-input v-model="form.phone" type="tel" inputmode="numeric" placeholder="e.g. 0811223344" required class="native-input" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Address</label>
              <div class="input-wrap">
                <ion-icon name="location-outline" class="input-icon" />
                <ion-input v-model="form.address" type="text" placeholder="e.g. Jl. Aminah Syukur" required class="native-input" />
              </div>
            </div>

            <ion-button expand="block" type="submit" :disabled="isLoading" class="submit-btn">
              <ion-spinner v-if="isLoading" name="crescent" />
              <span v-else>Finalize Account</span>
              <ion-icon v-if="!isLoading" name="arrow-forward" slot="end" />
            </ion-button>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { IonPage, IonContent, IonInput, IonButton, IonIcon, IonSpinner } from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import router from '@/router'

const auth = useAuthStore()
const toast = useToast()
const form = reactive({ name: '', phone: '', address: '' })
const isLoading = ref(false)

async function handleRegister() {
  isLoading.value = true
  try {
    await auth.registerDetail(form.name, form.phone, form.address)
    toast.success('Account setup complete!')
    router.push('/')
  } catch { toast.error('Failed to save account details.') }
  finally { isLoading.value = false }
}
</script>

<style scoped>
.auth-bg { min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 24px 0; }
.brand-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; }
.brand-icon { width: 48px; height: 48px; background: var(--ion-color-primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; box-shadow: 0 8px 20px rgba(79,70,229,.25); }
.brand-title { font-size: 22px; font-weight: 700; margin: 0; }
.card { background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 4px 32px rgba(0,0,0,.08); }
.card-head { margin-bottom: 20px; }
.card-title { font-size: 18px; font-weight: 700; margin: 0 0 4px; }
.card-subtitle { font-size: 13px; color: var(--ion-color-medium); margin: 0; }
.field-group { margin-bottom: 16px; }
.field-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 7px; }
.input-wrap { display: flex; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 4px 12px; gap: 8px; }
.input-icon { color: var(--ion-color-medium); font-size: 18px; flex-shrink: 0; }
.native-input { flex: 1; --padding-start: 0; --padding-end: 0; font-size: 15px; }
.submit-btn { margin-top: 8px; --border-radius: 12px; height: 50px; font-size: 15px; font-weight: 700; }

@media (prefers-color-scheme: dark) {
  .card { background: #1e293b; }
  .input-wrap { background: #0f172a; border-color: #334155; }
  .field-label { color: #e2e8f0; }
}
</style>
