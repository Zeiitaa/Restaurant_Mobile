<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="auth-bg">

        <div class="brand-header">
          <div class="brand-icon">
            <ion-icon name="restaurant" style="font-size:28px;color:#fff" />
          </div>
          <h1 class="brand-title">RestoKita</h1>
          <p class="brand-subtitle">Efficient restaurant administration</p>
        </div>

        <div class="card">
          <form @submit.prevent="handleLogin">

            <div class="field-group">
              <label class="field-label">Username</label>
              <div class="input-wrap">
                <ion-icon name="person-outline" class="input-icon" />
                <ion-input
                  v-model="form.Username"
                  type="text"
                  placeholder="John"
                  required
                  class="native-input"
                />
              </div>
            </div>

            <div class="field-group">
              <div class="field-header">
                <label class="field-label">Password</label>
                <router-link to="/forgot-password" class="link-small">Forgot Password?</router-link>
              </div>
              <div class="input-wrap">
                <ion-icon name="lock-closed-outline" class="input-icon" />
                <ion-input
                  v-model="form.Password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  class="native-input"
                />
                <ion-button fill="clear" @click="showPassword = !showPassword" class="eye-btn">
                  <ion-icon :name="showPassword ? 'eye-off-outline' : 'eye-outline'" />
                </ion-button>
              </div>
            </div>

            <ion-button
              expand="block"
              type="submit"
              :disabled="isLoading"
              class="submit-btn"
            >
              <ion-spinner v-if="isLoading" name="crescent" />
              <span v-else>Sign In</span>
              <ion-icon v-if="!isLoading" name="arrow-forward" slot="end" />
            </ion-button>
          </form>

          <div class="card-footer">
            <p class="footer-text">
              Don't have an account?
              <router-link to="/register" class="link-primary">Register now</router-link>
            </p>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  IonPage, IonContent, IonInput, IonButton, IonIcon, IonSpinner
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import router from '@/router'

const auth = useAuthStore()
const toast = useToast()

const form = reactive({ Username: '', Password: '' })
const showPassword = ref(false)
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  try {
    await auth.fetchAuth(form.Username, form.Password)
    if (auth.token) {
      await auth.fetchProfile()
      toast.success('Login Successful!')
      if (auth.isAdmin) router.push('/admin')
      else if (auth.isWaiters) router.push('/waiters')
      else router.push('/')
    }
  } catch {
    toast.error('Login failed. Please check your credentials.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-bg {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px 0;
}

.brand-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.brand-icon {
  width: 56px;
  height: 56px;
  background: var(--ion-color-primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 8px 24px rgba(79,70,229,.25);
}

.brand-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--ion-color-dark);
}

.brand-subtitle {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 4px 0 0;
}

.card {
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 4px 32px rgba(0,0,0,.08);
}

.field-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-bottom: 8px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.input-wrap {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 4px 12px;
  gap: 8px;
}

.input-icon {
  color: var(--ion-color-medium);
  font-size: 18px;
  flex-shrink: 0;
}

.native-input {
  flex: 1;
  --padding-start: 0;
  --padding-end: 0;
  font-size: 15px;
}

.eye-btn {
  --padding-start: 4px;
  --padding-end: 0;
  height: 36px;
}

.link-small {
  font-size: 12px;
  font-weight: 600;
  color: var(--ion-color-primary);
  text-decoration: none;
}

.submit-btn {
  margin-top: 8px;
  --border-radius: 12px;
  height: 52px;
  font-size: 16px;
  font-weight: 700;
}

.card-footer {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
}

.link-primary {
  color: var(--ion-color-primary);
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}

@media (prefers-color-scheme: dark) {
  .card { background: #1e293b; }
  .input-wrap { background: #0f172a; border-color: #334155; }
  .field-label { color: #e2e8f0; }
  .brand-title { color: #f1f5f9; }
}
</style>
