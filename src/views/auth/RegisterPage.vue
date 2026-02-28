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
            <h2 class="card-title">Create An Account</h2>
            <p class="card-subtitle">Set up your account!</p>
          </div>

          <form @submit.prevent="handleRegister">

            <div class="field-group">
              <label class="field-label">Username</label>
              <div class="input-wrap">
                <ion-icon name="person-outline" class="input-icon" />
                <ion-input v-model="form.Username" type="text" placeholder="e.g. John Doe" required class="native-input" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Email</label>
              <div class="input-wrap">
                <ion-icon name="mail-outline" class="input-icon" />
                <ion-input v-model="form.Email" type="email" placeholder="name@example.com" required class="native-input" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="input-wrap">
                <ion-icon name="lock-closed-outline" class="input-icon" />
                <ion-input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required class="native-input" />
                <ion-button fill="clear" @click="showPassword = !showPassword" class="eye-btn">
                  <ion-icon :name="showPassword ? 'eye-off-outline' : 'eye-outline'" />
                </ion-button>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Confirm Password</label>
              <div class="input-wrap">
                <ion-icon name="shield-checkmark-outline" class="input-icon" />
                <ion-input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="••••••••" required class="native-input" />
                <ion-button fill="clear" @click="showConfirmPassword = !showConfirmPassword" class="eye-btn">
                  <ion-icon :name="showConfirmPassword ? 'eye-off-outline' : 'eye-outline'" />
                </ion-button>
              </div>
            </div>

            <div class="terms-row">
              <ion-checkbox v-model="form.agreedToTerms" required />
              <span class="terms-text">I agree to the <a href="#" class="link-primary">Terms</a> and <a href="#" class="link-primary">Privacy Policy</a></span>
            </div>

            <ion-button expand="block" type="submit" :disabled="isLoading" class="submit-btn">
              <ion-spinner v-if="isLoading" name="crescent" />
              <span v-else>Create Account</span>
              <ion-icon v-if="!isLoading" name="arrow-forward" slot="end" />
            </ion-button>
          </form>

          <div class="card-footer">
            <p class="footer-text">
              Already have an account?
              <a href="#" @click.prevent="goBackToLogin" class="link-primary">Back to Login</a>
            </p>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { IonPage, IonContent, IonInput, IonButton, IonIcon, IonSpinner, IonCheckbox } from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import router from '@/router'

const auth = useAuthStore()
const toast = useToast()

const form = reactive({ Username: '', Email: '', password: '', confirmPassword: '', agreedToTerms: false })
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

async function handleRegister() {
  if (form.password !== form.confirmPassword) { toast.error('Passwords do not match!'); return }
  isLoading.value = true
  try {
    await auth.register(form.Username, form.Email, form.password, form.confirmPassword)
    toast.success('Account created successfully!')
    router.push('/register-detail')
  } catch { toast.error('Registration failed. Please try again.') }
  finally { isLoading.value = false }
}

const goBackToLogin = () => auth.logout()
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
.eye-btn { --padding-start: 4px; --padding-end: 0; height: 36px; }
.terms-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; }
.terms-text { font-size: 12px; color: var(--ion-color-medium); line-height: 1.5; }
.link-primary { color: var(--ion-color-primary); text-decoration: none; font-weight: 600; }
.submit-btn { --border-radius: 12px; height: 50px; font-size: 15px; font-weight: 700; }
.card-footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; }
.footer-text { font-size: 14px; color: var(--ion-color-medium); margin: 0; }

@media (prefers-color-scheme: dark) {
  .card { background: #1e293b; }
  .input-wrap { background: #0f172a; border-color: #334155; }
  .field-label { color: #e2e8f0; }
}
</style>
