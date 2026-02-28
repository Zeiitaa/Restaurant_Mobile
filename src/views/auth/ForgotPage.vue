<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="auth-bg">

        <div class="brand-header">
          <div class="brand-icon">
            <ion-icon name="restaurant" style="font-size:26px;color:#fff" />
          </div>
          <h1 class="brand-title">RestoKita</h1>
          <p class="brand-subtitle">Restaurant Administration System</p>
        </div>

        <div class="card">
          <div class="card-head">
            <h2 class="card-title">Forgot Password</h2>
            <p class="card-subtitle">Enter your email and we'll send you a reset code.</p>
          </div>

          <form @submit.prevent="handleResetPassword">
            <div class="field-group">
              <label class="field-label">Email Address</label>
              <div class="input-wrap">
                <ion-icon name="mail-outline" class="input-icon" />
                <ion-input v-model="form.email" type="email" placeholder="name@restaurant.com" required class="native-input" />
              </div>
            </div>

            <ion-button expand="block" type="submit" :disabled="isLoading" class="submit-btn">
              <ion-spinner v-if="isLoading" name="crescent" />
              <span v-else>Send Reset Code</span>
              <ion-icon v-if="!isLoading" name="arrow-forward" slot="end" />
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
import router from '@/router'

const auth = useAuthStore()
const toast = useToast()
const form = reactive({ email: '' })
const isLoading = ref(false)

async function handleResetPassword() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) { toast.error('Please enter your email address'); return }
  if (!emailRegex.test(form.email)) { toast.error('Please enter a valid email address'); return }

  isLoading.value = true
  try {
    await auth.forgotPassword(form.email)
    toast.success('Reset code has been sent to your email!')
    auth.tempEmail = form.email
    router.push('/verify-otp')
  } catch (e) { console.error(e) }
  finally { isLoading.value = false }
}

const goBackToLogin = () => auth.logout()
</script>

<style scoped>
.auth-bg { min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 24px 0; }
.brand-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }
.brand-icon { width: 56px; height: 56px; background: var(--ion-color-primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(79,70,229,.25); }
.brand-title { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
.brand-subtitle { font-size: 13px; color: var(--ion-color-medium); margin: 0; }
.card { background: #fff; border-radius: 20px; padding: 28px 24px; box-shadow: 0 4px 32px rgba(0,0,0,.08); }
.card-head { margin-bottom: 24px; }
.card-title { font-size: 18px; font-weight: 700; margin: 0 0 6px; }
.card-subtitle { font-size: 13px; color: var(--ion-color-medium); margin: 0; line-height: 1.5; }
.field-group { margin-bottom: 20px; }
.field-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.input-wrap { display: flex; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 4px 12px; gap: 8px; }
.input-icon { color: var(--ion-color-medium); font-size: 18px; flex-shrink: 0; }
.native-input { flex: 1; --padding-start: 0; --padding-end: 0; font-size: 15px; }
.submit-btn { --border-radius: 12px; height: 52px; font-size: 15px; font-weight: 700; }
.back-link { display: flex; align-items: center; gap: 6px; color: var(--ion-color-primary); font-weight: 600; font-size: 14px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; justify-content: center; cursor: pointer; }

@media (prefers-color-scheme: dark) {
  .card { background: #1e293b; }
  .input-wrap { background: #0f172a; border-color: #334155; }
  .field-label { color: #e2e8f0; }
}
</style>
