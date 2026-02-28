<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="auth-bg">

        <div class="brand-header">
          <div class="brand-icon">
            <ion-icon name="restaurant" style="font-size:26px;color:#fff" />
          </div>
          <h1 class="brand-title">RestoKita</h1>
          <p class="brand-subtitle">Step 3: Create a new password</p>
        </div>

        <div class="card">
          <div class="card-head">
            <h2 class="card-title">Reset Your Password</h2>
            <p class="card-subtitle">Please choose a strong password to protect your data.</p>
          </div>

          <div v-if="errorMessage" class="error-box">
            <ion-icon name="alert-circle-outline" />
            <span>{{ errorMessage }}</span>
          </div>

          <form @submit.prevent="handleUpdatePassword">

            <div class="field-group">
              <label class="field-label">New Password</label>
              <div class="input-wrap">
                <ion-icon name="lock-closed-outline" class="input-icon" />
                <ion-input v-model="form.newPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="••••••••" required class="native-input" />
                <ion-button fill="clear" @click="showNewPassword = !showNewPassword" class="eye-btn">
                  <ion-icon :name="showNewPassword ? 'eye-off-outline' : 'eye-outline'" />
                </ion-button>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Confirm New Password</label>
              <div class="input-wrap">
                <ion-icon name="checkmark-circle-outline" class="input-icon" />
                <ion-input v-model="form.confirmPassword" type="password" placeholder="••••••••" required class="native-input" />
              </div>
            </div>

            <ion-button expand="block" type="submit" :disabled="isUpdating" class="submit-btn">
              <ion-spinner v-if="isUpdating" name="crescent" />
              <span v-else>Update Password</span>
              <ion-icon v-if="!isUpdating" name="checkmark-done" slot="end" />
            </ion-button>
          </form>

          <div class="back-link" @click="goBackToLogin">
            <ion-icon name="arrow-back" />
            <span>Back to Login</span>
          </div>
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

const auth = useAuthStore()
const toast = useToast()
const form = reactive({ newPassword: '', confirmPassword: '' })
const showNewPassword = ref(false)
const isUpdating = ref(false)
const errorMessage = ref('')

async function handleUpdatePassword() {
  errorMessage.value = ''
  if (form.newPassword !== form.confirmPassword) { errorMessage.value = 'Passwords do not match.'; return }
  isUpdating.value = true
  try {
    await auth.resetPassword(auth.token_reset!, form.confirmPassword)
    toast.success('Password updated, Try login again!')
    auth.logout()
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Error resetting password')
  } finally { isUpdating.value = false }
}

const goBackToLogin = () => auth.logout()
</script>

<style scoped>
.auth-bg { min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 24px 0; }
.brand-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }
.brand-icon { width: 56px; height: 56px; background: var(--ion-color-primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.brand-title { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
.brand-subtitle { font-size: 13px; color: var(--ion-color-medium); margin: 0; }
.card { background: #fff; border-radius: 20px; padding: 28px 24px; box-shadow: 0 4px 32px rgba(0,0,0,.08); }
.card-head { margin-bottom: 20px; }
.card-title { font-size: 18px; font-weight: 700; margin: 0 0 6px; }
.card-subtitle { font-size: 13px; color: var(--ion-color-medium); margin: 0; }
.error-box { display: flex; align-items: center; gap: 8px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #ef4444; margin-bottom: 16px; }
.field-group { margin-bottom: 16px; }
.field-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.input-wrap { display: flex; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 4px 12px; gap: 8px; }
.input-icon { color: var(--ion-color-medium); font-size: 18px; flex-shrink: 0; }
.native-input { flex: 1; --padding-start: 0; --padding-end: 0; font-size: 15px; }
.eye-btn { --padding-start: 4px; --padding-end: 0; height: 36px; }
.submit-btn { margin-top: 8px; --border-radius: 12px; height: 52px; font-size: 15px; font-weight: 700; }
.back-link { display: flex; align-items: center; gap: 6px; color: var(--ion-color-primary); font-weight: 600; font-size: 14px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; justify-content: center; cursor: pointer; }

@media (prefers-color-scheme: dark) {
  .card { background: #1e293b; }
  .input-wrap { background: #0f172a; border-color: #334155; }
  .field-label { color: #e2e8f0; }
}
</style>
